import React from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createNumberedStopIcon } from '../../utils/mapIcons';

const PopularStopsAnalytics = ({ data, isLoading, error }) => {
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data || !Array.isArray(data)) {
    return <div>No popular stops data available</div>;
  }

  return (
    <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
      <MapContainer
        center={[34.0522, -118.2437]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {data.map((stop, index) => (
          <Marker
            key={`${stop.line}-${stop.stop_name}`}
            position={[stop.latitude, stop.longitude]}
            icon={createNumberedStopIcon(index + 1)}
          >
            <Popup>
              <div style={{
                padding: '8px',
                minWidth: '200px',
              }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: '#1a73e8',
                  fontSize: '16px',
                  borderBottom: '1px solid #eee',
                  paddingBottom: '8px',
                }}>
                  {index + 1}. {stop.stop_name}
                </h3>
                <div style={{
                  fontSize: '13px',
                  color: '#5f6368',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  <div>🚌 Line: {stop.line}</div>
                  <div>👥 Users: {stop.unique_users}</div>
                  <div>📊 Usage Count: {stop.usage_count}</div>
                  <div style={{ fontSize: '12px', color: '#80868b', marginTop: '4px' }}>
                    📍 {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

PopularStopsAnalytics.propTypes = {
  data: PropTypes.array,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default PopularStopsAnalytics; 