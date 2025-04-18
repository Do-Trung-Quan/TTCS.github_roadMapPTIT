from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import QuizAnswer
from .serializers import QuizAnswerSerializer

class QuizAnswerListCreate(APIView):
    # API cho việc lấy danh sách và tạo mới QuizAnswer
    def get(self, request):
        quiz_answers = QuizAnswer.objects.all()
        serializer = QuizAnswerSerializer(quiz_answers, many=True)
        return Response(serializer.data)

    def post(self, request):
        # API cho việc tạo mới QuizAnswer
        serializer = QuizAnswerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class QuizAnswerDetail(APIView):
    # API cho việc lấy thông tin và cập nhật, xóa QuizAnswer theo ID
    def get(self, request, pk):
        try:
            quiz_answer = QuizAnswer.objects.get(pk=pk)
        except QuizAnswer.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = QuizAnswerSerializer(quiz_answer)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            quiz_answer = QuizAnswer.objects.get(pk=pk)
        except QuizAnswer.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = QuizAnswerSerializer(quiz_answer, data=request.data, partial='true')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            quiz_answer = QuizAnswer.objects.get(pk=pk)
        except QuizAnswer.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        quiz_answer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
