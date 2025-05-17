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
        return # Bỏ qua kiểm tra CSRF

class QuizQuestionListCreate(APIView):
    authentication_classes = []

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]

    # GET: Lấy danh sách câu hỏi theo exercise_id
    def get(self, request):
        exercise_id = request.query_params.get('exercise_id')
        if exercise_id:
            quiz_questions = QuizQuestion.objects.filter(exercise_id=exercise_id)
        else:
            quiz_questions = QuizQuestion.objects.all()
        serializer = QuizQuestionSerializer(quiz_questions, many=True)
        return Response({
            'message': 'Lấy danh sách câu hỏi thành công.',
            'data': serializer.data
        })

    # POST: Tạo mới câu hỏi
    def post(self, request):
        serializer = QuizQuestionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Tạo câu hỏi thành công.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'message': 'Tạo câu hỏi thất bại.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class QuizQuestionDetail(APIView):
    authentication_classes = []

    def get_permissions(self):
        if self.request.method == 'PUT' or self.request.method == 'DELETE':
            return [IsAdmin()]
        return [AllowAny()]

    # GET: Lấy thông tin câu hỏi theo pk
    def get(self, request, pk):
        try:
            quiz_question = QuizQuestion.objects.get(pk=pk)
        except QuizQuestion.DoesNotExist:
            return Response({
                'message': 'Câu hỏi không tồn tại.'
            }, status=status.HTTP_404_NOT_FOUND)
        serializer = QuizQuestionSerializer(quiz_question)
        return Response({
            'message': 'Lấy thông tin câu hỏi thành công.',
            'data': serializer.data
        })

    # PUT: Cập nhật câu hỏi theo pk
    def put(self, request, pk):
        try:
            quiz_question = QuizQuestion.objects.get(pk=pk)
        except QuizQuestion.DoesNotExist:
            return Response({
                'message': 'Câu hỏi không tồn tại.'
            }, status=status.HTTP_404_NOT_FOUND)
        serializer = QuizQuestionSerializer(quiz_question, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Cập nhật câu hỏi thành công.',
                'data': serializer.data
            })
        return Response({
            'message': 'Cập nhật câu hỏi thất bại.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    # DELETE: Xóa câu hỏi theo pk
    def delete(self, request, pk):
        try:
            quiz_question = QuizQuestion.objects.get(pk=pk)
        except QuizQuestion.DoesNotExist:
            return Response({
                'message': 'Câu hỏi không tồn tại.'
            }, status=status.HTTP_404_NOT_FOUND)
        quiz_question.delete()
        return Response({
            'message': 'Xóa câu hỏi thành công.'
        }, status=status.HTTP_204_NO_CONTENT)