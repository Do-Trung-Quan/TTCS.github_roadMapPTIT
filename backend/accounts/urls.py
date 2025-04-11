from django.urls import path
from .views import RegisterView, UserListView, LoginView, ResetPasswordEmailView, ResetPasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('login/', LoginView.as_view(), name='login'),  
    path('reset-password-email/', ResetPasswordEmailView.as_view(), name='reset-password-email'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password')
]
