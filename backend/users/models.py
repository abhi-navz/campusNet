from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here

# We create our own User model that extends Django’s default user.
# This way, we get all built-in features (login, password hashing, permissions, groups) plus our own custom fields.

# 1. CUSTOM USER MODEL (why we are saying custom user model, because django have already user model
#  which is built-in but their columns name and other attributes are not as same as we have to required, so we are creating the custom user model)
class User(AbstractUser):
    """this is user model which is the central component of the particular user
    """
    is_student = models.BooleanField(default=False)
    is_alumni = models.BooleanField(default=False)
    is_faculty = models.BooleanField(default=False)

    about = models.TextField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to="profile_pics", blank=True, null=True)

    def __str__(self):
        return self.username


# 2. EDUCATION Model
class Education(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="educations") #CASCADE means: if a User is deleted, all related Education records are deleted too.
    # Foreign Key: Education record belongs to one User, but a single User can have many Education records.
    # related_name: It means from a User object, you can access all related Education objects

    degree = models.CharField(max_length=200)
    institution = models.CharField(max_length=200)
    start_year = models.IntegerField()
    end_year = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.degree} at {self.institution}" #__str__ defines how an object should be represented as a string. without str, it prints: <Education: Education object (1)>


# Certificate Model
class Certificate(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="certificates")
    title = models.CharField(max_length=200)
    issued_by = models.CharField(max_length=200)
    issue_date = models.DateField()
    image = models.ImageField(upload_to="certificates/", blank=True, null=True)
    certificate_link = models.URLField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.issued_by})"
    

# Achievement Model
class Achievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="achievements")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    date = models.DateField(blank=True, null=True)
    image = models.ImageField(upload_to="achievements/", blank=True, null=True)

    def __str__(self):
        return self.title
    

# Resume Model
class Resume(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="resume") #Only one per user (that’s why OneToOneField)
    file = models.FileField(upload_to="resumes/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Resume of {self.user.username}"