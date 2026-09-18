from .models import Notification

def create_notification(user, title, message, notification_type=Notification.TYPE_SYSTEM):
    """
    Utility function to generate a notification.
    """
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notification_type=notification_type
    )

def create_household_notification(household, title, message, notification_type, exclude_user=None):
    """
    Create a notification for all active members of a household.
    """
    from apps.households.models import HouseholdMember
    members = HouseholdMember.objects.filter(household=household, status=HouseholdMember.STATUS_ACTIVE)
    
    notifications = []
    for member in members:
        if exclude_user and member.user == exclude_user:
            continue
        notifications.append(
            Notification(
                user=member.user,
                title=title,
                message=message,
                notification_type=notification_type
            )
        )
    
    if notifications:
        Notification.objects.bulk_create(notifications)
