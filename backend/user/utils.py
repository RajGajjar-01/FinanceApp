from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone

def create_auth_response(user, message, status_code=status.HTTP_200_OK):
    refresh = RefreshToken.for_user(user)
    access_token = refresh.access_token
    
    response_data = {
        "success": True,
        "message": message,
        "timestamp": timezone.now().isoformat(),
        "data": {
            "user": {
                "id": str(user.id),
                "username": user.username,
                "email": user.email,
            },
            "auth": {
                "access_token": str(access_token),
                "expires_in": int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds()),
                "token_type": "Bearer"
            }
        }
    }
    
    response = Response(response_data, status=status_code)
   
    response.set_cookie(
        'refresh_token',
        refresh,
        max_age=604800, 
        httponly=True,
        secure=False,
        samesite='Lax',
    )    
    return response

def create_success_response(message, data=None, status_code=status.HTTP_200_OK):
    response_data = {
        "success": True,
        "message": message,
        "timestamp": timezone.now().isoformat(),
        "data": data
    }
    
    return Response(response_data, status=status_code)
    
def create_error_response(message, status_code=status.HTTP_400_BAD_REQUEST, errors=None, error_codes=None):
    response_data = {
        "success": False,
        "message": message,
        "timestamp": timezone.now().isoformat(),
        "data": {},
    }
    
    if errors:
        response_data["errors"] = errors
        
    if error_codes:
        response_data["error_codes"] = error_codes
    
    return Response(response_data, status=status.HTTP_200_OK)