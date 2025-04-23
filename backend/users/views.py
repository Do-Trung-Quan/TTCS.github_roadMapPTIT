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

from rest_framework.authentication import SessionAuthentication

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
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

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
    permission_classes = [AllowAny]

    def get_object(self):
        """
        Nếu là Admin: trả về đối tượng User theo id được truyền trong URL.
        Nếu là User bình thường: trả về thông tin của chính họ.
        """
        user_id = self.kwargs.get(self.lookup_field)
        if self.request.user.is_admin():
            return User.objects.get(id=user_id)
        return self.request.user

class UserDeleteView(APIView):
    permission_classes = [AllowAny]

    def delete(self, request, id):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({"detail": "Người dùng không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_admin():
            return Response({"detail": "Không thể xóa tài khoản admin."}, status=status.HTTP_403_FORBIDDEN)

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserUpdateView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]  # 👈 Thêm để xử lý multipart/form-data

    def put(self, request, id):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({"detail": "Người dùng không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

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
        return Response(serializer.data)