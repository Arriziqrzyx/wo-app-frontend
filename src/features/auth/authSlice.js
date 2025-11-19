import { createSlice } from "@reduxjs/toolkit";
import { loginUser, switchOrg } from "./authThunks";

const token = localStorage.getItem("token");

const initialState = {
  token: token || null,
  user: token ? JSON.parse(atob(token.split(".")[1])) : null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = JSON.parse(atob(action.payload.token.split(".")[1]));
        localStorage.setItem("token", action.payload.token);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(switchOrg.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user.activeOrganization = action.payload.activeOrganization;
        localStorage.setItem("token", action.payload.token);
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
