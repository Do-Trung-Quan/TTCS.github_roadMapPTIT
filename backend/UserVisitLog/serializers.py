from rest_framework import serializers
from .models import UserVisitLog

class UserVisitLogSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)  # Thêm username của user để dễ đọc
    id = serializers.CharField(read_only=True)
    class Meta:
        model = UserVisitLog
        fields = ['id', 'user_username', 'visit_date', 'login_streak', 'last_visit', 'is_consecutive']
        read_only_fields = ['id', 'last_visit', 'login_streak', 'is_consecutive']  # Chỉ cho phép tạo visit_date