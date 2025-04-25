from django.urls import path
from . import views

urlpatterns = [
    # Endpoint cho việc lấy danh sách và tạo TopicRoadmap
    path('topic-roadmap/', views.TopicRoadmapListCreate.as_view(), name='topic-roadmap-list-create'),
    # Endpoint cho việc lấy, cập nhật và xóa TopicRoadmap theo topic_id và roadmap_id
    path('topic-roadmap/<str:pk>/', views.TopicRoadmapDetail.as_view(), name='topic-roadmap-detail'),
]
