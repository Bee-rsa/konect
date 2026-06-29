import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/company-rates`;


const authHeader = () => {
  const token = localStorage.getItem("userToken");

  if (!token) console.warn("companyRateSlice: no token found");

  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

// ── Fetch my profile ──────────────────────────────────────────
export const fetchMyRates = createAsyncThunk(
  "companyRate/fetchMyRates",
  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(`${BASE}/my-rates`, authHeader());
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch");
    }
  }
);

// ── Save full profile (create or patch info) ──────────────────
export const saveCompanyProfile = createAsyncThunk(
  "companyRate/saveProfile",
  async (payload, thunkAPI) => {
    try {
      const existing = thunkAPI.getState().companyRate.profile;
      if (existing) {
        const { data } = await axios.patch(`${BASE}/info`, payload, authHeader());
        return data;
      }
      const { data } = await axios.post(`${BASE}/`, payload, authHeader());
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to save");
    }
  }
);

// ── Add courier rate ──────────────────────────────────────────
export const addCourierRate = createAsyncThunk(
  "companyRate/addCourierRate",
  async (payload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${BASE}/courier-rate`, payload, authHeader());
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to add courier rate");
    }
  }
);

// ── Update courier rate ───────────────────────────────────────
export const updateCourierRate = createAsyncThunk(
  "companyRate/updateCourierRate",
  async ({ index, payload }, thunkAPI) => {
    try {
      const { data } = await axios.patch(`${BASE}/courier-rate/${index}`, payload, authHeader());
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update");
    }
  }
);

// ── Delete courier rate ───────────────────────────────────────
export const deleteCourierRate = createAsyncThunk(
  "companyRate/deleteCourierRate",
  async (index, thunkAPI) => {
    try {
      const { data } = await axios.delete(`${BASE}/courier-rate/${index}`, authHeader());
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete");
    }
  }
);

// ── Add truck rate ────────────────────────────────────────────
export const addTruckRate = createAsyncThunk(
  "companyRate/addTruckRate",
  async (payload, thunkAPI) => {
    try {
      const { data } = await axios.post(`${BASE}/truck-rate`, payload, authHeader());
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to add truck rate");
    }
  }
);

// ── Update truck rate ─────────────────────────────────────────
export const updateTruckRate = createAsyncThunk(
  "companyRate/updateTruckRate",
  async ({ index, payload }, thunkAPI) => {
    try {
      const { data } = await axios.patch(`${BASE}/truck-rate/${index}`, payload, authHeader());
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update");
    }
  }
);

// ── Delete truck rate ─────────────────────────────────────────
export const deleteTruckRate = createAsyncThunk(
  "companyRate/deleteTruckRate",
  async (index, thunkAPI) => {
    try {
      const { data } = await axios.delete(`${BASE}/truck-rate/${index}`, authHeader());
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to delete");
    }
  }
);

const companyRateSlice = createSlice({
  name: "companyRate",
  initialState: {
    profile:     null,
    loading:     false,
    saving:      false,
    error:       null,
    saveSuccess: false,
  },
  reducers: {
    clearSaveSuccess: (state) => { state.saveSuccess = false; },
    clearError:       (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true;  state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.saving = false; state.error = action.payload; };

    builder
      .addCase(fetchMyRates.pending,  pending)
      .addCase(fetchMyRates.fulfilled, (state, action) => { state.loading = false; state.profile = action.payload; })
      .addCase(fetchMyRates.rejected,  rejected)

      .addCase(saveCompanyProfile.pending,   (state) => { state.saving = true; state.error = null; })
      .addCase(saveCompanyProfile.fulfilled, (state, action) => { state.saving = false; state.saveSuccess = true; state.profile = action.payload; })
      .addCase(saveCompanyProfile.rejected,  rejected)

      .addCase(addCourierRate.fulfilled,    (state, action) => { if (state.profile) state.profile.courierRates = action.payload; })
      .addCase(updateCourierRate.fulfilled, (state, action) => { if (state.profile) state.profile.courierRates = action.payload; })
      .addCase(deleteCourierRate.fulfilled, (state, action) => { if (state.profile) state.profile.courierRates = action.payload; })

      .addCase(addTruckRate.fulfilled,    (state, action) => { if (state.profile) state.profile.truckRates = action.payload; })
      .addCase(updateTruckRate.fulfilled, (state, action) => { if (state.profile) state.profile.truckRates = action.payload; })
      .addCase(deleteTruckRate.fulfilled, (state, action) => { if (state.profile) state.profile.truckRates = action.payload; })
      
      .addMatcher(
        (action) => action.type.startsWith("companyRate/") && action.type.endsWith("/rejected"),
        rejected
      );
  },
});

export const { clearSaveSuccess, clearError } = companyRateSlice.actions;
export default companyRateSlice.reducer;