from rest_framework.views import APIView
from rest_framework.generics import RetrieveUpdateDestroyAPIView, GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from .models import UserTopicProgress, User
from topic_roadmaps.models import TopicRoadmap
from roadmaps.models import Roadmap
from enroll.models import Enroll
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

# API: Đếm số topic theo trạng thái done và pending/skip theo UserID từ token
class UserTopicProgressStatusCountByUser(APIView):
    authentication_classes = []
    permission_classes = [IsAdminOrUser, can_access_own_data(user_field='UserID')]

    def get(self, request):
        # Lấy UserID từ token
        authenticated_user_id = request.auth_user.get('_id', '')
        if not authenticated_user_id:
            return Response({
                'message': 'Không thể xác định UserID từ token.'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Đếm số topic theo trạng thái
        done_count = UserTopicProgress.objects.filter(UserID=authenticated_user_id, status='done').count()
        pending_or_skip_count = UserTopicProgress.objects.filter(UserID=authenticated_user_id, status__in=['pending', 'skip']).count()

        # Log hành động
        user_role = request.auth_user.get('role', '')
        if user_role == 'admin':
            logger.info(f"Admin {authenticated_user_id} accessed status counts for themselves")
        else:
            logger.info(f"User {authenticated_user_id} accessed their own status counts")

        return Response({
            'message': f'Đếm trạng thái topic thành công cho UserID {authenticated_user_id}.',
            'data': {
                'user_id': authenticated_user_id,
                'done_count': done_count,
                'pending_or_skip_count': pending_or_skip_count
            }
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

        # Lấy danh sách roadmap mà user đã đăng ký từ bảng Enroll
        enrolled_roadmaps = Enroll.objects.filter(UserID=user_id).values_list('RoadmapID', flat=True)

        if not enrolled_roadmaps.exists():
            return Response({
                'message': 'Bạn chưa đăng ký bất kỳ roadmap nào.',
                'user_id': user_id,
                'data': []
            }, status=status.HTTP_200_OK)

        # Lấy roadmap_id từ query param (nếu có)
        roadmap_id = request.query_params.get('roadmap_id', None)

        # Lọc TopicRoadmap dựa trên các roadmap đã đăng ký
        topic_roadmaps = TopicRoadmap.objects.filter(RoadmapID__in=enrolled_roadmaps)
        if roadmap_id:
            topic_roadmaps = topic_roadmaps.filter(RoadmapID=roadmap_id)
            if not topic_roadmaps.exists():
                return Response({
                    'message': f'Không tìm thấy roadmap với ID {roadmap_id} mà bạn đã đăng ký.'
                }, status=status.HTTP_404_NOT_FOUND)

        # Lấy danh sách các RoadmapID duy nhất từ các roadmap đã đăng ký
        roadmap_ids = topic_roadmaps.values_list('RoadmapID', flat=True).distinct()

        # Bước 2: Lấy danh sách TopicID từ TopicRoadmap theo từng RoadmapID
        roadmap_progress = {}
        for r_id in roadmap_ids:
            # Lấy tất cả topic thuộc roadmap này
            roadmap_topics = TopicRoadmap.objects.filter(RoadmapID=r_id)
            topic_ids = roadmap_topics.values_list('TopicID', flat=True)

            # Lấy UserTopicProgress của user dựa trên danh sách TopicID
            user_progresses = UserTopicProgress.objects.filter(UserID=user_id, TopicID__in=topic_ids)

            # Lấy thông tin roadmap
            try:
                roadmap = Roadmap.objects.get(id=r_id)
                roadmap_title = roadmap.title
            except Roadmap.DoesNotExist:
                roadmap_title = "Unknown Roadmap"

            # Tính total_topics và completed_topics
            total_topics = roadmap_topics.count()
            completed_topics = user_progresses.filter(status='done').count()

            # Tính phần trăm hoàn thành
            if total_topics > 0:
                percentage_complete = round((completed_topics / total_topics) * 100, 2)
            else:
                percentage_complete = 0.0

            # Lưu kết quả
            roadmap_progress[r_id] = {
                'roadmap_id': str(r_id),
                'roadmap_title': roadmap_title,
                'total_topics': total_topics,
                'completed_topics': completed_topics,
                'percentage_complete': percentage_complete
            }

            # Nếu percentage_complete là 100%, cập nhật completed_at trong Enroll
            if percentage_complete == 100.0:
                try:
                    enroll = Enroll.objects.get(UserID=user_id, RoadmapID=r_id)
                    if not enroll.completed_at:  # Chỉ cập nhật nếu chưa hoàn thành
                        enroll.completed_at = timezone.now()
                        enroll.save()
                        logger.info(f"Updated completed_at for Enroll {enroll.id} to {enroll.completed_at}")
                except Enroll.DoesNotExist:
                    logger.warning(f"No Enroll record found for UserID {user_id} and RoadmapID {r_id}")

        # Chuyển dict thành list để trả về
        result = list(roadmap_progress.values())

        return Response({
            'message': 'Lấy tiến trình theo roadmap thành công.',
            'user_id': user_id,
            'data': result
        }, status=status.HTTP_200_OK)