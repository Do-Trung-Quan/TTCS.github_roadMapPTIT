from rest_framework import serializers
from .models import User
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ObjectDoesNotExist
import uuid
import logging

logger = logging.getLogger(__name__)

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    avatar = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    role = serializers.ChoiceField(choices=[('user', 'User'), ('admin', 'Admin')], default='user')
    created_at = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'role', 'avatar', 'created_at', 'last_login')
        read_only_fields = ('id', 'created_at', 'last_login')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã được sử dụng.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Tên đăng nhập đã được sử dụng.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 8 ký tự.")
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 chữ hoa.")
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 số.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        if not user.avatar:
            user.avatar = 'https://res.cloudinary.com/dsm1uhecl/image/upload/v1744875601/ptitLogo_x3gko8.png'
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        
        # Kiểm tra quyền cập nhật (admin có thể thay đổi tất cả, user chỉ có thể cập nhật bản thân)
        user = self.context['request'].user
        if user != instance and not user.is_admin():
            raise serializers.ValidationError("Bạn không có quyền cập nhật thông tin của người khác.")
        
        # Nếu là admin, có thể thay đổi vai trò
        if 'role' in validated_data and not user.is_admin():
            validated_data.pop('role')  # Nếu không phải admin, không thể thay đổi vai trò
        
        # Cập nhật thông tin người dùng
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Cập nhật mật khẩu nếu có
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance
    
class SocialUserSerializer(serializers.ModelSerializer):
    avatar = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    role = serializers.ChoiceField(choices=[('user', 'User'), ('admin', 'Admin')], default='user')
    created_at = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'role', 'avatar', 'created_at', 'last_login')
        read_only_fields = ('id', 'created_at', 'last_login')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email đã được sử dụng.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Tên đăng nhập đã được sử dụng.")
        return value

    def create(self, validated_data):
        validated_data['password'] = make_password(str(uuid.uuid4()))
        user = User(**validated_data)
        if not user.avatar:
            user.avatar = 'https://res.cloudinary.com/dsm1uhecl/image/upload/v1744875601/ptitLogo_x3gko8.png'
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError("Tên đăng nhập không tồn tại.")

        if not user.check_password(password):
            raise serializers.ValidationError("Mật khẩu không đúng.")

        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        data['user'] = user
        return data

class EmailLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, data):
        email = data.get('email')

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Email không tồn tại trong hệ thống.")

        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        data['user'] = user
        return data

class ResetPasswordEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except ObjectDoesNotExist:
            raise serializers.ValidationError("Email không tồn tại.")
        return value

    def send_reset_link(self, user):
        reset_link = f"http://localhost:3000/resetPassword?token={user.id}"
        subject = "Đặt lại mật khẩu của bạn"
        message = render_to_string('ResetPasswordEmail.html', {
            'user': user,
            'reset_link': reset_link,
        })
        send_mail(
            subject,
            message,
            'team3.e2202@gmail.com',
            [user.email],
            html_message=message,
        )

class ResetPasswordSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Không tìm thấy người dùng với tên đăng nhập này.")
        return value

    def validate(self, data):
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if new_password != confirm_password:
            raise serializers.ValidationError("Mật khẩu xác nhận không khớp.")

        if len(new_password) < 8:
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 8 ký tự.")
        if not any(char.isupper() for char in new_password):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 chữ hoa.")
        if not any(char.isdigit() for char in new_password):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 số.")

        return data

    def save(self):
        user = User.objects.get(username=self.validated_data['username'])
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user