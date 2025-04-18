from rest_framework import serializers
from .models import Roadmap

class RoadmapSerializer(serializers.ModelSerializer):
    class Meta:
        model = Roadmap
        fields = ['id', 'title', 'description', 'created_at']

    def create(self, validated_data):
        # Tạo một Roadmap mới
        return Roadmap.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Cập nhật thông tin một Roadmap
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.save()
        return instance
