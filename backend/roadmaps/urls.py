from django.urls import path
from .views import RoadmapListCreate, RoadmapDetail

urlpatterns = [
    # GET, POST: Lấy danh sách Roadmap hoặc tạo mới Roadmap
    path('roadmaps/', RoadmapListCreate.as_view(), name='roadmap-list-create'),
    
    # GET, PUT, DELETE: Lấy thông tin chi tiết Roadmap, cập nhật hoặc xóa Roadmap
    path('roadmaps/<str:pk>/', RoadmapDetail.as_view(), name='roadmap-detail'),
]
