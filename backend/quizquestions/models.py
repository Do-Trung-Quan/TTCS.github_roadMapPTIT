from django.db import models
from core.models import AutoIDModel
from exercise.models import Exercise

class QuizQuestion(AutoIDModel):
    PREFIX = 'QQ'
    question_text = models.TextField()
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, db_column='ExerciseID')

    def __str__(self):
        return self.question_text[:50]
    
    class Meta:
        db_table = 'Quiz_Question'  # Đảm bảo tên bảng khớp với bảng MySQL
        managed = False  # Chỉ định không để Django tự động tạo hoặc thay đổi bảng này
