from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.households.models import Household, HouseholdMember
from apps.meals.models import Meal
from apps.expenses.models import Expense, ExpenseCategory
from apps.deposits.models import Deposit
from decimal import Decimal
import datetime

User = get_user_model()

class DashboardTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='test@example.com', password='password123', first_name='Test', last_name='User')
        self.household = Household.objects.create(name='Test House', owner=self.user)
        self.member = HouseholdMember.objects.create(household=self.household, user=self.user, role=HouseholdMember.ROLE_ADMIN, status=HouseholdMember.STATUS_ACTIVE)
        
        self.category, _ = ExpenseCategory.objects.get_or_create(name='Test Category')
        
        # Current month data
        now = datetime.datetime.now()
        date = datetime.date(now.year, now.month, 15)
        
        Meal.objects.create(household=self.household, member=self.member, date=date, breakfast=1, lunch=1, dinner=1)
        Expense.objects.create(household=self.household, title='Test Exp', amount=Decimal('50.00'), category=self.category, paid_by=self.member, expense_date=date)
        Deposit.objects.create(household=self.household, member=self.member, amount=Decimal('100.00'), deposit_date=date, payment_method=Deposit.PAYMENT_CASH)

    def test_get_dashboard(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/v1/reports/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        metrics = response.data['metrics']
        self.assertEqual(metrics['total_members'], 1)
        self.assertEqual(metrics['total_meals'], 3.0)
        self.assertEqual(metrics['total_expenses'], 50.0)
        self.assertEqual(metrics['total_deposits'], 100.0)
        
        charts = response.data['charts']
        self.assertTrue(len(charts['expense_by_category']) > 0)
        self.assertTrue(len(charts['monthly_expense_trend']) > 0)
        self.assertTrue(len(charts['member_meal_consumption']) > 0)
