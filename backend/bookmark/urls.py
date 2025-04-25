from django.urls import path
from .views import BookmarkList, BookmarkDetail

urlpatterns = [
    path('bookmarks/', BookmarkList.as_view(), name='bookmark-list'),  # GET tất cả và POST tạo mới
    path('bookmarks/<str:pk>/', BookmarkDetail.as_view(), name='enroll-detail'), # GET theo ID, DELETE
]
