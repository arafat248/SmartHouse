from django.test import TestCase
from django.contrib.auth import get_user_model
from apps.households.models import Household, HouseholdMember
from apps.meals.models import Meal
from apps.expenses.models import Expense, ExpenseCategory
from apps.deposits.models import Deposit
from apps.settlements.models import Settlement, SettlementItem
from apps.settlements.services import SettlementCalculator
from decimal import Decimal
import datetime

User = get_user_model()

class SettlementFinancialTests(TestCase):
    def setUp(self):
        # User 1
        self.user1 = User.objects.create_user(email='u1@example.com', password='pw', first_name='U1', last_name='A')
        
        self.household = Household.objects.create(name='Test Household', owner=self.user1)
        
        self.member1 = HouseholdMember.objects.create(user=self.user1, household=self.household, status=HouseholdMember.STATUS_ACTIVE)
        
        # User 2
        self.user2 = User.objects.create_user(email='u2@example.com', password='pw', first_name='U2', last_name='A')
        self.member2 = HouseholdMember.objects.create(user=self.user2, household=self.household, status=HouseholdMember.STATUS_ACTIVE)

        self.grocery_cat, _ = ExpenseCategory.objects.get_or_create(name='Groceries')
        self.util_cat, _ = ExpenseCategory.objects.get_or_create(name='Utilities')
        
        self.year = 2023
        self.month = 10

    def test_settlement_calculation_accuracy(self):
        # 500 / 250 = 2 meal rate
        # 45 meals for U1 -> 45 * 2 = 90 meal cost
        # 205 meals for U2 -> 205 * 2 = 410 meal cost
        
        # Total meals: 4.5 + 20.5 = 25
        Meal.objects.create(household=self.household, member=self.member1, date=datetime.date(2023, 10, 1), breakfast=Decimal('4.50'))
        Meal.objects.create(household=self.household, member=self.member2, date=datetime.date(2023, 10, 1), breakfast=Decimal('20.50'))
        
        # Total food expense: 500
        Expense.objects.create(household=self.household, title='Food', amount=Decimal('500.00'), category=self.grocery_cat, paid_by=self.member1, expense_date=datetime.date(2023, 10, 5))
        
        # Calculate
        settlement = SettlementCalculator.generate_settlement(self.household.id, self.month, self.year)
        
        self.assertEqual(settlement.total_meals, Decimal('25.00'))
        self.assertEqual(settlement.meal_rate, Decimal('20.0000'))
        
        item1 = settlement.items.get(member=self.member1)
        self.assertEqual(item1.total_meals, Decimal('4.50'))
        self.assertEqual(item1.meal_cost, Decimal('90.00'))
        
        item2 = settlement.items.get(member=self.member2)
        self.assertEqual(item2.total_meals, Decimal('20.50'))
        self.assertEqual(item2.meal_cost, Decimal('410.00'))

    def test_balances_and_negative_balances(self):
        # 45 meals * 3 rate = 135 cost for member 1
        # Deposit = 200
        # Balance = 200 - 135 = 65
        
        Meal.objects.create(household=self.household, member=self.member1, date=datetime.date(2023, 10, 1), breakfast=Decimal('45.00'))
        Expense.objects.create(household=self.household, title='Food', amount=Decimal('135.00'), category=self.grocery_cat, paid_by=self.member1, expense_date=datetime.date(2023, 10, 5))
        
        # Paid by U1 is added to U1's deposit
        Deposit.objects.create(household=self.household, member=self.member1, amount=Decimal('65.00'), deposit_date=datetime.date(2023, 10, 10))
        # Total deposit for U1 = 135 + 65 = 200
        
        # Calculate
        settlement = SettlementCalculator.generate_settlement(self.household.id, self.month, self.year)
        
        item1 = settlement.items.get(member=self.member1)
        self.assertEqual(item1.meal_cost, Decimal('135.00'))
        self.assertEqual(item1.total_cost, Decimal('135.00'))
        self.assertEqual(item1.total_deposit, Decimal('200.00'))
        self.assertEqual(item1.balance, Decimal('65.00')) # Positive balance
        
        # User 2 has 0 deposits, but 0 meals, so balance 0
        item2 = settlement.items.get(member=self.member2)
        self.assertEqual(item2.balance, Decimal('0.00'))

    def test_zero_meals(self):
        # Total food expense 500, but 0 meals logged
        Expense.objects.create(household=self.household, title='Food', amount=Decimal('500.00'), category=self.grocery_cat, paid_by=self.member1, expense_date=datetime.date(2023, 10, 5))
        
        settlement = SettlementCalculator.generate_settlement(self.household.id, self.month, self.year)
        
        self.assertEqual(settlement.total_meals, Decimal('0.00'))
        self.assertEqual(settlement.meal_rate, Decimal('0.0000')) # Should handle division by zero
        
        item1 = settlement.items.get(member=self.member1)
        self.assertEqual(item1.meal_cost, Decimal('0.00'))
        self.assertEqual(item1.total_deposit, Decimal('500.00'))
        self.assertEqual(item1.balance, Decimal('500.00'))

    def test_rounding_behavior(self):
        # 100 expense / 3 meals = 33.3333 rate
        Expense.objects.create(household=self.household, title='Food', amount=Decimal('100.00'), category=self.grocery_cat, paid_by=self.member1, expense_date=datetime.date(2023, 10, 5))
        Meal.objects.create(household=self.household, member=self.member1, date=datetime.date(2023, 10, 1), breakfast=Decimal('3.00'))
        
        settlement = SettlementCalculator.generate_settlement(self.household.id, self.month, self.year)
        
        self.assertEqual(settlement.meal_rate, Decimal('33.3333'))
        
        item1 = settlement.items.get(member=self.member1)
        # 3 * 33.3333 = 99.9999 rounded to 100.00
        self.assertEqual(item1.meal_cost, Decimal('100.00'))
