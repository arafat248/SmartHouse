from rest_framework import serializers
from .models import Meal
from apps.households.serializers import HouseholdMemberSerializer

class MealSerializer(serializers.ModelSerializer):
    member_detail = HouseholdMemberSerializer(source='member', read_only=True)
    total_meals = serializers.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        read_only=True
    )

    class Meta:
        model = Meal
        fields = (
            'id', 'household', 'member', 'member_detail', 'date', 
            'breakfast', 'lunch', 'dinner', 'guest_meals', 'total_meals', 
            'notes', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate(self, data):
        # Additional validations could go here, though unique_together handles duplicate dates
        return data
