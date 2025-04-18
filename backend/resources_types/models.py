from django.db import models
from core.models import AutoIDModel

class ResourceType(AutoIDModel):
    PREFIX = 'RT'
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'Resource_Type'  # Đảm bảo tên bảng khớp với bảng MySQL
        managed = False  # Chỉ định không để Django tự động tạo hoặc thay đổi bảng này
