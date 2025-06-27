import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, Place, RecentSearch } from "@/types";

interface UserPreferences {
  searchRadius: number; // meters
  preferredTransport: string;
  language: string;
  theme: string;
}

interface UserState {
  profile: User | null;
  preferences: UserPreferences;
  recentSearches: RecentSearch[];
  favoritePlaces: Place[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
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
    setProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload;
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<UserPreferences>>,
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    addRecentSearch: (state, action: PayloadAction<RecentSearch>) => {
      // Keep only last 10 searches
      state.recentSearches = [
        action.payload,
        ...state.recentSearches.filter(
          (search) => search.query !== action.payload.query,
        ),
      ].slice(0, 10);
    },
    addFavoritePlace: (state, action: PayloadAction<Place>) => {
      if (
        !state.favoritePlaces.find((place) => place.id === action.payload.id)
      ) {
        state.favoritePlaces.push(action.payload);
      }
    },
    removeFavoritePlace: (state, action: PayloadAction<string>) => {
      state.favoritePlaces = state.favoritePlaces.filter(
        (place) => place.id !== action.payload,
      );
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
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
