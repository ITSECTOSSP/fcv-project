import { echo } from "@/echo";
import api from "@/lib/api/api";
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

      const [statisticsResponse, visitorsResponse] = await Promise.all([
        api.get<VisitorStatisticsResponse>("/api/auth/visitors/statistics"),
        api.get<Visitor[]>("/api/auth/visitors/recent", {
          params: { limit: 10 },
        }),
      ]);

      setStats(statisticsResponse.data.summary);
      setVisitors(visitorsResponse.data);
    } catch (error) {
      console.error("Failed to load visitor data:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load visitor statistics.",
      );
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      setLoading(true);
      await refresh();

      if (mounted) {
        setLoading(false);
      }
    };

    void loadInitialData();

    return () => {
      mounted = false;
    };
  }, [refresh]);

  useEffect(() => {
    const channel = echo.channel("visitor-statistics");

    channel.listen(".visitor.created", () => {
      console.log("New visitor detected.");
      void refresh();
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
