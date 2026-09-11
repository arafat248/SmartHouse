from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Settlement
from .serializers import SettlementSerializer
from .services import SettlementCalculator
from apps.households.permissions import IsHouseholdAdmin
from apps.households.models import HouseholdMember

class SettlementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = SettlementSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Settlement.objects.filter(
            household__members__user=self.request.user,
            household__members__status=HouseholdMember.STATUS_ACTIVE
        ).distinct()

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def generate(self, request):
        household_id = request.data.get('household')
        month = request.data.get('month')
        year = request.data.get('year')

        if not all([household_id, month, year]):
            return Response({"detail": "household, month, and year are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the user is an admin of this household
        is_admin = HouseholdMember.objects.filter(
            household_id=household_id,
            user=request.user,
            role=HouseholdMember.ROLE_ADMIN,
            status=HouseholdMember.STATUS_ACTIVE
        ).exists()

        if not is_admin:
            return Response({"detail": "You do not have permission to generate settlements for this household."}, status=status.HTTP_403_FORBIDDEN)

        try:
            settlement = SettlementCalculator.generate_settlement(
                household_id=int(household_id),
                month=int(month),
                year=int(year)
            )
            
            serializer = self.get_serializer(settlement)
            data = serializer.data
            data['suggested_transfers'] = SettlementCalculator.calculate_suggested_transfers(settlement)
            
            return Response(data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        data['suggested_transfers'] = SettlementCalculator.calculate_suggested_transfers(instance)
        return Response(data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def finalize(self, request, pk=None):
        settlement = self.get_object()
        
        is_admin = HouseholdMember.objects.filter(
            household=settlement.household,
            user=request.user,
            role=HouseholdMember.ROLE_ADMIN,
            status=HouseholdMember.STATUS_ACTIVE
        ).exists()

        if not is_admin:
            return Response({"detail": "You do not have permission to finalize settlements for this household."}, status=status.HTTP_403_FORBIDDEN)

        if settlement.status != Settlement.STATUS_DRAFT:
            return Response({"detail": "Only DRAFT settlements can be finalized."}, status=status.HTTP_400_BAD_REQUEST)

        settlement.status = Settlement.STATUS_FINALIZED
        settlement.save()
        
        return Response({"detail": "Settlement finalized successfully."})
