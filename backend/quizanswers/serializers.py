from rest_framework import serializers
from .models import QuizAnswer, QuizQuestion

class QuizAnswerSerializer(serializers.ModelSerializer):
    quiz_question = serializers.CharField()
    class Meta:
        model = QuizAnswer
        fields = ['id', 'option_text', 'is_correct', 'quiz_question']

    def create(self, validated_data):
        return QuizAnswer.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if 'quiz_question' in validated_data:
            quizQuestion_id = validated_data.pop('quiz_question')
            instance.quiz_question = QuizQuestion.objects.get(id=quizQuestion_id)
        instance.option_text = validated_data.get('option_text', instance.option_text)
        instance.is_correct = validated_data.get('is_correct', instance.is_correct)
        instance.save()
        return instance

    def delete(self, instance):
        instance.delete()
