from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('profile/<str:username>/', views.public_profile, name='public-profile'),
]