from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),  # Đường dẫn đến trang admin của Django
    path('api/', include('users.urls')),  # Endpoint chung cho API người dùng (register, login, profile, v.v.)
    path('api/', include('topics.urls')),  # Endpoint cho API quản lý topic
    path('api/', include('resources.urls')),  # Endpoint cho API quản lý resources
    path('api/', include('exercise.urls')),  # Endpoint cho API quản lý exercises
    path('api/', include('quizquestions.urls')),  # Endpoint cho API quản lý câu hỏi quiz
    path('api/', include('quizanswers.urls')),  # Endpoint cho API quản lý câu trả lời quiz
    path('api/', include('enroll.urls')),  # Endpoint cho API quản lý đăng ký (enroll)
    path('api/', include('roadmaps.urls')),  # Endpoint cho API quản lý roadmap
    path('api/', include('resources_types.urls')),  # Endpoint cho API quản lý loại tài nguyên
    path('api/', include('topic_roadmaps.urls')),  # Endpoint cho API quản lý mối quan hệ topic-roadmap
    path('api/', include('user_topic_progresses.urls')), # Endpoint cho API theo dõi tiến trình topic của người dùng
    path('api/', include('translate.urls')),  # Endpoint cho API dịch thuật
    path('api/', include('UserVisitLog.urls')),
]
# Cấu hình URL cho static và media khi debug
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
