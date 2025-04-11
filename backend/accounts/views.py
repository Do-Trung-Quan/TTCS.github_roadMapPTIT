from rest_framework.generics import CreateAPIView, ListAPIView
from .models import User
from .serializers import UserSerializer, ResetPasswordEmailSerializer, ResetPasswordSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ObjectDoesNotExist


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'admin')

# Cho phép bất kỳ ai đăng ký
class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # Lấy thông tin từ request
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')  # Cũng lấy email nếu có

        # Trường hợp đăng nhập qua username và password
        if username and password:
            try:
                user = User.objects.get(username=username)
                if check_password(password, user.password):
                    return Response({
                        'message': 'Đăng nhập thành công',
                        'username': user.username,
                        'email': user.email
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({'detail': 'Mật khẩu không đúng.'}, status=status.HTTP_401_UNAUTHORIZED)
            except ObjectDoesNotExist:
                return Response({'detail': 'Tên đăng nhập không tồn tại.'}, status=status.HTTP_404_NOT_FOUND)

        # Trường hợp đăng nhập qua email (cho Gmail, GitHub)
        if email:
            try:
                # Kiểm tra email trong cơ sở dữ liệu
                user = User.objects.get(email=email)
                return Response({
                    'message': 'Đăng nhập thành công qua email',
                    'username': user.username,
                    'email': user.email
                }, status=status.HTTP_200_OK)
            except ObjectDoesNotExist:
                return Response({'detail': 'Email không tồn tại trong hệ thống.'}, status=status.HTTP_404_NOT_FOUND)

        # Trả về lỗi nếu không đủ thông tin
        return Response({'detail': 'Tên đăng nhập, mật khẩu hoặc email là bắt buộc.'}, status=status.HTTP_400_BAD_REQUEST)
    
class ResetPasswordEmailView(APIView):
    """
    API view để gửi email chứa link reset mật khẩu.
    """

    def post(self, request, *args, **kwargs):
        # Sử dụng serializer để xử lý dữ liệu yêu cầu từ client
        serializer = ResetPasswordEmailSerializer(data=request.data)
        
        # Kiểm tra xem dữ liệu có hợp lệ không
        if serializer.is_valid():
            # Gửi email reset mật khẩu
            user = User.objects.get(email=serializer.validated_data['email'])
            serializer.send_reset_link(user)
            return Response(
                {"detail": "Đường link đặt lại mật khẩu đã được gửi qua email."},
                status=status.HTTP_200_OK
            )

        # Nếu dữ liệu không hợp lệ, trả về lỗi
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    def post(self, request):
        """Xử lý yêu cầu đặt lại mật khẩu bằng username"""
        serializer = ResetPasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"detail": "Mật khẩu đã được thay đổi thành công."},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)