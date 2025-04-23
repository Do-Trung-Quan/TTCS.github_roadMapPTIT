from django.db import models
from topics.models import Topic
from users.models import User
from core.models import AutoIDModel

class UserTopicProgress(AutoIDModel):
    PREFIX = 'PRG'
    UserID = models.ForeignKey(User, on_delete=models.CASCADE, db_column='UserID')
    TopicID = models.ForeignKey(Topic, on_delete=models.CASCADE, db_column= 'TopicID')
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('done', 'Done'),
        ('skip', 'Skip')
    ], default='pending')

    class Meta:
        unique_together = (('UserID', 'TopicID'),)
        db_table = 'User_Topic_Progress'  # Đảm bảo tên bảng khớp với bảng MySQL
        managed = False
