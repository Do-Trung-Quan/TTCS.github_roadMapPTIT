from django.urls import path
from .views import (
    RegisterView,
    SocialRegisterView,
    UserListView,
    UserDetailView,
    UserDeleteView,
    UserUpdateView,
    LoginView,
    SocialLoginView,
    ResetPasswordEmailView,
    ResetPasswordView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('social-register/', SocialRegisterView.as_view(), name='social-register'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<str:id>/', UserDetailView.as_view(), name='user-detail'),
    path('users/<str:id>/delete/', UserDeleteView.as_view(), name='user-delete'),
    path('users/<str:id>/update/', UserUpdateView.as_view(), name='user-update'),
    path('login/', LoginView.as_view(), name='login'),
    path('social-login/', SocialLoginView.as_view(), name='social-login'),
    path('password/reset-email/', ResetPasswordEmailView.as_view(), name='reset-password-email'),
    path('password/reset/', ResetPasswordView.as_view(), name='reset-password'),
]
