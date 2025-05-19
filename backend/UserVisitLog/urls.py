from django.urls import path
from . import views

urlpatterns = [
    path('visit-log/', views.UserVisitLogCreateAPIView.as_view(), name='user-visit-log-create'),
    path('visit-logs/', views.UserVisitLogListAPIView.as_view(), name='user-visit-logs-list'),
]