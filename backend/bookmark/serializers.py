from rest_framework import serializers
from .models import User, Roadmap, Bookmark

class BookmarkSerializer(serializers.ModelSerializer):
    UserID = serializers.CharField(max_length=36)  # ID của User
    RoadmapID = serializers.CharField(max_length=36)  # ID của Roadmap
    saved_at = serializers.DateTimeField(read_only=True)  # Trường saved_at tự động thêm vào khi tạo mới

    class Meta:
        model = Bookmark
        fields = ['UserID', 'RoadmapID', 'saved_at']

    def validate_UserID(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("Người dùng không tồn tại.")
        return value

    def validate_RoadmapID(self, value):
        if not Roadmap.objects.filter(id=value).exists():
            raise serializers.ValidationError("Roadmap không tồn tại.")
        return value

    def create(self, validated_data):
        # Tạo bookmark mới với UserID và RoadmapID
        return Bookmark.objects.create(
            user_id=validated_data['UserID'],
            roadmap_id=validated_data['RoadmapID']
        )
