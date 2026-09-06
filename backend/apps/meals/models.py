from django.db import models
from apps.households.models import Household, HouseholdMember
from decimal import Decimal

class Meal(models.Model):
    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='meals')
    member = models.ForeignKey(HouseholdMember, on_delete=models.CASCADE, related_name='meals')
    date = models.DateField()
    breakfast = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('0.00'))
    lunch = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('0.00'))
    dinner = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('0.00'))
    guest_meals = models.DecimalField(max_digits=4, decimal_places=2, default=Decimal('0.00'))
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('household', 'member', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.member.user.email} - {self.date}"

    @property
    def total_meals(self):
        return self.breakfast + self.lunch + self.dinner + self.guest_meals
