import L from "leaflet";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Common icon configurations
const ICON_CONFIG = {
  size: [25, 41] as [number, number],
  anchor: [12, 41] as [number, number],
  popupAnchor: [1, -34] as [number, number],
  shadowSize: [41, 41] as [number, number],
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
};

const NUMBERED_ICON_CONFIG = {
  size: [24, 24] as [number, number],
  anchor: [12, 12] as [number, number],
  popupAnchor: [0, -12] as [number, number],
};

// Color-coded marker icons
export const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: ICON_CONFIG.shadowUrl,
  iconSize: ICON_CONFIG.size,
  iconAnchor: ICON_CONFIG.anchor,
  popupAnchor: ICON_CONFIG.popupAnchor,
  shadowSize: ICON_CONFIG.shadowSize,
});

export const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: ICON_CONFIG.shadowUrl,
  iconSize: ICON_CONFIG.size,
  iconAnchor: ICON_CONFIG.anchor,
  popupAnchor: ICON_CONFIG.popupAnchor,
  shadowSize: ICON_CONFIG.shadowSize,
});

export const blueIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: ICON_CONFIG.shadowUrl,
  iconSize: ICON_CONFIG.size,
  iconAnchor: ICON_CONFIG.anchor,
  popupAnchor: ICON_CONFIG.popupAnchor,
  shadowSize: ICON_CONFIG.shadowSize,
});

export const yellowIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
  shadowUrl: ICON_CONFIG.shadowUrl,
  iconSize: ICON_CONFIG.size,
  iconAnchor: ICON_CONFIG.anchor,
  popupAnchor: ICON_CONFIG.popupAnchor,
  shadowSize: ICON_CONFIG.shadowSize,
});

export const orangeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: ICON_CONFIG.shadowUrl,
  iconSize: ICON_CONFIG.size,
  iconAnchor: ICON_CONFIG.anchor,
  popupAnchor: ICON_CONFIG.popupAnchor,
  shadowSize: ICON_CONFIG.shadowSize,
});

export const purpleIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: ICON_CONFIG.shadowUrl,
  iconSize: ICON_CONFIG.size,
  iconAnchor: ICON_CONFIG.anchor,
  popupAnchor: ICON_CONFIG.popupAnchor,
  shadowSize: ICON_CONFIG.shadowSize,
});

// Alias for backward compatibility
export const busIcon = yellowIcon;

type ColorType = 'red' | 'green' | 'blue' | 'yellow' | 'orange' | 'purple' | 'bus';

// Icon factory function
export const createColorIcon = (color: ColorType): L.Icon => {
  const iconMap: Record<ColorType, L.Icon> = {
    red: redIcon,
    green: greenIcon,
    blue: blueIcon,
    yellow: yellowIcon,
    orange: orangeIcon,
    purple: purpleIcon,
    bus: busIcon,
  };

  return iconMap[color] || blueIcon;
};

// Numbered icon factory functions
export const createNumberedIcon = (number: number, backgroundColor: string = "#1a73e8"): L.DivIcon => {
  return L.divIcon({
    className: "custom-numbered-icon",
    html: `<div style="
      background-color: ${backgroundColor};
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: NUMBERED_ICON_CONFIG.size,
    iconAnchor: NUMBERED_ICON_CONFIG.anchor,
    popupAnchor: NUMBERED_ICON_CONFIG.popupAnchor,
  });
};

export const createNumberedStopIcon = (number: number, backgroundColor: string = "#FFA500"): L.DivIcon => {
  return L.divIcon({
    className: "custom-numbered-stop",
    html: `<div style="
      background-color: ${backgroundColor};
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: NUMBERED_ICON_CONFIG.size,
    iconAnchor: NUMBERED_ICON_CONFIG.anchor,
    popupAnchor: NUMBERED_ICON_CONFIG.popupAnchor,
  });
};

// Olympic venue icon
export const createOlympicVenueIcon = (): L.DivIcon => {
  return L.divIcon({
    className: "olympic-venue-icon",
    html: `<div style="
      background-color: #FFD700;
      color: #000;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      border: 3px solid #FFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    ">🏅</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// User location icon
export const createUserLocationIcon = (): L.DivIcon => {
  return L.divIcon({
    className: "user-location-icon",
    html: `<div style="
      background-color: #4285F4;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -9],
  });
}; 