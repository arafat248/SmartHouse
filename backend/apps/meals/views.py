from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Meal
from .serializers import MealSerializer
from .permissions import IsMealHouseholdMember
from apps.households.models import HouseholdMember
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

@extend_schema_view(
    list=extend_schema(
        parameters=[
            OpenApiParameter(
                name='month', 
                type=OpenApiTypes.STR, 
                location=OpenApiParameter.QUERY, 
                description='Filter by month in YYYY-MM format',
                required=False
            )
        ]
    )
)
class MealViewSet(viewsets.ModelViewSet):
    serializer_class = MealSerializer
    permission_classes = [permissions.IsAuthenticated, IsMealHouseholdMember]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['date', 'member']

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Meal.objects.none()
        # Only return meals for households where the user is an active member
        queryset = Meal.objects.select_related('member__user').filter(
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

    def perform_create(self, serializer):
        meal = serializer.save()
        from apps.audit_logs.services import create_audit_log
        create_audit_log(
            request=self.request,
            action='CREATE_MEAL',
            description=f"Logged {meal.total_meals} meal(s) for {meal.member.user.first_name} on {meal.date}",
            household=meal.household,
            entity='Meal',
            entity_id=meal.id
        )

    def perform_update(self, serializer):
        meal = serializer.save()
        from apps.audit_logs.services import create_audit_log
        create_audit_log(
            request=self.request,
            action='UPDATE_MEAL',
            description=f"Updated meal entry for {meal.member.user.first_name} on {meal.date}",
            household=meal.household,
            entity='Meal',
            entity_id=meal.id
        )

    def perform_destroy(self, instance):
        household = instance.household
        member_name = instance.member.user.first_name
        date = instance.date
        meal_id = instance.id
        instance.delete()
        
        from apps.audit_logs.services import create_audit_log
        create_audit_log(
            request=self.request,
            action='DELETE_MEAL',
            description=f"Deleted meal entry for {member_name} on {date}",
            household=household,
            entity='Meal',
            entity_id=meal_id
        )
