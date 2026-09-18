import { useGetDashboardDataQuery } from '../../features/dashboard/dashboardApi';
import { StatCard } from '../../features/dashboard/components/StatCard';
import { RecentActivity } from '../../features/dashboard/components/RecentActivity';
import { DashboardCharts } from '../../features/dashboard/components/DashboardCharts';
import { DashboardSkeleton } from '../../features/dashboard/components/DashboardSkeletons';
import { 
  Users, 
  Utensils, 
  Receipt, 
  PiggyBank, 
  TrendingUp, 
  Wallet 
} from 'lucide-react';

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useGetDashboardDataQuery();

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 max-w-7xl mx-auto w-full flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-rose-50 text-rose-600 p-6 rounded-xl max-w-md text-center border border-rose-100">
          <svg className="w-12 h-12 mx-auto mb-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-bold mb-2">Failed to load dashboard</h3>
          <p className="text-sm mb-4">There was a problem connecting to the server. Please try again later.</p>
          <button 
            onClick={() => refetch()}
            className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { metrics, recent_activity, charts } = data;

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Household Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your household's financial and meal status.</p>
        </div>
        <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-500">Settlement Status:</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-xs ${
              metrics.settlement_status === 'FINALIZED' ? 'bg-emerald-100 text-emerald-700' :
              metrics.settlement_status === 'CLOSED' ? 'bg-slate-100 text-slate-700' :
              'bg-amber-100 text-amber-700'
            }`}>
              {metrics.settlement_status}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Members"
          value={metrics.total_members}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          title="Total Meals (This Month)"
          value={metrics.total_meals}
          icon={<Utensils className="w-6 h-6" />}
        />
        <StatCard
          title="Total Expenses (This Month)"
          value={`$${metrics.total_expenses.toFixed(2)}`}
          icon={<Receipt className="w-6 h-6" />}
        />
        <StatCard
          title="Total Deposits (This Month)"
          value={`$${metrics.total_deposits.toFixed(2)}`}
          icon={<PiggyBank className="w-6 h-6" />}
        />
        <StatCard
          title="Current Meal Rate"
          value={`$${metrics.current_meal_rate.toFixed(2)}`}
          icon={<TrendingUp className="w-6 h-6" />}
          subtitle="per meal estimated"
        />
        <StatCard
          title="My Balance"
          value={`$${metrics.my_balance.toFixed(2)}`}
          icon={<Wallet className="w-6 h-6" />}
          subtitle="based on current settlement"
          trend={{
            value: metrics.my_balance > 0 ? 100 : 0,
            isPositive: metrics.my_balance >= 0
          }}
        />
      </div>

      {/* Charts */}
      <DashboardCharts 
        expenseByCategory={charts.expense_by_category}
        monthlyExpenseTrend={charts.monthly_expense_trend}
        memberMealConsumption={charts.member_meal_consumption}
      />

      {/* Recent Activity */}
      <RecentActivity 
        expenses={recent_activity.expenses}
        deposits={recent_activity.deposits}
        meals={recent_activity.meals}
      />

    </div>
  );
}
