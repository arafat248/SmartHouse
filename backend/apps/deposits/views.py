from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Deposit
from .serializers import DepositSerializer
from .permissions import IsDepositHouseholdMember, IsDepositorOrAdmin
from apps.households.models import HouseholdMember

class DepositViewSet(viewsets.ModelViewSet):
    serializer_class = DepositSerializer
    permission_classes = [permissions.IsAuthenticated, IsDepositHouseholdMember, IsDepositorOrAdmin]
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = {
        'member': ['exact'],
        'payment_method': ['exact'],
        'deposit_date': ['gte', 'lte', 'exact'],
    }
    ordering_fields = ['deposit_date', 'created_at', 'amount']
    ordering = ['-deposit_date', '-created_at']

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Deposit.objects.none()
        # Only return deposits for households where the user is an active member
        return Deposit.objects.select_related('member__user').filter(
            household__members__user=self.request.user,
            household__members__status=HouseholdMember.STATUS_ACTIVE
        ).distinct()

    def create(self, request, *args, **kwargs):
        household_id = request.data.get('household')
        if not household_id:
            return Response({"household": ["This field is required."]}, status=status.HTTP_400_BAD_REQUEST)
            
        is_member = HouseholdMember.objects.filter(
            household_id=household_id,
            user=request.user,
            status=HouseholdMember.STATUS_ACTIVE
        ).exists()
        
        if not is_member:
            return Response(
                {"detail": "You do not have permission to add deposits to this household."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        deposit = serializer.save()
        from apps.notifications.services import create_household_notification, create_notification
        from apps.notifications.models import Notification
        from apps.households.models import HouseholdMember
        
        # Notify the member whose account got the deposit
        if deposit.member.user != self.request.user:
            create_notification(
                user=deposit.member.user,
                title="Deposit Recorded",
                message=f"A deposit of ${deposit.amount} was added to your account by {self.request.user.first_name}.",
                notification_type=Notification.TYPE_DEPOSIT
            )
            
        # Notify admins (excluding the request user)
        admins = HouseholdMember.objects.filter(
            household=deposit.household, 
            role=HouseholdMember.ROLE_ADMIN,
            status=HouseholdMember.STATUS_ACTIVE
        ).exclude(user=self.request.user)
        
        for admin in admins:
            create_notification(
                user=admin.user,
                title="New Deposit Recorded",
                message=f"A deposit of ${deposit.amount} was recorded for {deposit.member.user.first_name}.",
                notification_type=Notification.TYPE_DEPOSIT
            )
            
        from apps.audit_logs.services import create_audit_log
        create_audit_log(
            request=self.request,
            action='ADD_DEPOSIT',
            description=f"Added deposit of ${deposit.amount} for {deposit.member.user.first_name}",
            household=deposit.household,
            entity='Deposit',
            entity_id=deposit.id
        )

    def perform_update(self, serializer):
        deposit = serializer.save()
        from apps.audit_logs.services import create_audit_log
        create_audit_log(
            request=self.request,
            action='UPDATE_DEPOSIT',
            description=f"Updated deposit for {deposit.member.user.first_name} to ${deposit.amount}",
            household=deposit.household,
            entity='Deposit',
            entity_id=deposit.id
        )

    def perform_destroy(self, instance):
        household = instance.household
        member_name = instance.member.user.first_name
        amount = instance.amount
        deposit_id = instance.id
        instance.delete()
        
        from apps.audit_logs.services import create_audit_log
        create_audit_log(
            request=self.request,
            action='DELETE_DEPOSIT',
            description=f"Deleted deposit of ${amount} for {member_name}",
            household=household,
            entity='Deposit',
            entity_id=deposit_id
        )
