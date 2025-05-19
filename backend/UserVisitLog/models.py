from django.db import models
from core.models import AutoIDModel
from django.utils import timezone
from users.models import User

class UserVisitLog(AutoIDModel):
    PREFIX = 'UVL'
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visit_logs')
    visit_date = models.DateField(default=timezone.now)
    login_streak = models.PositiveIntegerField(default=1)  # Đếm số ngày đăng nhập liên tục
    last_visit = models.DateTimeField(auto_now_add=True)  # Lần truy cập cuối cùng
    is_consecutive = models.BooleanField(default=False)  # Xác định ngày login có liên tiếp không

    class Meta:
        db_table = 'UserVisitLog'
        managed = False  # Bảng đã tồn tại trong MySQL
        indexes = [
            models.Index(fields=['user', 'visit_date'], name='user_visit_date_idx'),
        ]
        unique_together = ('user', 'visit_date')  # Đảm bảo mỗi user chỉ có 1 log mỗi ngày

    def __str__(self):
        return f"{self.user.username} - {self.visit_date} (Streak: {self.login_streak})"

    def update_streak(self):
        """
        Cập nhật streak login dựa trên ngày truy cập trước đó.
        Nếu ngày hiện tại liền kề với ngày trước, tăng streak; nếu không, reset về 1.
        """
        logs = UserVisitLog.objects.filter(user=self.user).order_by('-visit_date')
        if logs.count() > 1:
            previous_log = logs[1]  # Log trước đó
            days_diff = (self.visit_date - previous_log.visit_date).days
            if days_diff == 1:
                self.login_streak = previous_log.login_streak + 1
                self.is_consecutive = True
            else:
                self.login_streak = 1
                self.is_consecutive = False
        self.save()