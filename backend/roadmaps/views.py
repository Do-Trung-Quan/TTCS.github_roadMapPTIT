from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Roadmap
from .serializers import RoadmapSerializer
from rest_framework.permissions import AllowAny
from users.permissions import IsAdmin
from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF

class RoadmapListCreate(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request):
        roadmaps = Roadmap.objects.all()
        serializer = RoadmapSerializer(roadmaps, many=True)
        return Response({
            "message": "Lấy danh sách Roadmap thành công.",
            "data": serializer.data
        })

    def post(self, request):
        serializer = RoadmapSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Tạo mới Roadmap thành công.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "message": "Tạo mới Roadmap thất bại.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class RoadmapDetail(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'PUT' or self.request.method == 'DELETE':
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request, pk):
        try:
            roadmap = Roadmap.objects.get(pk=pk)
            serializer = RoadmapSerializer(roadmap)
            return Response({
                "message": "Lấy thông tin chi tiết Roadmap thành công.",
                "data": serializer.data
            })
        except Roadmap.DoesNotExist:
            return Response({
                "message": "Roadmap không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            roadmap = Roadmap.objects.get(pk=pk)
            serializer = RoadmapSerializer(roadmap, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Cập nhật Roadmap thành công.",
                    "data": serializer.data
                })
            return Response({
                "message": "Cập nhật Roadmap thất bại.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Roadmap.DoesNotExist:
            return Response({
                "message": "Roadmap không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            roadmap = Roadmap.objects.get(pk=pk)
            roadmap.delete()
            return Response({
                "message": "Xóa Roadmap thành công."
            }, status=status.HTTP_204_NO_CONTENT)
        except Roadmap.DoesNotExist:
            return Response({
                "message": "Roadmap không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)
