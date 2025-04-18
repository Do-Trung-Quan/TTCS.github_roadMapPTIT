from django.db import models
from topics.models import Topic
from roadmaps.models import Roadmap

class TopicRoadmap(models.Model):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE)

    class Meta:
        db_table = 'Topic_Roadmap'  # Đảm bảo tên bảng khớp với bảng MySQL
        managed = False  # Chỉ định không để Django tự động tạo hoặc thay đổi bảng này
        unique_together = ('topic', 'roadmap')