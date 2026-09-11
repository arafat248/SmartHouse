from rest_framework import permissions
from apps.households.models import HouseholdMember

class IsDepositHouseholdMember(permissions.BasePermission):
    """
    Object-level permission to only allow members of a household to access its deposits.
    """
    def has_object_permission(self, request, view, obj):
        return HouseholdMember.objects.filter(
            household=obj.household,
            user=request.user,
            status=HouseholdMember.STATUS_ACTIVE
        ).exists()

class IsDepositorOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow the person who made the deposit or an Admin to edit/delete.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        member = HouseholdMember.objects.filter(
            household=obj.household,
            user=request.user,
            status=HouseholdMember.STATUS_ACTIVE
        ).first()

        if not member:
            return False

        return obj.member == member or member.role == HouseholdMember.ROLE_ADMIN
