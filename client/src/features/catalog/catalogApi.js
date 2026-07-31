import { apiSlice } from "../../app/api/apiSlice.js";

export const catalogApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => "/categories",
      providesTags: ["Category"],
    }),
    getProducts: builder.query({
      query: (params = {}) => ({ url: "/products", params }),
      providesTags: ["Product"],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (r, e, id) => [{ type: "Product", id }],
    }),
    getProductBySlug: builder.query({
      query: (slug) => `/products/slug/${slug}`,
    }),
    getProductReviews: builder.query({
      query: (productId) => `/products/${productId}/reviews`,
      providesTags: ["Review"],
    }),
    createReview: builder.mutation({
      query: ({ productId, ...body }) => ({
        url: `/products/${productId}/reviews`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Review"],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useGetProductBySlugQuery,
  useGetProductReviewsQuery,
  useCreateReviewMutation,
} = catalogApi;
