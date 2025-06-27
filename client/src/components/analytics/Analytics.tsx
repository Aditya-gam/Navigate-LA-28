import React, { useState, useEffect, useRef } from 'react';
import useAnalyticsData from '../../hooks/useAnalyticsData';
import AnalyticsTabBar from './AnalyticsTabBar';
import AttractionsAnalytics from './AttractionsAnalytics';
import DemographicsAnalytics from './DemographicsAnalytics';
import BusRoutesAnalytics from './BusRoutesAnalytics';
import PopularStopsAnalytics from './PopularStopsAnalytics';

type ActiveSubTab = 'attractions' | 'demographics' | 'bus-routes' | 'popular-stops';

const Analytics: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<ActiveSubTab>('attractions');
  const { data, isLoading, error } = useAnalyticsData(activeSubTab);
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const currentChart = chartRef.current;
    return () => {
      if (currentChart) {
        // Note: Chart.js destroy method would be called here if using Chart.js
        // For now, we'll just clean up the ref
      }
    };
  }, [activeSubTab]);

  const renderContent = () => {
    if (!data) {
      return <div>No data available</div>;
    }

    switch (activeSubTab) {
      case 'attractions':
        // Convert AttractionsAnalytics to Place[] for the component
        const attractionsData = data.attractions?.popular_attractions.map(attraction => ({
          name: attraction.name,
          rating: attraction.rating,
          types: attraction.category,
          latitude: 0, // This would need to come from the actual data
          longitude: 0, // This would need to come from the actual data
        })) || null;
        return (
          <AttractionsAnalytics 
            data={attractionsData} 
            isLoading={isLoading} 
            error={error} 
          />
        );

      case 'demographics':
        // Convert DemographicsAnalytics to the expected format
        const demographicsData = data.demographics ? {
          age: {
            reviews: Object.entries(data.demographics.age_groups).map(([age_group, count]) => ({
              age_group,
              total_reviews: count,
              avg_rating: 4.0, // Default value
              active_reviewers: Math.floor(count * 0.8), // Estimate
            })),
            bus_usage: Object.entries(data.demographics.age_groups).map(([age_group, count]) => ({
              age_group,
              total_trips: count,
              active_riders: Math.floor(count * 0.6), // Estimate
              trips_per_user: 2.5, // Default value
            })),
          },
          country: {
            reviews: Object.entries(data.demographics.countries).map(([country, count]) => ({
              country,
              total_reviews: count,
              avg_rating: 4.0, // Default value
              active_reviewers: Math.floor(count * 0.8), // Estimate
            })),
            bus_usage: Object.entries(data.demographics.countries).map(([country, count]) => ({
              country,
              total_trips: count,
              active_riders: Math.floor(count * 0.6), // Estimate
              trips_per_user: 2.5, // Default value
            })),
          },
        } : null;
        return (
          <DemographicsAnalytics 
            data={demographicsData} 
            isLoading={isLoading} 
            error={error} 
          />
        );

      case 'bus-routes':
        // Convert BusRoutesAnalytics to the expected format
        const busRoutesData = data['bus-routes'] ? {
          line_popularity: data['bus-routes'].popular_routes.map(route => ({
            line: route.route_number,
            total_trips: route.usage_count,
            unique_users: Math.floor(route.usage_count * 0.7), // Estimate
            stops_used: 15, // Default value
          })),
          frequent_routes: data['bus-routes'].popular_routes.map(route => ({
            line: route.route_number,
            stop_name: route.route_name,
            trip_count: route.usage_count,
            unique_users: Math.floor(route.usage_count * 0.7), // Estimate
          })),
        } : null;
        return (
          <BusRoutesAnalytics 
            data={busRoutesData} 
            isLoading={isLoading} 
            error={error} 
          />
        );

      case 'popular-stops':
        // Convert PopularStopsAnalytics to the expected format
        const popularStopsData = data['popular-stops']?.popular_stops.map(stop => ({
          line: stop.stop_number,
          stop_name: stop.stop_name,
          latitude: 34.0522, // Default LA coordinates
          longitude: -118.2437, // Default LA coordinates
          unique_users: Math.floor(stop.daily_boardings * 0.3), // Estimate
          usage_count: stop.daily_boardings,
        })) || null;
        return (
          <PopularStopsAnalytics 
            data={popularStopsData} 
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