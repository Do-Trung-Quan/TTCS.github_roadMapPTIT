from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import TopicRoadmap
from .serializers import TopicRoadmapSerializer
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from users.permissions import IsAdmin

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF

# API cho việc lấy danh sách tất cả TopicRoadmap và tạo mới
class TopicRoadmapListCreate(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request):
        # Lấy query parameter roadmap_id
        roadmap_id = request.query_params.get('roadmap_id', None)
        
        # Lọc TopicRoadmap theo roadmap_id nếu có
        if roadmap_id:
            topic_roadmaps = TopicRoadmap.objects.filter(RoadmapID=roadmap_id)
            if not topic_roadmaps.exists():
                return Response({
                    "message": f"Không tìm thấy TopicRoadmap cho RoadmapID {roadmap_id}."
                }, status=status.HTTP_404_NOT_FOUND)
        else:
            topic_roadmaps = TopicRoadmap.objects.all()

        serializer = TopicRoadmapSerializer(topic_roadmaps, many=True)
        return Response({
            "message": "Lấy danh sách TopicRoadmap thành công.",
            "data": serializer.data
        })

    def post(self, request):
        serializer = TopicRoadmapSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Tạo mới TopicRoadmap thành công.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "message": "Tạo mới TopicRoadmap thất bại.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class TopicRoadmapDetail(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'PUT' or self.request.method == 'DELETE':
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request, pk):
        try:
            topic_roadmap = TopicRoadmap.objects.get(pk=pk)
            serializer = TopicRoadmapSerializer(topic_roadmap)
            return Response({
                "message": "Lấy thông tin TopicRoadmap thành công.",
                "data": serializer.data
            })
        except TopicRoadmap.DoesNotExist:
            return Response({
                "message": "TopicRoadmap không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            topic_roadmap = TopicRoadmap.objects.get(pk=pk)
            serializer = TopicRoadmapSerializer(topic_roadmap, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Cập nhật TopicRoadmap thành công.",
                    "data": serializer.data
                })
            return Response({
                "message": "Cập nhật TopicRoadmap thất bại.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except TopicRoadmap.DoesNotExist:
            return Response({
                "message": "TopicRoadmap không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            topic_roadmap = TopicRoadmap.objects.get(pk=pk)
            topic_roadmap.delete()
            return Response({
                "message": "Xóa TopicRoadmap thành công."
            }, status=status.HTTP_204_NO_CONTENT)
        except TopicRoadmap.DoesNotExist:
            return Response({
                "message": "TopicRoadmap không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)