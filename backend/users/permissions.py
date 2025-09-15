from rest_framework import permissions
from rest_framework.permissions import SAFE_METHODS

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access to everyone
    but write access only to the owner of the object.


    Everyone can perform safe methods (GET, HEAD, OPTIONS) on any object.
    Only the owner of an object can modify it (PUT, PATCH, DELETE).
    For User model instances, the owner is the user themselves.

    User 1 can update their own profile, but not User 2's profile.
    """
    def has_object_permission(self, request, view, obj):

        # Read-only permissions are allowed for everyone
        if request.method in SAFE_METHODS:
            return True
        
        # If the object has a 'user' field (Education, Certificate, Achievement, Resume)
        return hasattr(obj, 'user') and obj.user == request.user