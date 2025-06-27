import React from "react";
import type { SearchBarProps } from "@/types";

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  handleSearch,
  selectedLocation,
}) => (
  <div className="search-bar">
    <input
      type="text"
      placeholder="Search for places..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="search-input"
    />
    <select
      value={searchType}
      onChange={(e) => setSearchType(e.target.value as any)}
      className="search-select"
    >
      <option value="nearest_places">Nearest Places</option>
      <option value="nearest_restrooms">Nearest Restrooms</option>
      <option value="olympic_venues">Olympic Venues</option>
      <option value="attraction_plan">Attraction Plan</option>
    </select>
    <button onClick={handleSearch} className="search-button">
      Search
    </button>
    {selectedLocation && (
      <div className="location-display">
        Selected: {selectedLocation[0].toFixed(4)},{" "}
        {selectedLocation[1].toFixed(4)}
      </div>
    )}
  </div>
);

export default SearchBar;
