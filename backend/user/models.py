from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
import secrets
from django.utils import timezone
from datetime import timedelta

class UserCustom(AbstractUser):

    class AuthProviders(models.TextChoices):
        EMAIL = 'Email/Password'
        GOOGLE = 'Google'

    username = models.CharField(max_length=255, unique=True)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, blank=False)
    auth_provider = models.CharField(max_length=20, choices=AuthProviders, default=AuthProviders.EMAIL)
    provider_id = models.CharField(max_length=255, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']  
    
    class Meta:
        db_table = 'custom_user'
        
class PendingUser(models.Model):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=255)
    password_hash = models.CharField(max_length=255)
    verification_token = models.CharField(max_length=255, unique = True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.verification_token:
            self.verification_token = secrets.token_urlsafe(32)
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=30)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_verified and timezone.now() < self.expires_at
    
    def create_user(self):
        """Create actual User from pending user data"""
        if not self.is_verified:
            raise ValueError("User must be verified before creating account")
        
        user = UserCustom.objects.create_user(
            username=self.username,
            email=self.email,
            password=None,  # Password already hashed
            is_active=True,
            last_login=timezone.now(),
        )
        
        user.password = self.password_hash
        user.save()
        
        return user
    
    class Meta:
        db_table = 'pending_user'


