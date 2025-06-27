import { useState, useEffect } from "react";
import type { AnalyticsData } from "@/types";

const useAnalyticsData = (activeSubTab: string) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Simulate API call - replace with actual API endpoint
        const response = await fetch(`/api/analytics/${activeSubTab}`);
        if (!response.ok) {
          throw new Error("Failed to fetch analytics data");
        }

        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (activeSubTab) {
      fetchData();
    }
  }, [activeSubTab]);

  return { data, isLoading, error };
};

export default useAnalyticsData;
