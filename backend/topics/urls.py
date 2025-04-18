from django.urls import path
from .views import TopicListCreate, TopicDetail

urlpatterns = [
    # GET, POST: Lấy danh sách Roadmap hoặc tạo mới Roadmap
    path('topics/', TopicListCreate.as_view(), name='topic-list-create'),
    
    # GET, PUT, DELETE: Lấy thông tin chi tiết Roadmap, cập nhật hoặc xóa Roadmap
    path('topics/<str:pk>/', TopicDetail.as_view(), name='topic-detail'),
]