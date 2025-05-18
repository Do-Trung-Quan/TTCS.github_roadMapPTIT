from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView, GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import UserTopicProgress, User
from .serializers import UserTopicProgressSerializer
from users.permissions import IsAdminOrUser, can_access_own_data
from rest_framework.authentication import SessionAuthentication
import logging

logger = logging.getLogger(__name__)

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF

# Lấy danh sách & Tạo mới tiến trình user-topic
class UserTopicProgressListCreate(APIView):
    authentication_classes = []
    permission_classes = [IsAdminOrUser]

    def get(self, request):
        if hasattr(request, 'auth_user') and request.auth_user:
            user_role = request.auth_user.get('role', '')
            authenticated_user_id = request.auth_user.get('_id', '')

            if user_role == 'admin':
                progresses = UserTopicProgress.objects.all()
                logger.info("Admin accessed all progresses")
            else:
                progresses = UserTopicProgress.objects.filter(UserID=authenticated_user_id)
                logger.info(f"User {authenticated_user_id} accessed their own progresses")
        else:
            return Response({
                'message': 'Authentication required to access progresses.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UserTopicProgressSerializer(progresses, many=True)
        return Response({
            'message': 'Lấy danh sách tiến trình thành công.',
            'data': serializer.data
        })

    def post(self, request):
        authenticated_user_id = request.auth_user['_id']
        user = User.objects.get(id=authenticated_user_id)

        data = request.data.copy()
        data['UserID'] = authenticated_user_id

        serializer = UserTopicProgressSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Tạo mới tiến trình thành công.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'message': 'Dữ liệu không hợp lệ.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

# Xử lý chi tiết: GET - PUT - DELETE một tiến trình
class UserTopicProgressDetail(RetrieveUpdateDestroyAPIView):
    authentication_classes = []
    permission_classes = [IsAdminOrUser, can_access_own_data(user_field='UserID')]
    queryset = UserTopicProgress.objects.all()
    serializer_class = UserTopicProgressSerializer
    lookup_field = 'pk'

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'message': 'Lấy thông tin tiến trình thành công.',
            'data': serializer.data
        })

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data.copy()
        data['UserID'] = str(instance.UserID.id)
        serializer = self.get_serializer(instance, data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            'message': 'Cập nhật tiến trình thành công.',
            'data': serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'message': 'Xóa tiến trình thành công.'
        }, status=status.HTTP_204_NO_CONTENT)

# Tính % hoàn thành của user
class CompletionPercentageAPIView(GenericAPIView):
    authentication_classes = []
    permission_classes = [IsAdminOrUser, can_access_own_data(user_field='UserID')]
    queryset = UserTopicProgress.objects.all()
    lookup_field = 'pk'

    def get(self, request, *args, **kwargs):
        progress = self.get_object()
        self.check_object_permissions(request, progress)

        user_id = progress.UserID.id
        authenticated_user_id = request.auth_user.get('_id', '')

        if request.auth_user.get('role', '') == 'admin':
            logger.info(f"Admin {authenticated_user_id} accessed progress for user {user_id}")
        else:
            logger.info(f"User {authenticated_user_id} accessed their own progress")

        total = UserTopicProgress.objects.filter(UserID=user_id).count()
        done = UserTopicProgress.objects.filter(UserID=user_id, status='done').count()

        if total == 0:
            percentage = 0
        else:
            percentage = round((done / total) * 100, 2)

        return Response({
            'progress_id': str(progress.id),
            'user_id': user_id,
            'completed_topics': done,
            'total_topics': total,
            'percentage_complete': f"{percentage}%"
        }, status=status.HTTP_200_OK)

# API mới: Đếm số lượng Topics Completed và Currently Learning
class UserTopicStatusCountAPIView(APIView):
    authentication_classes = []
    permission_classes = [IsAdminOrUser]

    def get(self, request):
        # Lấy UserID từ token xác thực
        if not hasattr(request, 'auth_user') or not request.auth_user:
            return Response({
                'message': 'Authentication required to access status count.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        authenticated_user_id = request.auth_user.get('_id', '')
        user_role = request.auth_user.get('role', '')

        # Nếu là admin, có thể xem dữ liệu của user khác qua query param
        if user_role == 'admin':
            user_id = request.query_params.get('user_id', authenticated_user_id)
            logger.info(f"Admin {authenticated_user_id} accessed status count for user {user_id}")
        else:
            user_id = authenticated_user_id
            logger.info(f"User {authenticated_user_id} accessed their own status count")

        # Kiểm tra user_id hợp lệ
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'message': 'User không tồn tại.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Đếm các trạng thái
        completed = UserTopicProgress.objects.filter(UserID=user_id, status='done').count()
        currently_learning = UserTopicProgress.objects.filter(UserID=user_id, status__in=['pending', 'skip']).count()

        return Response({
            'user_id': user_id,
            'completed_topics': completed,
            'currently_learning': currently_learning
        }, status=status.HTTP_200_OK)