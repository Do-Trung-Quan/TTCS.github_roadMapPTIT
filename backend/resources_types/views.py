from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ResourceType
from .serializers import ResourceTypeSerializer
from rest_framework.permissions import AllowAny
from users.permissions import IsAdmin

from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF

class ResourceTypeListCreate(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request):
        resource_types = ResourceType.objects.all()
        serializer = ResourceTypeSerializer(resource_types, many=True)
        return Response({
            "message": "Lấy danh sách loại tài nguyên thành công.",
            "data": serializer.data
        })

    def post(self, request):
        serializer = ResourceTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Tạo mới loại tài nguyên thành công.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "message": "Tạo mới loại tài nguyên thất bại.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ResourceTypeDetail(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'PUT' or self.request.method == 'DELETE':
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request, pk):
        try:
            resource_type = ResourceType.objects.get(pk=pk)
            serializer = ResourceTypeSerializer(resource_type)
            return Response({
                "message": "Lấy thông tin loại tài nguyên thành công.",
                "data": serializer.data
            })
        except ResourceType.DoesNotExist:
            return Response({
                "message": "Loại tài nguyên không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)

    def put(self, request, pk):
        try:
            resource_type = ResourceType.objects.get(pk=pk)
            serializer = ResourceTypeSerializer(resource_type, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Cập nhật loại tài nguyên thành công.",
                    "data": serializer.data
                })
            return Response({
                "message": "Cập nhật loại tài nguyên thất bại.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except ResourceType.DoesNotExist:
            return Response({
                "message": "Loại tài nguyên không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            resource_type = ResourceType.objects.get(pk=pk)
            resource_type.delete()
            return Response({
                "message": "Xóa loại tài nguyên thành công."
            }, status=status.HTTP_204_NO_CONTENT)
        except ResourceType.DoesNotExist:
            return Response({
                "message": "Loại tài nguyên không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)