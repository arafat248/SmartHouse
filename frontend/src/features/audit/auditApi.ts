import { api } from '../../services/api';

export interface AuditLog {
  id: number;
  user: number | null;
  user_email: string | null;
  household: number | null;
  household_name: string | null;
  action: string;
  entity: string | null;
  entity_id: number | null;
  description: string;
  ip_address: string | null;
  created_at: string;
}

export const auditApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<AuditLog[], void>({
      query: () => 'audit/',
      providesTags: ['AuditLog'],
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
} = auditApi;
