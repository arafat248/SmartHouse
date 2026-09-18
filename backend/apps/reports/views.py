from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from apps.households.models import HouseholdMember, Household
from apps.meals.models import Meal
from apps.expenses.models import Expense
from apps.deposits.models import Deposit
from apps.settlements.models import Settlement, SettlementItem

from apps.expenses.serializers import ExpenseSerializer
from apps.deposits.serializers import DepositSerializer

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Determine active household context
        household_id = request.query_params.get('household')
        
        # If no household specified, find the first active membership
        if not household_id:
            membership = HouseholdMember.objects.filter(user=request.user, status=HouseholdMember.STATUS_ACTIVE).first()
            if not membership:
                return Response({"detail": "You are not a member of any household."}, status=400)
            household_id = membership.household_id
            
        household = Household.objects.filter(id=household_id).first()
        if not household:
             return Response({"detail": "Household not found."}, status=404)
             
        # Ensure user is active member of this household
        membership = HouseholdMember.objects.filter(user=request.user, household=household, status=HouseholdMember.STATUS_ACTIVE).first()
        if not membership:
            return Response({"detail": "You do not have access to this household."}, status=403)

        now = timezone.now()
        current_month = now.month
        current_year = now.year

        # Aggregate Metrics
        total_members = HouseholdMember.objects.filter(household=household, status=HouseholdMember.STATUS_ACTIVE).count()
        
        total_meals = Meal.objects.filter(household=household, date__month=current_month, date__year=current_year).aggregate(
            total=Sum('breakfast') + Sum('lunch') + Sum('dinner') + Sum('guest_meals')
        )['total'] or Decimal('0.00')

        total_expenses = Expense.objects.filter(household=household, expense_date__month=current_month, expense_date__year=current_year).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        total_deposits = Deposit.objects.filter(household=household, deposit_date__month=current_month, deposit_date__year=current_year).aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')

        # Recent Items
        recent_expenses = Expense.objects.filter(household=household).order_by('-expense_date', '-created_at')[:5]
        recent_deposits = Deposit.objects.filter(household=household).order_by('-deposit_date', '-created_at')[:5]
        
        # We don't have a MealSerializer readily available, so we'll build a simple dict
        recent_meals_qs = Meal.objects.filter(household=household).order_by('-date', '-created_at')[:5]
        recent_meals = [
            {
                "id": m.id,
                "date": m.date,
                "member_name": f"{m.member.user.first_name} {m.member.user.last_name}",
                "total_meals": m.total_meals
            } for m in recent_meals_qs
        ]

        # Settlement Status
        current_settlement = Settlement.objects.filter(household=household, month=current_month, year=current_year).first()
        settlement_status = current_settlement.status if current_settlement else 'NOT GENERATED'
        meal_rate = current_settlement.meal_rate if current_settlement else Decimal('0.0000')
        
        my_balance = Decimal('0.00')
        if current_settlement:
            my_item = SettlementItem.objects.filter(settlement=current_settlement, member=membership).first()
            if my_item:
                my_balance = my_item.balance

        # Charts Data
        
        # 1. Expense by Category (Current Month)
        expense_by_category_qs = Expense.objects.filter(
            household=household, 
            expense_date__month=current_month, 
            expense_date__year=current_year
        ).values('category__name').annotate(total=Sum('amount')).order_by('-total')
        
        expense_by_category = [
            {"name": item['category__name'] or 'Uncategorized', "value": float(item['total'])}
            for item in expense_by_category_qs
        ]

        # 2. Monthly Expense Trend (Last 6 months)
        six_months_ago = now.date() - timedelta(days=180)
        trend_qs = Expense.objects.filter(
            household=household,
            expense_date__gte=six_months_ago
        ).values('expense_date__month', 'expense_date__year').annotate(total=Sum('amount')).order_by('expense_date__year', 'expense_date__month')

        monthly_expense_trend = []
        month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        for item in trend_qs:
            month_idx = item['expense_date__month'] - 1
            label = f"{month_names[month_idx]} {item['expense_date__year']}"
            monthly_expense_trend.append({"month": label, "amount": float(item['total'])})

        # 3. Member Meal Consumption (Current Month)
        meal_consumption_qs = Meal.objects.filter(
            household=household,
            date__month=current_month,
            date__year=current_year
        ).values('member__user__first_name', 'member__user__last_name').annotate(
            total=(Sum('breakfast') + Sum('lunch') + Sum('dinner') + Sum('guest_meals'))
        ).order_by('-total')

        member_meal_consumption = [
            {
                "name": f"{item['member__user__first_name']} {item['member__user__last_name']}",
                "meals": float(item['total'] or 0)
            } for item in meal_consumption_qs
        ]

        return Response({
            "metrics": {
                "total_members": total_members,
                "total_meals": float(total_meals),
                "total_expenses": float(total_expenses),
                "total_deposits": float(total_deposits),
                "current_meal_rate": float(meal_rate),
                "my_balance": float(my_balance),
                "settlement_status": settlement_status,
                "current_month": current_month,
                "current_year": current_year
            },
            "recent_activity": {
                "expenses": ExpenseSerializer(recent_expenses, many=True).data,
                "deposits": DepositSerializer(recent_deposits, many=True).data,
                "meals": recent_meals
            },
            "charts": {
                "expense_by_category": expense_by_category,
                "monthly_expense_trend": monthly_expense_trend,
                "member_meal_consumption": member_meal_consumption
            }
        })
