from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Bookmark
from .serializers import BookmarkSerializer

class BookmarkList(APIView):
    def get(self, request):
        # Lấy tất cả Bookmark
        bookmarks = Bookmark.objects.all()
        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response(serializer.data)

    def post(self, request):
        # Tạo mới Bookmark
        serializer = BookmarkSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class BookmarkDetail(APIView):
    def get(self, request, pk):
        try:
            bookmark = Bookmark.objects.get(pk=pk)
        except Bookmark.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = BookmarkSerializer(bookmark)
        return Response(serializer.data)

    def delete(self, request, pk):
        try:
            bookmark = Bookmark.objects.get(pk=pk)
        except Bookmark.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        bookmark.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
