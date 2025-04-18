from django.urls import path
from . import views

urlpatterns = [
    # Endpoint cho việc lấy danh sách và tạo mới QuizAnswer
    path('quizanswers/', views.QuizAnswerListCreate.as_view(), name='quizanswer-list-create'),
    # Endpoint cho việc lấy, cập nhật và xóa QuizAnswer theo ID
    path('quizanswers/<str:pk>/', views.QuizAnswerDetail.as_view(), name='quizanswer-detail'),
]
