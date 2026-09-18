import { api } from '../../services/api';
import type { Expense } from '../../types/expense';
import type { Deposit } from '../../types/deposit';

export interface DashboardData {
  metrics: {
    total_members: number;
    total_meals: number;
    total_expenses: number;
    total_deposits: number;
    current_meal_rate: number;
    my_balance: number;
    settlement_status: string;
    current_month: number;
    current_year: number;
  };
  recent_activity: {
    expenses: Expense[];
    deposits: Deposit[];
    meals: {
      id: number;
      date: string;
      member_name: string;
      total_meals: number;
    }[];
  };
  charts: {
    expense_by_category: { name: string; value: number }[];
    monthly_expense_trend: { month: string; amount: number }[];
    member_meal_consumption: { name: string; meals: number }[];
  };
}

export const reportsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardData, void>({
      query: () => 'reports/dashboard/',
      providesTags: ['Expense', 'Deposit', 'Meal', 'Settlement', 'HouseholdMember'],
    }),
  }),
});

export const { useGetDashboardQuery } = reportsApi;
