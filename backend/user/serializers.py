from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from . import models

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = models.PendingUser
        fields = [
            'email', 
            'username',
            'password',
        ]

    def validate_email(self, value):
        if models.UserCustom.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        if models.PendingUser.objects.filter(email=value, is_verified=False).exists():
            raise serializers.ValidationError("Verification email already sent to this address.")
        return value
    
    def validate_username(self, value):
        if models.UserCustom.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        if models.PendingUser.objects.filter(username=value, is_verified=False).exists():
            raise serializers.ValidationError("Username already taken.")
        return value
    
    def validate_password(self, value):
        user = models.UserCustom(
            email=self.initial_data.get('email'),
            username=self.initial_data.get('username'),
        )
        validate_password(value, user=user)
        return value
    
    def create(self, validated_data): 
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
        
        try:
            user = models.UserCustom.objects.get(email=login)
        except models.UserCustom.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password")
        
        if models.PendingUser.objects.filter(
            email=user.email, 
            is_verified=False
        ).exists():
            raise serializers.ValidationError("Please verify your email first")
        
        if not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials")
        
        data['user'] = user
        return data
    
