from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Household, HouseholdMember, Invitation
from .serializers import (
    HouseholdSerializer, HouseholdMemberSerializer, 
    InvitationSerializer, InviteMemberSerializer
)
from .permissions import IsHouseholdMember, IsHouseholdAdmin

class HouseholdViewSet(viewsets.ModelViewSet):
    serializer_class = HouseholdSerializer
    permission_classes = [permissions.IsAuthenticated, IsHouseholdMember]

    def get_queryset(self):
        # Users can only see households where they are members
        return Household.objects.filter(
            members__user=self.request.user, 
            members__status=HouseholdMember.STATUS_ACTIVE
        ).distinct()

    def perform_create(self, serializer):
        household = serializer.save(owner=self.request.user)
        # Add creator as ADMIN member
        HouseholdMember.objects.create(
            household=household,
            user=self.request.user,
            role=HouseholdMember.ROLE_ADMIN
        )

    def perform_destroy(self, instance):
        # Deactivate instead of hard delete
        instance.is_active = False
        instance.save()

class HouseholdMemberViewSet(viewsets.ModelViewSet):
    serializer_class = HouseholdMemberSerializer
    permission_classes = [permissions.IsAuthenticated, IsHouseholdMember]
    
    def get_queryset(self):
        return HouseholdMember.objects.filter(household_id=self.kwargs.get('household_pk'))

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsHouseholdAdmin()]
        return super().get_permissions()

    @action(detail=False, methods=['post'], serializer_class=InviteMemberSerializer)
    def invite(self, request, household_pk=None):
        household = get_object_or_404(Household, pk=household_pk)
        
        # Check admin permission manually for this custom action
        if not IsHouseholdAdmin().has_permission(request, self):
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Check if user is already a member
            if HouseholdMember.objects.filter(household=household, user__email=email).exists():
                return Response({'detail': 'User is already a member.'}, status=status.HTTP_400_BAD_REQUEST)

            invitation, created = Invitation.objects.get_or_create(
                household=household,
                email=email,
                status=Invitation.STATUS_PENDING,
                defaults={'invited_by': request.user}
            )
            
            # In a real app, send email with invitation.token here
            
            return Response(InvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
