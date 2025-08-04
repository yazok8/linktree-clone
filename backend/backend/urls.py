from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from accounts.serializers import UserProfileSerializer

@require_http_methods(["GET"])
def csrf_token_view(request):
    return JsonResponse({'csrfToken': get_token(request)})


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def user_details_view(request):
    if request.method == 'GET':
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    elif request.method == 'PATCH':
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Custom user details endpoint
    path('api/auth/user/', user_details_view, name='user-details'),
    
    # Authentication URLs
    path('api/auth/', include('dj_rest_auth.urls')),
    
    path('api/auth/csrf/', csrf_token_view, name='csrf-token'),
    
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # App URLs
    path('api/accounts/', include('accounts.urls')),
    path('api/links/', include('links.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)