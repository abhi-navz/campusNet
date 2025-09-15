
from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, EducationViewSet, CertificateViewSet, AchievementViewSet, ResumeViewSet

#NOTE: PHASE-1 : We were using particular path to fullfill our GET request
# Django can’t call a class directly.
# So, every class-based view provides a method called .as_view().
# This method converts the class into a function that Django’s URL dispatcher understands.
# UserListAPIView.as_view() creates a function that accepts the request and decides which http method is user(Create, put, post, delete)
# urlpatterns=[
#     path('', views.home, name='home'),
#     path('api/users/', views.UserListAPIView.as_view(), name='user_list'), #path('api/users/', ...) When the browser requests /api/users/, Django calls UserListAPIView.as_view()
#     path('api/users/<int:pk>/', views.UserDetailAPIView.as_view(), name='user-detail'), #it captures an integer from the URL and passes it to the view as pk. So /api/users/3/ gives pk=3
# ]

#NOTE: PHASE-2: NOW WE ARE USING DJANGO REST FRAMEWORK's "DefaultRouter" , it dynamically create the CRUD routes

# Router auto-creates REST API routes
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'educations', EducationViewSet, basename='education')
router.register(r'certificates', CertificateViewSet, basename='certificate')
router.register(r'achievements', AchievementViewSet, basename='achievement')
router.register(r'resumes', ResumeViewSet, basename='resume')

urlpatterns = [
    path('', include(router.urls)),
]
