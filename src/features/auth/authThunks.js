import { createAsyncThunk } from "@reduxjs/toolkit";
import authService from "./authService";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data, thunkAPI) => {
    try {
      return await authService.login(data);
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Login failed"
      );
    }
  }
);

export const switchOrg = createAsyncThunk(
  "auth/switchOrg",
  async (organization, thunkAPI) => {
    try {
      return await authService.switchOrganization(organization);
    } catch (err) {
      // Ambil message yang jelas
      const message =
        err.response?.data?.message || err.message || "Switch org failed";
      return thunkAPI.rejectWithValue(message);
    }
  }
);

