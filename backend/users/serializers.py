from rest_framework import serializers
from .models import User, Achievement, Education, Certificate,Resume

# What a serializer is: 
# Serializers convert Django models (Python objects) into JSON that a frontend like React can understand.
# They also work in reverse: they can take JSON from the frontend and convert it into a model instance.
# 
# 

class EducationSerializer(serializers.ModelSerializer):
    # ModelSerializer automatically maps all model fields to the API
    '''This is a serializer for the Education Model'''
    class Meta:
        '''This is REST API convention to define metadata for the serializer'''
        model = Education #Tells DRF(Django REST Framework) which model to serialize
        fields = "__all__" #Tells DRF to include all fields from the Education model in the JSON output


class CertificateSerializer(serializers.ModelSerializer):
    '''This is a serializer for the Certificate Model'''
    class Meta:
        model = Certificate
        fields = '__all__'

class AchievementSerializer(serializers.ModelSerializer):
    '''This is a serializer for the Achievement Model'''
    class Meta:
        model = Achievement
        fields = '__all__'

class ResumeSerializer(serializers.ModelSerializer):
    '''This is a serializer for the Resume Model'''
    class Meta:
        model = Resume
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    # read_only: the frontend cannot create or modify education objects through this serializer
    educations = EducationSerializer(many=True, read_only=True) #many=True: a user can have multiple education records.
    certificates = CertificateSerializer(many=True, read_only=True) #many=True: a user can have multiple Certificates records.
    achievements = AchievementSerializer(many=True, read_only=True) #many=True: a user can have multiple achievements records.
    resume = ResumeSerializer(read_only=True) #A user has one resume

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'about', 'linkedin', 'github',
            'is_student', 'is_alumni', 'is_faculty', 'profile_picture',
            'educations', 'certificates', 'achievements', 'resume'
        ]