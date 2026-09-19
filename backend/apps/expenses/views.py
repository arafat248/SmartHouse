from rest_framework import viewsets, permissions, status, filters
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Expense, ExpenseCategory
from .serializers import ExpenseSerializer, ExpenseCategorySerializer
from .permissions import IsExpenseHouseholdMember, IsPayerOrAdmin
from apps.households.models import HouseholdMember

class ExpenseCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ExpenseCategory.objects.filter(is_active=True)
    serializer_class = ExpenseCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # Categories usually don't need pagination

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated, IsExpenseHouseholdMember, IsPayerOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'category': ['exact'],
        'paid_by': ['exact'],
        'expense_date': ['gte', 'lte', 'exact'],
    }
    search_fields = ['title', 'description']
    ordering_fields = ['expense_date', 'created_at', 'amount']
    ordering = ['-expense_date', '-created_at']

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Expense.objects.none()
        # Only return expenses for households where the user is an active member
        return Expense.objects.select_related('category', 'paid_by__user').filter(
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
                {"detail": "You do not have permission to add expenses to this household."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        expense = serializer.save()
        from apps.notifications.services import create_household_notification
        from apps.notifications.models import Notification
        create_household_notification(
            household=expense.household,
            title="New Expense Added",
            message=f"An expense of ${expense.amount} for {expense.title} was added by {expense.paid_by.user.first_name}.",
            notification_type=Notification.TYPE_EXPENSE,
            exclude_user=self.request.user
        )
        
        from apps.audit_logs.services import create_audit_log
        create_audit_log(
            request=self.request,
            action='CREATE_EXPENSE',
            description=f"Created expense '{expense.title}' for ${expense.amount}",
            household=expense.household,
            entity='Expense',
            entity_id=expense.id
        )

    def perform_update(self, serializer):
        expense = serializer.save()
        from apps.audit_logs.services import create_audit_log
        create_audit_log(
            request=self.request,
            action='UPDATE_EXPENSE',
            description=f"Updated expense '{expense.title}'",
            household=expense.household,
            entity='Expense',
            entity_id=expense.id
        )

    def perform_destroy(self, instance):
        household = instance.household
        title = instance.title
        expense_id = instance.id
        instance.delete()
        
        from apps.audit_logs.services import create_audit_log
        create_audit_log(
            request=self.request,
            action='DELETE_EXPENSE',
            description=f"Deleted expense '{title}'",
            household=household,
            entity='Expense',
            entity_id=expense_id
        )
