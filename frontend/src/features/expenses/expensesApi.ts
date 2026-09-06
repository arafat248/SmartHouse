import { api } from '../../services/api';
import type { Expense, ExpenseCategory } from '../../types/expense';

interface PaginatedExpenses {
  count: number;
  next: string | null;
  previous: string | null;
  results: Expense[];
}

export const expensesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getExpenseCategories: builder.query<ExpenseCategory[], void>({
      query: () => 'expenses/categories/',
      providesTags: ['ExpenseCategory'],
    }),
    getExpenses: builder.query<PaginatedExpenses, Record<string, any>>({
      query: (params) => ({
        url: 'expenses/',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Expense' as const, id })),
              { type: 'Expense', id: 'LIST' },
            ]
          : [{ type: 'Expense', id: 'LIST' }],
    }),
    getExpense: builder.query<Expense, number>({
      query: (id) => `expenses/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Expense', id }],
    }),
    createExpense: builder.mutation<Expense, FormData>({
      query: (data) => ({
        url: 'expenses/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }],
    }),
    updateExpense: builder.mutation<Expense, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `expenses/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Expense', id }],
    }),
    deleteExpense: builder.mutation<void, number>({
      query: (id) => ({
        url: `expenses/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Expense', id }, { type: 'Expense', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetExpenseCategoriesQuery,
  useGetExpensesQuery,
  useGetExpenseQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi;
