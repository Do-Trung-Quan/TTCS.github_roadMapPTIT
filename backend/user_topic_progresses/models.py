from django.db import models
from topics.models import Topic
from users.models import User

class UserTopicProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('done', 'Done'),
        ('skip', 'Skip')
    ], default='pending')

    class Meta:
        unique_together = ('user', 'topic')
        db_table = 'User_Topic_Progress'  # Đảm bảo tên bảng khớp với bảng MySQL
        managed = False
