from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Household, HouseholdMember, Invitation
from apps.accounts.serializers import UserSerializer

User = get_user_model()

class HouseholdMemberSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = HouseholdMember
        fields = ('id', 'household', 'user', 'user_detail', 'role', 'status', 'joined_at', 'created_at')
        read_only_fields = ('id', 'household', 'joined_at', 'created_at')

class HouseholdSerializer(serializers.ModelSerializer):
    owner_detail = UserSerializer(source='owner', read_only=True)
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Household
        fields = ('id', 'uuid', 'name', 'description', 'address', 'currency', 'owner', 'owner_detail', 'is_active', 'members_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'uuid', 'owner', 'is_active', 'created_at', 'updated_at')

    def get_members_count(self, obj):
        return obj.members.count()

class InvitationSerializer(serializers.ModelSerializer):
    invited_by_detail = UserSerializer(source='invited_by', read_only=True)
    
    class Meta:
        model = Invitation
        fields = ('id', 'household', 'email', 'invited_by', 'invited_by_detail', 'status', 'expires_at', 'created_at')
        read_only_fields = ('id', 'household', 'invited_by', 'status', 'expires_at', 'created_at')

class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
