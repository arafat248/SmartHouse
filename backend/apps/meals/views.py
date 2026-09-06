from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Meal
from .serializers import MealSerializer
from .permissions import IsMealHouseholdMember
from apps.households.models import HouseholdMember

class MealViewSet(viewsets.ModelViewSet):
    serializer_class = MealSerializer
    permission_classes = [permissions.IsAuthenticated, IsMealHouseholdMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'member']

    def get_queryset(self):
        # Only return meals for households where the user is an active member
        queryset = Meal.objects.filter(
            household__members__user=self.request.user,
            household__members__status=HouseholdMember.STATUS_ACTIVE
        ).distinct()

        # Handle custom month filter
        month = self.request.query_params.get('month', None)
        if month:
            # month expected in format YYYY-MM
            queryset = queryset.filter(date__startswith=month)
            
        return queryset

    def create(self, request, *args, **kwargs):
        # Validate that the user is an active member of the provided household
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
                {"detail": "You do not have permission to add meals to this household."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return super().create(request, *args, **kwargs)
