import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../constants/chartConfig'; // Import chart configuration

// Create custom icons for analytics
const createNumberedIcon = (number) => {
  return L.divIcon({
    className: 'custom-numbered-icon',
    html: `<div style="
      background-color: #1a73e8;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const createNumberedStopIcon = (number) => {
  return L.divIcon({
    className: 'custom-numbered-stop',
    html: `<div style="
      background-color: #FFA500;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const Analytics = () => {
  const [data, setData] = useState({
    attractions: null,
    demographics: null,
    busRoutes: null,
    popularStops: null,
    geoDistribution: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('attractions');
  const chartRef = useRef(null);

  useEffect(() => {
    // Cleanup chart instance when component unmounts or tab changes
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [activeSubTab]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const endpointMap = {
          'attractions': 'attractions',
          'demographics': 'demographics',
          'bus-routes': 'bus-routes',
          'popular-stops': 'popular-stops',
          'geographic-distribution': 'geographic-distribution'
        };

        const endpoint = endpointMap[activeSubTab] || activeSubTab;
        let url = `http://localhost:8000/api/analytics/${endpoint}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const responseData = await response.json();

        setData(prevData => ({
          ...prevData,
          [activeSubTab]: responseData
        }));
      } catch (error) {
        setError(error.message);
        console.error(`Error fetching ${activeSubTab} data:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeSubTab]);

  const getChartData = () => {
    const currentData = data[activeSubTab];
    if (!currentData) return null;

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          font: {
            size: 16,
            weight: 'bold'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true
        },
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    };

    switch (activeSubTab) {
      case 'demographics': {
        if (!currentData?.age || !currentData?.country) return null;

        const ageReviewsData = {
          labels: currentData.age.reviews.map(item => item.age_group),
          datasets: [
            {
              label: 'Total Reviews',
              data: currentData.age.reviews.map(item => item.total_reviews),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            },
            {
              label: 'Average Rating',
              data: currentData.age.reviews.map(item => item.avg_rating),
              backgroundColor: 'rgba(255, 206, 86, 0.5)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1
            },
            {
              label: 'Active Reviewers',
              data: currentData.age.reviews.map(item => item.active_reviewers),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }
          ]
        };

        const ageBusData = {
          labels: currentData.age.bus_usage.map(item => item.age_group),
          datasets: [
            {
              label: 'Total Trips',
              data: currentData.age.bus_usage.map(item => item.total_trips),
              backgroundColor: 'rgba(153, 102, 255, 0.5)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1
            },
            {
              label: 'Active Riders',
              data: currentData.age.bus_usage.map(item => item.active_riders),
              backgroundColor: 'rgba(255, 159, 64, 0.5)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1
            },
            {
              label: 'Trips per User',
              data: currentData.age.bus_usage.map(item => item.trips_per_user),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        };

        const countryReviewsData = {
          labels: currentData.country.reviews.map(item => item.country),
          datasets: [
            {
              label: 'Total Reviews',
              data: currentData.country.reviews.map(item => item.total_reviews),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            },
            {
              label: 'Average Rating',
              data: currentData.country.reviews.map(item => item.avg_rating),
              backgroundColor: 'rgba(255, 206, 86, 0.5)',
              borderColor: 'rgba(255, 206, 86, 1)',
              borderWidth: 1
            },
            {
              label: 'Active Reviewers',
              data: currentData.country.reviews.map(item => item.active_reviewers),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }
          ]
        };

        const countryBusData = {
          labels: currentData.country.bus_usage.map(item => item.country),
          datasets: [
            {
              label: 'Total Trips',
              data: currentData.country.bus_usage.map(item => item.total_trips),
              backgroundColor: 'rgba(153, 102, 255, 0.5)',
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1
            },
            {
              label: 'Active Riders',
              data: currentData.country.bus_usage.map(item => item.active_riders),
              backgroundColor: 'rgba(255, 159, 64, 0.5)',
              borderColor: 'rgba(255, 159, 64, 1)',
              borderWidth: 1
            },
            {
              label: 'Trips per User',
              data: currentData.country.bus_usage.map(item => item.trips_per_user),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1
            }
          ]
        };

        return {
          ageReviewsData,
          ageBusData,
          countryReviewsData,
          countryBusData,
          options: chartOptions
        };
      }

      case 'attractions':
        return {
          data: {
            labels: currentData.map(a => a.name.length > 20 ? a.name.substring(0, 20) + '...' : a.name),
            datasets: [{
              label: 'Average Rating',
              data: currentData.map(a => a.rating),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: chartOptions
        };

      case 'bus-routes': {
        if (!currentData) return null;

        return {
          linePopularityData: {
            labels: currentData.line_popularity.map(route => `Line ${route.line}`),
            datasets: [
              {
                label: 'Total Trips',
                data: currentData.line_popularity.map(route => route.total_trips),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              },
              {
                label: 'Unique Users',
                data: currentData.line_popularity.map(route => route.unique_users),
                backgroundColor: 'rgba(255, 206, 86, 0.5)',
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1
              },
              {
                label: 'Stops Used',
                data: currentData.line_popularity.map(route => route.stops_used),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              }
            ]
          },
          frequentRoutesData: {
            labels: currentData.frequent_routes.map(route => `Line ${route.line}\n${route.stop_name}`),
            datasets: [
              {
                label: 'Trip Count',
                data: currentData.frequent_routes.map(route => route.trip_count),
                backgroundColor: 'rgba(153, 102, 255, 0.5)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
              },
              {
                label: 'Unique Users',  
                data: currentData.frequent_routes.map(route => route.unique_users),
                backgroundColor: 'rgba(255, 159, 64, 0.5)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
              }
            ]
          },
          options: chartOptions
        };
      }

      case 'popular-stops':
        return {
          data: {
            labels: currentData.map(stop => stop.stop_name),
            datasets: [{
              label: 'Usage Count',
              data: currentData.map(stop => stop.usage_count),
              backgroundColor: 'rgba(26, 115, 232, 0.5)',
              borderColor: 'rgba(26, 115, 232, 1)',
              borderWidth: 1
            }]
          },
          options: chartOptions
        };

      case 'geographic-distribution':
        return {
          data: {
            labels: Object.keys(currentData || {}),
            datasets: [{
              data: Object.values(currentData || {}),
              backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
              ],
              borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
              ],
              borderWidth: 1
            }]
          },
          options: chartOptions
        };

      default:
        return null;
    }
  };

  const renderContent = () => {
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    if (activeSubTab === 'demographics') {
      const chartData = getChartData();
      if (!chartData) return <div>No demographic data available</div>;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ height: '400px', padding: '20px' }}>
            <h3 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
              Age Demographics - Reviews
            </h3>
            <Bar data={chartData.ageReviewsData} options={chartData.options} />
          </div>

          <div style={{ height: '400px', padding: '20px' }}>
            <h3 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
              Age Demographics - Bus Usage
            </h3>
            <Bar data={chartData.ageBusData} options={chartData.options} />
          </div>

          <div style={{ height: '400px', padding: '20px' }}>
            <h3 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
              Country Demographics - Reviews
            </h3>
            <Bar data={chartData.countryReviewsData} options={chartData.options} />
          </div>

          <div style={{ height: '400px', padding: '20px' }}>
            <h3 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
              Country Demographics - Bus Usage
            </h3>
            <Bar data={chartData.countryBusData} options={chartData.options} />
          </div>
        </div>
      );
    }

    if (activeSubTab === 'bus-routes') {
      const currentData = data[activeSubTab];
      if (!currentData) {
        return <div>No bus route data available</div>;
      }

      const chartData = getChartData();

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ height: '400px', padding: '20px' }}>
            <h3 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
              Line Popularity Overview
            </h3>
            <Bar data={chartData.linePopularityData} options={chartData.options} />
          </div>

          <div style={{ height: '400px', padding: '20px' }}>
            <h3 style={{ textAlign: 'center', color: '#1a73e8', marginBottom: '20px' }}>
              Frequent Routes by Stop
            </h3>
            <Bar data={chartData.frequentRoutesData} options={chartData.options} />
          </div>
        </div>
      );
    }

    switch (activeSubTab) {
      case 'attractions': {
        if (!data.attractions || !Array.isArray(data.attractions)) {
          return <div>No attraction data available</div>;
        }

        return (
          <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
            <MapContainer
              center={[34.0522, -118.2437]}
              zoom={11}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {data.attractions.map((place, index) => {
                if (!place || typeof place.latitude !== 'number' || typeof place.longitude !== 'number') {
                  return null;
                }

                return (
                  <Marker
                    key={place.place_id || index}
                    position={[place.latitude, place.longitude]}
                    icon={createNumberedIcon(index + 1)}
                  >
                    <Popup>
                      <div style={{
                        padding: '8px',
                        minWidth: '200px',
                        maxWidth: '300px'
                      }}>
                        <h3 style={{
                          margin: '0 0 8px 0',
                          color: '#1a73e8',
                          fontSize: '16px',
                          borderBottom: '1px solid #eee',
                          paddingBottom: '8px'
                        }}>
                          {index + 1}. {place.name || 'Unnamed Location'}
                        </h3>
                        <div style={{
                          fontSize: '13px',
                          color: '#5f6368',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <div>⭐ Rating: {place.rating?.toFixed(2) || 'N/A'}/5</div>
                          <div>📊 Reviews: {place.review_count || 0}</div>
                          <div>🏆 High Ratings: {place.high_rating_ratio ?
                            Math.round(place.high_rating_ratio * 100) : 'N/A'}%</div>
                          {place.category && <div>🏷️ Category: {place.category}</div>}
                          <div style={{ fontSize: '12px', color: '#80868b', marginTop: '4px' }}>
                            📍 {place.latitude?.toFixed(6)}, {place.longitude?.toFixed(6)}
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        );
      }

      case 'popular-stops':
        return (
          <div style={{ height: 'calc(100vh - 200px)', width: '100%' }}>
            <MapContainer
              center={[34.0522, -118.2437]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {data['popular-stops']?.map((stop, index) => (
                <Marker
                  key={`${stop.line}-${stop.stop_name}`}
                  position={[stop.latitude, stop.longitude]}
                  icon={createNumberedStopIcon(index + 1)}
                >
                  <Popup>
                    <div style={{
                      padding: '8px',
                      minWidth: '200px'
                    }}>
                      <h3 style={{
                        margin: '0 0 8px 0',
                        color: '#1a73e8',
                        fontSize: '16px',
                        borderBottom: '1px solid #eee',
                        paddingBottom: '8px'
                      }}>
                        {index + 1}. {stop.stop_name}
                      </h3>
                      <div style={{
                        fontSize: '13px',
                        color: '#5f6368',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div>🚌 Line: {stop.line}</div>
                        <div>👥 Users: {stop.unique_users}</div>
                        <div>📊 Usage Count: {stop.usage_count}</div>
                        <div style={{ fontSize: '12px', color: '#80868b', marginTop: '4px' }}>
                          📍 {stop.latitude.toFixed(6)}, {stop.longitude.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveSubTab('attractions')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeSubTab === 'attractions' ? '#1a73e8' : '#fff',
            color: activeSubTab === 'attractions' ? '#fff' : '#1a73e8',
            border: '1px solid #1a73e8',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Top Attractions
        </button>
        <button
          onClick={() => setActiveSubTab('demographics')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeSubTab === 'demographics' ? '#1a73e8' : '#fff',
            color: activeSubTab === 'demographics' ? '#fff' : '#1a73e8',
            border: '1px solid #1a73e8',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Demographics
        </button>
        <button
          onClick={() => setActiveSubTab('bus-routes')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeSubTab === 'bus-routes' ? '#1a73e8' : '#fff',
            color: activeSubTab === 'bus-routes' ? '#fff' : '#1a73e8',
            border: '1px solid #1a73e8',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Bus Routes
        </button>
        <button
          onClick={() => setActiveSubTab('popular-stops')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeSubTab === 'popular-stops' ? '#1a73e8' : '#fff',
            color: activeSubTab === 'popular-stops' ? '#fff' : '#1a73e8',
            border: '1px solid #1a73e8',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Popular Stops
        </button>
      </div>

      {renderContent()}
    </div>
  );
};

export default Analytics; 