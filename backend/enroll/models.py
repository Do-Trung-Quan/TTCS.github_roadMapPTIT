from django.db import models
from users.models import User
from roadmaps.models import Roadmap

class Enroll(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='UserID')
    roadmap = models.ForeignKey(Roadmap, on_delete=models.CASCADE, db_column='RoadmapID')
    start_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'Enroll'  # Đảm bảo tên bảng khớp với bảng MySQL
        managed = False  # Chỉ định không để Django tự động tạo hoặc thay đổi bảng này
        unique_together = ('user', 'roadmap')
    
    def __str__(self):
        return f"Enrollment {self.UserID} - {self.RoadmapID}"
