from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import QuizAnswer
from .serializers import QuizAnswerSerializer
from rest_framework.permissions import AllowAny
from users.permissions import IsAdmin

from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF

class QuizAnswerListCreate(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]

    # GET: Lấy danh sách tất cả quiz answer
    def get(self, request):
        quiz_answers = QuizAnswer.objects.all()
        serializer = QuizAnswerSerializer(quiz_answers, many=True)
        return Response({
            'message': 'Lấy danh sách câu trả lời bài quiz thành công.',
            'data': serializer.data
        })

    # POST: Tạo mới quiz answer
    def post(self, request):
        serializer = QuizAnswerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Tạo câu trả lời bài quiz thành công.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'message': 'Tạo câu trả lời bài quiz thất bại.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class QuizAnswerDetail(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'PUT' or self.request.method == 'DELETE':
            return [IsAdmin()]
        return [AllowAny()]

    # GET: Lấy thông tin quiz answer theo pk
    def get(self, request, pk):
        try:
            quiz_answer = QuizAnswer.objects.get(pk=pk)
        except QuizAnswer.DoesNotExist:
            return Response({
                'message': 'Câu trả lời bài quiz không tồn tại.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = QuizAnswerSerializer(quiz_answer)
        return Response({
            'message': 'Lấy thông tin câu trả lời thành công.',
            'data': serializer.data
        })

    # PUT: Cập nhật quiz answer theo pk
    def put(self, request, pk):
        try:
            quiz_answer = QuizAnswer.objects.get(pk=pk)
        except QuizAnswer.DoesNotExist:
            return Response({
                'message': 'Câu trả lời bài quiz không tồn tại.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = QuizAnswerSerializer(quiz_answer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Cập nhật câu trả lời thành công.',
                'data': serializer.data
            })
        return Response({
            'message': 'Cập nhật câu trả lời thất bại.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    # DELETE: Xóa quiz answer theo pk
    def delete(self, request, pk):
        try:
            quiz_answer = QuizAnswer.objects.get(pk=pk)
        except QuizAnswer.DoesNotExist:
            return Response({
                'message': 'Câu trả lời bài quiz không tồn tại.'
            }, status=status.HTTP_404_NOT_FOUND)

        quiz_answer.delete()
        return Response({
            'message': 'Xóa câu trả lời thành công.'
        }, status=status.HTTP_204_NO_CONTENT)