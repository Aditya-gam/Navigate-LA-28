// Core Application Types

export interface Location {
  latitude: number;
  longitude: number;
}

export interface Place {
  id?: string;
  place_id?: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  types?: string;
  distance?: number;
  // Olympic venue specific fields
  sport?: string;
  capacity?: number;
  venue_type?: string;
  events?: string;
  // Additional metadata
  rating?: number;
  reviews_count?: number;
  phone?: string;
  website?: string;
  opening_hours?: string;
  type?: string; // search type context
}

export interface SearchResult extends Place {
  // Extending Place with search-specific data
}

export interface Marker {
  position: [number, number];
  name: string;
  type?: string;
  data?: Place;
}

export interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  is_verified?: boolean;
  is_active?: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language?: string;
  accessibility_needs?: string[];
  interests?: string[];
  notification_settings?: {
    email_notifications?: boolean;
    push_notifications?: boolean;
  };
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface Review {
  id: string;
  place_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content: string;
  visit_date?: string;
  created_at: string;
  updated_at?: string;
  helpful_count?: number;
  verified_visit?: boolean;
  metadata?: {
    place_name?: string;
    place_location?: Location;
    search_type?: string;
  };
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
    review_count?: number;
    is_verified?: boolean;
  };
  response?: {
    author: string;
    content: string;
    created_at: string;
  };
}

export interface ReviewSubmission {
  place_id: string;
  rating: number;
  title?: string;
  content: string;
  visit_date?: string;
  metadata?: {
    place_name?: string;
    place_location?: Location;
    search_type?: string;
  };
}

export interface BusRoute {
  route_number: string;
  route_name: string;
  route_type: string;
  category: string;
  geometry: [number, number][];
  origin: BusStop;
  destination: BusStop;
}

export interface BusStop {
  stop_number: string;
  name: string;
  distance: number;
  coordinates: [number, number];
  routes?: string[];
  features?: {
    wheelchair_accessible?: boolean;
    shelter?: boolean;
    bench?: boolean;
    digital_display?: boolean;
  };
}

export interface AttractionPlan {
  itinerary: AttractionPlanItem[];
  total_duration: number;
  total_distance: number;
  recommendations: string[];
}

export interface AttractionPlanItem {
  order: number;
  place: Place;
  estimated_duration: number;
  travel_time?: number;
  travel_distance?: number;
  notes?: string;
}

export interface AnalyticsData {
  attractions?: AttractionsAnalytics;
  demographics?: DemographicsAnalytics;
  "bus-routes"?: BusRoutesAnalytics;
  "popular-stops"?: PopularStopsAnalytics;
}

export interface AttractionsAnalytics {
  popular_attractions: {
    name: string;
    visits: number;
    rating: number;
    category: string;
  }[];
  visit_trends: {
    date: string;
    visits: number;
  }[];
  category_distribution: {
    category: string;
    percentage: number;
    count: number;
  }[];
  peak_hours: {
    hour: number;
    visits: number;
  }[];
}

export interface DemographicsAnalytics {
  age_groups: Record<string, number>;
  countries: Record<string, number>;
  peak_usage_times: {
    hour: number;
    usage_percentage: number;
  }[];
  popular_categories: Record<string, number>;
  user_behavior: {
    avg_session_duration: number;
    avg_places_visited: number;
    return_user_rate: number;
  };
}

export interface BusRoutesAnalytics {
  popular_routes: {
    route_number: string;
    route_name: string;
    usage_count: number;
    avg_rating: number;
  }[];
  usage_patterns: {
    time_slot: string;
    usage_count: number;
  }[];
  route_efficiency: {
    route_number: string;
    avg_delay: number;
    on_time_percentage: number;
  }[];
}

export interface PopularStopsAnalytics {
  popular_stops: {
    stop_name: string;
    stop_number: string;
    daily_boardings: number;
    routes_served: number;
    accessibility_score: number;
  }[];
  usage_trends: {
    date: string;
    total_boardings: number;
  }[];
  stop_amenities: {
    amenity: string;
    percentage: number;
  }[];
}

export interface SearchState {
  query: string;
  type: SearchType;
  results: SearchResult[];
  isLoading: boolean;
  error: string | null;
  selectedLocation: [number, number] | null;
  resultMarkers: Marker[];
  busRoute: BusRoute | null;
  attractionPlan: AttractionPlan | null;
  recentSearches: RecentSearch[];
}

export interface RecentSearch {
  query: string;
  type: SearchType;
  timestamp: string;
  location?: [number, number];
}

export type SearchType =
  | "nearest_places"
  | "nearest_restrooms"
  | "olympic_venues"
  | "attraction_plan";

export type TabType = "map" | "analytics";

export interface UIState {
  activeTab: TabType;
  isPanelVisible: boolean;
  isLoginOpen: boolean;
  isReviewModalOpen: boolean;
  selectedPlace: Place | null;
  isLoading: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  duration?: number;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
  timestamp: string;
}

export interface APIResponse<T = any> {
  status: "success" | "error";
  message?: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface APIError {
  message: string;
  code?: string;
  details?: any;
  status?: number;
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  country?: string;
}

// Event types
export interface MapClickEvent {
  latlng: {
    lat: number;
    lng: number;
  };
}

// Component Props Types
export interface MapContainerProps {
  onLocationSelect: (coords: [number, number]) => void;
  resultMarkers: Marker[];
  searchResults: SearchResult[];
  searchType: SearchType;
  busRoute: BusRoute | null;
  onMarkerClick: (lat: number, lng: number) => void;
  onWriteReview: (place: Place) => void;
}

export interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  handleSearch: () => void;
  selectedLocation: [number, number] | null;
}

export interface HeaderProps {
  username?: string;
  onLoginToggle: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  handleSearch: () => void;
  selectedLocation: [number, number] | null;
}

export interface ResultsPanelProps {
  searchResults: SearchResult[];
  searchType: SearchType;
  attractionPlan: AttractionPlan | null;
  isPanelVisible: boolean;
  setIsPanelVisible: (visible: boolean) => void;
}

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
}

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (formData: LoginFormData) => void;
}

export interface AnalyticsProps {
  data?: AnalyticsData;
  isLoading?: boolean;
  error?: string | null;
}

// Redux State Types
export interface RootState {
  auth: AuthState;
  location: {
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
  };
  user: {
    recentSearches: RecentSearch[];
  };
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Environment Types
export interface EnvConfig {
  NODE_ENV: "development" | "production" | "test";
  REACT_APP_API_URL: string;
  REACT_APP_SENTRY_DSN?: string;
  REACT_APP_MAPS_API_KEY?: string;
}

const typesDefaultExport = {};
export default typesDefaultExport;
