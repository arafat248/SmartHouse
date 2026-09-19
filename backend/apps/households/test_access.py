from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from apps.households.models import Household, HouseholdMember
from apps.meals.models import Meal
from apps.expenses.models import Expense, ExpenseCategory
from apps.deposits.models import Deposit
from decimal import Decimal
import datetime

User = get_user_model()

class CrossHouseholdAccessTests(TestCase):
    def setUp(self):
        self.client_a = APIClient()
        self.client_b = APIClient()
        
        # User A in Household A
        self.user_a = User.objects.create_user(email='usera@example.com', password='password123', first_name='User', last_name='A')
        self.client_a.force_authenticate(user=self.user_a)
        self.household_a = Household.objects.create(name='Household A', owner=self.user_a)
        self.member_a = HouseholdMember.objects.create(
            user=self.user_a, household=self.household_a, 
            role=HouseholdMember.ROLE_ADMIN, status=HouseholdMember.STATUS_ACTIVE
        )
        
        # User B in Household B
        self.user_b = User.objects.create_user(email='userb@example.com', password='password123', first_name='User', last_name='B')
        self.client_b.force_authenticate(user=self.user_b)
        self.household_b = Household.objects.create(name='Household B', owner=self.user_b)
        self.member_b = HouseholdMember.objects.create(
            user=self.user_b, household=self.household_b, 
            role=HouseholdMember.ROLE_ADMIN, status=HouseholdMember.STATUS_ACTIVE
        )

        # Create resources in Household B
        self.meal_b = Meal.objects.create(
            household=self.household_b, member=self.member_b, 
            date=datetime.date.today(), breakfast=Decimal('1.00')
        )
        
        self.cat_b = ExpenseCategory.objects.create(name='Groceries B')
        self.expense_b = Expense.objects.create(
            household=self.household_b, title='Food', amount=Decimal('50.00'),
            category=self.cat_b, paid_by=self.member_b, expense_date=datetime.date.today()
        )
        
        self.deposit_b = Deposit.objects.create(
            household=self.household_b, member=self.member_b,
            amount=Decimal('100.00'), deposit_date=datetime.date.today()
        )

    def test_cannot_access_other_household_details(self):
        response = self.client_a.get(f'/api/households/{self.household_b.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
    def test_cannot_access_other_household_meals(self):
        response = self.client_a.get(f'/api/meals/{self.meal_b.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
    def test_cannot_access_other_household_expenses(self):
        response = self.client_a.get(f'/api/expenses/{self.expense_b.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_cannot_access_other_household_deposits(self):
        response = self.client_a.get(f'/api/deposits/{self.deposit_b.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
    def test_cannot_create_meal_in_other_household(self):
        data = {
            'household': self.household_b.id,
            'member': self.member_b.id,
            'date': '2023-10-01',
            'breakfast': 1,
            'lunch': 1,
            'dinner': 1
        }
        response = self.client_a.post('/api/meals/', data)
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND])

    def test_cannot_create_expense_in_other_household(self):
        data = {
            'household': self.household_b.id,
            'title': 'Stolen Expense',
            'amount': 50.0,
            'category': self.cat_b.id,
            'paid_by': self.member_b.id,
            'expense_date': '2023-10-01'
        }
        response = self.client_a.post('/api/expenses/', data)
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_400_BAD_REQUEST, status.HTTP_404_NOT_FOUND])

    def test_cannot_access_other_household_reports(self):
        response = self.client_a.get(f'/api/reports/dashboard/?household={self.household_b.id}')
        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
