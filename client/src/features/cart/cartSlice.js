import { createSlice } from "@reduxjs/toolkit";

// Lightweight client-side mirror of the cart count for instant UI feedback.
const cartSlice = createSlice({
  name: "cart",
  initialState: { count: 0, drawerOpen: false },
  reducers: {
    setCartCount: (state, { payload }) => {
      state.count = payload;
    },
    toggleDrawer: (state, { payload }) => {
      state.drawerOpen = payload ?? !state.drawerOpen;
    },
  },
});

export const { setCartCount, toggleDrawer } = cartSlice.actions;
export default cartSlice.reducer;
