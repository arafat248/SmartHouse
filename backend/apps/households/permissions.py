from rest_framework import permissions
from .models import HouseholdMember

class IsHouseholdMember(permissions.BasePermission):
    """
    Allows access only to members of the household.
    Admin members get write access, regular members get read access.
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        # For listing households, allow if authenticated (filtering done in view)
        if view.action in ['list', 'create']:
            return True
            
        # For object-level operations, check if member
        household_id = view.kwargs.get('pk') or view.kwargs.get('household_pk')
        if not household_id:
            return True

        membership = HouseholdMember.objects.filter(
            household_id=household_id, 
            user=request.user,
            status=HouseholdMember.STATUS_ACTIVE
        ).first()

        if not membership:
            return False

        # Read permissions are allowed to any active member
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to ADMIN
        return membership.role == HouseholdMember.ROLE_ADMIN

class IsHouseholdAdmin(permissions.BasePermission):
    """
    Allows access only to admins of the household.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        household_id = view.kwargs.get('pk') or view.kwargs.get('household_pk')
        if not household_id:
            return False

        membership = HouseholdMember.objects.filter(
            household_id=household_id, 
            user=request.user,
            status=HouseholdMember.STATUS_ACTIVE,
            role=HouseholdMember.ROLE_ADMIN
        ).exists()

        return membership
