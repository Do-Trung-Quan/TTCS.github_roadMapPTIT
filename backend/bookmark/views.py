from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Bookmark
from .serializers import BookmarkSerializer
from django.shortcuts import get_object_or_404
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny
from users.models import User
from roadmaps.models import Roadmap

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return

class BookmarkList(APIView):
    permission_classes = [AllowAny]

    # GET: Lấy tất cả bookmarks
    def get(self, request):
        bookmarks = Bookmark.objects.all()
        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response({
            'message': 'Lấy danh sách bookmark thành công.',
            'data': serializer.data
        })

    # POST: Tạo mới bookmark
    def post(self, request):
        serializer = BookmarkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Tạo bookmark thành công.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'message': 'Tạo bookmark thất bại.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class BookmarkDetail(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        # Lấy đối tượng Bookmark theo pk
        return get_object_or_404(Bookmark, pk=pk)

    def get(self, request, pk):
        # Lấy đối tượng Bookmark theo pk và trả về dữ liệu
        bookmark = self.get_object(pk)
        serializer = BookmarkSerializer(bookmark)
        return Response({
            'message': 'Lấy thành công thông tin bookmark.',
            'data': serializer.data
            })

    def put(self, request, pk):
        # Cập nhật đối tượng Bookmark theo pk
        bookmark = self.get_object(pk)
        serializer = BookmarkSerializer(bookmark, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Cập nhật bookmark thành công.',
                'data': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        # Xóa đối tượng Bookmark theo pk
        bookmark = self.get_object(pk)
        bookmark.delete()
        return Response({
            'message': 'Xóa bookmark thành công.'
        }, status=status.HTTP_204_NO_CONTENT)