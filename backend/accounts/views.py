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

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_profile(request, username):
    try:
        user = User.objects.get(username=username)
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)