from django.urls import path
from . import views

urlpatterns = [
    # Endpoint cho việc lấy danh sách và tạo mới Exercise
    path('exercises/', views.ExerciseListCreate.as_view(), name='exercise-list-create'),
    # Endpoint cho việc lấy, cập nhật và xóa Exercise theo ID
    path('exercises/<str:pk>/', views.ExerciseDetail.as_view(), name='exercise-detail'),
]
