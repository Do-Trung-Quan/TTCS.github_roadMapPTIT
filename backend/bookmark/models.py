from django.db import models
from roadmaps.models import Roadmap
from users.models import User
from core.models import AutoIDModel

class Bookmark(AutoIDModel):
    PREFIX = 'BM'
    UserID = models.ForeignKey(User, on_delete=models.CASCADE, db_column='UserID')
    RoadmapID = models.ForeignKey(Roadmap, on_delete=models.CASCADE, db_column='RoadmapID')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Bookmark'  # Đảm bảo tên bảng khớp với bảng MySQL
        managed = False  # Chỉ định không để Django tự động tạo hoặc thay đổi bảng này
        unique_together = (('UserID', 'RoadmapID'),)