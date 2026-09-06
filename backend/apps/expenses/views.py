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
        # Only return expenses for households where the user is an active member
        return Expense.objects.filter(
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
