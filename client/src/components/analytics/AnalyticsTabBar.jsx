import React from 'react';

const AnalyticsTabBar = ({ activeSubTab, setActiveSubTab }) => {
  const tabs = [
    { key: 'attractions', label: 'Top Attractions' },
    { key: 'demographics', label: 'Demographics' },
    { key: 'bus-routes', label: 'Bus Routes' },
    { key: 'popular-stops', label: 'Popular Stops' }
  ];

  return (
    <div style={{
      display: 'flex',
      gap: '10px',
      marginBottom: '20px'
    }}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveSubTab(tab.key)}
          style={{
            padding: '8px 16px',
            backgroundColor: activeSubTab === tab.key ? '#1a73e8' : '#fff',
            color: activeSubTab === tab.key ? '#fff' : '#1a73e8',
            border: '1px solid #1a73e8',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default AnalyticsTabBar; 