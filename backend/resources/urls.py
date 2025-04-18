from django.urls import path
from . import views

urlpatterns = [
    # Endpoint cho việc lấy danh sách và tạo mới Resource
    path('resources/', views.ResourceListCreate.as_view(), name='resource-list-create'),
    # Endpoint cho việc lấy, cập nhật và xóa Resource theo ID
    path('resources/<str:pk>/', views.ResourceDetail.as_view(), name='resource-detail'),
]
