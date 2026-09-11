from django.db import models
from apps.households.models import Household, HouseholdMember
from django.core.validators import MinValueValidator
from decimal import Decimal

class Deposit(models.Model):
    PAYMENT_CASH = 'CASH'
    PAYMENT_BANK_TRANSFER = 'BANK_TRANSFER'
    PAYMENT_CARD = 'CARD'
    PAYMENT_VENMO = 'VENMO'
    PAYMENT_PAYPAL = 'PAYPAL'
    PAYMENT_OTHER = 'OTHER'

    PAYMENT_METHOD_CHOICES = [
        (PAYMENT_CASH, 'Cash'),
        (PAYMENT_BANK_TRANSFER, 'Bank Transfer'),
        (PAYMENT_CARD, 'Card'),
        (PAYMENT_VENMO, 'Venmo'),
        (PAYMENT_PAYPAL, 'PayPal'),
        (PAYMENT_OTHER, 'Other'),
    ]

    household = models.ForeignKey(Household, on_delete=models.CASCADE, related_name='deposits')
    member = models.ForeignKey(HouseholdMember, on_delete=models.CASCADE, related_name='deposits')
    amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    deposit_date = models.DateField()
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default=PAYMENT_BANK_TRANSFER)
    reference = models.CharField(max_length=255, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-deposit_date', '-created_at']

    def __str__(self):
        return f"Deposit of {self.amount} by {self.member.user.email} on {self.deposit_date}"
