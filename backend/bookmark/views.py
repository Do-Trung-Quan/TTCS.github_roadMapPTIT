from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import Bookmark
from .serializers import BookmarkSerializer
from django.shortcuts import get_object_or_404
from rest_framework.authentication import SessionAuthentication
from users.models import User
from users.permissions import IsAdminOrUser, can_access_own_data



import logging

logger = logging.getLogger(__name__)

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return

class BookmarkList(APIView):
    authentication_classes = []
    permission_classes = [IsAdminOrUser]

    def get(self, request):
        # If the request is authenticated, filter bookmarks based on user role
        if hasattr(request, 'auth_user') and request.auth_user:
            user_role = request.auth_user.get('role', '')
            authenticated_user_id = request.auth_user.get('_id', '')

            if user_role == 'admin':
                # Admins can see all bookmarks
                bookmarks = Bookmark.objects.all()
                logger.info("Admin accessed all bookmarks")
            else:
                # Non-admins can only see their own bookmarks
                bookmarks = Bookmark.objects.filter(UserID=authenticated_user_id)
                logger.info(f"User {authenticated_user_id} accessed their own bookmarks")
        else:
            # Unauthenticated requests are denied (due to IsAdminOrUser)
            return Response({
                'message': 'Authentication required to access bookmarks.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        serializer = BookmarkSerializer(bookmarks, many=True)
        return Response({
            'message': 'Lấy danh sách bookmark thành công.',
            'data': serializer.data
        })

    def post(self, request):
        # Ensure the request is authenticated (handled by IsAdminOrUser)
        authenticated_user_id = request.auth_user['_id']
        user = User.objects.get(id=authenticated_user_id)

        # Modify the request data to set UserID from the token
        data = request.data.copy()
        data['UserID'] = authenticated_user_id

        serializer = BookmarkSerializer(data=data)
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

class BookmarkDetail(RetrieveUpdateDestroyAPIView):
    authentication_classes = []
    permission_classes = [IsAdminOrUser, can_access_own_data(user_field='UserID')]
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    lookup_field = 'pk'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'message': 'Lấy thành công thông tin bookmark.',
            'data': serializer.data
        })

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # Ensure UserID cannot be changed during update
        data = request.data.copy()
        data['UserID'] = str(instance.UserID.id)  # Keep the original UserID

        serializer = self.get_serializer(instance, data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            'message': 'Cập nhật bookmark thành công.',
            'data': serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'message': 'Xóa bookmark thành công.'
        }, status=status.HTTP_204_NO_CONTENT)