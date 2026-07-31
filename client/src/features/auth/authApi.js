import { apiSlice } from "../../app/api/apiSlice.js";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    me: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: "/auth/profile", method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdateProfileMutation,
} = authApi;
