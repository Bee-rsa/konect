import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const authHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
  },
});

export const calcLeaseCost = (pricePerSeat, termMonths) => {
  const workingDays   = termMonths * 22;
  const discountPct   = termMonths === 2 ? 5 : termMonths === 3 ? 10 : 0;
  const totalAmount   = pricePerSeat * workingDays;
  const discountAmt   = parseFloat((totalAmount * discountPct / 100).toFixed(2));
  const finalAmount   = parseFloat((totalAmount - discountAmt).toFixed(2));
  const weeklyRelease = parseFloat((finalAmount / (termMonths * 4)).toFixed(2));
  return { workingDays, discountPct, totalAmount, discountAmt, finalAmount, weeklyRelease };
};

export const searchLiftClubs = createAsyncThunk(
  "liftClub/search",
  async ({ origin, destination, day, timeSlot }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (origin)      params.append("origin",      origin);
      if (destination) params.append("destination", destination);
      if (day)         params.append("day",         day);
      if (timeSlot)    params.append("timeSlot",    timeSlot);
      const { data } = await axios.get(
        `${BASE}/api/lift-clubs/search?${params}`
      );
      return data.clubs;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Search failed. Please try again."
      );
    }
  }
);

export const fetchLiftClubById = createAsyncThunk(
  "liftClub/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`${BASE}/api/lift-clubs/${id}`);
      return data.club;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not load this lift club."
      );
    }
  }
);

export const sendLeaseRequest = createAsyncThunk(
  "liftClub/sendLeaseRequest",
  async ({ liftClubId, termMonths, pickupStop, notes }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/api/lift-clubs/${liftClubId}/lease-request`,
        { termMonths, pickupStop, notes },
        authHeaders()
      );
      return data.lease;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to send request. Please try again."
      );
    }
  }
);

export const fetchMyLeases = createAsyncThunk(
  "liftClub/fetchMyLeases",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        `${BASE}/api/lift-clubs/leases/mine`,
        authHeaders()
      );
      return data.leases;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not fetch your leases."
      );
    }
  }
);

export const giveCancellationNotice = createAsyncThunk(
  "liftClub/cancelNotice",
  async ({ leaseId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await axios.post(
        `${BASE}/api/lift-clubs/lease/${leaseId}/cancel-notice`,
        { reason },
        authHeaders()
      );
      return data.lease;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Cancellation failed. Please try again."
      );
    }
  }
);

const initialState = {
  searchParams:   { origin: "", destination: "", day: "", timeSlot: "" },
  results:        [],
  searching:      false,
  searchError:    null,
  selectedClub:   null,
  loadingClub:    false,
  clubError:      null,
  selectedMonths: null,
  agreedToTerms:  false,
  pendingLease:   null,
  submitting:     false,
  submitError:    null,
  myLeases:       [],
  loadingLeases:  false,
  leasesError:    null,
};

const liftClubSlice = createSlice({
  name: "liftClub",
  initialState,
  reducers: {
    setSearchParams(state, { payload }) {
      state.searchParams = { ...state.searchParams, ...payload };
    },
    setSelectedMonths(state, { payload }) {
      state.selectedMonths = payload;
    },
    setAgreedToTerms(state, { payload }) {
      state.agreedToTerms = payload;
    },
    clearSelectedClub(state) {
      state.selectedClub   = null;
      state.selectedMonths = null;
      state.agreedToTerms  = false;
      state.submitError    = null;
    },
    clearPendingLease(state) {
      state.pendingLease = null;
      state.submitError  = null;
    },
    clearResults(state) {
      state.results     = [];
      state.searchError = null;
    },
    updateLeaseStatus(state, { payload: { leaseId, status } }) {
      if (state.pendingLease?._id === leaseId) {
        state.pendingLease = { ...state.pendingLease, status };
      }
      const idx = state.myLeases.findIndex((l) => l._id === leaseId);
      if (idx !== -1) state.myLeases[idx].status = status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchLiftClubs.pending,   (s) => { s.searching = true;  s.searchError = null; })
      .addCase(searchLiftClubs.fulfilled, (s, { payload }) => { s.searching = false; s.results = payload; })
      .addCase(searchLiftClubs.rejected,  (s, { payload }) => { s.searching = false; s.searchError = payload; });

    builder
      .addCase(fetchLiftClubById.pending,   (s) => { s.loadingClub = true;  s.clubError = null; })
      .addCase(fetchLiftClubById.fulfilled, (s, { payload }) => { s.loadingClub = false; s.selectedClub = payload; })
      .addCase(fetchLiftClubById.rejected,  (s, { payload }) => { s.loadingClub = false; s.clubError = payload; });

    builder
      .addCase(sendLeaseRequest.pending,   (s) => { s.submitting = true;  s.submitError = null; })
      .addCase(sendLeaseRequest.fulfilled, (s, { payload }) => { s.submitting = false; s.pendingLease = payload; })
      .addCase(sendLeaseRequest.rejected,  (s, { payload }) => { s.submitting = false; s.submitError = payload; });

    builder
      .addCase(fetchMyLeases.pending,   (s) => { s.loadingLeases = true;  s.leasesError = null; })
      .addCase(fetchMyLeases.fulfilled, (s, { payload }) => { s.loadingLeases = false; s.myLeases = payload; })
      .addCase(fetchMyLeases.rejected,  (s, { payload }) => { s.loadingLeases = false; s.leasesError = payload; });

    builder
      .addCase(giveCancellationNotice.fulfilled, (s, { payload }) => {
        const idx = s.myLeases.findIndex((l) => l._id === payload._id);
        if (idx !== -1) s.myLeases[idx] = payload;
        if (s.pendingLease?._id === payload._id) s.pendingLease = payload;
      });
  },
});

export const {
  setSearchParams,
  setSelectedMonths,
  setAgreedToTerms,
  clearSelectedClub,
  clearPendingLease,
  clearResults,
  updateLeaseStatus,
} = liftClubSlice.actions;

export default liftClubSlice.reducer;