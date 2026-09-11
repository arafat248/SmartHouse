import { api } from '../../services/api';

export interface SettlementItem {
  id: number;
  member: number;
  member_detail: {
    id: number;
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
    };
  };
  total_meals: string;
  meal_cost: string;
  other_cost: string;
  total_cost: string;
  total_deposit: string;
  balance: string;
}

export interface SuggestedTransfer {
  from_member: number;
  from_member_name: string;
  to_member: number;
  to_member_name: string;
  amount: number;
}

export interface Settlement {
  id: number;
  household: number;
  month: number;
  year: number;
  total_expense: string;
  total_meals: string;
  meal_rate: string;
  status: 'DRAFT' | 'FINALIZED' | 'CLOSED';
  created_at: string;
  items: SettlementItem[];
  suggested_transfers?: SuggestedTransfer[];
}

export const settlementsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSettlements: builder.query<{ results: Settlement[], count: number, next: string | null, previous: string | null }, { page?: number }>({
      query: (params) => ({
        url: 'settlements/',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Settlement' as const, id })),
              { type: 'Settlement', id: 'LIST' },
            ]
          : [{ type: 'Settlement', id: 'LIST' }],
    }),
    getSettlement: builder.query<Settlement, number>({
      query: (id) => `settlements/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Settlement', id }],
    }),
    generateSettlement: builder.mutation<Settlement, { household: number, month: number, year: number }>({
      query: (data) => ({
        url: 'settlements/generate/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Settlement', id: 'LIST' }],
    }),
    finalizeSettlement: builder.mutation<{ detail: string }, number>({
      query: (id) => ({
        url: `settlements/${id}/finalize/`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Settlement', id },
        { type: 'Settlement', id: 'LIST' }
      ],
    }),
  }),
});

export const {
  useGetSettlementsQuery,
  useGetSettlementQuery,
  useGenerateSettlementMutation,
  useFinalizeSettlementMutation,
} = settlementsApi;
