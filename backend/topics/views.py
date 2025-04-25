
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from .models import Topic
from .serializers import TopicSerializer
from users.permissions import IsAdmin

from rest_framework.authentication import SessionAuthentication

class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSR

class TopicListCreate(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request):
        try:
            topics = Topic.objects.all()
            serializer = TopicSerializer(topics, many=True)
            return Response({
                "message": "Lấy danh sách Topic thành công.",
                "data": serializer.data
            })
        except Exception as e:
            return Response({
                "message": "Đã xảy ra lỗi khi lấy danh sách Topic."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        try:
            serializer = TopicSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Tạo mới Topic thành công.",
                    "data": serializer.data
                }, status=status.HTTP_201_CREATED)
            return Response({
                "message": "Dữ liệu không hợp lệ.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                "message": f"Lỗi khi tạo Topic: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class TopicDetail(APIView):
    authentication_classes = []
    def get_permissions(self):
        if self.request.method == 'PUT' or self.request.method == 'DELETE':
            return [IsAdmin()]
        return [AllowAny()]

    def get(self, request, pk):
        try:
            topic = Topic.objects.get(pk=pk)
            serializer = TopicSerializer(topic)
            return Response({
                "message": "Lấy thông tin Topic thành công.",
                "data": serializer.data
            })
        except Topic.DoesNotExist:
            return Response({
                "message": "Topic không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "message": "Đã xảy ra lỗi khi lấy thông tin Topic."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def put(self, request, pk):
        try:
            topic = Topic.objects.get(pk=pk)
            serializer = TopicSerializer(topic, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response({
                    "message": "Cập nhật Topic thành công.",
                    "data": serializer.data
                })
            return Response({
                "message": "Dữ liệu không hợp lệ.",
                "errors": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Topic.DoesNotExist:
            return Response({
                "message": "Topic không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "message": "Đã xảy ra lỗi khi cập nhật Topic."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, pk):
        try:
            topic = Topic.objects.get(pk=pk)
            topic.delete()
            return Response({
                "message": "Xóa Topic thành công."
            }, status=status.HTTP_204_NO_CONTENT)
        except Topic.DoesNotExist:
            return Response({
                "message": "Topic không tồn tại."
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                "message": f"Đã xảy ra lỗi khi xóa Topic: {str(e)}"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
