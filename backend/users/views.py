# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from .models import User
from .serializers import (
    UserSerializer, SocialUserSerializer, LoginSerializer,
    EmailLoginSerializer, ResetPasswordEmailSerializer, ResetPasswordSerializer
)
from rest_framework_simplejwt.tokens import RefreshToken
import cloudinary.uploader
from rest_framework.parsers import MultiPartParser, FormParser
from .permissions import IsAdmin, IsAdminOrUser, CanAccessOwnUserData

from rest_framework.authentication import SessionAuthentication

import logging

logger = logging.getLogger(__name__)

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF

class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"detail": f"Lỗi khi đăng ký: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

class SocialRegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SocialUserSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"detail": f"Lỗi khi đăng ký social: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Đăng nhập thành công',
                'username': user.username,
                'email': user.email,
                'avatar': user.avatar or 'https://res.cloudinary.com/dsm1uhecl/image/upload/v1744875601/ptitLogo_x3gko8.png',
                'tokens': tokens,
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)

class SocialLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = EmailLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            tokens = get_tokens_for_user(user)
            return Response({
                'message': 'Đăng nhập thành công qua email (xác thực social)',
                'username': user.username,
                'email': user.email,
                'tokens': tokens
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordEmailSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.get(email=serializer.validated_data['email'])
            serializer.send_reset_link(user)
            return Response(
                {"detail": "Đường link đặt lại mật khẩu đã được gửi qua email."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"detail": "Mật khẩu đã được thay đổi thành công."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    
    refresh['user_id'] = str(user.id)
    refresh['role'] = user.role  

    access_token = refresh.access_token
    access_token['user_id'] = str(user.id)
    access_token['role'] = user.role  

    logger.info(f"[Token] Generated token for user_id: {user.id}, role: {user.role}")
    
    return {
        'refresh': str(refresh),
        'access': str(access_token),
    }

class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = []
    permission_classes = [IsAdmin]

    def get(self, request, *args, **kwargs):
        try:
            return super().get(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"detail": f"Lỗi khi lấy danh sách user: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserDetailView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    lookup_field = 'id'
    authentication_classes = []
    permission_classes = [IsAdminOrUser, CanAccessOwnUserData]

    def get_object(self):
        user_id = self.kwargs.get(self.lookup_field)
        # Permission checks (IsAdminOrUser, CanAccessOwnUserData) should have already run
        # If we reach here, either the user is an admin or accessing their own data
        if self.request.auth_user.get('role') == 'admin':
            return User.objects.get(id=user_id)
        return self.request.user

class UserDeleteView(APIView):
    authentication_classes = []
    permission_classes = [IsAdminOrUser, CanAccessOwnUserData]

    def delete(self, request, id):
        try:
            user_to_delete = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({"detail": "Người dùng không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        # Get the authenticated user's ID and role
        authenticated_user_id = request.auth_user['_id']
        user_role = request.auth_user['role']

        # Prevent admins from deleting their own account
        if user_role == 'admin' and id == authenticated_user_id:
            return Response({"detail": "Admin không thể tự xóa tài khoản của chính mình."}, status=status.HTTP_403_FORBIDDEN)

        # Permission checks (IsAdminOrUser, CanAccessOwnUserData) already ensure:
        # - Users can only delete their own account (id matches authenticated_user_id)
        # - Admins can delete any account except their own (handled above)
        user_to_delete.delete()
        return Response({"message": "Xóa người dùng thành công."}, status=status.HTTP_204_NO_CONTENT)

class UserUpdateView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    authentication_classes = []
    permission_classes = [IsAdminOrUser, CanAccessOwnUserData]

    def put(self, request, id):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({"detail": "Người dùng không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        # Permission checks (IsAdminOrUser, CanAccessOwnUserData) already ensure the user can modify this data
        data = request.data

        if 'username' in data:
            user.username = data['username']

        if 'email' in data:
            user.email = data['email']

        if 'password' in data:
            user.set_password(data['password'])

        if 'avatar' in request.FILES:
            avatar_file = request.FILES['avatar']
            try:
                result = cloudinary.uploader.upload(avatar_file)
                user.avatar = result['secure_url']
            except Exception as e:
                return Response({"detail": f"Lỗi khi tải ảnh lên Cloudinary: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        user.save()
        serializer = UserSerializer(user)
        return Response({
            "message": "Cập nhật thông tin người dùng thành công.",
            "data": serializer.data
        })