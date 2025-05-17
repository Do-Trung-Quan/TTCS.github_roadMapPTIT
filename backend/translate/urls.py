# translate/urls.py
from django.urls import path
from .views import TranslateAPIView

urlpatterns = [
    path('translate/', TranslateAPIView.as_view(), name='translate'),
]