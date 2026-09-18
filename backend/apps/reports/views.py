from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
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
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse, inline_serializer
from rest_framework import serializers

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='household', type=int, location=OpenApiParameter.QUERY, description='Household ID', required=False)
        ],
        responses={200: inline_serializer(name='DashboardResponse', fields={'metrics': serializers.DictField(), 'recent_activity': serializers.DictField(), 'charts': serializers.DictField()})},
        description="Get dashboard metrics, recent activity, and chart data."
    )
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

class ExpenseFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name="expense_date", lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name="expense_date", lookup_expr='lte')
    class Meta:
        model = Expense
        fields = ['category', 'start_date', 'end_date']

class ExpenseReportView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ExpenseSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = ExpenseFilter

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Expense.objects.none()
        household_id = self.request.query_params.get('household')
        if not household_id:
            membership = HouseholdMember.objects.filter(user=self.request.user, status=HouseholdMember.STATUS_ACTIVE).first()
            household_id = membership.household_id if membership else None
        return Expense.objects.filter(household_id=household_id).order_by('-expense_date')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['summary'] = {'total_expense': float(total_amount)}
            return response
        serializer = self.get_serializer(queryset, many=True)
        return Response({'results': serializer.data, 'summary': {'total_expense': float(total_amount)}})

class DepositFilter(django_filters.FilterSet):
    start_date = django_filters.DateFilter(field_name="deposit_date", lookup_expr='gte')
    end_date = django_filters.DateFilter(field_name="deposit_date", lookup_expr='lte')
    class Meta:
        model = Deposit
        fields = ['member', 'start_date', 'end_date']

class DepositReportView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DepositSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = DepositFilter

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Deposit.objects.none()
        household_id = self.request.query_params.get('household')
        if not household_id:
            membership = HouseholdMember.objects.filter(user=self.request.user, status=HouseholdMember.STATUS_ACTIVE).first()
            household_id = membership.household_id if membership else None
        return Deposit.objects.filter(household_id=household_id).order_by('-deposit_date')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        total_amount = queryset.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['summary'] = {'total_deposit': float(total_amount)}
            return response
        serializer = self.get_serializer(queryset, many=True)
        return Response({'results': serializer.data, 'summary': {'total_deposit': float(total_amount)}})

class DailyReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        parameters=[
            OpenApiParameter(name='household', type=int, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name='start_date', type=str, location=OpenApiParameter.QUERY, description='YYYY-MM-DD', required=True),
            OpenApiParameter(name='end_date', type=str, location=OpenApiParameter.QUERY, description='YYYY-MM-DD', required=True)
        ],
        responses={200: inline_serializer(name='DailyReportResponse', fields={'results': serializers.ListField()})},
        description="Get daily totals for expenses, deposits, and meals within a date range."
    )
    def get(self, request):
        household_id = request.query_params.get('household')
        if not household_id:
            membership = HouseholdMember.objects.filter(user=request.user, status=HouseholdMember.STATUS_ACTIVE).first()
            household_id = membership.household_id if membership else None
        
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not start_date_str or not end_date_str:
            return Response({"detail": "start_date and end_date are required"}, status=400)
            
        try:
            start_date = timezone.datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = timezone.datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD"}, status=400)

        # Generate list of dates
        delta = end_date - start_date
        dates = [start_date + timedelta(days=i) for i in range(delta.days + 1)]
        
        # Fetch data
        expenses = Expense.objects.filter(household_id=household_id, expense_date__range=[start_date, end_date]).values('expense_date').annotate(total=Sum('amount'))
        deposits = Deposit.objects.filter(household_id=household_id, deposit_date__range=[start_date, end_date]).values('deposit_date').annotate(total=Sum('amount'))
        meals = Meal.objects.filter(household_id=household_id, date__range=[start_date, end_date]).values('date').annotate(total=Sum('breakfast') + Sum('lunch') + Sum('dinner') + Sum('guest_meals'))
        
        exp_dict = {item['expense_date']: float(item['total']) for item in expenses}
        dep_dict = {item['deposit_date']: float(item['total']) for item in deposits}
        meal_dict = {item['date']: float(item['total']) for item in meals}
        
        results = []
        for d in dates:
            results.append({
                "date": d.strftime('%Y-%m-%d'),
                "total_expense": exp_dict.get(d, 0.0),
                "total_deposit": dep_dict.get(d, 0.0),
                "total_meals": meal_dict.get(d, 0.0)
            })
            
        return Response(results)

class MonthlyReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        parameters=[
            OpenApiParameter(name='household', type=int, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name='month', type=int, location=OpenApiParameter.QUERY, required=True),
            OpenApiParameter(name='year', type=int, location=OpenApiParameter.QUERY, required=True)
        ],
        responses={200: inline_serializer(name='MonthlyReportResponse', fields={'summary': serializers.DictField(), 'members': serializers.ListField()})},
        description="Get comprehensive monthly report including meal rates, member balances, and total expenses."
    )
    def get(self, request):
        household_id = request.query_params.get('household')
        if not household_id:
            membership = HouseholdMember.objects.filter(user=request.user, status=HouseholdMember.STATUS_ACTIVE).first()
            household_id = membership.household_id if membership else None
            
        month_str = request.query_params.get('month')
        year_str = request.query_params.get('year')
        
        if not month_str or not year_str:
            return Response({"detail": "month and year are required"}, status=400)
            
        try:
            month = int(month_str)
            year = int(year_str)
        except ValueError:
            return Response({"detail": "Invalid month or year"}, status=400)
            
        household = Household.objects.get(id=household_id)
        members = HouseholdMember.objects.filter(household=household, status=HouseholdMember.STATUS_ACTIVE)
        
        expenses = Expense.objects.filter(household=household, expense_date__year=year, expense_date__month=month)
        meal_expenses = expenses.filter(category__name__in=['Groceries', 'Market'])
        other_expenses = expenses.exclude(category__name__in=['Groceries', 'Market'])
        
        total_meal_expense = meal_expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_other_expense = other_expenses.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        total_expense = total_meal_expense + total_other_expense
        
        meals = Meal.objects.filter(household=household, date__year=year, date__month=month)
        
        member_meals = {m.id: Decimal('0.00') for m in members}
        total_meals = Decimal('0.00')
        for meal in meals:
            if meal.member_id in member_meals:
                member_meals[meal.member_id] += meal.total_meals
            total_meals += meal.total_meals
            
        meal_rate = Decimal('0.0000')
        if total_meals > Decimal('0.00'):
            meal_rate = total_meal_expense / total_meals
            
        num_members = members.count()
        other_cost_per_member = Decimal('0.00')
        if num_members > 0:
            other_cost_per_member = total_other_expense / num_members
            
        deposits = Deposit.objects.filter(household=household, deposit_date__year=year, deposit_date__month=month)
        member_deposits = {m.id: Decimal('0.00') for m in members}
        total_deposits = Decimal('0.00')
        
        for d in deposits:
            if d.member_id in member_deposits:
                member_deposits[d.member_id] += d.amount
            total_deposits += d.amount
            
        for e in expenses:
            if e.paid_by_id in member_deposits:
                member_deposits[e.paid_by_id] += e.amount
                total_deposits += e.amount
                
        member_results = []
        for m in members:
            m_meals = member_meals.get(m.id, Decimal('0.00'))
            m_meal_cost = m_meals * meal_rate
            m_other_cost = other_cost_per_member
            m_total_cost = m_meal_cost + m_other_cost
            m_total_deposit = member_deposits.get(m.id, Decimal('0.00'))
            m_balance = m_total_deposit - m_total_cost
            
            member_results.append({
                "member_name": f"{m.user.first_name} {m.user.last_name}",
                "total_meals": float(m_meals),
                "meal_cost": float(m_meal_cost),
                "other_cost": float(m_other_cost),
                "total_cost": float(m_total_cost),
                "total_deposit": float(m_total_deposit),
                "balance": float(m_balance)
            })
            
        return Response({
            "summary": {
                "total_expense": float(total_expense),
                "total_food_expense": float(total_meal_expense),
                "total_meals": float(total_meals),
                "meal_rate": float(meal_rate),
                "total_deposits": float(total_deposits)
            },
            "members": member_results
        })

class MemberReportView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        parameters=[
            OpenApiParameter(name='household', type=int, location=OpenApiParameter.QUERY, required=False),
            OpenApiParameter(name='start_date', type=str, location=OpenApiParameter.QUERY, description='YYYY-MM-DD', required=True),
            OpenApiParameter(name='end_date', type=str, location=OpenApiParameter.QUERY, description='YYYY-MM-DD', required=True)
        ],
        responses={200: inline_serializer(name='MemberReportResponse', fields={'results': serializers.ListField()})},
        description="Get aggregate member activity (meals, deposits, expenses) within a date range."
    )
    def get(self, request):
        household_id = request.query_params.get('household')
        if not household_id:
            membership = HouseholdMember.objects.filter(user=request.user, status=HouseholdMember.STATUS_ACTIVE).first()
            household_id = membership.household_id if membership else None
            
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not start_date_str or not end_date_str:
            return Response({"detail": "start_date and end_date are required"}, status=400)
            
        try:
            start_date = timezone.datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_date = timezone.datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"detail": "Invalid date format. Use YYYY-MM-DD"}, status=400)
            
        household = Household.objects.get(id=household_id)
        members = HouseholdMember.objects.filter(household=household, status=HouseholdMember.STATUS_ACTIVE)
        
        meals = Meal.objects.filter(household=household, date__range=[start_date, end_date]).values('member_id').annotate(total=Sum('breakfast') + Sum('lunch') + Sum('dinner') + Sum('guest_meals'))
        deposits = Deposit.objects.filter(household=household, deposit_date__range=[start_date, end_date]).values('member_id').annotate(total=Sum('amount'))
        expenses = Expense.objects.filter(household=household, expense_date__range=[start_date, end_date]).values('paid_by_id').annotate(total=Sum('amount'))
        
        meal_dict = {item['member_id']: float(item['total']) for item in meals}
        dep_dict = {item['member_id']: float(item['total']) for item in deposits}
        exp_dict = {item['paid_by_id']: float(item['total']) for item in expenses}
        
        results = []
        for m in members:
            results.append({
                "member_id": m.id,
                "member_name": f"{m.user.first_name} {m.user.last_name}",
                "total_meals": meal_dict.get(m.id, 0.0),
                "total_deposits": dep_dict.get(m.id, 0.0),
                "total_expenses_paid": exp_dict.get(m.id, 0.0)
            })
            
        return Response(results)
