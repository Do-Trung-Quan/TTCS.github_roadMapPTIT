from django.db import models
from django.contrib.auth.hashers import make_password, check_password

class User(models.Model):
    id = models.CharField(primary_key=True, max_length=36)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=5, choices=[('admin', 'Admin'), ('user', 'User')], default='user')
    avatar = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'User'
        managed = False  # Ngăn Django quản lý bảng (đã tồn tại trong MySQL)

    def __str__(self):
        return self.username

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return check_password(raw_password, self.password)

    def is_admin(self):
        return self.role == 'admin'

    def is_user(self):
        return self.role == 'user'

    @classmethod
    def generate_user_id(cls):
        # Lấy user có id lớn nhất (dựa trên số thứ tự sau 'US')
        last_user = cls.objects.filter(id__startswith='US').order_by('-id').first()
        if last_user:
            last_number = int(last_user.id[2:])  # Lấy số từ 'USxxx'
            new_number = last_number + 1
        else:
            new_number = 1
        
        if new_number > 999:
            raise ValueError("Đã đạt giới hạn số lượng user (999).")
        
        return f"US{new_number:03d}"  # Định dạng US001, US002, ...