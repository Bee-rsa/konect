import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
const API_URL = `${API_BASE_URL}/api/case-studies`;

const fetchWithTimeout = async (url, options = {}, timeout = 15000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const createCaseStudy = createAsyncThunk(
  "caseStudies/createCaseStudy",
  async (caseStudyData, { rejectWithValue }) => {
    try {
      const response = await fetchWithTimeout(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(caseStudyData),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to create case study");
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request timed out while creating case study");
      }
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

export const fetchCaseStudies = createAsyncThunk(
  "caseStudies/fetchCaseStudies",
  async (params = {}, { rejectWithValue }) => {
    try {
      let normalizedParams = {};

      if (typeof params === "boolean") {
        normalizedParams = {
          published: params,
        };
      } else {
        normalizedParams = params || {};
      }

      const searchParams = new URLSearchParams();

      if (normalizedParams.published === true) {
        searchParams.append("published", "true");
      }

      if (normalizedParams.sortBy) {
        searchParams.append("sortBy", normalizedParams.sortBy);
      }

      if (normalizedParams.limit) {
        searchParams.append("limit", String(normalizedParams.limit));
      }

      if (normalizedParams.category) {
        searchParams.append("category", normalizedParams.category);
      }

      if (normalizedParams.region) {
        searchParams.append("region", normalizedParams.region);
      }

      if (normalizedParams.search) {
        searchParams.append("search", normalizedParams.search);
      }

      const queryString = searchParams.toString();
      const url = `${API_URL}${queryString ? `?${queryString}` : ""}`;

      const response = await fetchWithTimeout(
        url,
        {
          method: "GET",
        },
        15000
      );

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch case studies");
      }

      if (Array.isArray(data)) {
        return data;
      }

      if (Array.isArray(data.caseStudies)) {
        return data.caseStudies;
      }

      if (Array.isArray(data.data)) {
        return data.data;
      }

      return [];
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue(
          "Case studies request timed out. The backend may be too slow or unreachable."
        );
      }
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

export const fetchCaseStudyBySlug = createAsyncThunk(
  "caseStudies/fetchCaseStudyBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/slug/${slug}`);
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch case study");
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue("Request timed out while fetching case study");
      }
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

export const incrementCaseStudyViews = createAsyncThunk(
  "caseStudies/incrementCaseStudyViews",
  async (slug, { rejectWithValue }) => {
    try {
      const response = await fetchWithTimeout(`${API_URL}/slug/${slug}/view`, {
        method: "PUT",
      });
      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(
          data.message || "Failed to increment case study views"
        );
      }

      return data;
    } catch (error) {
      if (error.name === "AbortError") {
        return rejectWithValue(
          "Request timed out while incrementing case study views"
        );
      }
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

const caseStudySlice = createSlice({
  name: "caseStudies",
  initialState: {
    caseStudies: [],
    caseStudy: null,
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetCaseStudyState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    clearCurrentCaseStudy: (state) => {
      state.caseStudy = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCaseStudy.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createCaseStudy.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.caseStudies.unshift(action.payload);
      })
      .addCase(createCaseStudy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCaseStudies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCaseStudies.fulfilled, (state, action) => {
        state.loading = false;
        state.caseStudies = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchCaseStudies.rejected, (state, action) => {
        state.loading = false;
        state.caseStudies = [];
        state.error = action.payload;
      })

      .addCase(fetchCaseStudyBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCaseStudyBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.caseStudy = action.payload;
      })
      .addCase(fetchCaseStudyBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(incrementCaseStudyViews.fulfilled, (state, action) => {
        if (state.caseStudy && state.caseStudy._id === action.payload._id) {
          state.caseStudy = {
            ...state.caseStudy,
            views: action.payload.views,
            viewCount: action.payload.viewCount,
          };
        }

        const index = state.caseStudies.findIndex(
          (item) => item._id === action.payload._id
        );

        if (index !== -1) {
          state.caseStudies[index] = {
            ...state.caseStudies[index],
            views: action.payload.views,
            viewCount: action.payload.viewCount,
          };
        }
      })
      .addCase(incrementCaseStudyViews.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetCaseStudyState, clearCurrentCaseStudy } =
  caseStudySlice.actions;

export default caseStudySlice.reducer;