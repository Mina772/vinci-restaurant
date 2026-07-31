import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logOut } from "../../features/auth/authSlice.js";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || "/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

// Wrap base query to transparently refresh an expired access token once.
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    const refresh = await rawBaseQuery({ url: "/auth/refresh", method: "POST" }, api, extraOptions);
    if (refresh.data?.data?.accessToken) {
      api.dispatch(setCredentials(refresh.data.data));
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logOut());
    }
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Category", "Cart", "Order", "User", "Review", "Coupon", "Reservation", "Admin"],
  endpoints: () => ({}),
});
