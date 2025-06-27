import React from 'react';
import PropTypes from 'prop-types';
import '../styles/SearchBar.css'; // Importing the CSS file

const SearchBar = ({
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
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Click on map or search in LA..."
      className="search-input"
    />
    <select
      value={searchType}
      onChange={(e) => setSearchType(e.target.value)}
      className="search-select"
    >
      <option value="nearest_places">Nearest Places</option>
      <option value="nearest_restrooms">Nearest Restrooms</option>
      <option value="olympic_venues">Olympic Venues</option>
      <option value="attraction_plan">Attraction Plan</option>
    </select>
    <button 
      onClick={handleSearch}
      className="search-button"
    >
      Search
    </button>
    {selectedLocation && (
      <div className="location-display">
        Selected: {selectedLocation[0].toFixed(6)}, {selectedLocation[1].toFixed(6)}
      </div>
    )}
  </div>
);

SearchBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  searchType: PropTypes.string.isRequired,
  setSearchType: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  selectedLocation: PropTypes.arrayOf(PropTypes.number),
};

export default SearchBar;
