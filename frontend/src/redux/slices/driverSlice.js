import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("driverToken")}`,
});

/* ══════════════════════════════
   THUNKS
══════════════════════════════ */

export const registerDriver = createAsyncThunk(
  "driver/register",
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${BASE}/api/driver/register`, formData);
      localStorage.setItem("driverToken", data.token);
      localStorage.setItem("driverInfo", JSON.stringify(data.driver));
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Registration failed.");
    }
  }
);

export const loginDriver = createAsyncThunk(
  "driver/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(`${BASE}/api/driver/login`, { email, password });
      localStorage.setItem("driverToken", data.token);
      localStorage.setItem("driverInfo", JSON.stringify(data.driver));
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Login failed.");
    }
  }
);

export const fetchDriverProfile = createAsyncThunk(
  "driver/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE}/api/driver/me`, { headers: getHeaders() });
      return data.driver;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch profile.");
    }
  }
);

export const updateDriverVehicle = createAsyncThunk(
  "driver/updateVehicle",
  async (vehicleData, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`${BASE}/api/driver/vehicle`, vehicleData, { headers: getHeaders() });
      return data.vehicle;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update vehicle.");
    }
  }
);

export const updateDriverLicense = createAsyncThunk(
  "driver/updateLicense",
  async (licenseData, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`${BASE}/api/driver/license`, licenseData, { headers: getHeaders() });
      return data.license;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update license.");
    }
  }
);

export const updateDriverBank = createAsyncThunk(
  "driver/updateBank",
  async (bankData, { rejectWithValue }) => {
    try {
      await axios.patch(`${BASE}/api/driver/bank`, bankData, { headers: getHeaders() });
      return bankData;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update bank details.");
    }
  }
);

export const toggleDriverStatus = createAsyncThunk(
  "driver/toggleStatus",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.patch(`${BASE}/api/driver/status/toggle`, {}, { headers: getHeaders() });
      return data.status;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to toggle status.");
    }
  }
);

export const updateDriverLocation = createAsyncThunk(
  "driver/updateLocation",
  async ({ lng, lat }, { rejectWithValue }) => {
    try {
      await axios.patch(`${BASE}/api/driver/location`, { lng, lat }, { headers: getHeaders() });
      return { lng, lat };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update location.");
    }
  }
);

/* ══════════════════════════════
   SLICE
══════════════════════════════ */

const stored = localStorage.getItem("driverInfo");

const initialState = {
  driver:   stored ? JSON.parse(stored) : null,
  token:    localStorage.getItem("driverToken") || null,
  loading:  false,
  error:    null,
  success:  null,
};

const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    logoutDriver: (state) => {
      state.driver  = null;
      state.token   = null;
      state.error   = null;
      state.success = null;
      localStorage.removeItem("driverToken");
      localStorage.removeItem("driverInfo");
    },
    clearDriverError:   (state) => { state.error   = null; },
    clearDriverSuccess: (state) => { state.success = null; },
    setDriverStatus: (state, action) => {
      if (state.driver) state.driver.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    const pending  = (state) => { state.loading = true;  state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      /* register */
      .addCase(registerDriver.pending,   pending)
      .addCase(registerDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.driver  = action.payload.driver;
        state.token   = action.payload.token;
        state.success = action.payload.message;
      })
      .addCase(registerDriver.rejected, rejected)

      /* login */
      .addCase(loginDriver.pending,   pending)
      .addCase(loginDriver.fulfilled, (state, action) => {
        state.loading = false;
        state.driver  = action.payload.driver;
        state.token   = action.payload.token;
      })
      .addCase(loginDriver.rejected, rejected)

      /* fetch profile */
      .addCase(fetchDriverProfile.pending,   pending)
      .addCase(fetchDriverProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.driver  = action.payload;
        localStorage.setItem("driverInfo", JSON.stringify(action.payload));
      })
      .addCase(fetchDriverProfile.rejected, rejected)

      /* vehicle */
      .addCase(updateDriverVehicle.fulfilled, (state, action) => {
        if (state.driver) {
          state.driver.vehicle = action.payload;
          localStorage.setItem("driverInfo", JSON.stringify(state.driver));
        }
        state.success = "Vehicle updated.";
      })
      .addCase(updateDriverVehicle.rejected, rejected)

      /* license */
      .addCase(updateDriverLicense.fulfilled, (state, action) => {
        if (state.driver) {
          state.driver.license = action.payload;
          localStorage.setItem("driverInfo", JSON.stringify(state.driver));
        }
        state.success = "License updated.";
      })
      .addCase(updateDriverLicense.rejected, rejected)

      /* bank */
      .addCase(updateDriverBank.fulfilled, (state, action) => {
        if (state.driver) {
          state.driver.bankDetails = action.payload;
          localStorage.setItem("driverInfo", JSON.stringify(state.driver));
        }
        state.success = "Bank details updated.";
      })
      .addCase(updateDriverBank.rejected, rejected)

      /* toggle status */
      .addCase(toggleDriverStatus.fulfilled, (state, action) => {
        if (state.driver) {
          state.driver.status = action.payload;
          localStorage.setItem("driverInfo", JSON.stringify(state.driver));
        }
      })
      .addCase(toggleDriverStatus.rejected, rejected)

      /* location */
      .addCase(updateDriverLocation.rejected, rejected);
  },
});

export const {
  logoutDriver,
  clearDriverError,
  clearDriverSuccess,
  setDriverStatus,
} = driverSlice.actions;

export default driverSlice.reducer;