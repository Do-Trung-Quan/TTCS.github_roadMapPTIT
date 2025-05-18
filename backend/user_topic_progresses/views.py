from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework import status
from .models import UserTopicProgress, User
from topic_roadmaps.models import TopicRoadmap
from roadmaps.models import Roadmap
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
        if not hasattr(request, 'auth_user') or not request.auth_user:
            return Response({
                'message': 'Authentication required to access progresses.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        authenticated_user_id = request.auth_user.get('_id', '')
        user_role = request.auth_user.get('role', '')

        # Lấy query parameter UserID
        query_user_id = request.query_params.get('UserID', None)

        if user_role == 'admin':
            # Admin có thể lọc theo UserID nếu có, nếu không thì lấy tất cả
            if query_user_id:
                progresses = UserTopicProgress.objects.filter(UserID=query_user_id)
                if not progresses.exists():
                    return Response({
                        'message': f'Không tìm thấy tiến trình cho UserID {query_user_id}.'
                    }, status=status.HTTP_404_NOT_FOUND)
                logger.info(f"Admin {authenticated_user_id} accessed progresses for user {query_user_id}")
            else:
                progresses = UserTopicProgress.objects.all()
                logger.info("Admin accessed all progresses")
        else:
            # Người dùng thông thường chỉ có thể xem dữ liệu của chính mình
            if query_user_id and query_user_id != authenticated_user_id:
                return Response({
                    'message': 'Bạn không có quyền truy cập dữ liệu của người dùng khác.'
                }, status=status.HTTP_403_FORBIDDEN)
            progresses = UserTopicProgress.objects.filter(UserID=authenticated_user_id)
            if not progresses.exists():
                return Response({
                    'message': f'Không tìm thấy tiến trình cho UserID {authenticated_user_id}.'
                }, status=status.HTTP_404_NOT_FOUND)
            logger.info(f"User {authenticated_user_id} accessed their own progresses")

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
        # Chỉ lấy status từ request, giữ nguyên UserID và TopicID từ instance
        serializer_data = {'status': data.get('status', instance.status)}
        serializer = self.get_serializer(instance, data=serializer_data, partial=True)
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

# API: Đếm số lượng Topics Completed và Currently Learning
class UserTopicStatusCountAPIView(APIView):
    authentication_classes = []
    permission_classes = [IsAdminOrUser]

    def get(self, request):
        if not hasattr(request, 'auth_user') or not request.auth_user:
            return Response({
                'message': 'Authentication required to access status count.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        authenticated_user_id = request.auth_user.get('_id', '')
        user_role = request.auth_user.get('role', '')

        if user_role == 'admin':
            user_id = request.query_params.get('user_id', authenticated_user_id)
            logger.info(f"Admin {authenticated_user_id} accessed status count for user {user_id}")
        else:
            user_id = authenticated_user_id
            logger.info(f"User {authenticated_user_id} accessed their own status count")

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'message': 'User không tồn tại.'
            }, status=status.HTTP_404_NOT_FOUND)

        completed = UserTopicProgress.objects.filter(UserID=user_id, status='done').count()
        currently_learning = UserTopicProgress.objects.filter(UserID=user_id, status__in=['pending', 'skip']).count()

        return Response({
            'user_id': user_id,
            'completed_topics': completed,
            'currently_learning': currently_learning
        }, status=status.HTTP_200_OK)

# API: Tính % hoàn thành theo từng roadmap
class UserRoadmapProgressAPIView(APIView):
    authentication_classes = []
    permission_classes = [IsAdminOrUser]

    def get(self, request):
        # Kiểm tra xác thực
        if not hasattr(request, 'auth_user') or not request.auth_user:
            return Response({
                'message': 'Authentication required to access roadmap progress.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        authenticated_user_id = request.auth_user.get('_id', '')
        user_role = request.auth_user.get('role', '')

        # Nếu là admin, có thể xem dữ liệu của user khác qua query param
        if user_role == 'admin':
            user_id = request.query_params.get('user_id', authenticated_user_id)
            logger.info(f"Admin {authenticated_user_id} accessed roadmap progress for user {user_id}")
        else:
            user_id = authenticated_user_id
            logger.info(f"User {authenticated_user_id} accessed their own roadmap progress")

        # Kiểm tra user_id hợp lệ
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'message': 'User không tồn tại.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Lấy roadmap_id từ query param (nếu có)
        roadmap_id = request.query_params.get('roadmap_id', None)

        # Bước 1: Lấy tất cả TopicID thuộc RoadmapID từ TopicRoadmap
        topic_roadmaps = TopicRoadmap.objects.all()
        if roadmap_id:
            topic_roadmaps = topic_roadmaps.filter(RoadmapID=roadmap_id)
            if not topic_roadmaps.exists():
                return Response({
                    'message': f'Không tìm thấy roadmap với ID {roadmap_id}.'
                }, status=status.HTTP_404_NOT_FOUND)

        # Bước 2: Lấy danh sách TopicID từ TopicRoadmap
        topic_ids = topic_roadmaps.values_list('TopicID', flat=True)

        # Bước 3: Lấy UserTopicProgress của user dựa trên danh sách TopicID
        user_progresses = UserTopicProgress.objects.filter(UserID=user_id, TopicID__in=topic_ids)

        # Bước 4: Nhóm theo RoadmapID và tính toán
        roadmap_progress = {}
        for tr in topic_roadmaps:
            roadmap_id = str(tr.RoadmapID)
            if roadmap_id not in roadmap_progress:
                # Lấy tổng số topic trong roadmap này
                total_topics = TopicRoadmap.objects.filter(RoadmapID=roadmap_id).count()
                # Lấy roadmap để lấy thông tin title (nếu cần)
                try:
                    roadmap = Roadmap.objects.get(id=roadmap_id)
                    roadmap_title = roadmap.title
                except Roadmap.DoesNotExist:
                    roadmap_title = "Unknown Roadmap"
                roadmap_progress[roadmap_id] = {
                    'roadmap_id': roadmap_id,
                    'roadmap_title': roadmap_title,
                    'total_topics': total_topics,
                    'completed_topics': 0,
                    'percentage_complete': 0.0
                }

            # Kiểm tra trạng thái của topic trong UserTopicProgress
            progress = user_progresses.filter(TopicID=tr.TopicID).first()
            if progress and progress.status == 'done':
                roadmap_progress[roadmap_id]['completed_topics'] += 1

        # Bước 5: Tính phần trăm hoàn thành
        for roadmap_id, data in roadmap_progress.items():
            total = data['total_topics']
            done = data['completed_topics']
            if total > 0:
                percentage = round((done / total) * 100, 2)
            else:
                percentage = 0.0
            data['percentage_complete'] = percentage  # Trả về số thay vì chuỗi

        # Chuyển dict thành list để trả về
        result = list(roadmap_progress.values())

        return Response({
            'message': 'Lấy tiến trình theo roadmap thành công.',
            'user_id': user_id,
            'data': result
        }, status=status.HTTP_200_OK)