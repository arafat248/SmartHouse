from django.db import models
from apps.households.models import Household, HouseholdMember
from django.core.validators import MinValueValidator
from decimal import Decimal

class ExpenseCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
        
    class Meta:
        verbose_name_plural = "Expense Categories"

class Expense(models.Model):
    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=255)
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    category = models.ForeignKey(ExpenseCategory, on_delete=models.SET_NULL, null=True, related_name='expenses')
    paid_by = models.ForeignKey(HouseholdMember, on_delete=models.CASCADE, related_name='expenses_paid')
    expense_date = models.DateField()
    description = models.TextField(blank=True)
    receipt = models.FileField(upload_to='receipts/%Y/%m/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-expense_date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.amount}"
