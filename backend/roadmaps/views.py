from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Roadmap
from .serializers import RoadmapSerializer

class RoadmapListCreate(APIView):
    # GET: Lấy danh sách tất cả Roadmap
    def get(self, request):
        roadmaps = Roadmap.objects.all()
        serializer = RoadmapSerializer(roadmaps, many=True)
        return Response(serializer.data)

    # POST: Tạo mới một Roadmap
    def post(self, request):
        serializer = RoadmapSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Serializers sẽ tự động xử lý việc tạo mới
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RoadmapDetail(APIView):
    # GET: Lấy thông tin chi tiết Roadmap
    def get(self, request, pk):
        try:
            roadmap = Roadmap.objects.get(pk=pk)
        except Roadmap.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = RoadmapSerializer(roadmap)
        return Response(serializer.data)

    # PUT: Cập nhật thông tin Roadmap
    def put(self, request, pk):
        try:
            roadmap = Roadmap.objects.get(pk=pk)
        except Roadmap.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = RoadmapSerializer(roadmap, data=request.data)
        if serializer.is_valid():
            serializer.save()  # Serializers sẽ tự động xử lý việc cập nhật
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # DELETE: Xóa một Roadmap
    def delete(self, request, pk):
        try:
            # Lấy đối tượng Roadmap theo pk
            roadmap = Roadmap.objects.get(pk=pk)
        except Roadmap.DoesNotExist:
            # Nếu không tìm thấy, trả về lỗi 404
            return Response({"detail": "Roadmap not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Xóa đối tượng
        roadmap.delete()
        
        # Trả về phản hồi 204 (No Content) để báo xóa thành công
        return Response(status=status.HTTP_204_NO_CONTENT)
