import { apiSlice } from "../../app/api/apiSlice.js";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: () => "/admin/dashboard",
      providesTags: ["Admin"],
    }),
    getSalesReport: builder.query({
      query: (params = {}) => ({ url: "/admin/reports/sales", params }),
    }),
    listUsers: builder.query({
      query: (params = {}) => ({ url: "/admin/users", params }),
      providesTags: ["User"],
    }),
    listCoupons: builder.query({
      query: () => "/admin/coupons",
      providesTags: ["Coupon"],
    }),
    createCoupon: builder.mutation({
      query: (body) => ({ url: "/admin/coupons", method: "POST", body }),
      invalidatesTags: ["Coupon"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetSalesReportQuery,
  useListUsersQuery,
  useListCouponsQuery,
  useCreateCouponMutation,
} = adminApi;
