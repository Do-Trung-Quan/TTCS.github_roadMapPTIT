from rest_framework import serializers
from .models import Topic

class TopicSerializer(serializers.ModelSerializer):

    class Meta:
        model = Topic
        fields = ['id', 'title', 'description', 'topic_order']
        read_only_fields = ['id']

    def validate(self, data):
        if 'topic_order' in data and data['topic_order'] < 1:
            raise serializers.ValidationError({"topic_order": "Topic order phải lớn hơn 0."})
        return data
    
    def create(self, validated_data):
        try:
            return Topic.objects.create(**validated_data)
        except Exception as e:
            raise serializers.ValidationError(f"Lỗi khi tạo topic: {str(e)}")

    def update(self, instance, validated_data):
        # Cập nhật thông tin một Topic
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.topic_order = validated_data.get('topic_order', instance.topic_order)
        instance.save()
        return instance