//src/features/workOrders/workOrdersSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/workorders`;

// ====================================================
// 🔹 Fetch semua Work Order
// ====================================================
export const fetchWorkOrders = createAsyncThunk(
  "workOrders/fetchAll",
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch work orders"
      );
    }
  }
);

// ====================================================
// 🔹 Fetch Work Order by ID (dengan context supervisor)
// ====================================================
export const fetchWorkOrderById = createAsyncThunk(
  "workOrders/fetchById",
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        wo: res.data.wo || res.data.data,
        supervisorRoleContext: res.data.supervisorRoleContext || null,
      };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch work order"
      );
    }
  }
);

// ====================================================
// 🔹 Create Work Order (Support FormData)
// ====================================================
export const createWorkOrder = createAsyncThunk(
  "workOrders/create",
  async (formData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await axios.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create work order"
      );
    }
  }
);

// ====================================================
// 🔹 Approval oleh Supervisor Pemohon
// ====================================================
export const approveWorkOrderBySupervisor = createAsyncThunk(
  "workOrders/approveBySupervisor",
  async ({ id, action, note }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await axios.put(
        `${API_URL}/approval/${id}/supervisor`,
        { action, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.wo;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to approve work order"
      );
    }
  }
);

// ====================================================
// 🔹 Approval oleh Supervisor TARGET
// ====================================================
export const approveWorkOrderByTargetSupervisor = createAsyncThunk(
  "workOrders/approveByTargetSupervisor",
  async ({ id, action, note, assignedStaffIds = [] }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await axios.put(
        `${API_URL}/approval/${id}/target`,
        { action, note, assignedStaffIds }, // << kirim array
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.wo;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message ||
          "Failed to approve work order by target supervisor"
      );
    }
  }
);

// ====================================================
// 🔹 Get Staffs by Department ID (untuk assign WO)
// ====================================================
export const fetchStaffByDepartment = createAsyncThunk(
  "workOrders/fetchStaffByDepartment",
  async (departmentId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/departments/${departmentId}/staffs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.staffs || res.data.data || [];
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to fetch staff list"
      );
    }
  }
);

// ====================================================
// 🔹 Update Progress oleh IT Staff
// ====================================================
export const updateWorkOrderProgress = createAsyncThunk(
  "workOrders/updateProgress",
  async ({ id, action, note, files }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;

      const formData = new FormData();
      formData.append("action", action);
      if (note) formData.append("note", note);
      if (files && files.length > 0) {
        Array.from(files).forEach((file) => {
          formData.append("files", file);
        });
      }

      const res = await axios.put(`${API_URL}/${id}/progress`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      return res.data.wo;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to update progress"
      );
    }
  }
);

// ====================================================
// 🔹 Slice utama
// ====================================================
const workOrdersSlice = createSlice({
  name: "workOrders",
  initialState: {
    list: [],
    selected: null,
    supervisorRoleContext: null,
    staffList: [],
    loading: false,
    error: null,
  },

  reducers: {
    clearSelectedWorkOrder: (state) => {
      state.selected = null;
      state.supervisorRoleContext = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ====== FETCH ALL ======
      .addCase(fetchWorkOrders.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchWorkOrders.fulfilled, (s, a) => {
        s.loading = false;
        s.list = a.payload || [];
      })
      .addCase(fetchWorkOrders.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ====== FETCH BY ID ======
      .addCase(fetchWorkOrderById.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchWorkOrderById.fulfilled, (s, a) => {
        s.loading = false;
        s.selected = a.payload.wo || null;
        s.supervisorRoleContext = a.payload.supervisorRoleContext || null;
      })
      .addCase(fetchWorkOrderById.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ====== CREATE ======
      .addCase(createWorkOrder.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createWorkOrder.fulfilled, (s, a) => {
        s.loading = false;
        if (a.payload) s.list.unshift(a.payload);
      })
      .addCase(createWorkOrder.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ====== APPROVAL SUPERVISOR PEMOHON ======
      .addCase(approveWorkOrderBySupervisor.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(approveWorkOrderBySupervisor.fulfilled, (s, a) => {
        s.loading = false;
        s.selected = a.payload;
      })
      .addCase(approveWorkOrderBySupervisor.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })

      // ====== APPROVAL SUPERVISOR TARGET ======
      .addCase(approveWorkOrderByTargetSupervisor.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(approveWorkOrderByTargetSupervisor.fulfilled, (s, a) => {
        s.loading = false;
        s.selected = a.payload;
      })
      .addCase(approveWorkOrderByTargetSupervisor.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      // ====== FETCH STAFF BY DEPARTMENT ======
      .addCase(fetchStaffByDepartment.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchStaffByDepartment.fulfilled, (s, a) => {
        s.loading = false;
        s.staffList = a.payload || [];
      })
      .addCase(fetchStaffByDepartment.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload;
      })
      // ====== UPDATE PROGRESS ======
      .addCase(updateWorkOrderProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWorkOrderProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(updateWorkOrderProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSelectedWorkOrder } = workOrdersSlice.actions;
export default workOrdersSlice.reducer;
