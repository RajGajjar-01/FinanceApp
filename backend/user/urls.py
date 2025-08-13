from django.urls import path

from . import views

urlpatterns = [
    path('auth/register/', views.user_registration_view, name='register'),
    path('auth/login/', views.user_login_view, name='login'),
    path('auth/verify-email/', views.verify_otp_view, name='verify-email'),
    path('auth/resend-verification/', views.resend_verification_email_view, name='resend-verification'),
    path('auth/delete-user/', views.user_deletion_view, name='user-deletion'),
    path('auth/logout/', views.user_logout_view, name='user-logout'),
]