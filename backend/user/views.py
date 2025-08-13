import secrets
from datetime import timedelta
from urllib.parse import urlencode

import requests
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import (api_view, 
                                       permission_classes,
                                       throttle_classes)
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from . import models, serializers, throttles
from .error_codes import ErrorCodes
from .tasks import send_verification_email
from .utils import create_auth_response, create_success_response, create_error_response
from rest_framework_simplejwt.exceptions import TokenError

@api_view(['POST'])
def google_auth_callback(request):
    print(request.data)
    code = request.data['code']
    state = request.data['state']
        
    is_registration_flow = state == 'from:register' if state else False
    is_login_flow = state == 'from:login' if state else True
    
    if not code:
        return Response(
            {'error': 'Authorization code is required'}, 
            status=status.HTTP_200_OK
        )

    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        'client_id': settings.GOOGLE_OAUTH2_CLIENT_ID,
        'client_secret': settings.GOOGLE_OAUTH2_CLIENT_SECRET,
        'redirect_uri': settings.GOOGLE_OAUTH2_REDIRECT_URI if is_login_flow else settings.GOOGLE_OAUTH2_REDIRECT_URI_REGISTER,
        'grant_type': 'authorization_code',
        'code': code,
    }

    try:
        token_response = requests.post(token_url, data=token_data)
        token_response.raise_for_status()
        token_json = token_response.json()
        
        access_token = token_json.get('access_token')
        
        if not access_token:
            return Response(
                {'error': 'Failed to obtain access token'}, 
                status=status.HTTP_200_OK
            )
        
        user_info_url = f"https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}"
        user_response = requests.get(user_info_url)
        user_response.raise_for_status()
        user_data = user_response.json()
        
        email = user_data.get('email')
        first_name = user_data.get('given_name', '')
        last_name = user_data.get('family_name', '')
        google_id = user_data.get('id')
        picture = user_data.get('picture')
        
        if not email:
            return Response(
                {'error': 'Email not provided by Google'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user, created = models.UserCustom.objects.get_or_create(
            email=email,
            defaults={
                'username': first_name.lower(),
                'first_name': first_name,
                'last_name': last_name,
                'is_active': True,
                'auth_provider': models.UserCustom.AuthProviders.GOOGLE,
                'provider_id': google_id,
                'last_login': timezone.now()
            }
        )
  
        if not created:
            user.first_name = first_name
            user.last_name = last_name
            user.save()
        
        response = create_auth_response(user, message='Your account is active now')
        return response
    
    except requests.RequestException as e:
        print(e)
        return Response(
            {'error': f'Request failed: {str(e)}'}, 
            status=status.HTTP_200_OK
        )
    except Exception as e:
        print(e)
        return Response(
            {'error': f'Authentication failed: {str(e)}'}, 
            status=status.HTTP_200_OK
        )
        
@api_view(['POST'])
@throttle_classes([throttles.RegistrationThrottle])
def user_registration_view(request):    
    serializer = serializers.UserRegistrationSerializer(data=request.data)
    
    if not serializer.is_valid():
        return create_error_response(message="Input field errors", errors=serializer.errors)
        
    pending_user = serializer.save()
    try:
        otp_code = pending_user.generate_otp()
        if not otp_code:
            raise ValueError("OTP generation failed")   
         
        send_verification_email.delay(otp_code, pending_user.email)
    except ValueError as err:
        pending_user.delete()
        return create_error_response(message=str(err), error_codes=[ErrorCodes.OTP_GENERATION_FAILURE])
    except Exception as exc:
        pending_user.delete()
        return create_error_response(message="Email service temporarily unavailable", error_codes=[ErrorCodes.EMAIL_GENERATION_FAILURE])
        
    return create_success_response("Registration successful! A verification code has been sent to your email address.", 
                                    data={"email": pending_user.email},
                                    status_code=status.HTTP_201_CREATED)
        
@api_view(['POST'])
def user_login_view(request):
    serializer = serializers.UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        return create_auth_response(user, message="Login successful")

    return create_error_response("Validation error occured", errors=serializer.errors, error_codes=[ErrorCodes.VALIDATION_ERROR])

@api_view(['POST'])
def verify_otp_view(request):
    email = request.data.get('email')
    otp_code = request.data.get('otp_code')
    
    if not email or not otp_code:
        return create_error_response("Email and OTP code are required", error_codes=[ErrorCodes.OTP_NOT_RECEIVED, ErrorCodes.EMAIL_NOT_RECEIVED] )
    
    try:
        pending_user = models.PendingUser.objects.get(email=email)
        
        if not pending_user.is_valid():
            return create_error_response("Invalid or Expired OTP", error_codes=[ErrorCodes.OTP_EXPIRED])
        
        is_valid, message = pending_user.verify_otp(otp_code)
        
        if is_valid:
            pending_user.is_verified = True
            pending_user.save()

            user = pending_user.create_user()
            pending_user.delete()
            
            return create_auth_response(user, message="Email verified successfully! Your account is now active.")
        else:
            return create_error_response(message, error_codes=[ErrorCodes.OTP_INVALID])
        
    except models.PendingUser.DoesNotExist:
        return create_error_response(
            "No pending verification found for this email", 
            error_codes=[ErrorCodes.USER_NOT_FOUND],
            status_code=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        return create_error_response(
            "An unexpected error occurred. Please try again.", 
            error_codes=[ErrorCodes.INTERNAL_ERROR],
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def resend_verification_email_view(request):
    email = request.data.get('email')
    
    if not email:
        return create_error_response('Email is required', error_codes=[ErrorCodes.EMAIL_NOT_RECEIVED])
    
    try:
        pending_user = models.PendingUser.objects.get(email=email, is_verified=False)
        
        if not pending_user.is_valid():
            pending_user.verification_token = secrets.token_urlsafe(32)
            pending_user.expires_at = timezone.now() + timedelta(minutes=30)
            pending_user.save()
        
        otp_code = pending_user.generate_otp()
        send_verification_email.delay(otp_code, pending_user.email)

        return create_success_response("Verification email sent successfully",data={"email": pending_user.email})
            
    except models.PendingUser.DoesNotExist:
        return create_error_response(
            "No pending verification found for this email", 
            error_codes=[ErrorCodes.USER_NOT_FOUND],
            status_code=status.HTTP_404_NOT_FOUND
        )

    except Exception as e:
        return create_error_response(
            "An unexpected error occurred. Please try again.", 
            error_codes=[ErrorCodes.INTERNAL_ERROR],
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def user_deletion_view(request):   
    password = request.data.get("password").strip()
    confirmation = request.data.get("cpnfirmation").strip()
    
    if not password:
        return create_error_response(
            "Current password is required for account deletion", 
            error_codes=[ErrorCodes.VALIDATION_ERROR],
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    if confirmation != "DELETE":
        return create_error_response(
            "Please type 'DELETE' to confirm account deletion", 
            error_codes=[ErrorCodes.VALIDATION_ERROR],
            status_code=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = request.user
            
        if not user.check_password(password):
            return create_error_response(
                "Invalid password provided", 
                error_codes=[ErrorCodes.VALIDATION_ERROR],
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        user_info = {
            'id': str(user.id),
            'username': user.username,
            'email': user.email
        }
        
        with transaction.atomic():
            user.delete()
            return create_success_response("Your account has been permanently deleted",
                                            data={
                                                "deleted_at": timezone.now().isoformat(),
                                                "user_id": user_info['id']
                                            })
            
    except Exception as e:
        return create_error_response(
            "An unexpected error occurred during account deletion", 
            error_codes=[ErrorCodes.INTERNAL_ERROR],
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def user_logout_view(request):
    try:
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return create_success_response("Successfully logged out")
        
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        response = create_success_response("Successfully logged out") 
        response.delete_cookie(
            'refresh_token',
            samesite='None' ,
        )
        return response
        
    except TokenError as e:
        return create_error_response("Invalid or Expired token", error_codes=[ErrorCodes.TOKEN_ERROR])
    except Exception as e:
        return create_error_response(
            "An unexpected error occurred while logging out", 
            error_codes=[ErrorCodes.INTERNAL_ERROR],
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
@api_view(['POST'])
def password_reset_view(request):
    pass

@api_view(['POST'])
def token_refresh_view(request):
    refresh_token = request.COOKIES.get("refresh_token")
        
    if not refresh_token:
        return Response({"error":"Refresh token not provided"}, status= status.HTTP_401_UNAUTHORIZED)
    
    try:
        refresh = RefreshToken(refresh_token)
        access_token = str(refresh.access_token)
        
        return create_success_response(message="Access token sent successfully", data={'access_token': access_token})
    except Exception as e:
        return Response({"error":"Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)
