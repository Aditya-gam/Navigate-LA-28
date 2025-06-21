import React, { useState, useEffect, useRef } from 'react';
import '../../constants/chartConfig'; // Import chart configuration
import useAnalyticsData from '../../hooks/useAnalyticsData';
import AnalyticsTabBar from './AnalyticsTabBar';
import AttractionsAnalytics from './AttractionsAnalytics';
import DemographicsAnalytics from './DemographicsAnalytics';
import BusRoutesAnalytics from './BusRoutesAnalytics';
import PopularStopsAnalytics from './PopularStopsAnalytics';

const Analytics = () => {
  const [activeSubTab, setActiveSubTab] = useState('attractions');
  const { data, isLoading, error } = useAnalyticsData(activeSubTab);
  const chartRef = useRef(null);

  useEffect(() => {
    // Cleanup chart instance when component unmounts or tab changes
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [activeSubTab]);

  const renderContent = () => {
    const currentData = data[activeSubTab];

    switch (activeSubTab) {
      case 'attractions':
        return (
          <AttractionsAnalytics 
            data={currentData} 
            isLoading={isLoading} 
            error={error} 
          />
        );

      case 'demographics':
        return (
          <DemographicsAnalytics 
            data={currentData} 
            isLoading={isLoading} 
            error={error} 
          />
        );

      case 'bus-routes':
        return (
          <BusRoutesAnalytics 
            data={currentData} 
            isLoading={isLoading} 
            error={error} 
          />
        );

      case 'popular-stops':
        return (
          <PopularStopsAnalytics 
            data={data['popular-stops']} 
            isLoading={isLoading} 
            error={error} 
          />
        );

      default:
        return <div>Select a tab to view analytics</div>;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <AnalyticsTabBar 
        activeSubTab={activeSubTab} 
        setActiveSubTab={setActiveSubTab} 
      />
      {renderContent()}
    </div>
  );
};

export default Analytics; 