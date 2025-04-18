from rest_framework import serializers
from .models import Exercise
from topics.models import Topic

class ExerciseSerializer(serializers.ModelSerializer):
    topic = serializers.CharField()  # nhận topic ID từ client

    class Meta:
        model = Exercise
        fields = ['id', 'title', 'description', 'difficulty', 'created_at', 'topic']

    def validate(self, data):
        topic_id = data.get('topic')
        if topic_id:
            if not Topic.objects.filter(id=topic_id).exists():
                raise serializers.ValidationError({"topic": "Topic không tồn tại."})
        return data

    def create(self, validated_data):
        topic_id = validated_data.pop('topic')
        topic = Topic.objects.get(id=topic_id)
        exercise = Exercise.objects.create(topic=topic, **validated_data)
        return exercise

    def update(self, instance, validated_data):
        if 'topic' in validated_data:
            topic_id = validated_data.pop('topic')
            instance.topic = Topic.objects.get(id=topic_id)

        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.difficulty = validated_data.get('difficulty', instance.difficulty)
        instance.save()
        return instance

    def delete(self, instance):
        instance.delete()
