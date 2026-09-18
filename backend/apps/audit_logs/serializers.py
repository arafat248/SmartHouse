from rest_framework import serializers
from .models import AuditLog
from apps.accounts.serializers import UserSerializer

class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    household_name = serializers.CharField(source='household.name', read_only=True)

    class Meta:
        model = AuditLog
        fields = ('id', 'user', 'user_email', 'household', 'household_name', 'action', 'entity', 'entity_id', 'description', 'ip_address', 'created_at')
        read_only_fields = fields
