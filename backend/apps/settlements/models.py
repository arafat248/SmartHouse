from django.db import models
from apps.households.models import Household, HouseholdMember
from decimal import Decimal

class Settlement(models.Model):
    STATUS_DRAFT = 'DRAFT'
    STATUS_FINALIZED = 'FINALIZED'
    STATUS_CLOSED = 'CLOSED'

    STATUS_CHOICES = [
        (STATUS_DRAFT, 'Draft'),
        (STATUS_FINALIZED, 'Finalized'),
        (STATUS_CLOSED, 'Closed'),
    ]

    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='settlements')
    month = models.IntegerField()
    year = models.IntegerField()
    total_expense = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_meals = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    meal_rate = models.DecimalField(max_digits=10, decimal_places=4, default=Decimal('0.0000'))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year', '-month']

    def __str__(self):
        return f"Settlement {self.month}/{self.year} for {self.household.name}"

class SettlementItem(models.Model):
    settlement = models.ForeignKey(Settlement, on_delete=models.CASCADE, related_name='items')
    member = models.ForeignKey(HouseholdMember, on_delete=models.CASCADE, related_name='settlement_items')
    total_meals = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    meal_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    other_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    total_deposit = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))

    def __str__(self):
        return f"{self.member.user.email} - Balance: {self.balance}"
