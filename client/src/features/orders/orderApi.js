import { apiSlice } from "../../app/api/apiSlice.js";

export const orderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    checkout: builder.mutation({
      query: (body) => ({ url: "/orders/checkout", method: "POST", body }),
      invalidatesTags: ["Cart", "Order"],
    }),
    myOrders: builder.query({
      query: (params = {}) => ({ url: "/orders/me", params }),
      providesTags: ["Order"],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (r, e, id) => [{ type: "Order", id }],
    }),
    cancelOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: "PATCH" }),
      invalidatesTags: ["Order"],
    }),
    listAllOrders: builder.query({
      query: (params = {}) => ({ url: "/orders", params }),
      providesTags: ["Order"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: "PATCH", body }),
      invalidatesTags: ["Order"],
    }),
  }),
});

export const {
  useCheckoutMutation,
  useMyOrdersQuery,
  useGetOrderQuery,
  useCancelOrderMutation,
  useListAllOrdersQuery,
  useUpdateOrderStatusMutation,
} = orderApi;
