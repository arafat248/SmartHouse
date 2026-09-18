from django.db import models
from django.conf import settings
from apps.households.models import Household

class AuditLog(models.Model):
    ACTION_CHOICES = [
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('CREATE_EXPENSE', 'Create Expense'),
        ('UPDATE_EXPENSE', 'Update Expense'),
        ('DELETE_EXPENSE', 'Delete Expense'),
        ('CREATE_MEAL', 'Create Meal'),
        ('UPDATE_MEAL', 'Update Meal'),
        ('DELETE_MEAL', 'Delete Meal'),
        ('ADD_DEPOSIT', 'Add Deposit'),
        ('UPDATE_DEPOSIT', 'Update Deposit'),
        ('DELETE_DEPOSIT', 'Delete Deposit'),
        ('INVITE_MEMBER', 'Invite Member'),
        ('REMOVE_MEMBER', 'Remove Member'),
        ('CREATE_SETTLEMENT', 'Create Settlement'),
        ('FINALIZE_SETTLEMENT', 'Finalize Settlement'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    household = models.ForeignKey(Household, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    entity = models.CharField(max_length=50, null=True, blank=True)
    entity_id = models.IntegerField(null=True, blank=True)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action} - {self.created_at}"

    class Meta:
        ordering = ['-created_at']
