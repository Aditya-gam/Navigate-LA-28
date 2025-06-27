import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  SearchResult,
  Marker,
  BusRoute,
  AttractionPlan,
  SearchType,
} from "@/types";

interface LocationState {
  selectedLocation: [number, number] | null;
  searchResults: SearchResult[];
  resultMarkers: Marker[];
  busRoute: BusRoute | null;
  attractionPlan: AttractionPlan | null;
  searchType: SearchType;
  searchQuery: string;
  isPanelVisible: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: LocationState = {
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
    setSelectedLocation: (
      state,
      action: PayloadAction<[number, number] | null>,
    ) => {
      state.selectedLocation = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.searchResults = action.payload;
    },
    setResultMarkers: (state, action: PayloadAction<Marker[]>) => {
      state.resultMarkers = action.payload;
    },
    setBusRoute: (state, action: PayloadAction<BusRoute | null>) => {
      state.busRoute = action.payload;
    },
    setAttractionPlan: (
      state,
      action: PayloadAction<AttractionPlan | null>,
    ) => {
      state.attractionPlan = action.payload;
    },
    setSearchType: (state, action: PayloadAction<SearchType>) => {
      state.searchType = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setPanelVisibility: (state, action: PayloadAction<boolean>) => {
      state.isPanelVisible = action.payload;
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
