import logging
from .models import AuditLog

logger = logging.getLogger(__name__)

def get_client_ip(request):
    if not request:
        return None
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def create_audit_log(request, action, description, household=None, entity=None, entity_id=None, user=None):
    """
    Creates an audit log entry.
    """
    try:
        ip_address = get_client_ip(request)
        log_user = user or (request.user if request and hasattr(request, 'user') and request.user.is_authenticated else None)
        
        AuditLog.objects.create(
            user=log_user,
            household=household,
            action=action,
            entity=entity,
            entity_id=entity_id,
            description=description,
            ip_address=ip_address
        )
    except Exception as e:
        # Audit logging should never break the main application flow
        logger.error(f"Failed to create audit log: {str(e)}")
