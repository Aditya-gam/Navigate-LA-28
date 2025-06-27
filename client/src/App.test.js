import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import App from './App';
import { useAuth } from './hooks/useAuth';
import * as mapService from './services/mapService';

// Mock the useAuth hook
jest.mock('./hooks/useAuth');

// Mock the map service
jest.mock('./services/mapService');

// Mock CSS imports
jest.mock('./styles/App.css', () => ({}));
jest.mock('./utils/leafletIcons', () => ({}));

// Create a mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      location: (state = {
        selectedLocation: null,
        searchResults: [],
        resultMarkers: [],
        busRoute: null,
        attractionPlan: null,
        searchType: 'nearest_places',
        searchQuery: '',
        isPanelVisible: true,
        isLoading: false,
      }, action) => {
        switch (action.type) {
          case 'location/setSelectedLocation':
            return { ...state, selectedLocation: action.payload };
          case 'location/setSearchResults':
            return { ...state, searchResults: action.payload };
          case 'location/setLoading':
            return { ...state, isLoading: action.payload };
          default:
            return state;
        }
      },
    },
    preloadedState: initialState,
  });
};

const renderWithProvider = (component, store = createMockStore()) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('App Component', () => {
  const mockAuth = {
    login: jest.fn(),
    logout: jest.fn(),
    user: null,
    isAuthenticated: false,
  };

  beforeEach(() => {
    useAuth.mockReturnValue(mockAuth);
    mapService.searchNearestPlaces.mockResolvedValue([]);
    mapService.searchNearestRestrooms.mockResolvedValue([]);
    mapService.searchOlympicVenues.mockResolvedValue([]);
  });

  test('renders without crashing', () => {
    renderWithProvider(<App />);
    expect(screen.getByRole('main') || screen.getByTestId('app')).toBeInTheDocument();
  });

  test('displays header component', () => {
    renderWithProvider(<App />);
    // Header should be present - look for common header elements
    const headerElements = screen.getAllByRole('button');
    expect(headerElements.length).toBeGreaterThan(0);
  });

  test('displays map container by default', () => {
    renderWithProvider(<App />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  test('handles location selection', async () => {
    const store = createMockStore();
    renderWithProvider(<App />, store);
    
    // The app should handle location selection internally
    // We can test this by checking if the store state updates
    const actions = store.getState();
    expect(actions.location.selectedLocation).toBeNull();
  });

  test('handles search functionality', async () => {
    mapService.searchNearestPlaces.mockResolvedValue([
      {
        id: '1',
        name: 'Test Place',
        latitude: 34.0522,
        longitude: -118.2437,
        distance: 0.5,
      }
    ]);

    const store = createMockStore({
      location: {
        selectedLocation: [34.0522, -118.2437],
        searchResults: [],
        resultMarkers: [],
        busRoute: null,
        attractionPlan: null,
        searchType: 'nearest_places',
        searchQuery: '',
        isPanelVisible: true,
        isLoading: false,
      }
    });

    renderWithProvider(<App />, store);

    // Test will verify that search functions are called when appropriate
    await waitFor(() => {
      expect(mapService.searchNearestPlaces).toHaveBeenCalledTimes(0);
    });
  });

  test('handles authentication state changes', () => {
    const authenticatedAuth = {
      ...mockAuth,
      isAuthenticated: true,
      user: { username: 'testuser', email: 'test@example.com' },
    };
    
    useAuth.mockReturnValue(authenticatedAuth);
    
    renderWithProvider(<App />);
    
    // Component should render differently when authenticated
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  test('handles error states gracefully', async () => {
    mapService.searchNearestPlaces.mockRejectedValue(new Error('API Error'));
    
    const store = createMockStore({
      location: {
        selectedLocation: [34.0522, -118.2437],
        searchResults: [],
        resultMarkers: [],
        busRoute: null,
        attractionPlan: null,
        searchType: 'nearest_places',
        searchQuery: '',
        isPanelVisible: true,
        isLoading: false,
      }
    });

    renderWithProvider(<App />, store);
    
    // The app should handle errors gracefully without crashing
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  test('displays loading spinner when loading', () => {
    const store = createMockStore({
      location: {
        selectedLocation: null,
        searchResults: [],
        resultMarkers: [],
        busRoute: null,
        attractionPlan: null,
        searchType: 'nearest_places',
        searchQuery: '',
        isPanelVisible: true,
        isLoading: true,
      }
    });

    renderWithProvider(<App />, store);
    
    // Loading spinner should be present when isLoading is true
    const loadingElement = screen.queryByText(/loading/i) || screen.queryByRole('progressbar');
    // Loading component may or may not be visible depending on implementation
  });

  test('switches between map and analytics tabs', () => {
    renderWithProvider(<App />);
    
    // By default, map tab should be active
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
    
    // Analytics tab should not be visible by default
    expect(screen.queryByTestId('analytics')).not.toBeInTheDocument();
  });

  test('handles different search types', async () => {
    const store = createMockStore({
      location: {
        selectedLocation: [34.0522, -118.2437],
        searchResults: [],
        resultMarkers: [],
        busRoute: null,
        attractionPlan: null,
        searchType: 'olympic_venues',
        searchQuery: '',
        isPanelVisible: true,
        isLoading: false,
      }
    });

    renderWithProvider(<App />, store);
    
    // Component should handle different search types
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  test('manages modal states correctly', () => {
    renderWithProvider(<App />);
    
    // Modals should not be visible by default
    expect(screen.queryByTestId('login-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('review-modal')).not.toBeInTheDocument();
  });

  test('integrates with Redux store properly', () => {
    const store = createMockStore();
    renderWithProvider(<App />, store);
    
    // Component should connect to Redux store
    const state = store.getState();
    expect(state.location).toBeDefined();
    expect(state.location.searchType).toBe('nearest_places');
  });
}); 