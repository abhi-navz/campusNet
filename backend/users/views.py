# THESE ALL THREE IMPORT WERE USED IN UserAPIView() and UserListAPIView() which was read only views, but now we are using ModelSets to perform all the CRUD operation in one box
# from rest_framework import generics #class-based views that do common API jobs(list, retrieve, create, update)
from rest_framework import generics
from .models import User
from .serializers import UserSerializer
from django.http import JsonResponse

from rest_framework import viewsets
from .models import User, Education, Achievement, Certificate, Resume
from .serializers import UserSerializer, EducationSerializer, ResumeSerializer, CertificateSerializer, AchievementSerializer
from .permissions import IsOwnerOrReadOnly

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password
from .models import User
from .serializers import UserSerializer


# Create your views here.


##NOTE: PHASE-1: This was phase-1 where we just got the API, but we are extending this to define all other Operation too like Upadte/delete/Post
# class UserListAPIView(generics.ListAPIView):
#     """GET /api/users/ returns a list of users as JSON."""
#     queryset = User.objects.all() # This is the data the view will work with. For the list view it returns all users
#     serializer_class = UserSerializer

# class UserDetailAPIView(generics.RetrieveAPIView):
#     '''GET /api/users/<id>/ returns a single user JSON'''
#     queryset = User.objects.all() #The detail view it finds the single user by pk (primary key)
#     serializer_class = UserSerializer



#NOTE: PHASE-2: NOW WE ARE USING THE MODELSETS TO PERFORM ALL THE GET, POST, PUT, PATCH, DELETE OPERATION IN ONE CLASS
# USER API:  Handles all operations for User model
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all() # get all users
    serializer_class = UserSerializer # translate between Python <-> JSON
    permission_classes = [IsOwnerOrReadOnly]

# EDUCATION API: # Handles all operations for Education model
class EducationViewSet(viewsets.ModelViewSet):
    queryset = Education.objects.all()
    serializer_class = EducationSerializer
    permission_classes = [IsOwnerOrReadOnly]

# CERTIFICATE API: # Handles all operations for Certificate model
class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [IsOwnerOrReadOnly]

# RESUME API: # Handles all operations for Achievement model
class ResumeViewSet(viewsets.ModelViewSet):
    queryset = Resume.objects.all()
    serializer_class = ResumeSerializer
    permission_classes = [IsOwnerOrReadOnly]

# ACHIEVEMENT API: # Handles all operations for Achievement model
class AchievementViewSet(viewsets.ModelViewSet):
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [IsOwnerOrReadOnly]


@api_view(["POST"])
@permission_classes([AllowAny])  # Anyone can hit signup
def signup(request):
    """
    Signup API
    ----------------
    - Accepts: username, email, password, and optional fields (is_student, is_alumni, is_faculty, about, linkedin, github)
    - Creates a new User in the database
    - Returns the created user's details (without password)

    Example request (from React):
    POST /api/signup/
    {
        "username": "john_doe",
        "email": "john@example.com",
        "password": "strongpassword123",
        "is_student": true
    }
    """
    data = request.data

    # Hash the password before saving
    data["password"] = make_password(data["password"])

    serializer = UserSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)