from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import ResourceType
from .serializers import ResourceTypeSerializer

class ResourceTypeListCreate(APIView):
    # API cho việc lấy danh sách và tạo mới ResourceType
    def get(self, request):
        resource_types = ResourceType.objects.all()
        serializer = ResourceTypeSerializer(resource_types, many=True)
        return Response(serializer.data)

    def post(self, request):
        # API cho việc tạo mới ResourceType
        serializer = ResourceTypeSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResourceTypeDetail(APIView):
    # API cho việc lấy thông tin và cập nhật, xóa ResourceType theo ID
    def get(self, request, pk):
        try:
            resource_type = ResourceType.objects.get(pk=pk)
        except ResourceType.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ResourceTypeSerializer(resource_type)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            resource_type = ResourceType.objects.get(pk=pk)
        except ResourceType.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = ResourceTypeSerializer(resource_type, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            resource_type = ResourceType.objects.get(pk=pk)
        except ResourceType.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        resource_type.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
