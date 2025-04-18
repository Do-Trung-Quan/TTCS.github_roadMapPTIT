# accounts/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from django.views.decorators.csrf import csrf_exempt
from .models import User
from .serializers import (
    UserSerializer, SocialUserSerializer, LoginSerializer,
    EmailLoginSerializer, ResetPasswordEmailSerializer, ResetPasswordSerializer
)
from .permissions import IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
import logging

logger = logging.getLogger(__name__)

class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    @csrf_exempt
    def post(self, request, *args, **kwargs):
        logger.info(f"Register request data: {request.data}")
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Register error: {str(e)}")
            return Response(
                {"detail": f"Lỗi khi đăng ký: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

class SocialRegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SocialUserSerializer
    permission_classes = [AllowAny]

    @csrf_exempt
    def post(self, request, *args, **kwargs):
        logger.info(f"Social register request data: {request.data}")
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Social register error: {str(e)}")
            return Response(
                {"detail": f"Lỗi khi đăng ký social: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request, *args, **kwargs):
        logger.info(f"User list request received from user: {request.user}")
        try:
            return super().get(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error listing users: {str(e)}")
            return Response(
                {"detail": f"Lỗi khi lấy danh sách user: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserDetailView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    lookup_field = 'id'

class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, id):
        try:
            user = User.objects.get(id=id)
        except User.DoesNotExist:
            return Response({"detail": "Người dùng không tồn tại."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_admin():
            return Response({"detail": "Không thể xóa tài khoản admin."}, status=status.HTTP_403_FORBIDDEN)

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class LoginView(APIView):
    permission_classes = [AllowAny]

    @csrf_exempt
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

    @csrf_exempt
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

    @csrf_exempt
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

    @csrf_exempt
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