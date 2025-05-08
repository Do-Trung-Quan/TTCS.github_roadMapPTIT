from django.db import models
from topics.models import Topic
from roadmaps.models import Roadmap
from core.models import AutoIDModel

class TopicRoadmap(AutoIDModel):
    PREFIX = 'TR'
    TopicID = models.ForeignKey(Topic, on_delete=models.CASCADE, db_column='TopicID')
    RoadmapID = models.ForeignKey(Roadmap, on_delete=models.CASCADE, db_column='RoadmapID')
    topic_order = models.IntegerField()

    class Meta:
        db_table = 'Topic_Roadmap'  # Đảm bảo tên bảng khớp với bảng MySQL
        managed = False  # Chỉ định không để Django tự động tạo hoặc thay đổi bảng này
        unique_together = (('TopicID', 'RoadmapID'),)