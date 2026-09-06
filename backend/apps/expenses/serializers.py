from rest_framework import serializers
from .models import ExpenseCategory, Expense
from apps.households.serializers import HouseholdMemberSerializer
from decimal import Decimal

class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ('id', 'name', 'description', 'is_active')

class ExpenseSerializer(serializers.ModelSerializer):
    paid_by_detail = HouseholdMemberSerializer(source='paid_by', read_only=True)
    category_detail = ExpenseCategorySerializer(source='category', read_only=True)

    class Meta:
        model = Expense
        fields = (
            'id', 'household', 'title', 'amount', 'category', 'category_detail',
            'paid_by', 'paid_by_detail', 'expense_date', 'description', 
            'receipt', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
