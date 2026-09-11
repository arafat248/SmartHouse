import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../store/store';

const baseQuery = fetchBaseQuery({
  baseUrl: 'http://localhost:8000/api/v1/',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Household', 'HouseholdMember', 'Invitation', 'Meal', 'Expense', 'ExpenseCategory', 'Deposit', 'Settlement'],
  endpoints: () => ({}),
});
