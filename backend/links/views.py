from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Link
from .serializers import LinkSerializer

User = get_user_model()

class LinkListCreateView(generics.ListCreateAPIView):
    serializer_class = LinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Link.objects.filter(user=self.request.user)

class LinkDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = LinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Link.objects.filter(user=self.request.user)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def public_links(request, username):
    try:
        user = User.objects.get(username=username)
        links = Link.objects.filter(user=user, is_active=True)
        serializer = LinkSerializer(links, many=True)
        return Response(serializer.data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)