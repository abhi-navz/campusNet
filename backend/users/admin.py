from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Education, Certificate, Achievement, Resume

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Education)
admin.site.register(Certificate)
admin.site.register(Achievement)
admin.site.register(Resume)