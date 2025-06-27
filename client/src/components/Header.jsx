import React from "react";
import PropTypes from "prop-types";
import "../styles/Header.css";
import SearchBar from "./SearchBar";

const Header = ({
  username,
  onLoginToggle,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  handleSearch,
  selectedLocation,
}) => (
  <div className="header">
    <h1 className="header-title">Navigate LA</h1>

    <div className="tab-buttons">
      <button
        onClick={() => setActiveTab("map")}
        className={`tab-button ${activeTab === "map" ? "active" : ""}`}
      >
        Map
      </button>
      <button
        onClick={() => setActiveTab("analytics")}
        className={`tab-button ${activeTab === "analytics" ? "active" : ""}`}
      >
        Analytics
      </button>
    </div>

    <div className="search-container">
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchType={searchType}
        setSearchType={setSearchType}
        handleSearch={handleSearch}
        selectedLocation={selectedLocation}
      />
    </div>

    <div className="header-actions">
      {username && <span className="username">{username}</span>}
      <button onClick={onLoginToggle} className="auth-button">
        {username ? "👤" : "🔑"}
      </button>
    </div>
  </div>
);

Header.propTypes = {
  username: PropTypes.string,
  onLoginToggle: PropTypes.func.isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  searchType: PropTypes.string.isRequired,
  setSearchType: PropTypes.func.isRequired,
  handleSearch: PropTypes.func.isRequired,
  selectedLocation: PropTypes.arrayOf(PropTypes.number),
};

export default Header;
