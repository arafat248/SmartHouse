from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.households.models import Household, HouseholdMember
from .models import Expense, ExpenseCategory
from decimal import Decimal
import datetime

User = get_user_model()

class ExpenseTests(APITestCase):
    def setUp(self):
        # Create users
        self.user1 = User.objects.create_user(email='user1@example.com', password='password123', first_name='User', last_name='One')
        self.user2 = User.objects.create_user(email='user2@example.com', password='password123', first_name='User', last_name='Two')
        self.user3 = User.objects.create_user(email='user3@example.com', password='password123', first_name='User', last_name='Three')

        # Create household 1 with user1 and user2
        self.household1 = Household.objects.create(name='Household 1', owner=self.user1)
        self.member1 = HouseholdMember.objects.create(household=self.household1, user=self.user1, role=HouseholdMember.ROLE_ADMIN, status=HouseholdMember.STATUS_ACTIVE)
        self.member2 = HouseholdMember.objects.create(household=self.household1, user=self.user2, role=HouseholdMember.ROLE_MEMBER, status=HouseholdMember.STATUS_ACTIVE)

        # Create household 2 with user3
        self.household2 = Household.objects.create(name='Household 2', owner=self.user3)
        self.member3 = HouseholdMember.objects.create(household=self.household2, user=self.user3, role=HouseholdMember.ROLE_ADMIN, status=HouseholdMember.STATUS_ACTIVE)

        # Ensure categories exist
        self.category = ExpenseCategory.objects.first()
        if not self.category:
            self.category = ExpenseCategory.objects.create(name='Test Category')

        # Create an expense for household 1
        self.expense1 = Expense.objects.create(
            household=self.household1,
            title='Test Expense',
            amount=Decimal('50.00'),
            category=self.category,
            paid_by=self.member1,
            expense_date=datetime.date.today()
        )

    def test_get_expenses(self):
        """Test getting expenses for a user's household."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/v1/expenses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return 1 expense for household1
        self.assertEqual(len(response.data['results']), 1)

    def test_get_expenses_other_household(self):
        """Test getting expenses doesn't return other households' expenses."""
        self.client.force_authenticate(user=self.user3)
        response = self.client.get('/api/v1/expenses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return 0 expenses because household2 has none
        self.assertEqual(len(response.data['results']), 0)

    def test_create_expense(self):
        """Test creating a valid expense."""
        self.client.force_authenticate(user=self.user1)
        data = {
            'household': self.household1.id,
            'title': 'Groceries',
            'amount': '100.50',
            'category': self.category.id,
            'paid_by': self.member1.id,
            'expense_date': str(datetime.date.today())
        }
        response = self.client.post('/api/v1/expenses/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Expense.objects.count(), 2)

    def test_create_expense_invalid_amount(self):
        """Test creating an expense with amount <= 0 fails."""
        self.client.force_authenticate(user=self.user1)
        data = {
            'household': self.household1.id,
            'title': 'Groceries',
            'amount': '-10.00',
            'category': self.category.id,
            'paid_by': self.member1.id,
            'expense_date': str(datetime.date.today())
        }
        response = self.client.post('/api/v1/expenses/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', response.data)

    def test_update_expense_by_payer(self):
        """Test updating expense by the member who paid."""
        self.client.force_authenticate(user=self.user1) # member1 paid it
        data = {'title': 'Updated Title'}
        response = self.client.patch(f'/api/v1/expenses/{self.expense1.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.expense1.refresh_from_db()
        self.assertEqual(self.expense1.title, 'Updated Title')

    def test_update_expense_by_non_payer_non_admin(self):
        """Test updating expense by member who didn't pay and isn't admin fails."""
        # Create expense paid by member1
        # Member2 tries to update it
        self.client.force_authenticate(user=self.user2)
        data = {'title': 'Hacked Title'}
        response = self.client.patch(f'/api/v1/expenses/{self.expense1.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_expense_by_admin(self):
        """Test updating expense by admin who didn't pay succeeds."""
        # Make member2 the payer
        self.expense1.paid_by = self.member2
        self.expense1.save()
        
        # Admin (member1) tries to update it
        self.client.force_authenticate(user=self.user1)
        data = {'title': 'Admin Updated Title'}
        response = self.client.patch(f'/api/v1/expenses/{self.expense1.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_expense(self):
        """Test deleting an expense."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(f'/api/v1/expenses/{self.expense1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Expense.objects.count(), 0)
