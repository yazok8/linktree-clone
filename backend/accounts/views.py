from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, UserProfileSerializer

User = get_user_model()

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def patch(self, request, *args, **kwargs):
        """Handle partial updates to user profile"""
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([])  # Allow public access
def public_profile(request, username):
    """Get public profile data for a user"""
    try:
        user = User.objects.get(username=username)
        serializer = UserProfileSerializer(user)
        # Only return public fields
        data = {
            'username': user.username,
            'display_name': user.display_name,
            'bio': user.bio,
            'avatar': user.avatar.url if user.avatar else None,
            'background_color': user.background_color,
            'text_color': user.text_color,
        }
        return Response(data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)