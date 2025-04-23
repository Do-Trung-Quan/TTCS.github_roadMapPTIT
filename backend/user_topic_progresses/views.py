from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import UserTopicProgress
from .serializers import UserTopicProgressSerializer
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF

# Lấy danh sách & Tạo mới tiến trình user-topic
class UserTopicProgressListCreate(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        try:
            progresses = UserTopicProgress.objects.all()
            serializer = UserTopicProgressSerializer(progresses, many=True)
            return Response({
                "message": "Lấy danh sách tiến trình thành công.",
                "data": serializer.data
            })
        except Exception as e:
            return Response({
                "message": "Đã xảy ra lỗi khi lấy danh sách tiến trình."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            # Kiểm tra xem tiến trình đã tồn tại chưa
            UserID= request.data.get('UserID')
            TopicID = request.data.get('TopicID')

            if UserTopicProgress.objects.filter(UserID=UserID, TopicID=TopicID).exists():
                return Response({
                    "message": "Tiến trình này đã tồn tại cho user và topic này."
                }, status=status.HTTP_400_BAD_REQUEST)

            serializer = UserTopicProgressSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Tạo mới tiến trình thành công.",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                "message": "Dữ liệu không hợp lệ.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "message": f"Lỗi khi tạo tiến trình: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Xử lý chi tiết: GET - PUT - DELETE một tiến trình
class UserTopicProgressDetail(APIView):
    permission_classes = [AllowAny]

    def get_object(self, pk):
        try:
            return UserTopicProgress.objects.get(pk=pk)
        except UserTopicProgress.DoesNotExist:
            return None

    def get(self, request, pk):
        progress = self.get_object(pk)
        if progress is None:
            return Response({
                "message": "Không tìm thấy tiến trình với pk này."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = UserTopicProgressSerializer(progress)
        return Response({
            "message": "Lấy thông tin tiến trình thành công.",
            "data": serializer.data
        })

    def put(self, request, pk):
        progress = self.get_object(pk)
        if progress is None:
            return Response({
                "message": "Không tìm thấy tiến trình với pk này."
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = UserTopicProgressSerializer(progress, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "Cập nhật tiến trình thành công.",
                "data": serializer.data
            })
        return Response({
            "message": "Dữ liệu không hợp lệ.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        progress = self.get_object(pk)
        if progress is None:
            return Response({
                "message": "Không tìm thấy tiến trình với pk này."
            }, status=status.HTTP_404_NOT_FOUND)

        progress.delete()
        return Response({
            "message": "Xóa tiến trình thành công."
        }, status=status.HTTP_204_NO_CONTENT)



# Tính % hoàn thành của user
class CompletionPercentageAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        # Lấy tổng số tiến trình của user (dựa trên pk của UserTopicProgress)
        total = UserTopicProgress.objects.count()

        # Lấy số tiến trình đã hoàn thành của user
        done = UserTopicProgress.objects.filter(status='done').count()

        # Tính phần trăm hoàn thành
        if total == 0:
            percentage = 0
        else:
            percentage = round((done / total) * 100, 2)

        return Response({
            'progress_id': pk,
            'completed_topics': done,
            'total_topics': total,
            'percentage_complete': f"{percentage}%"
        }, status=status.HTTP_200_OK)