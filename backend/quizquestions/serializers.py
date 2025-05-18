from rest_framework import serializers
from .models import QuizQuestion, Exercise

class QuizQuestionSerializer(serializers.ModelSerializer):
    exercise = serializers.PrimaryKeyRelatedField(queryset=Exercise.objects.all())

    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'exercise']

    def create(self, validated_data):
        exercise = validated_data.pop('exercise')
        question = QuizQuestion.objects.create(exercise=exercise, **validated_data)
        return question

    def update(self, instance, validated_data):
        if 'exercise' in validated_data:
            instance.exercise = validated_data.pop('exercise')
        instance.question_text = validated_data.get('question_text', instance.question_text)
        instance.save()
        return instance

    def delete(self, instance):
        instance.delete()