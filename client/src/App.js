import React, { useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';
import './constants/chartConfig'; // Import chart configuration
import './utils/leafletIcons'; // Import leaflet icon configuration

// Import components
import Header from './components/Header';
import MapContainerComponent from './components/MapContainerComponent';
import ResultsPanel from './components/ResultsPanel';
import LoginModal from './components/LoginModal';
import ReviewModal from './components/ReviewModal';
import Analytics from './components/Analytics';
import LoadingSpinner from './components/LoadingSpinner';

// Import services
import { 
  searchNearestPlaces, 
  searchNearestRestrooms, 
  fetchDirectBusRoutes, 
  fetchAttractionPlan 
} from './services/mapService';

function App() {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("nearest_places");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [resultMarkers, setResultMarkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [busRoute, setBusRoute] = useState(null);
  const [attractionPlan, setAttractionPlan] = useState(null);
  const [activeTab, setActiveTab] = useState('map');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  // Check for existing auth token on component mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      // You might want to validate the token here
      // For now, we'll assume it's valid
      setUsername('User'); // You could decode the token to get the actual username
    }
  }, []);

  const handleLocationSelect = (coords) => {
    setSelectedLocation(coords);
    const [lat, lng] = coords;
    setSearchQuery(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setBusRoute(null);

    if (searchType === "attraction_plan") {
      handleAttractionPlan(coords);
    } else {
      if (searchResults.length === 0) {
        setSearchType("nearest_places");
        handleSearch(coords, "nearest_places");
      } else {
        handleSearch(coords, searchType);
      }
    }
  };

  const handleLoginSuccess = (loggedInUsername) => {
    setIsLoginOpen(false);
    setUsername(loggedInUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUsername(null);
  };

  const handleSearch = async (location = selectedLocation, type = searchType) => {
    if (!location) {
      alert("Please select a location on the map first");
      return;
    }

    setIsLoading(true);
    setResultMarkers([]);
    setSearchResults([]);
    setBusRoute(null);

    try {
      const [lat, lng] = location;
      const token = localStorage.getItem('access_token');
      
      let data;
      if (type === "nearest_places") {
        data = await searchNearestPlaces(lat, lng, token);
      } else if (type === "nearest_restrooms") {
        data = await searchNearestRestrooms(lat, lng, token);
      }

      setSearchResults(data);

      const markers = data.map(result => ({
        position: [result.latitude, result.longitude],
        name: result.name || 'Unnamed Location'
      }));
      setResultMarkers(markers);
    } catch (error) {
      console.error('Error details:', error);
      alert(`Failed to fetch ${type.replace('_', ' ')}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttractionPlan = async (coords) => {
    if (!coords) return;

    setIsLoading(true);
    try {
      const [lat, lng] = coords;
      const token = localStorage.getItem('access_token');
      
      const data = await fetchAttractionPlan(lat, lng, 5, token);
      setAttractionPlan(data);

      const planMarkers = data.itinerary.map(item => ({
        position: [item.place.latitude, item.place.longitude],
        name: item.place.name
      }));
      setResultMarkers(planMarkers);

    } catch (error) {
      console.error('Error fetching attraction plan:', error);
      alert('Failed to fetch attraction plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerClick = async (targetLat, targetLon) => {
    if (!selectedLocation) return;

    try {
      const token = localStorage.getItem('access_token');
      const responseData = await fetchDirectBusRoutes(
        selectedLocation[0], 
        selectedLocation[1], 
        targetLat, 
        targetLon, 
        token
      );

      if (responseData.status === "success" && responseData.data) {
        setBusRoute(responseData.data);
      } else {
        alert("No direct bus routes found between these locations");
        setBusRoute(null);
      }

    } catch (error) {
      console.error('Error fetching bus stops:', error);
      alert(error.message || 'Failed to fetch bus route information');
      setBusRoute(null);
    }
  };

  const handleWriteReview = (place) => {
    setSelectedPlace(place);
    setIsReviewModalOpen(true);
  };

  const handleSearchTypeChange = (newType) => {
    setSearchType(newType);
    setResultMarkers([]);
    setSearchResults([]);
    setAttractionPlan(null);
    
    if (selectedLocation) {
      if (newType === "attraction_plan") {
        handleAttractionPlan(selectedLocation);
      } else {
        handleSearch(selectedLocation, newType);
      }
    }
  };

  return (
    <div style={{
      fontFamily: "Roboto, Arial, sans-serif",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f8f9fa"
    }}>
      <Header
        username={username}
        onLoginToggle={() => {
          if (username) {
            handleLogout();
          } else {
            setIsLoginOpen(true);
          }
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchType={searchType}
        setSearchType={handleSearchTypeChange}
        handleSearch={handleSearch}
        selectedLocation={selectedLocation}
      />

      {activeTab === 'map' ? (
        <div style={{ flex: 1, display: "flex", gap: "20px", padding: "20px" }}>
          <div style={{
            flex: searchResults.length && isPanelVisible ? "1 1 70%" : "1 1 100%",
            transition: "flex 0.3s ease"
          }}>
            <MapContainerComponent
              selectedLocation={selectedLocation}
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
            setIsPanelVisible={setIsPanelVisible}
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