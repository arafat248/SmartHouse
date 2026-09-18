import { api } from '../../services/api';

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'INVITATION' | 'EXPENSE' | 'DEPOSIT' | 'SETTLEMENT' | 'BALANCE' | 'SYSTEM';
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<Notification[], void>({
      query: () => 'notifications/',
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation<{ status: string }, number>({
      query: (id) => ({
        url: `notifications/${id}/read/`,
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation<{ status: string }, void>({
      query: () => ({
        url: 'notifications/read-all/',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} = notificationsApi;
