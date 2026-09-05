from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Household, HouseholdMember, Invitation

User = get_user_model()

class HouseholdTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(email='user1@example.com', password='Password123!', first_name='User', last_name='One')
        self.user2 = User.objects.create_user(email='user2@example.com', password='Password123!', first_name='User', last_name='Two')
        self.user3 = User.objects.create_user(email='user3@example.com', password='Password123!', first_name='User', last_name='Three')

        self.list_create_url = '/api/v1/households/'
    
    def test_create_household(self):
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(self.list_create_url, {
            'name': 'My House',
            'description': 'A nice house'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Household.objects.count(), 1)
        
        household = Household.objects.get()
        self.assertEqual(household.owner, self.user1)
        
        # Check if user1 was added as admin
        member = HouseholdMember.objects.get(household=household, user=self.user1)
        self.assertEqual(member.role, HouseholdMember.ROLE_ADMIN)

    def test_list_households(self):
        # Create household for user1
        self.client.force_authenticate(user=self.user1)
        self.client.post(self.list_create_url, {'name': 'House 1'})
        
        # User2 should not see House 1
        self.client.force_authenticate(user=self.user2)
        response = self.client.get(self.list_create_url)
        self.assertEqual(len(response.data), 0)

    def test_household_permissions(self):
        household = Household.objects.create(name='Test House', owner=self.user1)
        HouseholdMember.objects.create(household=household, user=self.user1, role=HouseholdMember.ROLE_ADMIN)
        HouseholdMember.objects.create(household=household, user=self.user2, role=HouseholdMember.ROLE_MEMBER)

        detail_url = f'/api/v1/households/{household.id}/'

        # Admin can update
        self.client.force_authenticate(user=self.user1)
        response = self.client.patch(detail_url, {'name': 'Updated House'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Member cannot update
        self.client.force_authenticate(user=self.user2)
        response = self.client.patch(detail_url, {'name': 'Hacked House'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # Non-member cannot access at all
        self.client.force_authenticate(user=self.user3)
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)  # 403 because permission class blocks it

    def test_invite_member(self):
        household = Household.objects.create(name='Test House', owner=self.user1)
        HouseholdMember.objects.create(household=household, user=self.user1, role=HouseholdMember.ROLE_ADMIN)

        invite_url = f'/api/v1/households/{household.id}/members/invite/'

        # Admin can invite
        self.client.force_authenticate(user=self.user1)
        response = self.client.post(invite_url, {'email': 'newuser@example.com'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Invitation.objects.count(), 1)

        # Non-admin cannot invite
        HouseholdMember.objects.create(household=household, user=self.user2, role=HouseholdMember.ROLE_MEMBER)
        self.client.force_authenticate(user=self.user2)
        response = self.client.post(invite_url, {'email': 'anotheruser@example.com'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
