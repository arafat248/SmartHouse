from rest_framework import permissions
from apps.households.models import HouseholdMember

class IsMealHouseholdMember(permissions.BasePermission):
    """
    Allows access only to users who are active members of the household that the meal belongs to.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # For listing and creating, we handle filtering/validation in the view.
        # But we want to ensure basic auth is there.
        return True

    def has_object_permission(self, request, view, obj):
        # User must be an active member of the household this meal belongs to
        return HouseholdMember.objects.filter(
            household=obj.household,
            user=request.user,
            status=HouseholdMember.STATUS_ACTIVE
        ).exists()
