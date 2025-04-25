from rest_framework import serializers
from .models import UserTopicProgress, User, Topic

class UserTopicProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTopicProgress
        fields = ['id', 'UserID', 'TopicID', 'status']  
    def validate_user(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("Người dùng không tồn tại.")
        return value

    def validate_topic(self, value):
        if not Topic.objects.filter(id=value).exists():
            raise serializers.ValidationError("Chủ đề (Topic) không tồn tại.")
        return value

    def create(self, validated_data):
        # Kiểm tra xem đã có UserTopicProgress cho UserID và TopicID này chưa
        if UserTopicProgress.objects.filter(UserID=validated_data['UserID'], TopicID=validated_data['TopicID']).exists():
            raise serializers.ValidationError("Người dùng đã tiến hành cho chủ đề này.")
        return UserTopicProgress.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance
