from datetime import date
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from apps.households.models import Household, HouseholdMember
from .models import Meal

User = get_user_model()

class MealTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(email='user1@example.com', password='Password123!', first_name='User', last_name='One')
        self.user2 = User.objects.create_user(email='user2@example.com', password='Password123!', first_name='User', last_name='Two')
        self.user3 = User.objects.create_user(email='user3@example.com', password='Password123!', first_name='User', last_name='Three')

        self.household = Household.objects.create(name='Test House', owner=self.user1)
        self.member1 = HouseholdMember.objects.create(household=self.household, user=self.user1, role=HouseholdMember.ROLE_ADMIN)
        self.member2 = HouseholdMember.objects.create(household=self.household, user=self.user2, role=HouseholdMember.ROLE_MEMBER)

        self.list_create_url = '/api/v1/meals/'
    
    def test_create_meal(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(self.list_create_url, {
            'household': self.household.id,
            'member': self.member1.id,
            'date': '2026-09-05',
            'breakfast': '1.00',
            'lunch': '1.00',
            'dinner': '1.00',
            'guest_meals': '2.00'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Meal.objects.count(), 1)
        meal = Meal.objects.get()
        self.assertEqual(meal.total_meals, 5.00)

    def test_duplicate_meal(self):
        self.client.force_authenticate(user=self.user1)
        # First creation
        self.client.post(self.list_create_url, {
            'household': self.household.id,
            'member': self.member1.id,
            'date': '2026-09-05',
        })
        # Second creation should fail due to unique_together
        response = self.client.post(self.list_create_url, {
            'household': self.household.id,
            'member': self.member1.id,
            'date': '2026-09-05',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_meal_permissions(self):
        meal = Meal.objects.create(household=self.household, member=self.member1, date='2026-09-05')
        
        detail_url = f'/api/v1/meals/{meal.id}/'
        
        # user1 (admin member) can access
        self.client.force_authenticate(user=self.user1)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # user2 (regular member) can access
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # user3 (non-member) cannot access
        self.client.force_authenticate(user=self.user3)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) # filtered out by get_queryset

    def test_filtering(self):
        Meal.objects.create(household=self.household, member=self.member1, date='2026-09-01')
        Meal.objects.create(household=self.household, member=self.member1, date='2026-09-15')
        Meal.objects.create(household=self.household, member=self.member2, date='2026-09-01')
        Meal.objects.create(household=self.household, member=self.member1, date='2026-10-01')
        
        self.client.force_authenticate(user=self.user1)

        # Filter by date
        response = self.client.get(self.list_create_url + '?date=2026-09-01')
        results = response.data['results'] if isinstance(response.data, dict) and 'results' in response.data else response.data
        self.assertEqual(len(results), 2)

        # Filter by member
        response = self.client.get(self.list_create_url + f'?member={self.member2.id}')
        results = response.data['results'] if isinstance(response.data, dict) and 'results' in response.data else response.data
        self.assertEqual(len(results), 1)

        # Filter by month
        response = self.client.get(self.list_create_url + '?month=2026-09')
        results = response.data['results'] if isinstance(response.data, dict) and 'results' in response.data else response.data
        self.assertEqual(len(results), 3)

        response = self.client.get(self.list_create_url + '?month=2026-10')
        results = response.data['results'] if isinstance(response.data, dict) and 'results' in response.data else response.data
        self.assertEqual(len(results), 1)

    def test_update_meal(self):
        from decimal import Decimal
        meal = Meal.objects.create(household=self.household, member=self.member1, date='2026-09-05', breakfast=Decimal('1.00'))
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(f'/api/v1/meals/{meal.id}/', {
            'lunch': '2.00'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        meal.refresh_from_db()
        self.assertEqual(meal.lunch, 2.00)
        self.assertEqual(meal.total_meals, 3.00)

    def test_delete_meal(self):
        meal = Meal.objects.create(household=self.household, member=self.member1, date='2026-09-05')
        self.client.force_authenticate(user=self.user1)
        response = self.client.delete(f'/api/v1/meals/{meal.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Meal.objects.count(), 0)

    def test_guest_meal(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(self.list_create_url, {
            'household': self.household.id,
            'member': self.member1.id,
            'date': '2026-09-06',
            'guest_meals': '3.00'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        meal = Meal.objects.get(date='2026-09-06')
        self.assertEqual(meal.guest_meals, 3.00)
        self.assertEqual(meal.total_meals, 3.00)

    def test_update_delete_permissions(self):
        other_user = User.objects.create_user(email='other@example.com', password='Password123!')
        other_household = Household.objects.create(name='Other House', owner=other_user)
        other_member = HouseholdMember.objects.create(household=other_household, user=other_user, role=HouseholdMember.ROLE_ADMIN)
        other_meal = Meal.objects.create(household=other_household, member=other_member, date='2026-09-05')

        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(f'/api/v1/meals/{other_meal.id}/', {'breakfast': '1.00'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
