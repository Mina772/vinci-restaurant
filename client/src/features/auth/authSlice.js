import { createSlice } from "@reduxjs/toolkit";

const persisted = (() => {
  try {
    return JSON.parse(localStorage.getItem("vinci_auth")) || {};
  } catch {
    return {};
  }
})();

const initialState = {
  user: persisted.user || null,
  accessToken: persisted.accessToken || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, { payload }) => {
      if (payload.user) state.user = payload.user;
      if (payload.accessToken) state.accessToken = payload.accessToken;
      localStorage.setItem(
        "vinci_auth",
        JSON.stringify({ user: state.user, accessToken: state.accessToken })
      );
    },
    logOut: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem("vinci_auth");
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (s) => s.auth.user;
export const selectIsAuthenticated = (s) => Boolean(s.auth.accessToken);
