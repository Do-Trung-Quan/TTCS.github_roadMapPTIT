from rest_framework import serializers
from .models import UserTopicProgress, User, Topic
class UserTopicProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserTopicProgress
        fields = ['UserID', 'TopicID', 'status']

    def validate_UserID(self, value):
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("Người dùng không tồn tại.")
        return value

    def validate_TopicID(self, value):
        if not Topic.objects.filter(id=value).exists():
            raise serializers.ValidationError("Chủ đề (Topic) không tồn tại.")
        return value

    def create(self, validated_data):
        return UserTopicProgress.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.save()
        return instance
