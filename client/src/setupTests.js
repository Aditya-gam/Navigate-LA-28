// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock leaflet
global.L = {
  Icon: {
    Default: {
      mergeOptions: jest.fn(),
    },
  },
  icon: jest.fn(() => ({
    options: {},
  })),
  divIcon: jest.fn(() => ({
    options: {},
  })),
  map: jest.fn(() => ({
    setView: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
    setLatLng: jest.fn(),
    remove: jest.fn(),
  })),
  popup: jest.fn(() => ({
    setLatLng: jest.fn(),
    setContent: jest.fn(),
    openOn: jest.fn(),
  })),
  polyline: jest.fn(() => ({
    addTo: jest.fn(),
    remove: jest.fn(),
  })),
};

// Mock Chart.js
jest.mock("chart.js", () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  BarElement: jest.fn(),
  LineElement: jest.fn(),
  PointElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn(),
}));

// Mock react-chartjs-2
jest.mock("react-chartjs-2", () => ({
  Bar: jest.fn(({ data, options }) => <div data-testid="bar-chart" />),
  Line: jest.fn(({ data, options }) => <div data-testid="line-chart" />),
  Pie: jest.fn(({ data, options }) => <div data-testid="pie-chart" />),
  Doughnut: jest.fn(({ data, options }) => (
    <div data-testid="doughnut-chart" />
  )),
}));

// Mock react-leaflet
jest.mock("react-leaflet", () => ({
  MapContainer: jest.fn(({ children, ...props }) => (
    <div data-testid="map-container" {...props}>
      {children}
    </div>
  )),
  TileLayer: jest.fn(() => <div data-testid="tile-layer" />),
  Marker: jest.fn(({ children, ...props }) => (
    <div data-testid="marker" {...props}>
      {children}
    </div>
  )),
  Popup: jest.fn(({ children, ...props }) => (
    <div data-testid="popup" {...props}>
      {children}
    </div>
  )),
  Polyline: jest.fn(() => <div data-testid="polyline" />),
  useMapEvents: jest.fn(() => null),
  useMap: jest.fn(() => ({
    setView: jest.fn(),
    getZoom: jest.fn(() => 13),
    getCenter: jest.fn(() => ({ lat: 34.0522, lng: -118.2437 })),
  })),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  fetch.mockClear();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});
