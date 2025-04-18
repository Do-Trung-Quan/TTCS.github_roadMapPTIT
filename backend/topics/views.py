
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Topic
from .serializers import TopicSerializer
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import logging

logger = logging.getLogger(__name__)

@method_decorator(csrf_exempt, name='dispatch')
class TopicListCreate(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            topics = Topic.objects.all()
            serializer = TopicSerializer(topics, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Get topics error: {str(e)}")
            return Response({"detail": "Lỗi khi lấy danh sách topic."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            logger.info(f"Received POST data: {request.data}")
            serializer = TopicSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Created topic: {serializer.data['id']}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            logger.error(f"Create topic error: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Post topic error: {str(e)}")
            return Response({"detail": f"Lỗi khi tạo topic: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
class TopicDetail(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            topic = Topic.objects.get(pk=pk)
            serializer = TopicSerializer(topic)
            return Response(serializer.data)
        except Topic.DoesNotExist:
            return Response({"detail": "Topic không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Get topic {pk} error: {str(e)}")
            return Response({"detail": "Lỗi khi lấy topic."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, pk):
        try:
            topic = Topic.objects.get(pk=pk)
            serializer = TopicSerializer(topic, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Updated topic: {topic.id}")
                return Response(serializer.data)
            logger.error(f"Update topic {pk} error: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Topic.DoesNotExist:
            return Response({"detail": "Topic không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Update topic {pk} error: {str(e)}")
            return Response({"detail": "Lỗi khi cập nhật topic."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            topic = Topic.objects.get(pk=pk)
            topic.delete()
            logger.info(f"Deleted topic: {pk}")
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Topic.DoesNotExist:
            return Response({"detail": "Topic không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Delete topic {pk} error: {str(e)}")
            return Response({"detail": f"Lỗi khi xóa topic: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)