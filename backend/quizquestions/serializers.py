from rest_framework import serializers
from .models import QuizQuestion, Exercise

class QuizQuestionSerializer(serializers.ModelSerializer):
    exercise = serializers.CharField()
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'exercise']

    def create(self, validated_data):
        return QuizQuestion.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        if 'exercise' in validated_data:
            exercise_id = validated_data.pop('exercise')
            instance.exercise = Exercise.objects.get(id=exercise_id)
        instance.question_text = validated_data.get('question_text', instance.question_text)
        instance.save()
        return instance
    
    def delete(self, instance):
        instance.delete()
