from django.db import models
from core.models import AutoIDModel
from topics.models import Topic

class Exercise(AutoIDModel):
    PREFIX = 'EX'
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ], default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, db_column='TopicID')

    class Meta:
        db_table = 'Exercise'  # Đảm bảo tên bảng khớp với bảng MySQL
        managed = False  # Chỉ định không để Django tự động tạo hoặc thay đổi bảng này

