from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from . import models

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators = [validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = models.PendingUser
        fields = [
            'email', 
            'username',
            'password',
            'password_confirm',
        ]

    def validate_email(self, value):
        # Check if email already exists in User or PendingUser
        if models.UserCustom.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        if models.PendingUser.objects.filter(email=value, is_verified=False).exists():
            raise serializers.ValidationError("Verification email already sent to this address.")
        return value
    
    def validate_username(self, value):
        # Check if username already exists in User or PendingUser
        if models.UserCustom.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        if models.PendingUser.objects.filter(username=value, is_verified=False).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        
        password = validated_data.pop('password')
        validated_data['password_hash'] = make_password(password)
        
        models.PendingUser.objects.filter(email=validated_data['email'], is_verified=False).delete()
        
        return models.PendingUser.objects.create(**validated_data)
    
class UserLoginSerializer(serializers.Serializer):  
    login = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=255)
   
    def validate(self, data):
        login = data.get('login')
        password = data.get('password')
        
        if '@' in login:
            try:
                user = models.UserCustom.objects.get(email=login)
            except models.UserCustom.DoesNotExist:
                raise serializers.ValidationError("Invalid email or password.")
        else:
            try:
                user = models.UserCustom.objects.get(username=login)
            except models.UserCustom.DoesNotExist:
                raise serializers.ValidationError("Invalid username or password.")
        
        if models.PendingUser.objects.filter(
            email=user.email, 
            is_verified=False
        ).exists():
            raise serializers.ValidationError("Please verify your email first.")
        
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials.")
        
        data['user'] = user
        return data