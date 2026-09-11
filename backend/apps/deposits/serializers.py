from rest_framework import serializers
from .models import Deposit
from apps.households.serializers import HouseholdMemberSerializer

class DepositSerializer(serializers.ModelSerializer):
    member_detail = HouseholdMemberSerializer(source='member', read_only=True)

    class Meta:
        model = Deposit
        fields = (
            'id', 'household', 'member', 'member_detail', 'amount', 
            'deposit_date', 'payment_method', 'reference', 'notes', 
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than zero.")
        return value
