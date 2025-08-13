import uuid
import random
from datetime import timedelta
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class UserCustom(AbstractUser):
    class AuthProviders(models.TextChoices):
        EMAIL = 'Email/Password'
        GOOGLE = 'Google'

    username = models.CharField(max_length=255)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, blank=False)
    auth_provider = models.CharField(max_length=20, choices=AuthProviders, default=AuthProviders.EMAIL)
    provider_id = models.CharField(max_length=255, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    class Meta:
        db_table = 'custom_user'    

class PendingUser(models.Model):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=255)
    password_hash = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    
    otp_code = models.CharField(max_length=6)
    otp_created_at = models.DateTimeField(auto_now_add=True)
    otp_attempts = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_verified and timezone.now() < self.expires_at
    
    def generate_otp(self):
        self.otp_code = str(random.randint(100000, 999999))
        self.otp_created_at = timezone.now()
        self.otp_attempts = 0
        self.save()
        return self.otp_code
    
    def is_otp_valid(self):
        if not self.otp_created_at:
            return False
        expiry_time = self.otp_created_at + timedelta(minutes=10)
        return timezone.now() < expiry_time
   
    def verify_otp(self, entered_otp):
        if self.otp_attempts >= 5:
            return False, "Too many attempts. Please request a new OTP."
        
        if not self.is_otp_valid():
            return False, "OTP has expired. Please request a new one."
        
        self.otp_attempts += 1
        self.save()
        
        if self.otp_code == entered_otp:
            self.is_verified = True
            self.save()
            return True, "OTP verified successfully!"
        
        return False, f"Invalid OTP. {5 - self.otp_attempts} attempts remaining."
   
    def create_user(self):
        if not self.is_verified:
            raise ValueError("User must be verified before creating account")
       
        user = UserCustom.objects.create_user(
            username=self.username,
            email=self.email,
            password=None,
            is_active=True,
            last_login=timezone.now(),
        )
       
        user.password = self.password_hash
        user.save()
        
        return user
   
    class Meta:
        db_table = 'pending_user'


