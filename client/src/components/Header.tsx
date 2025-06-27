import React from "react";
import type { HeaderProps } from "@/types";

const Header: React.FC<HeaderProps> = ({
  username,
  onLoginToggle,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  searchType,
  setSearchType,
  handleSearch,
}) => (
  <header className="header">
    <div className="header-title">
      <h1>Navigate LA 28</h1>
    </div>

    <div className="tab-buttons">
      <button
        className={`tab-button ${activeTab === "map" ? "active" : ""}`}
        onClick={() => setActiveTab("map")}
      >
        Map
      </button>
      <button
        className={`tab-button ${activeTab === "analytics" ? "active" : ""}`}
        onClick={() => setActiveTab("analytics")}
      >
        Analytics
      </button>
    </div>

    <div className="search-container">
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
    </div>

    <div className="header-actions">
      {username ? <span className="username">Welcome, {username}</span> : null}
      <button onClick={onLoginToggle} className="auth-button">
        {username ? "Logout" : "Login"}
      </button>
    </div>
  </header>
);

export default Header;
