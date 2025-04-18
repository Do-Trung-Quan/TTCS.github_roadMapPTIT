from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import UserTopicProgress
from .serializers import UserTopicProgressSerializer

# Lấy danh sách & Tạo mới tiến trình user-topic
class UserTopicProgressListCreate(APIView):
    def get(self, request):
        progresses = UserTopicProgress.objects.all()
        serializer = UserTopicProgressSerializer(progresses, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserTopicProgressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Xử lý chi tiết: GET - PUT - DELETE một tiến trình
class UserTopicProgressDetail(APIView):
    def get_object(self, user_id, topic_id):
        try:
            return UserTopicProgress.objects.get(UserID=user_id, TopicID=topic_id)
        except UserTopicProgress.DoesNotExist:
            return None

    def get(self, request, user_id, topic_id):
        progress = self.get_object(user_id, topic_id)
        if progress is None:
            return Response({'error': 'Không tìm thấy tiến trình!'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserTopicProgressSerializer(progress)
        return Response(serializer.data)

    def put(self, request, user_id, topic_id):
        progress = self.get_object(user_id, topic_id)
        if progress is None:
            return Response({'error': 'Không tìm thấy tiến trình!'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserTopicProgressSerializer(progress, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id, topic_id):
        progress = self.get_object(user_id, topic_id)
        if progress is None:
            return Response({'error': 'Không tìm thấy tiến trình!'}, status=status.HTTP_404_NOT_FOUND)

        progress.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Tính % hoàn thành của user
class CompletionPercentageAPIView(APIView):
    def get(self, request, user_id):
        total = UserTopicProgress.objects.filter(UserID=user_id).count()
        done = UserTopicProgress.objects.filter(UserID=user_id, status='done').count()

        if total == 0:
            percentage = 0
        else:
            percentage = round((done / total) * 100, 2)

        return Response({
            'user_id': user_id,
            'completed_topics': done,
            'total_topics': total,
            'percentage_complete': f"{percentage}%"
        }, status=status.HTTP_200_OK)
