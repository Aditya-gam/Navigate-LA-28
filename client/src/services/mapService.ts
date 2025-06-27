import axios from "../utils/api";
import { LOCATION_ENDPOINTS } from "../constants/apiEndpoints";
import type { Place, AttractionPlan, BusRoute, APIResponse } from "@/types";

/**
 * Fetch location data based on query.
 * @param query - Location search query.
 * @returns Response from server.
 */
export const fetchLocations = async (query: string): Promise<APIResponse> => {
  const response = await axios.get(`${LOCATION_ENDPOINTS.SEARCH}?q=${query}`);
  return response.data;
};

/**
 * Search for nearest places
 * @param lat - Latitude
 * @param lng - Longitude
 * @param token - Optional access token
 * @returns Response with nearest places
 */
export const searchNearestPlaces = async (
  lat: number,
  lng: number,
  token?: string,
): Promise<Place[]> => {
  const url = new URL("http://localhost:8001/api/geo/nearest_places/");
  url.searchParams.append("lat", lat.toString());
  url.searchParams.append("long", lng.toString());

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Search for nearest restrooms
 * @param lat - Latitude
 * @param lng - Longitude
 * @param token - Optional access token
 * @returns Response with nearest restrooms
 */
export const searchNearestRestrooms = async (
  lat: number,
  lng: number,
  token?: string,
): Promise<Place[]> => {
  const url = new URL("http://localhost:8001/api/geo/nearest_restrooms/");
  url.searchParams.append("lat", lat.toString());
  url.searchParams.append("long", lng.toString());

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Search for Olympic venues
 * @param lat - Latitude
 * @param lng - Longitude
 * @param token - Optional access token
 * @returns Response with Olympic venues
 */
export const searchOlympicVenues = async (
  lat: number,
  lng: number,
  token?: string,
): Promise<Place[]> => {
  const url = new URL("http://localhost:8001/api/olympic_venues/");
  url.searchParams.append("lat", lat.toString());
  url.searchParams.append("lng", lng.toString());

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Get all Olympic venues
 * @param token - Optional access token
 * @returns Response with all Olympic venues
 */
export const fetchAllOlympicVenues = async (
  token?: string,
): Promise<Place[]> => {
  const url = new URL("http://localhost:8001/api/olympic_venues/all/");

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Get Olympic venue details by ID
 * @param venueId - Olympic venue ID
 * @param token - Optional access token
 * @returns Response with venue details
 */
export const fetchOlympicVenueDetails = async (
  venueId: string,
  token?: string,
): Promise<Place> => {
  const url = new URL(`http://localhost:8001/api/olympic_venues/${venueId}/`);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Fetch direct bus routes between two locations
 * @param lat1 - Origin latitude
 * @param lng1 - Origin longitude
 * @param lat2 - Destination latitude
 * @param lng2 - Destination longitude
 * @param token - Optional access token
 * @returns Response with bus route data
 */
export const fetchDirectBusRoutes = async (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  token?: string,
): Promise<APIResponse<BusRoute>> => {
  const url = new URL("http://localhost:8001/api/geo/direct_bus_routes/");
  url.searchParams.append("lat1", lat1.toString());
  url.searchParams.append("long1", lng1.toString());
  url.searchParams.append("lat2", lat2.toString());
  url.searchParams.append("long2", lng2.toString());
  url.searchParams.append("buffer_radius", "0.5");

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.message ?? `HTTP error! status: ${response.status}`,
    );
  }

  return await response.json();
};

/**
 * Fetch attraction plan for a location
 * @param lat - Latitude
 * @param lng - Longitude
 * @param maxPlaces - Maximum number of places to include
 * @param token - Optional access token
 * @returns Response with attraction plan
 */
export const fetchAttractionPlan = async (
  lat: number,
  lng: number,
  maxPlaces: number = 5,
  token?: string,
): Promise<AttractionPlan> => {
  const url = new URL("http://localhost:8001/api/geo/attraction_plan/");
  url.searchParams.append("lat", lat.toString());
  url.searchParams.append("long", lng.toString());
  url.searchParams.append("max_places", maxPlaces.toString());

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Geocoding service - convert address to coordinates
 * @param address - Address to geocode
 * @param token - Optional access token
 * @returns Response with coordinates
 */
export const geocodeAddress = async (
  address: string,
  token?: string,
): Promise<APIResponse> => {
  const url = new URL("http://localhost:8001/api/geo/geocode/");
  url.searchParams.append("address", address);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

/**
 * Reverse geocoding service - convert coordinates to address
 * @param lat - Latitude
 * @param lng - Longitude
 * @param token - Optional access token
 * @returns Response with address
 */
export const reverseGeocode = async (
  lat: number,
  lng: number,
  token?: string,
): Promise<APIResponse> => {
  const url = new URL("http://localhost:8001/api/geo/reverse-geocode/");
  url.searchParams.append("lat", lat.toString());
  url.searchParams.append("lng", lng.toString());

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};
