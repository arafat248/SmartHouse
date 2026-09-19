import { api } from '../../services/api';
import type { User } from '../../types/auth';

interface LoginRequest {
  email: string;
  password?: string; // adjust according to actual payload
}

interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
}

interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login/',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (userData) => ({
        url: 'auth/register/',
        method: 'POST',
        body: userData,
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => 'auth/me/',
      providesTags: ['User'],
    }),
    logout: builder.mutation<void, any>({
      query: (data) => ({
        url: 'auth/logout/',
        method: 'POST',
        body: data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;
