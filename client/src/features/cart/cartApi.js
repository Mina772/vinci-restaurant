import { apiSlice } from "../../app/api/apiSlice.js";

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),
    addToCart: builder.mutation({
      query: (body) => ({ url: "/cart/items", method: "POST", body }),
      invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation({
      query: ({ itemId, ...body }) => ({
        url: `/cart/items/${itemId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Cart"],
    }),
    removeCartItem: builder.mutation({
      query: (itemId) => ({ url: `/cart/items/${itemId}`, method: "DELETE" }),
      invalidatesTags: ["Cart"],
    }),
    clearCart: builder.mutation({
      query: () => ({ url: "/cart", method: "DELETE" }),
      invalidatesTags: ["Cart"],
    }),
    applyCoupon: builder.mutation({
      query: (body) => ({ url: "/cart/coupon", method: "POST", body }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useApplyCouponMutation,
} = cartApi;
