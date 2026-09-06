from rest_framework import permissions
from apps.households.models import HouseholdMember

class IsExpenseHouseholdMember(permissions.BasePermission):
    """
    Object-level permission to only allow members of a household to access its expenses.
    """
    def has_object_permission(self, request, view, obj):
        # Allow access if user is an active member of the household this expense belongs to
        return HouseholdMember.objects.filter(
            household=obj.household,
            user=request.user,
            status=HouseholdMember.STATUS_ACTIVE
        ).exists()

class IsPayerOrAdmin(permissions.BasePermission):
    """
    Object-level permission to only allow the person who paid the expense or an Admin to edit/delete.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any household member (handled by IsExpenseHouseholdMember)
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the person who paid or household admin
        member = HouseholdMember.objects.filter(
            household=obj.household,
            user=request.user,
            status=HouseholdMember.STATUS_ACTIVE
        ).first()

        if not member:
            return False

        return obj.paid_by == member or member.role == HouseholdMember.ROLE_ADMIN
