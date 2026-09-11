from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.households.models import Household, HouseholdMember
from .models import Deposit
from decimal import Decimal
import datetime

User = get_user_model()

class DepositTests(APITestCase):
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

        # Create a deposit for household 1
        self.deposit1 = Deposit.objects.create(
            household=self.household1,
            member=self.member1,
            amount=Decimal('500.00'),
            deposit_date=datetime.date.today(),
            payment_method=Deposit.PAYMENT_BANK_TRANSFER,
        )

    def test_get_deposits(self):
        """Test getting deposits for a user's household."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.get('/api/v1/deposits/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data.get('results', response.data)), 1)

    def test_get_deposits_other_household(self):
        """Test getting deposits doesn't return other households' deposits."""
        self.client.force_authenticate(user=self.user3)
        response = self.client.get('/api/v1/deposits/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data.get('results', response.data)), 0)

    def test_create_deposit(self):
        """Test creating a valid deposit."""
        self.client.force_authenticate(user=self.user1)
        data = {
            'household': self.household1.id,
            'member': self.member1.id,
            'amount': '1000.50',
            'deposit_date': str(datetime.date.today()),
            'payment_method': 'CARD'
        }
        response = self.client.post('/api/v1/deposits/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Deposit.objects.count(), 2)

    def test_create_deposit_invalid_amount(self):
        """Test creating a deposit with amount <= 0 fails."""
        self.client.force_authenticate(user=self.user1)
        data = {
            'household': self.household1.id,
            'member': self.member1.id,
            'amount': '-10.00',
            'deposit_date': str(datetime.date.today()),
            'payment_method': 'CASH'
        }
        response = self.client.post('/api/v1/deposits/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('amount', response.data)

    def test_update_deposit_by_depositor(self):
        """Test updating deposit by the member who made it."""
        self.client.force_authenticate(user=self.user1)
        data = {'notes': 'Updated Notes'}
        response = self.client.patch(f'/api/v1/deposits/{self.deposit1.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.deposit1.refresh_from_db()
        self.assertEqual(self.deposit1.notes, 'Updated Notes')

    def test_update_deposit_by_non_depositor_non_admin(self):
        """Test updating deposit by member who didn't make it and isn't admin fails."""
        # Member 2 tries to update deposit 1 (made by Member 1)
        self.client.force_authenticate(user=self.user2)
        data = {'notes': 'Hacked Notes'}
        response = self.client.patch(f'/api/v1/deposits/{self.deposit1.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_deposit(self):
        """Test deleting a deposit."""
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(f'/api/v1/deposits/{self.deposit1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Deposit.objects.count(), 0)
