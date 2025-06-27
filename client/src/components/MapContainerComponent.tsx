import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  redIcon,
  greenIcon,
  busIcon,
  createOlympicVenueIcon,
  createColorIcon,
} from "../utils/leafletIcons";
import LocationMarker from "./LocationMarker";
import "../styles/MapContainerComponent.css";
import type { MapContainerProps, Marker as MarkerType } from "@/types";

const MapContainerComponent: React.FC<MapContainerProps> = ({
  onLocationSelect,
  resultMarkers,
  searchResults,
  searchType,
  busRoute,
  onMarkerClick,
  onWriteReview,
}) => {
  // Function to get appropriate icon based on search type and marker data
  const getMarkerIcon = (_marker: MarkerType, searchType: string) => {
    if (searchType === "olympic_venues") {
      return createOlympicVenueIcon();
    } else if (searchType === "nearest_restrooms") {
      return greenIcon;
    } else if (searchType === "attraction_plan") {
      return createColorIcon("blue");
    } else {
      return redIcon;
    }
  };

  return (
    <MapContainer
      center={[34.0522, -118.2437]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <LocationMarker onLocationSelect={onLocationSelect} />

      {resultMarkers.map((marker, index) => {
        const searchResult = searchResults[index];
        return (
          <Marker
            key={`${marker.position[0]}-${marker.position[1]}-${index}`}
            position={marker.position}
            icon={getMarkerIcon(marker, searchType)}
            eventHandlers={{
              click: () => {
                onMarkerClick(marker.position[0], marker.position[1]);
              },
            }}
          >
            <Popup>
              <div className="popup-content">
                <h3 className="popup-title">
                  {searchType === "olympic_venues" && "🏅 "}
                  {marker.name}
                </h3>

                {searchResult?.description && (
                  <p className="popup-description">
                    {searchResult.description}
                  </p>
                )}

                {/* Olympic venue specific information */}
                {searchType === "olympic_venues" && searchResult && (
                  <div className="olympic-venue-info">
                    {searchResult.sport && (
                      <p>
                        🏆 <strong>Sport:</strong> {searchResult.sport}
                      </p>
                    )}
                    {searchResult.capacity && (
                      <p>
                        👥 <strong>Capacity:</strong>{" "}
                        {searchResult.capacity.toLocaleString()}
                      </p>
                    )}
                    {searchResult.venue_type && (
                      <p>
                        🏟️ <strong>Type:</strong> {searchResult.venue_type}
                      </p>
                    )}
                    {searchResult.events && (
                      <p>
                        📅 <strong>Events:</strong> {searchResult.events}
                      </p>
                    )}
                  </div>
                )}

                {busRoute && (
                  <div className="bus-route-info">
                    <div className="route-header">
                      <span className="route-number">
                        Route {busRoute.route_number}
                      </span>
                      <span className="route-name">{busRoute.route_name}</span>
                    </div>

                    <div className="route-details">
                      <div className="route-type">
                        <span>🚌</span>
                        Type: {busRoute.route_type} ({busRoute.category})
                      </div>

                      <div className="stops-info">
                        <div className="stop-section">
                          <div className="stop-title">Origin Stop</div>
                          <div>Stop #{busRoute.origin.stop_number}</div>
                          <div>{busRoute.origin.name}</div>
                          <div className="distance">
                            {busRoute.origin.distance} miles away
                          </div>
                        </div>

                        <div className="stop-divider" />

                        <div className="stop-section">
                          <div className="stop-title">Destination Stop</div>
                          <div>Stop #{busRoute.destination.stop_number}</div>
                          <div>{busRoute.destination.name}</div>
                          <div className="distance">
                            {busRoute.destination.distance} miles away
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="location-info">
                  {searchResult?.address && (
                    <p className="address-info">
                      📍 {searchResult.address}(
                      {searchResult?.distance?.toFixed(2) ?? "N/A"} miles)
                    </p>
                  )}

                  {searchResult?.types && (
                    <p className="types-info">🏷️ {searchResult.types}</p>
                  )}

                  {searchResult && (
                    <p className="coordinates">
                      📌 {searchResult.latitude.toFixed(6)},{" "}
                      {searchResult.longitude.toFixed(6)}
                    </p>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (searchResult) {
                        onWriteReview(searchResult);
                      }
                    }}
                    className="review-button"
                  >
                    <span>⭐</span> Write Review
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {busRoute?.geometry && (
        <>
          <Marker
            position={[
              busRoute.origin.coordinates[1],
              busRoute.origin.coordinates[0],
            ]}
            icon={busIcon}
          >
            <Popup>
              <div className="popup-content">
                <h3 className="popup-title">Starting Bus Stop</h3>
                <p>🚌 Line: {busRoute.route_number}</p>
                <p>Name: {busRoute.origin.name}</p>
                <p className="distance">
                  📍 Distance: {busRoute.origin.distance.toFixed(2)} miles
                </p>
              </div>
            </Popup>
          </Marker>

          <Marker
            position={[
              busRoute.destination.coordinates[1],
              busRoute.destination.coordinates[0],
            ]}
            icon={busIcon}
          >
            <Popup>
              <div className="popup-content">
                <h3 className="popup-title">Destination Bus Stop</h3>
                <p>🚌 Line: {busRoute.route_number}</p>
                <p>Name: {busRoute.destination.name}</p>
                <p className="distance">
                  📍 Distance: {busRoute.destination.distance.toFixed(2)} miles
                </p>
              </div>
            </Popup>
          </Marker>

          <Polyline
            positions={busRoute.geometry.map((coord) => [coord[1], coord[0]])}
            color="#1a73e8"
            weight={4}
            opacity={0.8}
          />
        </>
      )}
    </MapContainer>
  );
};

export default MapContainerComponent;
