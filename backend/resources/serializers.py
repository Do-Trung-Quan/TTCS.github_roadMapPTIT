from rest_framework import serializers
from .models import Resource
from topics.models import Topic
from resources_types.models import ResourceType

class ResourceSerializer(serializers.ModelSerializer):
    topic = serializers.CharField()
    resource_type = serializers.CharField()

    class Meta:
        model = Resource
        fields = ['id', 'title', 'url', 'topic', 'resource_type']

    def validate(self, data):
        topic_id = data.get('topic')
        if topic_id:
            if not Topic.objects.filter(id=topic_id).exists():
                raise serializers.ValidationError({"topic": "Topic không tồn tại."})

        resource_type_id = data.get('resource_type')
        if resource_type_id:
            if not ResourceType.objects.filter(id=resource_type_id).exists():
                raise serializers.ValidationError({"resource_type": "ResourceType không tồn tại."})
        return data

    def create(self, validated_data):
        topic = Topic.objects.get(id=validated_data.pop('topic'))
        resource_type = ResourceType.objects.get(id=validated_data.pop('resource_type'))
        resource = Resource.objects.create(topic=topic, resource_type=resource_type, **validated_data)
        return resource

    def update(self, instance, validated_data):
        if 'topic' in validated_data:
            instance.topic = Topic.objects.get(id=validated_data.pop('topic'))
        if 'resource_type' in validated_data:
            instance.resource_type = ResourceType.objects.get(id=validated_data.pop('resource_type'))
        instance.title = validated_data.get('title', instance.title)
        instance.url = validated_data.get('url', instance.url)
        instance.save()
        return instance
