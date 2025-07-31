from django.urls import path
from . import views

urlpatterns = [
    path('', views.LinkListCreateView.as_view(), name='link-list-create'),
    path('<int:pk>/', views.LinkDetailView.as_view(), name='link-detail'),
    path('public/<str:username>/', views.public_links, name='public-links'),
]