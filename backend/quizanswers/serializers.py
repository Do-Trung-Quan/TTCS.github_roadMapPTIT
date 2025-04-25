from rest_framework import serializers
from .models import QuizAnswer, QuizQuestion

class QuizAnswerSerializer(serializers.ModelSerializer):
    quiz_question = serializers.CharField()

    class Meta:
        model = QuizAnswer
        fields = ['id', 'option_text', 'is_correct', 'quiz_question']

    def create(self, validated_data):
        quiz_question_id = validated_data.pop('quiz_question')
        try:
            quiz_question = QuizQuestion.objects.get(id=quiz_question_id)
        except QuizQuestion.DoesNotExist:
            raise serializers.ValidationError({"quiz_question": "Câu hỏi không tồn tại."})
        
        return QuizAnswer.objects.create(quiz_question=quiz_question, **validated_data)

    def update(self, instance, validated_data):
        if 'quiz_question' in validated_data:
            quiz_question_id = validated_data.pop('quiz_question')
            try:
                instance.quiz_question = QuizQuestion.objects.get(id=quiz_question_id)
            except QuizQuestion.DoesNotExist:
                raise serializers.ValidationError({"quiz_question": "Câu hỏi không tồn tại."})

        instance.option_text = validated_data.get('option_text', instance.answer_text)
        instance.is_correct = validated_data.get('is_correct', instance.is_correct)
        instance.save()
        return instance

