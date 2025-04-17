from django.contrib import admin
from django import forms
from .models import User

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

        if self.instance.pk is None:
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
    list_display = ('id', 'email', 'username', 'role', 'created_at')
    list_filter = ('role',)
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
    search_fields = ('email', 'username', 'id')
    ordering = ('email',)
    readonly_fields = ('id', 'created_at', 'last_login')

    def get_fieldsets(self, request, obj=None):
        if not obj:
            return self.add_fieldsets
        return super().get_fieldsets(request, obj)