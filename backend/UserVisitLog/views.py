from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import UserVisitLog
from .serializers import UserVisitLogSerializer
from users.permissions import IsAdminOrUser
from django.utils import timezone
from users.models import User

# Hàm hỗ trợ để ghi nhận lượt truy cập
def record_user_visit(user):
    if not user or not isinstance(user, User):
        return None
    visit_date = timezone.now().date()
    last_visit = timezone.now()

    # Kiểm tra user ID hợp lệ (phải là chuỗi nếu AutoIDModel định nghĩa id là CharField)
    if not isinstance(user.id, str):
        return None

    # Kiểm tra xem user đã có log cho ngày hôm nay chưa
    existing_log = UserVisitLog.objects.filter(user=user, visit_date=visit_date).first()
    if existing_log:
        # Cập nhật last_visit nếu đã có log
        existing_log.last_visit = last_visit
        existing_log.save(update_fields=['last_visit'])
        existing_log.update_streak()
        return existing_log

    # Tạo log mới
    visit_log = UserVisitLog(user=user, visit_date=visit_date, last_visit=last_visit)
    visit_log.save()
    visit_log.update_streak()
    return visit_log

class UserVisitLogCreateAPIView(APIView):
    permission_classes = [IsAdminOrUser]

    def post(self, request):
        user = request.user
        # Ghi nhận lượt truy cập bằng hàm record_user_visit
        visit_log = record_user_visit(user)
        if not visit_log:
            return Response({
                "message": "Người dùng không hợp lệ hoặc ID người dùng không đúng định dạng.",
                "errors": {"user": ["User object or user ID is invalid."]}
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = UserVisitLogSerializer(visit_log)
        # Thêm thông tin bổ sung: Tổng số ngày đã truy cập
        total_visits = UserVisitLog.objects.filter(user=user).count()
        
        if UserVisitLog.objects.filter(user=user, visit_date=timezone.now().date()).exists():
            return Response({
                "message": "Lượt truy cập đã được ghi nhận cho ngày hôm nay.",
                "data": serializer.data,
                "extra": {
                    "total_visits": total_visits
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "message": "Ghi nhận lượt truy cập thành công.",
                "data": serializer.data,
                "extra": {
                    "total_visits": total_visits
                }
            }, status=status.HTTP_201_CREATED)

class UserVisitLogListAPIView(APIView):
    permission_classes = [IsAdminOrUser]

    def get(self, request):
        user = request.user
        if not user or not isinstance(user, User) or not isinstance(user.id, str):
            return Response({
                "message": "Người dùng không hợp lệ hoặc ID người dùng không đúng định dạng.",
                "errors": {"user": ["User object or user ID is invalid."]}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            visit_logs = UserVisitLog.objects.filter(user=user).order_by('-visit_date')
            serializer = UserVisitLogSerializer(visit_logs, many=True)
            total_visits = visit_logs.count()
            return Response({
                "message": "Lấy danh sách lượt truy cập thành công.",
                "data": serializer.data,
                "extra": {
                    "total_visits": total_visits
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "message": "Lỗi khi lấy danh sách lượt truy cập.",
                "errors": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)