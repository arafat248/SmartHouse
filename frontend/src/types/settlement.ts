import type { HouseholdMember } from './household';

export interface Settlement {
  id: number;
  household: number;
  from_member: number;
  from_member_detail: HouseholdMember;
  to_member: number;
  to_member_detail: HouseholdMember;
  amount: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface SettlementInput {
  household: number;
  from_member: number;
  to_member: number;
  amount: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}
