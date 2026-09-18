from rest_framework import viewsets, permissions
from django.db.models import Q
from .models import AuditLog
from .serializers import AuditLogSerializer
from apps.households.models import HouseholdMember

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.is_superuser:
            return AuditLog.objects.all()
            
        # Get households where user is an ADMIN
        admin_households = HouseholdMember.objects.filter(
            user=user, 
            role=HouseholdMember.ROLE_ADMIN,
            status=HouseholdMember.STATUS_ACTIVE
        ).values_list('household_id', flat=True)
        
        if admin_households:
            # Admins can see logs for their households, and their own personal logs
            return AuditLog.objects.filter(
                Q(household_id__in=admin_households) | Q(user=user)
            ).distinct()
            
        # Normal users shouldn't have access to the audit log endpoint, but just in case, only show their own
        return AuditLog.objects.filter(user=user)
