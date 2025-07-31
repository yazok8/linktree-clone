from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'bio', 'profile_picture', 
                 'background_color', 'text_color', 'created_at']
        read_only_fields = ['id', 'created_at']
        
class UserProfileSerializer(serializers.ModelSerializer):
    links_count = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'bio', 'profile_picture', 
                 'background_color', 'text_color', 'links_count']
        read_only_fields = ['id', 'username']
    
    def get_links_count(self, obj):
        return obj.links.filter(is_active=True).count()
    
    