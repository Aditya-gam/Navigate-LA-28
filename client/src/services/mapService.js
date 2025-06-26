// src/services/mapService.js
import axios from '../utils/api';
import { LOCATION_ENDPOINTS } from '../constants/apiEndpoints';

/**
 * Fetch location data based on query.
 * @param {String} query - Location search query.
 * @returns {Promise} Response from server.
 */
export const fetchLocations = async (query) => {
  const response = await axios.get(`${LOCATION_ENDPOINTS.SEARCH}?q=${query}`);
  return response.data;
};

/**
 * Search for nearest places
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} token - Optional access token
 * @returns {Promise} Response with nearest places
 */
export const searchNearestPlaces = async (lat, lng, token = null) => {
  const url = new URL('http://localhost:8001/api/geo/nearest_places/');
  url.searchParams.append('lat', lat);
  url.searchParams.append('long', lng);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Search for nearest restrooms
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {string} token - Optional access token
 * @returns {Promise} Response with nearest restrooms
 */
export const searchNearestRestrooms = async (lat, lng, token = null) => {
  const url = new URL('http://localhost:8001/api/geo/nearest_restrooms/');
  url.searchParams.append('lat', lat);
  url.searchParams.append('long', lng);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Fetch direct bus routes between two locations
 * @param {number} lat1 - Origin latitude
 * @param {number} lng1 - Origin longitude
 * @param {number} lat2 - Destination latitude
 * @param {number} lng2 - Destination longitude
 * @param {string} token - Optional access token
 * @returns {Promise} Response with bus route data
 */
export const fetchDirectBusRoutes = async (lat1, lng1, lat2, lng2, token = null) => {
  const url = new URL('http://localhost:8001/api/geo/direct_bus_routes/');
  url.searchParams.append('lat1', lat1);
  url.searchParams.append('long1', lng1);
  url.searchParams.append('lat2', lat2);
  url.searchParams.append('long2', lng2);
  url.searchParams.append('buffer_radius', '0.5');

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Fetch attraction plan for a location
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} maxPlaces - Maximum number of places to include
 * @param {string} token - Optional access token
 * @returns {Promise} Response with attraction plan
 */
export const fetchAttractionPlan = async (lat, lng, maxPlaces = 5, token = null) => {
  const url = new URL('http://localhost:8001/api/geo/attraction_plan/');
  url.searchParams.append('lat', lat);
  url.searchParams.append('long', lng);
  url.searchParams.append('max_places', maxPlaces);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
