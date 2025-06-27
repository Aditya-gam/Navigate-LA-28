import React from 'react';
import { useMap } from 'react-leaflet';

interface LocationMarkerProps {
  onLocationSelect: (coords: [number, number]) => void;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ onLocationSelect }) => {
  const map = useMap();

  React.useEffect(() => {
    const handleClick = (e: any) => {
      const { lat, lng } = e.latlng;
      onLocationSelect([lat, lng]);
    };

    map.on('click', handleClick);

    return () => {
      map.off('click', handleClick);
    };
  }, [map, onLocationSelect]);

  return null;
};

export default LocationMarker; 