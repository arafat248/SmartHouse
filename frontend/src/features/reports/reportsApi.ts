import { api } from '../../services/api';
import type { Expense } from '../../types/expense';
import type { Deposit } from '../../types/deposit';

// Re-export Dashboard data for existing references
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

// New Report Types
export interface DailyReportItem {
  date: string;
  total_expense: number;
  total_deposit: number;
  total_meals: number;
}

export interface MonthlyReportData {
  summary: {
    total_expense: number;
    total_food_expense: number;
    total_meals: number;
    meal_rate: number;
    total_deposits: number;
  };
  members: {
    member_name: string;
    total_meals: number;
    meal_cost: number;
    other_cost: number;
    total_cost: number;
    total_deposit: number;
    balance: number;
  }[];
}

export interface MemberReportItem {
  member_id: number;
  member_name: string;
  total_meals: number;
  total_deposits: number;
  total_expenses_paid: number;
}

export interface ExpenseReportResponse {
  results: Expense[];
  summary: {
    total_expense: number;
  };
  count?: number;
}

export interface DepositReportResponse {
  results: Deposit[];
  summary: {
    total_deposit: number;
  };
  count?: number;
}

export const reportsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<DashboardData, void>({
      query: () => 'reports/dashboard/',
      providesTags: ['Expense', 'Deposit', 'Meal', 'Settlement', 'HouseholdMember'],
    }),
    getDailyReport: builder.query<DailyReportItem[], { start_date: string; end_date: string }>({
      query: (params) => ({
        url: 'reports/daily/',
        params,
      }),
      providesTags: ['Expense', 'Deposit', 'Meal'],
    }),
    getMonthlyReport: builder.query<MonthlyReportData, { month: number; year: number }>({
      query: (params) => ({
        url: 'reports/monthly/',
        params,
      }),
      providesTags: ['Expense', 'Deposit', 'Meal', 'HouseholdMember'],
    }),
    getMemberReport: builder.query<MemberReportItem[], { start_date: string; end_date: string }>({
      query: (params) => ({
        url: 'reports/member/',
        params,
      }),
      providesTags: ['Expense', 'Deposit', 'Meal', 'HouseholdMember'],
    }),
    getExpenseReport: builder.query<ExpenseReportResponse, Record<string, any>>({
      query: (params) => ({
        url: 'reports/expenses/',
        params,
      }),
      providesTags: ['Expense'],
    }),
    getDepositReport: builder.query<DepositReportResponse, Record<string, any>>({
      query: (params) => ({
        url: 'reports/deposits/',
        params,
      }),
      providesTags: ['Deposit'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetDailyReportQuery,
  useGetMonthlyReportQuery,
  useGetMemberReportQuery,
  useGetExpenseReportQuery,
  useGetDepositReportQuery,
} = reportsApi;
