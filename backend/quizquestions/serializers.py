from rest_framework import serializers
from .models import QuizQuestion, Exercise

class QuizQuestionSerializer(serializers.ModelSerializer):
    exercise = serializers.CharField()
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question_text', 'exercise']

    def create(self, validated_data):
        exercise_id = validated_data.pop('exercise')
        try:
            exercise = Exercise.objects.get(id=exercise_id)
        except Exercise.DoesNotExist:
            raise serializers.ValidationError({"exercise": "Không tìm thấy Exercise với id đã cung cấp."})

        question = QuizQuestion.objects.create(exercise=exercise, **validated_data)
        return question
    
    def update(self, instance, validated_data):
        if 'exercise' in validated_data:
            exercise_id = validated_data.pop('exercise')
            instance.exercise = Exercise.objects.get(id=exercise_id)
        instance.question_text = validated_data.get('question_text', instance.question_text)
        instance.save()
        return instance
    
    def delete(self, instance):
        instance.delete()
