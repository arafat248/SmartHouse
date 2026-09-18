from django.urls import path
from .views import (
    DashboardView,
    DailyReportView,
    MonthlyReportView,
    MemberReportView,
    ExpenseReportView,
    DepositReportView,
)

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('daily/', DailyReportView.as_view(), name='daily-report'),
    path('monthly/', MonthlyReportView.as_view(), name='monthly-report'),
    path('member/', MemberReportView.as_view(), name='member-report'),
    path('expenses/', ExpenseReportView.as_view(), name='expense-report'),
    path('deposits/', DepositReportView.as_view(), name='deposit-report'),
]
