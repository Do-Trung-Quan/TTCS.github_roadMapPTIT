from django.contrib import admin
from django import forms
from .models import User
from django.contrib import messages

class UserAdminForm(forms.ModelForm):
    password1 = forms.CharField(label='Mật khẩu', widget=forms.PasswordInput, required=False)
    password2 = forms.CharField(label='Xác nhận mật khẩu', widget=forms.PasswordInput, required=False)

    class Meta:
        model = User
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')

        if self.instance.pk is None:  # Tạo user mới
            if not password1 or not password2:
                raise forms.ValidationError('Vui lòng nhập mật khẩu và xác nhận mật khẩu.')
        if password1 or password2:
            if password1 != password2:
                raise forms.ValidationError('Mật khẩu và xác nhận mật khẩu không khớp.')
            if len(password1) < 8:
                raise forms.ValidationError('Mật khẩu phải có ít nhất 8 ký tự.')
            if not any(char.isupper() for char in password1):
                raise forms.ValidationError('Mật khẩu phải chứa ít nhất 1 chữ hoa.')
            if not any(char.isdigit() for char in password1):
                raise forms.ValidationError('Mật khẩu phải chứa ít nhất 1 số.')

        return cleaned_data

    def save(self, commit=True):
        user = super().save(commit=False)
        password1 = self.cleaned_data.get('password1')
        if password1:
            user.set_password(password1)
        if not user.id:
            user.id = User.generate_user_id()
        if commit:
            user.save()
        return user

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    form = UserAdminForm
    list_display = ('id', 'email', 'username', 'role', 'created_at', 'is_admin')
    list_filter = ('role',)
    search_fields = ('email', 'username', 'id')
    ordering = ('email',)
    readonly_fields = ('id', 'created_at', 'last_login')

    fieldsets = (
        (None, {'fields': ('id', 'email', 'username', 'password1', 'password2')}),
        ('Thông tin cá nhân', {'fields': ('avatar',)}),
        ('Phân quyền', {'fields': ('role',)}),
        ('Thời gian', {'fields': ('created_at', 'last_login')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role', 'avatar')}
        ),
    )

    def is_admin(self, obj):
        """Hiển thị trạng thái admin trong danh sách"""
        return obj.is_admin()
    is_admin.boolean = True
    is_admin.short_description = 'Admin'

    def delete_model(self, request, obj):
        """Xử lý xóa user"""
        if obj.is_admin():
            self.message_user(request, f"Không thể xóa tài khoản admin: {obj.username}", level=messages.ERROR)
        else:
            obj.delete()
            self.message_user(request, f"Đã xóa user: {obj.username}", level=messages.SUCCESS)

    def delete_queryset(self, request, queryset):
        """Xử lý xóa nhiều user"""
        admin_users = queryset.filter(role='admin')
        if admin_users.exists():
            self.message_user(
                request,
                f"Không thể xóa {admin_users.count()} tài khoản admin.",
                level=messages.ERROR
            )
            queryset = queryset.exclude(role='admin')
        if queryset.exists():
            count = queryset.count()
            queryset.delete()
            self.message_user(request, f"Đã xóa {count} user.", level=messages.SUCCESS)

    def get_queryset(self, request):
        """Tối ưu truy vấn"""
        return super().get_queryset(request).select_related()

    def has_delete_permission(self, request, obj=None):
        """Chỉ superuser được xóa admin"""
        if obj and obj.is_admin() and not request.user.is_superuser:
            return False
        return super().has_delete_permission(request, obj)

    def has_change_permission(self, request, obj=None):
        """Cho phép admin chỉnh sửa user"""
        return super().has_change_permission(request, obj)

    def has_view_permission(self, request, obj=None):
        """Cho phép admin xem user"""
        return super().has_view_permission(request, obj)