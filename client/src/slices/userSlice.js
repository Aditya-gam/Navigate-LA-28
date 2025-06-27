// src/slices/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  preferences: {
    searchRadius: 1000, // meters
    preferredTransport: "bus",
    language: "en",
    theme: "light",
  },
  recentSearches: [],
  favoritePlaces: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    addRecentSearch: (state, action) => {
      // Keep only last 10 searches
      state.recentSearches = [
        action.payload,
        ...state.recentSearches.filter(
          (search) => search.query !== action.payload.query,
        ),
      ].slice(0, 10);
    },
    addFavoritePlace: (state, action) => {
      if (
        !state.favoritePlaces.find((place) => place.id === action.payload.id)
      ) {
        state.favoritePlaces.push(action.payload);
      }
    },
    removeFavoritePlace: (state, action) => {
      state.favoritePlaces = state.favoritePlaces.filter(
        (place) => place.id !== action.payload,
      );
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
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
  },
});

export const {
  setProfile,
  updatePreferences,
  addRecentSearch,
  addFavoritePlace,
  removeFavoritePlace,
  clearRecentSearches,
  setLoading,
  setError,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;
