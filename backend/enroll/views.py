from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Enroll
from .serializers import EnrollSerializer
from django.shortcuts import get_object_or_404
from rest_framework.permissions import AllowAny
import logging

from rest_framework.authentication import SessionAuthentication

logger = logging.getLogger(__name__)


class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Bỏ qua kiểm tra CSRF

class EnrollListCreate(APIView):
    permission_classes = [AllowAny]

    # GET: Lấy danh sách tất cả Enroll
    def get(self, request):
        enrolls = Enroll.objects.all()
        serializer = EnrollSerializer(enrolls, many=True)
        return Response({
            'message': 'Lấy danh sách lượt đăng ký thành công.',
            'data': serializer.data
        })

    # POST: Tạo mới một bản ghi Enroll
    def post(self, request):
        serializer = EnrollSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Tạo mới lượt đăng ký thành công.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'message': 'Tạo mới lượt đăng ký thất bại.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class EnrollDetail(APIView):
    permission_classes = [AllowAny]
    def get_object(self, pk):
        # Lấy đối tượng Enroll theo pk
        return get_object_or_404(Enroll, pk=pk)

    def get(self, request, pk):
        # Lấy đối tượng Enroll và trả về dữ liệu
        enroll = self.get_object(pk)
        serializer = EnrollSerializer(enroll)
        return Response({
            'message': 'Lấy thành công thông tin enroll.',
            'data': serializer.data
        })

    def put(self, request, pk):
        # Cập nhật đối tượng Enroll
        enroll = self.get_object(pk)
        serializer = EnrollSerializer(enroll, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Cập nhật enroll thành công.',
                'data': serializer.data
            })
        return Response({
            'message': 'Cập nhật enroll thất bại.',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        # Xóa đối tượng Enroll
        enroll = self.get_object(pk)
        enroll.delete()
        return Response({
            'message': 'Xóa enroll thành công.'
        }, status=status.HTTP_204_NO_CONTENT)