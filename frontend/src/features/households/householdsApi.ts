import { api } from '../../services/api';

export const householdsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getHouseholds: builder.query({
      query: () => 'households/',
      providesTags: ['Household'],
    }),
    getHousehold: builder.query({
      query: (id) => `households/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Household', id }],
    }),
    createHousehold: builder.mutation({
      query: (data) => ({
        url: 'households/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Household'],
    }),
    updateHousehold: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `households/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Household', id }],
    }),
    getMembers: builder.query({
      query: (householdId) => `households/${householdId}/members/`,
      providesTags: (_result, _error, id) => [{ type: 'HouseholdMember', id }],
    }),
    inviteMember: builder.mutation({
      query: ({ householdId, email }) => ({
        url: `households/${householdId}/members/invite/`,
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['Invitation'],
    }),
    removeMember: builder.mutation({
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
