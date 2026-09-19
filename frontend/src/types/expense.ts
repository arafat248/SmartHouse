import type { HouseholdMember } from './household';

export interface ExpenseCategory {
  id: number;
  name: string;
  description: string;
  is_active: boolean;
}

export interface Expense {
  id: number;
  household: number;
  title: string;
  amount: string;
  category: number | null;
  category_detail: ExpenseCategory | null;
  paid_by: number;
  paid_by_detail: HouseholdMember;
  expense_date: string;
  description: string;
  receipt: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseInput {
  household: number;
  title: string;
  amount: string;
  category: number | null;
  paid_by: number;
  expense_date: string;
  description?: string;
  receipt?: File | null;
}
