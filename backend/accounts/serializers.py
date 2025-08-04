# accounts/serializers.py

from rest_framework import serializers
from dj_rest_auth.registration.serializers import RegisterSerializer
from django.contrib.auth import get_user_model
from allauth.account.utils import setup_user_email

User = get_user_model()

class CustomRegisterSerializer(RegisterSerializer):
    first_name = serializers.CharField(max_length=30, required=True)
    last_name = serializers.CharField(max_length=150, required=True)

    def validate_first_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("First name cannot be empty.")
        return value.strip()

    def validate_last_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Last name cannot be empty.")
        return value.strip()

    def get_cleaned_data(self):
        data_dict = super().get_cleaned_data()
        data_dict['first_name'] = self.validated_data.get('first_name', '').strip()
        data_dict['last_name'] = self.validated_data.get('last_name', '').strip()
        return data_dict

    def save(self, request):
        """
        Override save to handle custom fields properly and avoid allauth adapter issues
        """
        # Get the cleaned data
        cleaned_data = self.get_cleaned_data()
        
        # Create the user with the basic fields
        user = User.objects.create_user(
            username=cleaned_data['username'],
            email=cleaned_data['email'],
            password=cleaned_data['password1'],
            first_name=cleaned_data.get('first_name', ''),
            last_name=cleaned_data.get('last_name', ''),
        )
        
        # Setup user email (required by allauth)
        setup_user_email(request, user, [])
        
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                'bio', 'profile_picture', 'background_color',
                'text_color', 'created_at']
        read_only_fields = ['id', 'created_at']
        
class UserProfileSerializer(serializers.ModelSerializer):
    links_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'bio', 'profile_picture', 
                 'background_color', 'text_color', 'links_count']
        read_only_fields = ['id', 'username']
    
    def get_links_count(self, obj):
        return obj.links.filter(is_active=True).count()