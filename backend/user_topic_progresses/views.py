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
        # If the request is authenticated, filter bookmarks based on user role
        if hasattr(request, 'auth_user') and request.auth_user:
            user_role = request.auth_user.get('role', '')
            authenticated_user_id = request.auth_user.get('_id', '')

            if user_role == 'admin':
                # Admins can see all progresses
                progresses = UserTopicProgress.objects.all()
                logger.info("Admin accessed all progresses")
            else:
                # Non-admins can only see their own progresses
                progresses = UserTopicProgress.objects.filter(UserID=authenticated_user_id)
                logger.info(f"User {authenticated_user_id} accessed their own progresses")
        else:
            # Unauthenticated requests are denied (due to IsAdminOrUser)
            return Response({
                'message': 'Authentication required to access progresses.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        serializer = UserTopicProgressSerializer(progresses, many=True)
        return Response({
            'message': 'Lấy danh sách tiến trình thành công.',
            'data': serializer.data
        })

    def post(self, request):
        # Ensure the request is authenticated (handled by IsAdminOrUser)
        authenticated_user_id = request.auth_user['_id']
        user = User.objects.get(id=authenticated_user_id)

        # Modify the request data to set UserID from the token
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
        # Ensure UserID cannot be changed during update
        data = request.data.copy()
        data['UserID'] = str(instance.UserID.id)  # Keep the original UserID
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
        # Retrieve the specific UserTopicProgress object
        progress = self.get_object()  # This will use pk from the URL (e.g., PRG002)

        # Check object-level permissions (calls has_object_permission)
        # This ensures only the owner (UserID matches authenticated user) or an admin can proceed
        self.check_object_permissions(request, progress)

        # Get the user_id from the UserTopicProgress object
        user_id = progress.UserID.id

        # Log the access
        authenticated_user_id = request.auth_user.get('_id', '')
        if request.auth_user.get('role', '') == 'admin':
            logger.info(f"Admin {authenticated_user_id} accessed progress for user {user_id}")
        else:
            logger.info(f"User {authenticated_user_id} accessed their own progress")

        # Calculate total topics for this user
        total = UserTopicProgress.objects.filter(UserID=user_id).count()

        # Calculate completed topics (status == 'done')
        done = UserTopicProgress.objects.filter(UserID=user_id, status='done').count()

        # Calculate completion percentage
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