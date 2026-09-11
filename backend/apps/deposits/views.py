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
        # Only return deposits for households where the user is an active member
        return Deposit.objects.filter(
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
