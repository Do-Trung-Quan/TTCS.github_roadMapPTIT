from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Exercise
from .serializers import ExerciseSerializer

class ExerciseListCreate(APIView):
    # API cho việc lấy danh sách và tạo mới Exercise
    def get(self, request):
        exercises = Exercise.objects.all()
        serializer = ExerciseSerializer(exercises, many=True)
        return Response(serializer.data)

    def post(self, request):
        # API cho việc tạo mới Exercise
        serializer = ExerciseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExerciseDetail(APIView):
    # API cho việc lấy thông tin và cập nhật, xóa Exercise theo ID
    def get(self, request, pk):
        try:
            exercise = Exercise.objects.get(pk=pk)
        except Exercise.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ExerciseSerializer(exercise)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            exercise = Exercise.objects.get(pk=pk)
        except Exercise.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ExerciseSerializer(exercise, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            exercise = Exercise.objects.get(pk=pk)
        except Exercise.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        exercise.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
