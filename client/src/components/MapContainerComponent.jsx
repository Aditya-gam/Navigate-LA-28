import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { redIcon, greenIcon, busIcon } from '../utils/leafletIcons';
import LocationMarker from './LocationMarker';
import '../styles/MapContainerComponent.css';

const MapContainerComponent = ({
  onLocationSelect,
  resultMarkers,
  searchResults,
  searchType,
  busRoute,
  onMarkerClick,
  onWriteReview,
}) => {
  return (
    <MapContainer
      center={[34.0522, -118.2437]}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      <LocationMarker onLocationSelect={onLocationSelect} />
      
      {resultMarkers.map((marker, index) => (
        <Marker
          key={`${marker.position[0]}-${marker.position[1]}`}
          position={marker.position}
          icon={searchType === 'nearest_restrooms' ? greenIcon : redIcon}
          eventHandlers={{
            click: () => {
              onMarkerClick(marker.position[0], marker.position[1]);
            },
          }}
        >
          <Popup>
            <div className="popup-content">
              <h3 className="popup-title">{marker.name}</h3>

              {searchResults[index]?.description && (
                <p className="popup-description">{searchResults[index].description}</p>
              )}

              {busRoute && (
                <div className="bus-route-info">
                  <div className="route-header">
                    <span className="route-number">
                      Route {busRoute.route_number}
                    </span>
                    <span className="route-name">
                      {busRoute.route_name}
                    </span>
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
                {searchResults[index]?.address && (
                  <p className="address-info">
                    📍 {searchResults[index].address}
                    ({searchResults[index]?.distance?.toFixed(2) || 'N/A'} miles)
                  </p>
                )}

                {searchResults[index]?.types && (
                  <p className="types-info">
                    🏷️ {searchResults[index].types}
                  </p>
                )}

                {searchResults[index] && (
                  <p className="coordinates">
                    📌 {searchResults[index].latitude.toFixed(6)}, {searchResults[index].longitude.toFixed(6)}
                  </p>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onWriteReview(searchResults[index]);
                  }}
                  className="review-button"
                >
                  <span>⭐</span>{' '}Write Review
                </button>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {busRoute?.geometry && (
        <>
          <Marker
            position={[busRoute.origin.coordinates[1], busRoute.origin.coordinates[0]]}
            icon={busIcon}
          >
            <Popup>
              <div className="popup-content">
                <h3 className="popup-title">Starting Bus Stop</h3>
                <p>🚌 Line: {busRoute.route_number}</p>
                <p>Name: {busRoute.origin.name}</p>
                <p className="distance">📍 Distance: {busRoute.origin.distance.toFixed(2)} miles</p>
              </div>
            </Popup>
          </Marker>

          <Marker
            position={[busRoute.destination.coordinates[1], busRoute.destination.coordinates[0]]}
            icon={busIcon}
          >
            <Popup>
              <div className="popup-content">
                <h3 className="popup-title">Destination Bus Stop</h3>
                <p>🚌 Line: {busRoute.route_number}</p>
                <p>Name: {busRoute.destination.name}</p>
                <p className="distance">📍 Distance: {busRoute.destination.distance.toFixed(2)} miles</p>
              </div>
            </Popup>
          </Marker>

          <Polyline
            pathOptions={{ color: '#000000', weight: 5, opacity: 1 }}
            positions={busRoute.geometry.map(([lng, lat]) => [lat, lng])}
          />
        </>
      )}
    </MapContainer>
  );
};

MapContainerComponent.propTypes = {
  onLocationSelect: PropTypes.func.isRequired,
  resultMarkers: PropTypes.arrayOf(PropTypes.shape({
    position: PropTypes.arrayOf(PropTypes.number).isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  searchResults: PropTypes.array.isRequired,
  searchType: PropTypes.string.isRequired,
  busRoute: PropTypes.object,
  onMarkerClick: PropTypes.func.isRequired,
  onWriteReview: PropTypes.func.isRequired,
};

export default MapContainerComponent;
