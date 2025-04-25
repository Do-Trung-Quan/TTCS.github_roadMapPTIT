from rest_framework import serializers
from .models import Topic

class TopicSerializer(serializers.ModelSerializer):

    class Meta:
        model = Topic
        fields = ['id', 'title', 'description']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        try:
            return Topic.objects.create(**validated_data)
        except Exception as e:
            raise serializers.ValidationError(f"Lỗi khi tạo topic: {str(e)}")

    def update(self, instance, validated_data):
        # Cập nhật thông tin một Topic
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        return instance