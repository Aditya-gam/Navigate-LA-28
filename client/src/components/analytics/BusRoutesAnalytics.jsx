import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { getDefaultChartOptions, chartColors } from '../../utils/chartConfig';

const BusRoutesAnalytics = ({ data, isLoading, error }) => {
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) {
    return <div>No bus route data available</div>;
  }

  const chartOptions = getDefaultChartOptions();

  const linePopularityData = {
    labels: data.line_popularity.map(route => `Line ${route.line}`),
    datasets: [
      {
        label: 'Total Trips',
        data: data.line_popularity.map(route => route.total_trips),
        backgroundColor: chartColors.primary.background,
        borderColor: chartColors.primary.border,
        borderWidth: 1,
      },
      {
        label: 'Unique Users',
        data: data.line_popularity.map(route => route.unique_users),
        backgroundColor: chartColors.secondary.background,
        borderColor: chartColors.secondary.border,
        borderWidth: 1,
      },
      {
        label: 'Stops Used',
        data: data.line_popularity.map(route => route.stops_used),
        backgroundColor: chartColors.tertiary.background,
        borderColor: chartColors.tertiary.border,
        borderWidth: 1,
      },
    ],
  };

  const frequentRoutesData = {
    labels: data.frequent_routes.map(route => `Line ${route.line}\n${route.stop_name}`),
    datasets: [
      {
        label: 'Trip Count',
        data: data.frequent_routes.map(route => route.trip_count),
        backgroundColor: chartColors.quaternary.background,
        borderColor: chartColors.quaternary.border,
        borderWidth: 1,
      },
      {
        label: 'Unique Users',  
        data: data.frequent_routes.map(route => route.unique_users),
        backgroundColor: chartColors.quinary.background,
        borderColor: chartColors.quinary.border,
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ height: '400px', padding: '20px' }}>
        <h3 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
          Line Popularity Overview
        </h3>
        <Bar data={linePopularityData} options={chartOptions} />
      </div>

      <div style={{ height: '400px', padding: '20px' }}>
        <h3 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
          Frequent Routes by Stop
        </h3>
        <Bar data={frequentRoutesData} options={chartOptions} />
      </div>
    </div>
  );
};

BusRoutesAnalytics.propTypes = {
  data: PropTypes.object,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

export default BusRoutesAnalytics; 