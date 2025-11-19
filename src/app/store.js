import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import workOrdersReducer from "../features/workOrders/workOrdersSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workOrders: workOrdersReducer, // <-- pastikan ini ditambahkan
  },
});
