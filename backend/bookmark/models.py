from django.db import models
from roadmaps.models import Roadmap
from users.models import User

class Bookmark(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='UserID')
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, db_column='RoadmapID')
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Bookmark'  # Đảm bảo tên bảng khớp với bảng MySQL
        managed = False  # Chỉ định không để Django tự động tạo hoặc thay đổi bảng này
        unique_together = ('user', 'roadmap')