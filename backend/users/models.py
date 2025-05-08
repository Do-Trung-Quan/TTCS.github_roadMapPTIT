# accounts/models.py
from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from core.models import AutoIDModel

class User(AutoIDModel):
    PREFIX = 'US'
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=5, choices=[('admin', 'Admin'), ('user', 'User')], default='user')
    avatar = models.URLField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'User'
        managed = False  # Bảng đã tồn tại trong MySQL

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