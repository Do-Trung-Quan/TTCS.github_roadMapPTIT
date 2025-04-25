from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Exercise
from .serializers import ExerciseSerializer
from rest_framework.permissions import AllowAny
from users.permissions import IsAdmin

from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF
    
class ExerciseListCreate(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]

    # GET: Lấy danh sách tất cả bài tập
    def get(self, request):
        exercises = Exercise.objects.all()
        serializer = ExerciseSerializer(exercises, many=True)
        return Response({
            'message': 'Lấy danh sách bài tập thành công.',
            'data': serializer.data
        })

    # POST: Tạo mới một bài tập
    def post(self, request):
        serializer = ExerciseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Tạo mới bài tập thành công.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'message': 'Tạo mới bài tập thất bại.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ExerciseDetail(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'PUT' or self.request.method == 'DELETE':
            return [IsAdmin()]
        return [AllowAny()]
    #API GET: Lấy thông tin bài tập theo pk
    def get(self, request, pk):
        try:
            exercise = Exercise.objects.get(pk=pk)
        except Exercise.DoesNotExist:
            return Response({
                'message': 'Bài tập không tồn tại.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ExerciseSerializer(exercise)
        return Response({
            'message': 'Lấy thông tin bài tập thành công.',
            'data': serializer.data
        })

    # API PUT: Cập nhật thông tin bài tập theo pk
    def put(self, request, pk):
        try:
            exercise = Exercise.objects.get(pk=pk)
        except Exercise.DoesNotExist:
            return Response({
                'message': 'Bài tập không tồn tại.'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ExerciseSerializer(exercise, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Cập nhật bài tập thành công.',
                'data': serializer.data
            })
        return Response({
            'message': 'Cập nhật bài tập thất bại.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    # API DELETE: Xóa bài tập theo pk
    def delete(self, request, pk):
        try:
            exercise = Exercise.objects.get(pk=pk)
        except Exercise.DoesNotExist:
            return Response({
                'message': 'Bài tập không tồn tại.'
            }, status=status.HTTP_404_NOT_FOUND)

        exercise.delete()
        return Response({
            'message': 'Xóa bài tập thành công.'
        }, status=status.HTTP_204_NO_CONTENT)