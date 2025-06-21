import { useState, useEffect } from 'react';

const useAnalyticsData = (activeSubTab) => {
  const [data, setData] = useState({
    attractions: null,
    demographics: null,
    busRoutes: null,
    popularStops: null,
    geoDistribution: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return { data, isLoading, error };
};

export default useAnalyticsData; 