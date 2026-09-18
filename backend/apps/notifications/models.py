from django.db import models
from django.conf import settings

class Notification(models.fields.related.ForeignKey):
    pass
# Wait, let me rewrite this properly

from django.db import models
from django.conf import settings

class Notification(models.Model):
    TYPE_INVITATION = 'INVITATION'
    TYPE_EXPENSE = 'EXPENSE'
    TYPE_DEPOSIT = 'DEPOSIT'
    TYPE_SETTLEMENT = 'SETTLEMENT'
    TYPE_BALANCE = 'BALANCE'
    TYPE_SYSTEM = 'SYSTEM'

    TYPE_CHOICES = [
        (TYPE_INVITATION, 'Invitation'),
        (TYPE_EXPENSE, 'Expense'),
        (TYPE_DEPOSIT, 'Deposit'),
        (TYPE_SETTLEMENT, 'Settlement'),
        (TYPE_BALANCE, 'Balance'),
        (TYPE_SYSTEM, 'System'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=TYPE_SYSTEM)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.title} ({'Read' if self.is_read else 'Unread'})"

    class Meta:
        ordering = ['-created_at']
