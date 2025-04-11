from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from django.conf import settings
from django.core.exceptions import ValidationError
from django.contrib.auth.hashers import check_password
from django.core.exceptions import ObjectDoesNotExist
from django.core.mail import send_mail
from django.template.loader import render_to_string

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    avatar = serializers.SerializerMethodField(read_only=True)
    role = serializers.CharField(default='user')
    created_at = serializers.DateTimeField(required=False, read_only=True)
    last_login = serializers.DateTimeField(required=False, read_only=True)

    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'password', 'role', 'avatar', 'created_at', 'last_login')
        read_only_fields = ('id', 'created_at')

    def get_avatar(self, obj):
        # Nếu avatar là None hoặc rỗng, dùng mặc định
        filename = obj.avatar or 'ptitLogo.png'
        return f"{settings.MEDIA_URL}{filename}"

    def create(self, validated_data):
        password = validated_data.pop('password')
        # Nếu không có avatar được gửi lên, dùng mặc định
        if not validated_data.get('avatar'):
            validated_data['avatar'] = 'ptitLogo.png'
        return User.objects.create_user(password=password, **validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        # Tìm user theo username
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError("Tên đăng nhập không tồn tại.")

        # Kiểm tra mật khẩu
        if not check_password(password, user.password):
            raise serializers.ValidationError("Mật khẩu không đúng.")

        # Nếu đăng nhập thành công, trả về user trong dữ liệu
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
        
        data['user'] = user
        return data


class ResetPasswordEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        """ Kiểm tra email có tồn tại trong cơ sở dữ liệu không """
        try:
            user = User.objects.get(email=value)
        except ObjectDoesNotExist:
            raise serializers.ValidationError("Email không tồn tại.")
        return value

    def send_reset_link(self, user):
        # Tạo link reset mật khẩu
        reset_link = f"http://localhost:3000/resetPassword?token={user.id}"

        # Sử dụng render_to_string để tạo nội dung email từ template HTML
        subject = "Đặt lại mật khẩu của bạn"
        message = render_to_string('ResetPasswordEmail.html', {
            'user': user,
            'reset_link': reset_link,
        })

        # Gửi email với nội dung HTML
        send_mail(
            subject,
            message,  # Nội dung email dưới dạng HTML
            'team3.e2202@gmail.com',  # Người gửi
            [user.email],  # Người nhận
            html_message=message,  # Nội dung HTML cho email
        )


class ResetPasswordSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_username(self, value):
        """Kiểm tra nếu người dùng tồn tại trong cơ sở dữ liệu"""
        if not User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Không tìm thấy người dùng với tên đăng nhập này.")
        return value

    def validate(self, data):
        """Kiểm tra mật khẩu xác nhận và các tiêu chí bảo mật"""
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if new_password != confirm_password:
            raise serializers.ValidationError("Mật khẩu xác nhận không khớp.")

        # Kiểm tra độ mạnh của mật khẩu
        if len(new_password) < 8:
            raise serializers.ValidationError("Mật khẩu phải có ít nhất 8 ký tự.")
        if not any(char.isupper() for char in new_password):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 chữ hoa.")
        if not any(char.isdigit() for char in new_password):
            raise serializers.ValidationError("Mật khẩu phải chứa ít nhất 1 số.")

        return data

    def save(self):
        """Cập nhật mật khẩu cho người dùng"""
        user = User.objects.get(username=self.validated_data['username'])
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user