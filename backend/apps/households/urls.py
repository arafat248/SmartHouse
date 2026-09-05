from django.urls import path, include
from rest_framework_nested import routers
from .views import HouseholdViewSet, HouseholdMemberViewSet

router = routers.DefaultRouter()
router.register(r'', HouseholdViewSet, basename='household')

households_router = routers.NestedDefaultRouter(router, r'', lookup='household')
households_router.register(r'members', HouseholdMemberViewSet, basename='household-members')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(households_router.urls)),
]
