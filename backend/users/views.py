# THESE ALL THREE IMPORT WERE USED IN UserAPIView() and UserListAPIView() which was read only views, but now we are using ModelSets to perform all the CRUD operation in one box
# from rest_framework import generics #class-based views that do common API jobs(list, retrieve, create, update)
from rest_framework import generics
from .models import User
from .serializers import UserSerializer
from django.http import JsonResponse

from rest_framework import viewsets
from .models import User, Education, Achievement, Certificate, Resume
from .serializers import UserSerializer, EducationSerializer, ResumeSerializer, CertificateSerializer, AchievementSerializer


# Create your views here.

# A default Home page in Json formate
def home(request):
    return JsonResponse({"message": "Welcome to CampusNet API!"})

##NOTE: PHASE-1: This was phase-1 where we just got the API, but we are extending this to define all other Operation too like Upadte/delete/Post
class UserListAPIView(generics.ListAPIView):
    """GET /api/users/ returns a list of users as JSON."""
    queryset = User.objects.all() # This is the data the view will work with. For the list view it returns all users
    serializer_class = UserSerializer

class UserDetailAPIView(generics.RetrieveAPIView):
    '''GET /api/users/<id>/ returns a single user JSON'''
    queryset = User.objects.all() #The detail view it finds the single user by pk (primary key)
    serializer_class = UserSerializer



#NOTE: PHASE-2: NOW WE ARE USING THE MODELSETS TO PERFORM ALL THE GET, POST, PUT, PATCH, DELETE OPERATION IN ONE CLASS
# USER API
# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer

# # EDUCATION API
# class EducationViewSet(viewsets.ModelViewSet):
#     queryset = Education.objects.all()
#     serializer_class = EducationSerializer

# # CERTIFICATE API
# class CertificateViewSet(viewsets.ModelViewSet):
#     queryset = Certificate.objects.all()
#     serializer_class = CertificateSerializer

# # RESUME API
# class ResumeViewSet(viewsets.ModelViewSet):
#     queryset = Resume.objects.all()
#     serializer_class = ResumeSerializer

# # ACHIEVEMENT SERIALIZER
# class AchievementViewSet(viewsets.ModelViewSet):
#     queryset = Achievement.objects.all()
#     serializer_class = AchievementSerializer