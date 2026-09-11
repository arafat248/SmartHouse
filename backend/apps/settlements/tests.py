from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.households.models import Household, HouseholdMember
from apps.meals.models import Meal
from apps.expenses.models import Expense, ExpenseCategory
from apps.deposits.models import Deposit
from .models import Settlement, SettlementItem
from decimal import Decimal
import datetime

User = get_user_model()

class SettlementTests(APITestCase):
    def setUp(self):
        # Users
        self.admin_user = User.objects.create_user(email='admin@example.com', password='password123', first_name='Admin', last_name='User')
        self.member1_user = User.objects.create_user(email='m1@example.com', password='password123', first_name='John', last_name='Doe')
        self.member2_user = User.objects.create_user(email='m2@example.com', password='password123', first_name='Jane', last_name='Smith')

        # Household
        self.household = Household.objects.create(name='Test House', owner=self.admin_user)
        self.admin = HouseholdMember.objects.create(household=self.household, user=self.admin_user, role=HouseholdMember.ROLE_ADMIN, status=HouseholdMember.STATUS_ACTIVE)
        self.member1 = HouseholdMember.objects.create(household=self.household, user=self.member1_user, role=HouseholdMember.ROLE_MEMBER, status=HouseholdMember.STATUS_ACTIVE)
        self.member2 = HouseholdMember.objects.create(household=self.household, user=self.member2_user, role=HouseholdMember.ROLE_MEMBER, status=HouseholdMember.STATUS_ACTIVE)

        # Categories
        self.grocery_cat, _ = ExpenseCategory.objects.get_or_create(name='Groceries')
        self.market_cat, _ = ExpenseCategory.objects.get_or_create(name='Market')
        self.other_cat, _ = ExpenseCategory.objects.get_or_create(name='Internet')

        # Month and Year
        self.year = 2023
        self.month = 10
        date = datetime.date(self.year, self.month, 15)

        # Meals:
        # Admin: 30 meals total
        Meal.objects.create(household=self.household, member=self.admin, date=date, breakfast=10, lunch=10, dinner=10)
        # Member1: 60 meals total
        Meal.objects.create(household=self.household, member=self.member1, date=date, breakfast=20, lunch=20, dinner=20)
        # Member2: 10 meals total
        Meal.objects.create(household=self.household, member=self.member2, date=date, breakfast=5, lunch=5, dinner=0)

        # Total Meals = 100

        # Expenses (Meal):
        # Groceries: 200 (Paid by Admin)
        Expense.objects.create(household=self.household, title='Groc', amount=Decimal('200.00'), category=self.grocery_cat, paid_by=self.admin, expense_date=date)
        # Market: 100 (Paid by Member1)
        Expense.objects.create(household=self.household, title='Market', amount=Decimal('100.00'), category=self.market_cat, paid_by=self.member1, expense_date=date)
        # Meal total = 300. Meal Rate = 300/100 = 3.00

        # Expenses (Other):
        # Internet: 60 (Paid by Member2)
        Expense.objects.create(household=self.household, title='Internet', amount=Decimal('60.00'), category=self.other_cat, paid_by=self.member2, expense_date=date)
        # Other Cost Per Member = 60 / 3 = 20.00

        # Deposits:
        # Admin: 50
        Deposit.objects.create(household=self.household, member=self.admin, amount=Decimal('50.00'), deposit_date=date, payment_method=Deposit.PAYMENT_BANK_TRANSFER)
        # Member1: 0
        # Member2: 100
        Deposit.objects.create(household=self.household, member=self.member2, amount=Decimal('100.00'), deposit_date=date, payment_method=Deposit.PAYMENT_CASH)

        # Total deposits (including expenses):
        # Admin: 50 (deposit) + 200 (expenses paid) = 250
        # Member1: 0 (deposit) + 100 (expenses paid) = 100
        # Member2: 100 (deposit) + 60 (expenses paid) = 160

        # Costs:
        # Admin: 30 meals * 3.00 = 90.00 + 20.00 = 110.00
        # Member1: 60 meals * 3.00 = 180.00 + 20.00 = 200.00
        # Member2: 10 meals * 3.00 = 30.00 + 20.00 = 50.00

        # Balances:
        # Admin: 250 - 110 = 140 (Creditor)
        # Member1: 100 - 200 = -100 (Debtor)
        # Member2: 160 - 50 = 110 (Creditor)

        # Total balances: 140 - 100 + 110 = 150 (Wait, 140 + 110 - 100 = 150? This is because they put in more money than was spent!)
        # Total cost = 300 + 60 = 360
        # Total put in = 200+100+60 (expenses) + 50+100 (deposits) = 510
        # 510 - 360 = 150. Yes, the surplus is 150.

    def test_generate_settlement(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post('/api/v1/settlements/generate/', {
            'household': self.household.id,
            'month': self.month,
            'year': self.year
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        self.assertEqual(response.data['total_expense'], '360.00')
        self.assertEqual(response.data['total_meals'], '100.00')
        self.assertEqual(response.data['meal_rate'], '3.0000')

        items = response.data['items']
        self.assertEqual(len(items), 3)

        admin_item = next(i for i in items if i['member'] == self.admin.id)
        self.assertEqual(admin_item['balance'], '140.00')
        self.assertEqual(admin_item['total_cost'], '110.00')
        
        member1_item = next(i for i in items if i['member'] == self.member1.id)
        self.assertEqual(member1_item['balance'], '-100.00')
        self.assertEqual(member1_item['total_cost'], '200.00')

        member2_item = next(i for i in items if i['member'] == self.member2.id)
        self.assertEqual(member2_item['balance'], '110.00')
        self.assertEqual(member2_item['total_cost'], '50.00')

        transfers = response.data['suggested_transfers']
        # Member1 owes 100. Admin is owed 140, Member2 is owed 110.
        # It will pick the largest creditor first. Admin has 140.
        # So Member1 pays Admin 100.
        self.assertEqual(len(transfers), 1)
        self.assertEqual(transfers[0]['from_member'], self.member1.id)
        self.assertEqual(transfers[0]['to_member'], self.admin.id)
        self.assertEqual(transfers[0]['amount'], 100.00)

    def test_finalize_settlement(self):
        # Generate first
        self.client.force_authenticate(user=self.admin_user)
        gen_res = self.client.post('/api/v1/settlements/generate/', {
            'household': self.household.id,
            'month': self.month,
            'year': self.year
        })
        settlement_id = gen_res.data['id']

        response = self.client.post(f'/api/v1/settlements/{settlement_id}/finalize/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        s = Settlement.objects.get(id=settlement_id)
        self.assertEqual(s.status, Settlement.STATUS_FINALIZED)

    def test_non_admin_cannot_generate(self):
        self.client.force_authenticate(user=self.member1_user)
        response = self.client.post('/api/v1/settlements/generate/', {
            'household': self.household.id,
            'month': self.month,
            'year': self.year
        })
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
