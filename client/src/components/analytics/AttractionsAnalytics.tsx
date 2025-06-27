import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { createNumberedIcon } from '../../utils/leafletIcons';
import type { Place } from '@/types';

interface AttractionsAnalyticsProps {
  data?: Place[] | null;
  isLoading?: boolean;
  error?: string | null;
}

const AttractionsAnalytics: React.FC<AttractionsAnalyticsProps> = ({ 
  data, 
  isLoading, 
  error 
}) => {
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data || !Array.isArray(data)) {
    return <div>No attraction data available</div>;
  }

  return (
    <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
      <MapContainer
        center={[34.0522, -118.2437]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {data.map((place, index) => {
          if (!place || typeof place.latitude !== 'number' || typeof place.longitude !== 'number') {
            return null;
          }

          return (
            <Marker
              key={place.place_id ?? index}
              position={[place.latitude, place.longitude]}
              icon={createNumberedIcon(index + 1)}
            >
              <Popup>
                <div style={{
                  padding: '8px',
                  minWidth: '200px',
                  maxWidth: '300px',
                }}>
                  <h3 style={{
                    margin: '0 0 8px 0',
                    color: '#1a73e8',
                    fontSize: '16px',
                    borderBottom: '1px solid #eee',
                    paddingBottom: '8px',
                  }}>
                    {index + 1}. {place.name || 'Unnamed Location'}
                  </h3>
                  <div style={{
                    fontSize: '13px',
                    color: '#5f6368',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                    <div>⭐ Rating: {place.rating?.toFixed(2) ?? 'N/A'}/5</div>
                    <div>📊 Reviews: {place.reviews_count ?? 0}</div>
                    <div>🏆 High Ratings: {place.rating && place.rating >= 4 ? 'Yes' : 'No'}</div>
                    {place.types && <div>🏷️ Category: {place.types}</div>}
                    <div style={{ fontSize: '12px', color: '#80868b', marginTop: '4px' }}>
                      📍 {place.latitude?.toFixed(6)}, {place.longitude?.toFixed(6)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default AttractionsAnalytics; 