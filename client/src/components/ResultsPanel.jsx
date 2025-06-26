import React from 'react';
import PropTypes from 'prop-types';

const ResultsPanel = ({ 
  searchResults, 
  searchType,
  attractionPlan,
  isPanelVisible, 
  setIsPanelVisible, 
}) => {
  if ((searchResults.length === 0 && !(searchType === 'attraction_plan' && attractionPlan))) {
    return null;
  }

  return (
    <div style={{
      flex: isPanelVisible ? '1 1 30%' : '0 0 auto',
      backgroundColor: 'white',
      padding: isPanelVisible ? '15px' : '8px',
      borderRadius: '8px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
      maxHeight: 'calc(100vh - 140px)',
      overflowY: 'auto',
      alignSelf: 'flex-start',
      transition: 'all 0.3s ease',
      width: isPanelVisible ? 'auto' : '40px',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: isPanelVisible ? 'space-between' : 'center',
        alignItems: 'center',
        marginBottom: isPanelVisible ? '15px' : '0',
        borderBottom: isPanelVisible ? '1px solid #eee' : 'none',
        paddingBottom: isPanelVisible ? '10px' : '0',
      }}>
        {isPanelVisible && (
          <h3 style={{
            margin: '0',
            color: '#1a73e8',
            fontSize: '18px',
            fontWeight: '500',
          }}>
            {searchType === 'attraction_plan' ? 'Attraction Plan' : 'Search Results'}
          </h3>
        )}
        <button
          onClick={() => setIsPanelVisible(!isPanelVisible)}
          style={{
            backgroundColor: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            outline: 'none',
            padding: 0,
            transform: isPanelVisible ? 'rotate(0deg)' : 'rotate(180deg)',
          }}
        >
          ›
        </button>
      </div>

      {isPanelVisible && (
        <>
          {searchType === 'attraction_plan' && attractionPlan ? (
            <>
              <div style={{ marginBottom: '12px', color: '#5f6368', fontSize: '14px' }}>
                Total Duration: {(() => {
                  if (!attractionPlan.total_duration || typeof attractionPlan.total_duration !== 'string') return 'N/A';
                  const hoursPart = attractionPlan.total_duration.split(' ')[0];
                  const hours = parseFloat(hoursPart);
                  if (isNaN(hours)) return 'N/A';
                  const fullHours = Math.floor(hours);
                  const minutes = Math.round((hours - fullHours) * 60);
                  return `${fullHours}h ${minutes}m`;
                })()}
              </div>
              {attractionPlan.itinerary.map((item, index) => (
                <div key={`${item.place.name}-${index}`} style={{
                  padding: '12px',
                  borderBottom: '1px solid #eee',
                  fontSize: '14px',
                  backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                  borderRadius: '4px',
                  marginBottom: '8px',
                }}>
                  <div style={{
                    fontWeight: '500',
                    color: '#1a73e8',
                    marginBottom: '4px',
                  }}>
                    {index + 1}. {item.place.name}
                  </div>
                  <div style={{
                    color: '#5f6368',
                    fontSize: '13px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}>
                    <div>⏰ {item.start_time || 'N/A'} - {item.end_time || 'N/A'}</div>
                    <div>⌛ Duration: {(() => {
                      if (!item.suggested_duration || typeof item.suggested_duration !== 'string') return 'N/A';
                      const hoursPart = item.suggested_duration.split(' ')[0];
                      const hours = parseFloat(hoursPart);
                      if (isNaN(hours)) return 'N/A';
                      const fullHours = Math.floor(hours);
                      const minutes = Math.round((hours - fullHours) * 60);
                      
                      if (fullHours > 0) {
                        return minutes > 0 ? `${fullHours}h ${minutes}m` : `${fullHours}h`;
                      }
                      return `${minutes}m`;
                    })()}</div>
                    <div>📍 Distance: {item.place.distance_from_start?.toFixed(2) || 'N/A'} miles</div>
                    {item.place.address && <div>🏠 {item.place.address}</div>}
                    {item.place.description && <div>ℹ️ {item.place.description}</div>}
                  </div>
                </div>
              ))}
            </>
          ) : (
            // Regular search results display
            searchResults.map((result, index) => (
              <div key={`${result.name || 'unnamed'}-${index}`} style={{
                padding: '12px',
                borderBottom: '1px solid #eee',
                fontSize: '14px',
                backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white',
                borderRadius: '4px',
                marginBottom: '8px',
              }}>
                <div style={{
                  fontWeight: '500',
                  color: '#1a73e8',
                  marginBottom: '4px',
                }}>
                  {result.name || 'Unnamed Location'}
                </div>
                <div style={{
                  color: '#5f6368',
                  fontSize: '13px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  <div>📍 Distance: {result.distance?.toFixed(2) || 'N/A'} miles</div>
                  {result.address && <div>🏠 Address: {result.address}</div>}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
};

ResultsPanel.propTypes = {
  searchResults: PropTypes.array.isRequired,
  searchType: PropTypes.string.isRequired,
  attractionPlan: PropTypes.object,
  isPanelVisible: PropTypes.bool.isRequired,
  setIsPanelVisible: PropTypes.func.isRequired,
};

export default ResultsPanel; 