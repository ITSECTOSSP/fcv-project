// This hook fetches visitor statistics and recent visitor data from the API, manages loading and error states, and listens for real-time updates via a WebSocket channel. It provides a refresh function to manually reload the data when needed.
import { echo } from "@/echo";
import { useCallback, useEffect, useState } from "react";

export interface VisitorSummary {
  total_visits: number;
  unique_visitors: number;
  today_visits: number;
  today_unique: number;
}

export interface Visitor {
  id: number;
  visitor_id: string;
  ip_address: string | null;
  page: string | null;
  country: string | null;
  country_code: string | null;
  region: string | null;
  city: string | null;
  isp: string | null;
  device_type: string | null;
  browser: string | null;
  operating_system: string | null;
  visited_at: string;
}

interface VisitorStatisticsResponse {
  summary: VisitorSummary;
}

export function useVisitorStatistics() {
  const [stats, setStats] = useState<VisitorSummary | null>(null);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);

      const [statisticsResponse, visitorsResponse] =
        await Promise.all([
          fetch("/api/auth/visitors/statistics", {
            credentials: "include",
          }),
          fetch("/api/auth/visitors/recent?limit=10", {
            credentials: "include",
          }),
        ]);

      if (!statisticsResponse.ok) {
        throw new Error("Failed to fetch visitor statistics");
      }

      if (!visitorsResponse.ok) {
        throw new Error("Failed to fetch recent visitors");
      }

      const statisticsData: VisitorStatisticsResponse =
        await statisticsResponse.json();

      const visitorsData: Visitor[] =
        await visitorsResponse.json();

      setStats(statisticsData.summary);
      setVisitors(visitorsData);
    } catch (error) {
      console.error("Failed to load visitor data:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load visitor statistics."
      );
    }
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    };

    loadInitialData();
  }, [refresh]);

  useEffect(() => {
    const channel = echo.channel("visitor-statistics");

    channel.listen(".visitor.created", () => {
      console.log("New visitor detected.");
      refresh();
    });

    return () => {
      echo.leaveChannel("visitor-statistics");
    };
  }, [refresh]);

  return {
    stats,
    visitors,
    loading,
    error,
    refresh,
  };
}