import React from 'react';
import { Bar } from 'react-chartjs-2';
import { getDefaultChartOptions, chartColors } from '../../utils/chartConfig';

const DemographicsAnalytics = ({ data, isLoading, error }) => {
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data?.age || !data?.country) {
    return <div>No demographic data available</div>;
  }

  const chartOptions = getDefaultChartOptions();

  const ageReviewsData = {
    labels: data.age.reviews.map(item => item.age_group),
    datasets: [
      {
        label: 'Total Reviews',
        data: data.age.reviews.map(item => item.total_reviews),
        backgroundColor: chartColors.tertiary.background,
        borderColor: chartColors.tertiary.border,
        borderWidth: 1
      },
      {
        label: 'Average Rating',
        data: data.age.reviews.map(item => item.avg_rating),
        backgroundColor: chartColors.secondary.background,
        borderColor: chartColors.secondary.border,
        borderWidth: 1
      },
      {
        label: 'Active Reviewers',
        data: data.age.reviews.map(item => item.active_reviewers),
        backgroundColor: chartColors.primary.background,
        borderColor: chartColors.primary.border,
        borderWidth: 1
      }
    ]
  };

  const ageBusData = {
    labels: data.age.bus_usage.map(item => item.age_group),
    datasets: [
      {
        label: 'Total Trips',
        data: data.age.bus_usage.map(item => item.total_trips),
        backgroundColor: chartColors.quaternary.background,
        borderColor: chartColors.quaternary.border,
        borderWidth: 1
      },
      {
        label: 'Active Riders',
        data: data.age.bus_usage.map(item => item.active_riders),
        backgroundColor: chartColors.quinary.background,
        borderColor: chartColors.quinary.border,
        borderWidth: 1
      },
      {
        label: 'Trips per User',
        data: data.age.bus_usage.map(item => item.trips_per_user),
        backgroundColor: chartColors.tertiary.background,
        borderColor: chartColors.tertiary.border,
        borderWidth: 1
      }
    ]
  };

  const countryReviewsData = {
    labels: data.country.reviews.map(item => item.country),
    datasets: [
      {
        label: 'Total Reviews',
        data: data.country.reviews.map(item => item.total_reviews),
        backgroundColor: chartColors.tertiary.background,
        borderColor: chartColors.tertiary.border,
        borderWidth: 1
      },
      {
        label: 'Average Rating',
        data: data.country.reviews.map(item => item.avg_rating),
        backgroundColor: chartColors.secondary.background,
        borderColor: chartColors.secondary.border,
        borderWidth: 1
      },
      {
        label: 'Active Reviewers',
        data: data.country.reviews.map(item => item.active_reviewers),
        backgroundColor: chartColors.primary.background,
        borderColor: chartColors.primary.border,
        borderWidth: 1
      }
    ]
  };

  const countryBusData = {
    labels: data.country.bus_usage.map(item => item.country),
    datasets: [
      {
        label: 'Total Trips',
        data: data.country.bus_usage.map(item => item.total_trips),
        backgroundColor: chartColors.quaternary.background,
        borderColor: chartColors.quaternary.border,
        borderWidth: 1
      },
      {
        label: 'Active Riders',
        data: data.country.bus_usage.map(item => item.active_riders),
        backgroundColor: chartColors.quinary.background,
        borderColor: chartColors.quinary.border,
        borderWidth: 1
      },
      {
        label: 'Trips per User',
        data: data.country.bus_usage.map(item => item.trips_per_user),
        backgroundColor: chartColors.tertiary.background,
        borderColor: chartColors.tertiary.border,
        borderWidth: 1
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ height: '400px', padding: '20px' }}>
        <h3 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
          Age Demographics - Reviews
        </h3>
        <Bar data={ageReviewsData} options={chartOptions} />
      </div>

      <div style={{ height: '400px', padding: '20px' }}>
        <h3 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
          Age Demographics - Bus Usage
        </h3>
        <Bar data={ageBusData} options={chartOptions} />
      </div>

      <div style={{ height: '400px', padding: '20px' }}>
        <h3 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
          Country Demographics - Reviews
        </h3>
        <Bar data={countryReviewsData} options={chartOptions} />
      </div>

      <div style={{ height: '400px', padding: '20px' }}>
        <h3 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
          Country Demographics - Bus Usage
        </h3>
        <Bar data={countryBusData} options={chartOptions} />
      </div>
    </div>
  );
};

export default DemographicsAnalytics; 