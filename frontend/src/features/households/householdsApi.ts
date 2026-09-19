import { api } from '../../services/api';
import type { Household, HouseholdInput, HouseholdMember } from '../../types/household';

export const householdsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHouseholds: builder.query<Household[], void>({
      query: () => 'households/',
      providesTags: ['Household'],
    }),
    getHousehold: builder.query<Household, number>({
      query: (id) => `households/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Household', id }],
    }),
    createHousehold: builder.mutation<Household, HouseholdInput>({
      query: (data) => ({
        url: 'households/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Household'],
    }),
    updateHousehold: builder.mutation<Household, { id: number } & Partial<HouseholdInput>>({
      query: ({ id, ...data }) => ({
        url: `households/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Household', id }],
    }),
    getMembers: builder.query<HouseholdMember[], number>({
      query: (householdId) => `households/${householdId}/members/`,
      providesTags: (_result, _error, id) => [{ type: 'HouseholdMember', id }],
    }),
    inviteMember: builder.mutation<any, { householdId: number; email: string }>({
      query: ({ householdId, email }) => ({
        url: `households/${householdId}/members/invite/`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['Invitation'],
    }),
    removeMember: builder.mutation<void, { householdId: number; memberId: number }>({
      query: ({ householdId, memberId }) => ({
        url: `households/${householdId}/members/${memberId}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { householdId }) => [{ type: 'HouseholdMember', id: householdId }],
    }),
  }),
});

export const {
  useGetHouseholdsQuery,
  useGetHouseholdQuery,
  useCreateHouseholdMutation,
  useUpdateHouseholdMutation,
  useGetMembersQuery,
  useInviteMemberMutation,
  useRemoveMemberMutation,
} = householdsApi;
