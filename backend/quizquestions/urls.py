from django.urls import path
from . import views

urlpatterns = [
    # Endpoint cho việc lấy danh sách và tạo mới QuizQuestion
    path('quizquestions/', views.QuizQuestionListCreate.as_view(), name='quizquestion-list-create'),
    # Endpoint cho việc lấy, cập nhật và xóa QuizQuestion theo ID
    path('quizquestions/<str:pk>/', views.QuizQuestionDetail.as_view(), name='quizquestion-detail'),
]
