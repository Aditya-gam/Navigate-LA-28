import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/types";
import "leaflet/dist/leaflet.css";
import "./styles/App.css"; // Import global styles
import "./utils/leafletIcons"; // Import leaflet icon configuration
import Header from "@/components/Header";
import MapContainerComponent from "@/components/MapContainerComponent";
import ResultsPanel from "@/components/ResultsPanel";
import LoginModal from "@/components/LoginModal";
import ReviewModal from "@/components/ReviewModal";
import Analytics from "@/components/analytics/Analytics";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
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
} from "@/slices/locationSlice";
import { useAuth } from "@/hooks/useAuth";
import { addRecentSearch } from "@/slices/userSlice";
import {
  searchNearestPlaces,
  searchNearestRestrooms,
  searchOlympicVenues,
  fetchAttractionPlan,
  fetchDirectBusRoutes,
} from "@/services/mapService";
import { errorHandler, showError, showInfo } from "@/utils/errorHandler";
import type {
  SearchType,
  TabType,
  Place,
  LoginFormData,
  AttractionPlanItem,
} from "@/types";

function App(): JSX.Element {
  const dispatch = useDispatch();
  const { login, logout, user, isAuthenticated } = useAuth();

  // Redux state
  const {
    selectedLocation,
    searchResults,
    resultMarkers,
    busRoute,
    attractionPlan,
    searchType,
    searchQuery,
    isPanelVisible,
    isLoading,
  } = useSelector((state: RootState) => state.location);

  // Local state for modals and UI
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>("map");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Check for existing auth token on component mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && !isAuthenticated) {
      // Token exists but user not authenticated - could validate here
      // For now, we'll let the auth hook handle this
    }
  }, [isAuthenticated]);

  const handleLocationSelect = (coords: [number, number]): void => {
    dispatch(setSelectedLocation(coords));
    const [lat, lng] = coords;
    dispatch(setSearchQuery(`${lat.toFixed(6)}, ${lng.toFixed(6)}`));
    dispatch(setBusRoute(null));

    if (searchType === "attraction_plan") {
      handleAttractionPlan(coords);
    } else if (!searchResults.length) {
      dispatch(setSearchType("nearest_places"));
      handleSearch(coords, "nearest_places");
    } else {
      handleSearch(coords, searchType);
    }
  };

  const handleLoginSuccess = async (formData: LoginFormData): Promise<void> => {
    await login(formData);
    setIsLoginOpen(false);
  };

  const handleLogout = (): void => {
    logout();
  };

  const handleSearch = async (
    location: [number, number] | null = selectedLocation,
    type: SearchType = searchType,
  ): Promise<void> => {
    if (!location) {
      showError("Please select a location on the map first");
      return;
    }

    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const [lat, lng] = location;
      const token = localStorage.getItem("access_token") ?? undefined;

      let data: Place[] | undefined;
      if (type === "nearest_places") {
        data = await searchNearestPlaces(lat, lng, token);
      } else if (type === "nearest_restrooms") {
        data = await searchNearestRestrooms(lat, lng, token);
      } else if (type === "olympic_venues") {
        data = await searchOlympicVenues(lat, lng, token);
      }

      if (data) {
        dispatch(setSearchResults(data));

        const markers = data.map((result: Place) => ({
          position: [result.latitude, result.longitude] as [number, number],
          name: result.name || "Unnamed Location",
          type: type,
          data: result,
        }));
        dispatch(setResultMarkers(markers));

        // Add to recent searches
        dispatch(
          addRecentSearch({
            query: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            type,
            timestamp: new Date().toISOString(),
          }),
        );
      }
    } catch (error) {
      errorHandler.handleApiError(error, { type, location: selectedLocation });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAttractionPlan = async (
    coords: [number, number],
  ): Promise<void> => {
    if (!coords) return;

    dispatch(setLoading(true));
    try {
      const [lat, lng] = coords;
      const token = localStorage.getItem("access_token") ?? undefined;

      const data = await fetchAttractionPlan(lat, lng, 5, token);
      dispatch(setAttractionPlan(data));

      const planMarkers = data.itinerary.map((item: AttractionPlanItem) => ({
        position: [item.place.latitude, item.place.longitude] as [
          number,
          number,
        ],
        name: item.place.name,
      }));
      dispatch(setResultMarkers(planMarkers));
    } catch (error) {
      errorHandler.handleApiError(error, { context: "attraction_plan" });
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleMarkerClick = async (
    targetLat: number,
    targetLon: number,
  ): Promise<void> => {
    if (!selectedLocation) return;

    try {
      const token = localStorage.getItem("access_token") ?? undefined;
      const responseData = await fetchDirectBusRoutes(
        selectedLocation[0],
        selectedLocation[1],
        targetLat,
        targetLon,
        token,
      );

      if (responseData.status === "success" && responseData.data) {
        dispatch(setBusRoute(responseData.data));
      } else {
        showInfo("No direct bus routes found between these locations");
        dispatch(setBusRoute(null));
      }
    } catch (error) {
      errorHandler.handleApiError(error, { context: "bus_routes" });
      dispatch(setBusRoute(null));
    }
  };

  const handleWriteReview = (place: Place): void => {
    setSelectedPlace(place);
    setIsReviewModalOpen(true);
  };

  const handleSearchTypeChange = (newType: SearchType): void => {
    dispatch(setSearchType(newType));
    dispatch(setResultMarkers([]));
    dispatch(setSearchResults([]));
    dispatch(setAttractionPlan(null));

    if (selectedLocation) {
      if (newType === "attraction_plan") {
        handleAttractionPlan(selectedLocation);
      } else {
        handleSearch(selectedLocation, newType);
      }
    }
  };

  return (
    <div
      style={{
        fontFamily: "Roboto, Arial, sans-serif",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Header
        username={user?.username}
        onLoginToggle={() => {
          if (isAuthenticated) {
            handleLogout();
          } else {
            setIsLoginOpen(true);
          }
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={(value: string) => dispatch(setSearchQuery(value))}
        searchType={searchType}
        setSearchType={handleSearchTypeChange}
        handleSearch={handleSearch}
        selectedLocation={selectedLocation}
      />

      {activeTab === "map" ? (
        <div style={{ flex: 1, display: "flex", gap: "20px", padding: "20px" }}>
          <div
            style={{
              flex:
                searchResults.length > 0 && isPanelVisible
                  ? "1 1 70%"
                  : "1 1 100%",
              transition: "flex 0.3s ease",
            }}
          >
            <MapContainerComponent
              onLocationSelect={handleLocationSelect}
              resultMarkers={resultMarkers}
              searchResults={searchResults}
              searchType={searchType}
              busRoute={busRoute}
              onMarkerClick={handleMarkerClick}
              onWriteReview={handleWriteReview}
            />
          </div>

          <ResultsPanel
            searchResults={searchResults}
            searchType={searchType}
            attractionPlan={attractionPlan}
            isPanelVisible={isPanelVisible}
            setIsPanelVisible={(value: boolean) =>
              dispatch(setPanelVisibility(value))
            }
          />
        </div>
      ) : (
        <Analytics />
      )}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        place={selectedPlace}
      />

      <LoadingSpinner isLoading={isLoading} />
    </div>
  );
}

export default App;
