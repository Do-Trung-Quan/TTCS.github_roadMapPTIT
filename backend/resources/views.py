from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Resource
from .serializers import ResourceSerializer
import logging

logger = logging.getLogger(__name__)
class ResourceListCreate(APIView):
    # API cho việc lấy danh sách và tạo mới Resource
    def get(self, request):
        resources = Resource.objects.all()
        serializer = ResourceSerializer(resources, many=True)
        return Response(serializer.data)

    def post(self, request):
        # API cho việc tạo mới Resource
        serializer = ResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResourceDetail(APIView):
    # API cho việc lấy thông tin và cập nhật, xóa Resource theo ID
    
    def get(self, request, pk):
        try:
            resource = Resource.objects.get(pk=pk)
        except Resource.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ResourceSerializer(resource)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            resource = Resource.objects.get(pk=pk)
            serializer = ResourceSerializer(resource, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                logger.info(f"Updated resource: {resource.id}")
                return Response(serializer.data)
            logger.error(f"Update resource {pk} error: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Resource.DoesNotExist:
            return Response({"detail": "Resource không tồn tại."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Update resource {pk} error: {str(e)}")
            return Response({"detail": "Lỗi khi cập nhật resource."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            resource = Resource.objects.get(pk=pk)
        except Resource.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        resource.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

