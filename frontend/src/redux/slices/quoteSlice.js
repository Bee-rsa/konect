import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const searchQuotes = createAsyncThunk(
  "quotes/searchQuotes",
  async (payload, thunkAPI) => {
    try {
      const params = new URLSearchParams();

      Object.entries(payload).forEach(([key, val]) => {
  if (val === "" || val === null || val === undefined || val === false) return;
  if (typeof val === "number" && val === 0) return;
  if (key === "serviceType") return; // ← skip, we use serviceMode instead
  params.append(key, val);
});

      const url = `${import.meta.env.VITE_BACKEND_URL}/api/company-rates/search?${params.toString()}`;
      
      console.log("Search URL:", url);

      const response = await axios.get(url);

      return {
        results: response.data,
        searchParams: payload,
      };
    } catch (error) {
      console.error("Search error:", error.response?.status, error.response?.data);
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to search quotes"
      );
    }
  }
);

const quoteSlice = createSlice({
  name: "quotes",
  initialState: {
    results: [],
    loading: false,
    error: null,
    searchParams: null,
  },
  reducers: {
    clearQuotes: (state) => {
      state.results = [];
      state.loading = false;
      state.error = null;
      state.searchParams = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchQuotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchQuotes.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        state.searchParams = action.payload.searchParams;
      })
      .addCase(searchQuotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearQuotes } = quoteSlice.actions;
export default quoteSlice.reducer;