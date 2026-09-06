import { api } from '../../services/api';
import type { Meal, MealInput } from '../../types/meal';

export const mealsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMeals: builder.query<{ count: number; next: string | null; previous: string | null; results: Meal[] }, { date?: string; member?: number; month?: string; page?: number }>({
      query: (params) => ({
        url: 'meals/',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.results.map(({ id }) => ({ type: 'Meal' as const, id })),
              { type: 'Meal', id: 'LIST' },
            ]
          : [{ type: 'Meal', id: 'LIST' }],
    }),
    getMeal: builder.query<Meal, number>({
      query: (id) => `meals/${id}/`,
      providesTags: (_result, _error, id) => [{ type: 'Meal', id }],
    }),
    createMeal: builder.mutation<Meal, MealInput>({
      query: (data) => ({
        url: 'meals/',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Meal', id: 'LIST' }],
    }),
    updateMeal: builder.mutation<Meal, Partial<MealInput> & { id: number }>({
      query: ({ id, ...data }) => ({
        url: `meals/${id}/`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Meal', id }],
    }),
    deleteMeal: builder.mutation<void, number>({
      query: (id) => ({
        url: `meals/${id}/`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Meal', id }, { type: 'Meal', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetMealsQuery,
  useGetMealQuery,
  useCreateMealMutation,
  useUpdateMealMutation,
  useDeleteMealMutation,
} = mealsApi;
