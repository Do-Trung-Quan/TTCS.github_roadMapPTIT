from django.db import models
from core.models import AutoIDModel
from quizquestions.models import QuizQuestion

class QuizAnswer(AutoIDModel):
    PREFIX = 'QA'
    option_text = models.TextField()
    is_correct = models.BooleanField(default=False)
    quiz_question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, db_column='Quiz_QuestionID')

    def __str__(self):
        return self.option_text[:50]
    
    class Meta:
        db_table = 'Quiz_Answer'  # Đảm bảo tên bảng khớp với bảng MySQL
        managed = False  # Chỉ định không để Django tự động tạo hoặc thay đổi bảng này
