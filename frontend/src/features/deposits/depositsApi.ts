import { api } from '../../services/api';
import type { Deposit, DepositInput } from '../../types/deposit';

interface PaginatedDeposits {
  count: number;
  next: string | null;
  previous: string | null;
  results: Deposit[];
}

export const depositsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDeposits: builder.query<PaginatedDeposits, Record<string, any>>({
      query: (params) => ({
        url: 'deposits/',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Deposit' as const, id })),
              { type: 'Deposit', id: 'LIST' },
            ]
          : [{ type: 'Deposit', id: 'LIST' }],
    }),
    getDeposit: builder.query<Deposit, number>({
      query: (id) => `deposits/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Deposit', id }],
    }),
    createDeposit: builder.mutation<Deposit, DepositInput>({
      query: (data) => ({
        url: 'deposits/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Deposit', id: 'LIST' }],
    }),
    updateDeposit: builder.mutation<Deposit, { id: number; data: Partial<DepositInput> }>({
      query: ({ id, data }) => ({
        url: `deposits/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Deposit', id }, { type: 'Deposit', id: 'LIST' }],
    }),
    deleteDeposit: builder.mutation<void, number>({
      query: (id) => ({
        url: `deposits/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Deposit', id }, { type: 'Deposit', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetDepositsQuery,
  useGetDepositQuery,
  useCreateDepositMutation,
  useUpdateDepositMutation,
  useDeleteDepositMutation,
} = depositsApi;
