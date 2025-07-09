from django.shortcuts import render
from django.utils import timezone
import json
import secrets
from urllib.parse import urlencode
import requests
from rest_framework.decorators import (api_view, 
                                    permission_classes,
                                    renderer_classes)
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .tasks import send_verification_email
from . import models, serializers
from django.conf import settings
from rest_framework import status
from django.db import transaction
from datetime import timedelta


@api_view(['GET']) 
@permission_classes([AllowAny]) 
def google_auth_url(request):
    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"

    params = {
        'client_id': settings.GOOGLE_OAUTH2_CLIENT_ID,
        'redirect_uri': settings.GOOGLE_OAUTH2_REDIRECT_URI,
        'scope': 'openid email profile',
        'response_type': 'code',
        'access_type': 'offline',
        'prompt': 'consent'
    }

    url = f"{google_auth_url}?{urlencode(params)}"

    return Response({
        'auth_url' : url
    })

@api_view(['GET','POST'])
def google_auth_callback(request):
    if request.method == 'GET':
        code = request.GET.get('code')
        error = request.GET.get('error')
        
        if error:
            return Response(
                {'error': f'Google OAuth error: {error}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    else: 
        code = request.data.get('code')
    
    if not code:
        return Response(
            {'error': 'Authorization code is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    if not code:
        return Response(
            {
                'error' : 'Authorization code is required',
            },
            status = status.HTTP_400_BAD_REQUEST
        )
    token_url = "https://oauth2.googleapis.com/token"
    token_data = {
        'client_id': settings.GOOGLE_OAUTH2_CLIENT_ID,
        'client_secret': settings.GOOGLE_OAUTH2_CLIENT_SECRET,
        'redirect_uri': settings.GOOGLE_OAUTH2_REDIRECT_URI,
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
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_info_url = f"https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}"
        user_response = requests.get(user_info_url)
        user_response.raise_for_status()
        user_data = user_response.json()
        
        email = user_data.get('email')
        first_name = user_data.get('given_name', '')
        last_name = user_data.get('family_name', '')
        google_id = user_data.get('id')
        
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
        
        refresh = RefreshToken.for_user(user)
        access_token_jwt = str(refresh.access_token)
        refresh_token_jwt = str(refresh)
        
        return Response({
            'access_token': access_token_jwt,
            'refresh_token': refresh_token_jwt,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_new_user': created,
                'google_id' : google_id
            }
        })
    
    except requests.RequestException as e:
        return Response(
            {'error': f'Request failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {'error': f'Authentication failed: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
@api_view(['POST'])
def user_registration_view(request):
    serializer = serializers.UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        pending_user = serializer.save()
            
        send_verification_email.delay(pending_user.verification_token, pending_user.email)
            
        return Response({
            'message': 'Registration successful! Please check your email to verify your account.',
            'email': pending_user.email,
            'verification_sent': True
        }, status=status.HTTP_201_CREATED)
        
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def user_login_view(request):
    serializer = serializers.UserLoginSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
    
        refresh = RefreshToken.for_user(user)
        access_token_jwt = str(refresh.access_token)
        refresh_token_jwt = str(refresh)
        
        return Response({
            'message': 'Login successful',
            'access_token': access_token_jwt,
            'refresh_token': refresh_token_jwt,
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'auth_provider': user.auth_provider
            }
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def verify_email_view(request):
    token = request.GET.get('token')
    
    if not token:
        return Response({
            'error': 'Verification token is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        pending_user = models.PendingUser.objects.get(verification_token=token)
        
        if not pending_user.is_valid:
            return Response({
                'error': 'Invalid or expired verification token',
                'expired': True
            }, status=status.HTTP_400_BAD_REQUEST)
        
        pending_user.is_verified = True
        pending_user.save()

        user = pending_user.create_user()

        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        pending_user.delete()

        return Response({
            'message': 'Email verified successfully! Your account is now active.',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                },
                'tokens': {
                    'access': str(access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_200_OK)

    except models.PendingUser.DoesNotExist:
        return Response({
            'error': 'Invalid verification token'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        print(e)
        return Response({
            'error': 'Opps! something went wrong !',
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def resend_verification_email_view(request):
    email = request.data.get('email')
    
    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        pending_user = models.PendingUser.objects.get(email=email, is_verified=False)
        
        if not pending_user.is_valid():
            pending_user.verification_token = secrets.token_urlsafe(32)
            pending_user.expires_at = timezone.now() + timedelta(minutes=30)
            pending_user.save()
            
        send_verification_email(pending_user)
    
        return Response({
                'message': 'Verification email sent successfully'
            }, status=status.HTTP_200_OK)
            
    except models.PendingUser.DoesNotExist:
        return Response({
            'error': 'No pending registration found for this email'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        print(e)
        
@api_view(['DELETE'])
# @permission_classes([IsAuthenticated])
def user_deletion_view(request):   
    email = request.data.get("email", "").strip().lower()
    username = request.data.get("username", "").strip()
    
    if not email or not username:
        return Response({
            'error': 'Both email and username are required',
            'code': 'MISSING_FIELDS'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = models.UserCustom.objects.only('id', 'username', 'email').get(
            email__iexact=email,
            username__iexact=username
        )
        
        with transaction.atomic():
            models.UserCustom.objects.filter(id=user.id).delete()
            
            return Response({
                'message': 'User account deleted successfully',
                'deleted_user': {
                    'username': username,
                    'email': email
                }
            }, status=status.HTTP_200_OK)
            
    except models.UserCustom.DoesNotExist:
        return Response({
            'error': 'User not found with the provided credentials',
            'code': 'USER_NOT_FOUND'
        }, status=status.HTTP_404_NOT_FOUND)
        
    except Exception as e:
        return Response({
            'error': 'An unexpected error occurred during deletion',
            'code': 'INTERNAL_ERROR'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@api_view(['POST'])
def password_reset_view(request):
    pass