from django.urls import path
from .views import EnrollListCreate, EnrollDetail

urlpatterns = [
    path('enrolls/', EnrollListCreate.as_view(), name='enroll-list-create'),
    path('enrolls/<str:user_id>/<str:roadmap_id>/', EnrollDetail.as_view(), name='enroll-detail'),
]