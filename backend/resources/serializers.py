from rest_framework import serializers
from .models import Resource
from topics.models import Topic
from resources_types.models import ResourceType

class ResourceSerializer(serializers.ModelSerializer):
    topic = serializers.PrimaryKeyRelatedField(queryset=Topic.objects.all())
    resource_type = serializers.PrimaryKeyRelatedField(queryset=ResourceType.objects.all())
    topic_name = serializers.CharField(source='topic.title', read_only=True)
    resource_type_name = serializers.CharField(source='resource_type.name', read_only=True)

    class Meta:
        model = Resource
        fields = ['id', 'title', 'url', 'topic', 'topic_name', 'resource_type', 'resource_type_name']

    def validate(self, data):
        topic = data.get('topic')
        if topic and not Topic.objects.filter(id=topic.id).exists():
            raise serializers.ValidationError({"topic": "Topic không tồn tại."})

        resource_type = data.get('resource_type')
        if resource_type and not ResourceType.objects.filter(id=resource_type.id).exists():
            raise serializers.ValidationError({"resource_type": "ResourceType không tồn tại."})
        return data

    def create(self, validated_data):
        topic = validated_data.pop('topic')
        resource_type = validated_data.pop('resource_type')
        resource = Resource.objects.create(topic=topic, resource_type=resource_type, **validated_data)
        return resource

    def update(self, instance, validated_data):
        if 'topic' in validated_data:
            instance.topic = validated_data.pop('topic')
        if 'resource_type' in validated_data:
            instance.resource_type = validated_data.pop('resource_type')
        instance.title = validated_data.get('title', instance.title)
        instance.url = validated_data.get('url', instance.url)
        instance.save()
        return instance