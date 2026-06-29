import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;

const userFromStorage = localStorage.getItem("userInfo")
  ? JSON.parse(localStorage.getItem("userInfo"))
  : null;

const initialGuestId =
  localStorage.getItem("guestId") || `guest_${new Date().getTime()}`;
localStorage.setItem("guestId", initialGuestId);

const getStoredLastActivity = () => {
  const value = localStorage.getItem("lastActivityAt");
  return value ? Number(value) : Date.now();
};

const clearAuthStorage = () => {
  localStorage.removeItem("userInfo");
  localStorage.removeItem("userToken");
  localStorage.removeItem("lastActivityAt");
};

const initialState = {
  user: userFromStorage,
  guestId: initialGuestId,
  loading: false,
  error: null,
  lastActivityAt: getStoredLastActivity(),
  sessionExpired: false,
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/login`,
        userData
      );

      const now = Date.now();

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("lastActivityAt", String(now));

      return {
        user: response.data.user,
        lastActivityAt: now,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Login failed" }
      );
    }
  }
);

export const loginCompany = createAsyncThunk(
  "auth/loginCompany",
  async ({ identifier, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        {
          identifier,
          password,
        }
      );

      const now = Date.now();

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("lastActivityAt", String(now));

      return {
        user: response.data.user,
        lastActivityAt: now,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Company login failed" }
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/register`,
        userData
      );

      const now = Date.now();

      localStorage.setItem("userInfo", JSON.stringify(response.data.user));
      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("lastActivityAt", String(now));

      return {
        user: response.data.user,
        lastActivityAt: now,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Registration failed" }
      );
    }
  }
);

export const acceptTerms = createAsyncThunk(
  "auth/acceptTerms",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");

      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/accept-terms`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const now = Date.now();

      localStorage.setItem("userInfo", JSON.stringify(response.data));
      localStorage.setItem("lastActivityAt", String(now));

      return {
        user: response.data,
        lastActivityAt: now,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to accept terms" }
      );
    }
  }
);

export const completeWelcome = createAsyncThunk(
  "auth/completeWelcome",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("userToken");

      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/welcome-complete`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const now = Date.now();

      localStorage.setItem("userInfo", JSON.stringify(response.data));
      localStorage.setItem("lastActivityAt", String(now));

      return {
        user: response.data,
        lastActivityAt: now,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { message: "Failed to complete welcome" }
      );
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.guestId = `guest_${new Date().getTime()}`;
      state.lastActivityAt = Date.now();
      state.sessionExpired = false;
      state.error = null;

      clearAuthStorage();
      localStorage.setItem("guestId", state.guestId);
    },

    forceLogoutForInactivity: (state) => {
      state.user = null;
      state.guestId = `guest_${new Date().getTime()}`;
      state.lastActivityAt = Date.now();
      state.sessionExpired = true;
      state.error = null;

      clearAuthStorage();
      localStorage.setItem("guestId", state.guestId);
    },

    generateNewGuestId: (state) => {
      state.guestId = `guest_${new Date().getTime()}`;
      localStorage.setItem("guestId", state.guestId);
    },

    updateLastActivity: (state) => {
      if (!state.user) return;

      const now = Date.now();
      state.lastActivityAt = now;
      localStorage.setItem("lastActivityAt", String(now));
    },

    checkSessionTimeout: (state) => {
      if (!state.user) return;

      const now = Date.now();
      const lastActivityAt = Number(
        localStorage.getItem("lastActivityAt") || state.lastActivityAt || now
      );

      if (now - lastActivityAt >= INACTIVITY_LIMIT_MS) {
        state.user = null;
        state.guestId = `guest_${new Date().getTime()}`;
        state.lastActivityAt = now;
        state.sessionExpired = true;
        state.error = null;

        clearAuthStorage();
        localStorage.setItem("guestId", state.guestId);
      }
    },

    clearSessionExpired: (state) => {
      state.sessionExpired = false;
    },

    clearAuthError: (state) => {
      state.error = null;
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
        state.user = action.payload.user;
        state.lastActivityAt = action.payload.lastActivityAt;
        state.sessionExpired = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
      })

      .addCase(loginCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.lastActivityAt = action.payload.lastActivityAt;
        state.sessionExpired = false;
        state.error = null;
      })
      .addCase(loginCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Company login failed";
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.lastActivityAt = action.payload.lastActivityAt;
        state.sessionExpired = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Registration failed";
      })

      .addCase(acceptTerms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptTerms.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.lastActivityAt = action.payload.lastActivityAt;
        state.error = null;
      })
      .addCase(acceptTerms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to accept terms";
      })

      .addCase(completeWelcome.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeWelcome.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.lastActivityAt = action.payload.lastActivityAt;
        state.error = null;
      })
      .addCase(completeWelcome.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to complete welcome";
      });
  },
});

export const {
  logout,
  forceLogoutForInactivity,
  generateNewGuestId,
  updateLastActivity,
  checkSessionTimeout,
  clearSessionExpired,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;