from rest_framework import serializers
from .models import Settlement, SettlementItem
from apps.households.serializers import HouseholdMemberSerializer

class SettlementItemSerializer(serializers.ModelSerializer):
    member_detail = HouseholdMemberSerializer(source='member', read_only=True)

    class Meta:
        model = SettlementItem
        fields = (
            'id', 'member', 'member_detail', 'total_meals', 'meal_cost',
            'other_cost', 'total_cost', 'total_deposit', 'balance'
        )

class SettlementSerializer(serializers.ModelSerializer):
    items = SettlementItemSerializer(many=True, read_only=True)

    class Meta:
        model = Settlement
        fields = (
            'id', 'household', 'month', 'year', 'total_expense',
            'total_meals', 'meal_rate', 'status', 'created_at', 'items'
        )
        read_only_fields = (
            'id', 'total_expense', 'total_meals', 'meal_rate', 'status', 'created_at'
        )
