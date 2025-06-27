// src/slices/locationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedLocation: null,
  searchResults: [],
  resultMarkers: [],
  busRoute: null,
  attractionPlan: null,
  searchType: "nearest_places",
  searchQuery: "",
  isPanelVisible: true,
  isLoading: false,
  error: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setSelectedLocation: (state, action) => {
      state.selectedLocation = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setResultMarkers: (state, action) => {
      state.resultMarkers = action.payload;
    },
    setBusRoute: (state, action) => {
      state.busRoute = action.payload;
    },
    setAttractionPlan: (state, action) => {
      state.attractionPlan = action.payload;
    },
    setSearchType: (state, action) => {
      state.searchType = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setPanelVisibility: (state, action) => {
      state.isPanelVisible = action.payload;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.resultMarkers = [];
      state.busRoute = null;
      state.attractionPlan = null;
    },
  },
});

export const {
  setSelectedLocation,
  setSearchResults,
  setResultMarkers,
  setBusRoute,
  setAttractionPlan,
  setSearchType,
  setSearchQuery,
  setPanelVisibility,
  setLoading,
  setError,
  clearError,
  clearSearchResults,
} = locationSlice.actions;

export default locationSlice.reducer;
