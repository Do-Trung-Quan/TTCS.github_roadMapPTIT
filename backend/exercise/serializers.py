from rest_framework import serializers
from .models import Exercise
from topics.models import Topic

class ExerciseSerializer(serializers.ModelSerializer):
    topic = serializers.PrimaryKeyRelatedField(queryset=Topic.objects.all())
    topic_name = serializers.CharField(source='topic.title', read_only=True)

    class Meta:
        model = Exercise
        fields = ['id', 'title', 'description', 'difficulty', 'created_at', 'topic', 'topic_name']

    def validate(self, data):
        topic = data.get('topic')
        if topic and not Topic.objects.filter(id=topic.id).exists():
            raise serializers.ValidationError({"topic": "Topic không tồn tại."})
        return data

    def create(self, validated_data):
        topic = validated_data.pop('topic')
        exercise = Exercise.objects.create(topic=topic, **validated_data)
        return exercise

    def update(self, instance, validated_data):
        if 'topic' in validated_data:
            instance.topic = validated_data.pop('topic')

        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.difficulty = validated_data.get('difficulty', instance.difficulty)
        instance.save()
        return instance