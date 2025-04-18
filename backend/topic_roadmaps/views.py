from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TopicRoadmap
from .serializers import TopicRoadmapSerializer

# API cho việc lấy danh sách tất cả TopicRoadmap và tạo mới
class TopicRoadmapListCreate(APIView):
    def get(self, request):
        # Lấy tất cả các TopicRoadmap
        topic_roadmaps = TopicRoadmap.objects.all()
        serializer = TopicRoadmapSerializer(topic_roadmaps, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Tạo mới TopicRoadmap
        serializer = TopicRoadmapSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Lưu dữ liệu vào cơ sở dữ liệu
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# API cho việc lấy thông tin và xóa một TopicRoadmap theo ID
class TopicRoadmapDetail(APIView):
    def get(self, request, topic_id, roadmap_id):
        try:
            # Lấy thông tin TopicRoadmap theo topic_id và roadmap_id
            topic_roadmap = TopicRoadmap.objects.get(topic_id=topic_id, roadmap_id=roadmap_id)
        except TopicRoadmap.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)  # Nếu không tìm thấy

        serializer = TopicRoadmapSerializer(topic_roadmap)
        return Response(serializer.data)

    def delete(self, request, topic_id, roadmap_id):
        try:
            # Lấy TopicRoadmap cần xóa
            topic_roadmap = TopicRoadmap.objects.get(topic_id=topic_id, roadmap_id=roadmap_id)
        except TopicRoadmap.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)  # Nếu không tìm thấy

        topic_roadmap.delete()  # Xóa TopicRoadmap
        return Response(status=status.HTTP_204_NO_CONTENT)
