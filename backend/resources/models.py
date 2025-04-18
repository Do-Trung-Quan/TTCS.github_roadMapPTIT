from django.db import models
from core.models import AutoIDModel
from topics.models import Topic
from resources_types.models import ResourceType

class Resource(AutoIDModel):
    PREFIX = 'RS'
    title = models.CharField(max_length=255)
    url = models.URLField()
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, db_column='TopicID')
    resource_type = models.ForeignKey(ResourceType, on_delete=models.CASCADE, db_column='Resource_TypeID')

    def __str__(self):
        return self.title
    
    class Meta:
        db_table = 'Resource'  # Đảm bảo tên bảng khớp với bảng MySQL
        managed = False  # Chỉ định không để Django tự động tạo hoặc thay đổi bảng này
