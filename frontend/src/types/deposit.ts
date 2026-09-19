import type { HouseholdMember } from './household';

export interface Deposit {
  id: number;
  household: number;
  member: number;
  member_detail: HouseholdMember;
  amount: string;
  deposit_date: string;
  payment_method: string;
  reference: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface DepositInput {
  household: number;
  member: number;
  amount: string;
  deposit_date: string;
  payment_method: string;
  reference?: string;
  notes?: string;
}
