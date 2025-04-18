from django.urls import path
from . import views

urlpatterns = [
    # Endpoint cho việc lấy danh sách và tạo mới ResourceType
    path('resource_types/', views.ResourceTypeListCreate.as_view(), name='resource-type-list-create'),
    # Endpoint cho việc lấy, cập nhật và xóa ResourceType theo ID
    path('resource_types/<str:pk>/', views.ResourceTypeDetail.as_view(), name='resource-type-detail'),
]
