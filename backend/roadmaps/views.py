from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Roadmap
from .serializers import RoadmapSerializer
from rest_framework.permissions import AllowAny
from users.permissions import IsAdmin
from rest_framework.authentication import SessionAuthentication
from django.db.models import Q
from rest_framework.pagination import PageNumberPagination

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF

class CustomPagination(PageNumberPagination):
    page_size = 5  # Số mục mặc định trên mỗi trang
    page_size_query_param = 'page_size'  # Tùy chỉnh số mục qua query param
    max_page_size = 20  # Giới hạn tối đa số mục trên một trang

class RoadmapListCreate(APIView):
    authentication_classes = []
    pagination_class = CustomPagination

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request):
        # Lấy từ khóa tìm kiếm từ query parameters
        search_term = request.query_params.get('search', None)
        paginator = self.pagination_class()
        queryset = Roadmap.objects.all()

        if search_term:
            # Tìm kiếm các roadmap theo tiêu đề hoặc mô tả
            queryset = Roadmap.objects.filter(
                Q(title__icontains=search_term) | Q(description__icontains=search_term)
            )

        # Áp dụng phân trang
        page = paginator.paginate_queryset(queryset, request)
        serializer = RoadmapSerializer(page, many=True)

        return paginator.get_paginated_response({
            "message": "Lấy danh sách Roadmap thành công." if not search_term else f"Tìm kiếm Roadmap với '{search_term}' thành công.",
            "data": serializer.data,
            "count": paginator.page.paginator.count,  # Tổng số mục
            "next": paginator.get_next_link(),
            "previous": paginator.get_previous_link(),
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
