from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)

        user_count = User.objects.count() + 1
        extra_fields.setdefault('id', f"US{user_count:03d}")  # USR001, USR002,...
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)

        if not user.avatar:
            user.avatar = 'ptitLogo.png'

        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, username, password, **extra_fields)

class User(AbstractBaseUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('user', 'User'),
    ]

    id = models.CharField(primary_key=True, max_length=36)
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=5, choices=ROLE_CHOICES)
    avatar = models.CharField(max_length=255, blank=True, null=True, default='ptitLogo.png')
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    class Meta:
        db_table = 'User'

    def __str__(self):
        return self.username

    # 👉 custom permission check
    def is_admin(self):
        return self.role == 'admin'

    def is_user(self):
        return self.role == 'user'
