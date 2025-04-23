from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Resource
from .serializers import ResourceSerializer
import logging
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF
    
logger = logging.getLogger(__name__)
class ResourceListCreate(APIView):
    permission_classes = [AllowAny]
    
    # GET: Lấy danh sách tài nguyên
    def get(self, request):
        resources = Resource.objects.all()
        serializer = ResourceSerializer(resources, many=True)
        return Response({
            "message": "Lấy danh sách tài nguyên thành công.",
            "data": serializer.data
        })

    # POST: Tạo mới tài nguyên
    def post(self, request):
        serializer = ResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Tạo mới tài nguyên thành công.",
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            "message": "Tạo mới tài nguyên thất bại.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ResourceDetail(APIView):
    permission_classes = [AllowAny]

    # GET: Lấy chi tiết tài nguyên theo ID
    def get(self, request, pk):
        try:
            resource = Resource.objects.get(pk=pk)
            serializer = ResourceSerializer(resource)
            return Response({
                "message": "Lấy thông tin tài nguyên thành công.",
                "data": serializer.data
            })
        except Resource.DoesNotExist:
            return Response({
                "message": "Tài nguyên không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)

    # PUT: Cập nhật tài nguyên
    def put(self, request, pk):
        try:
            resource = Resource.objects.get(pk=pk)
            serializer = ResourceSerializer(resource, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Cập nhật tài nguyên thành công.",
                    "data": serializer.data
                })
            return Response({
                "message": "Cập nhật tài nguyên thất bại.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Resource.DoesNotExist:
            return Response({
                "message": "Tài nguyên không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "message": f"Lỗi khi cập nhật tài nguyên: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # DELETE: Xóa tài nguyên
    def delete(self, request, pk):
        try:
            resource = Resource.objects.get(pk=pk)
            resource.delete()
            return Response({
                "message": "Xóa tài nguyên thành công."
            }, status=status.HTTP_204_NO_CONTENT)
        except Resource.DoesNotExist:
            return Response({
                "message": "Tài nguyên không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)