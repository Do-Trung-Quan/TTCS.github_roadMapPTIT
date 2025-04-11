from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'role')
    list_filter = ('role',)

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        ('Thông tin cá nhân', {'fields': ('avatar',)}),
        ('Phân quyền', {'fields': ('role',)}),
        ('Thời gian', {'fields': ('created_at',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'role')}
        ),
    )

    search_fields = ('email', 'username')
    ordering = ('email',)
    readonly_fields = ('created_at',)
