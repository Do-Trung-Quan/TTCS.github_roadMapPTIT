from django.urls import path
from . import views

urlpatterns = [
    # Lấy danh sách và tạo mới tiến trình user-topic
    path('user-topic-progress/', views.UserTopicProgressListCreate.as_view(), name='user-topic-progress-list-create'),
    
    # Lấy, cập nhật, xóa tiến trình của user theo user_id và topic_id
    path('user-topic-progress/<str:pk>/', views.UserTopicProgressDetail.as_view(), name='user-topic-progress-detail'),
    
    # API: Đếm Topics Completed và Currently Learning
    path('user-topic-progress/status-count/', views.UserTopicStatusCountAPIView.as_view(), name='user-topic-progress-status-count'),
    
    # API: Tính % hoàn thành theo từng roadmap
    path('user-topic-progress/roadmap-progress/', views.UserRoadmapProgressAPIView.as_view(), name='user-roadmap-progress'),
]