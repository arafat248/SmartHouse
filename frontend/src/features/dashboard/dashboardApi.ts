import { api } from '../../services/api';

export interface ExpenseData {
  id: number;
  title: string;
  amount: string;
  expense_date: string;
  category: number | null;
  paid_by: number;
}

export interface DepositData {
  id: number;
  amount: string;
  deposit_date: string;
  payment_method: string;
  member: number;
}

export interface MealData {
  id: number;
  date: string;
  member_name: string;
  total_meals: string | number;
}

export interface DashboardMetrics {
  total_members: number;
  total_meals: number;
  total_expenses: number;
  total_deposits: number;
  current_meal_rate: number;
  my_balance: number;
  settlement_status: string;
  current_month: number;
  current_year: number;
}

export interface DashboardActivity {
  expenses: ExpenseData[];
  deposits: DepositData[];
  meals: MealData[];
}

export interface ChartExpenseCategory {
  name: string;
  value: number;
}

export interface ChartMonthlyTrend {
  month: string;
  amount: number;
}

export interface ChartMemberConsumption {
  name: string;
  meals: number;
}

export interface DashboardCharts {
  expense_by_category: ChartExpenseCategory[];
  monthly_expense_trend: ChartMonthlyTrend[];
  member_meal_consumption: ChartMemberConsumption[];
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  recent_activity: DashboardActivity;
  charts: DashboardCharts;
}

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardData: builder.query<DashboardResponse, void>({
      query: () => 'reports/dashboard/',
      providesTags: ['Household', 'Expense', 'Deposit', 'Meal', 'Settlement'],
    }),
  }),
});

export const { useGetDashboardDataQuery } = dashboardApi;
