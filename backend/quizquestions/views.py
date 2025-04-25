from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import QuizQuestion
from .serializers import QuizQuestionSerializer
from rest_framework.permissions import AllowAny
from users.permissions import IsAdmin

from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF

class QuizQuestionListCreate(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]
    # API cho việc lấy danh sách và tạo mới QuizQuestion
    def get(self, request):
        quiz_questions = QuizQuestion.objects.all()
        serializer = QuizQuestionSerializer(quiz_questions, many=True)
        return Response(serializer.data)

    def post(self, request):
        # API cho việc tạo mới QuizQuestion
        serializer = QuizQuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuizQuestionDetail(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'PUT' or self.request.method == 'DELETE':
            return [IsAdmin()]
        return [AllowAny()]
    # API cho việc lấy thông tin và cập nhật, xóa QuizQuestion theo ID
    def get(self, request, pk):
        try:
            quiz_question = QuizQuestion.objects.get(pk=pk)
        except QuizQuestion.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = QuizQuestionSerializer(quiz_question)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            quiz_question = QuizQuestion.objects.get(pk=pk)
        except QuizQuestion.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = QuizQuestionSerializer(quiz_question, data=request.data, partial='True')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            quiz_question = QuizQuestion.objects.get(pk=pk)
        except QuizQuestion.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        quiz_question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
