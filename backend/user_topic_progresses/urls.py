from django.urls import path
from . import views

urlpatterns = [
    # Lấy danh sách và tạo mới tiến trình user-topic
    path('user-topic-progress/', views.UserTopicProgressListCreate.as_view(), name='user-topic-progress-list-create'),
    
    # Lấy, cập nhật, xóa tiến trình của user theo user_id và topic_id
    path('user-topic-progress/<str:pk>/', views.UserTopicProgressDetail.as_view(), name='user-topic-progress-detail'),

    # Tính % hoàn thành của user
    path('user-topic-progress/percentage/<str:pk>/', views.CompletionPercentageAPIView.as_view(), name='user-topic-progress-percentage'),

    # API mới: Đếm Topics Completed và Currently Learning
   path('user-topic-progress/status-count/', views.UserTopicStatusCountAPIView.as_view(), name='user-topic-progress-status-count'),
]