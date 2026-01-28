import { useState, useCallback } from "react";

const API_BASE_URL = import.meta.env.VITE_DEVICE_API_BASE_URL;

// Queue Analytics Types
export interface QueueTrendDTO {
  timestamp: string;
  deviceId: string;
  averageQueueLength: number;
  maxQueueLength: number;
  minQueueLength: number;
  dataPoints: number;
  interval: string;
}

export interface QueueComparisonDTO {
  deviceId: string;
  deviceName: string;
  location: string;
  averageQueueLength: number;
  maxQueueLength: number;
  minQueueLength: number;
  totalReadings: number;
  firstReading: string;
  lastReading: string;
}

export interface AverageQueueDTO {
  timestamp: string;
  location: string | null;
  segment: string | null;
  averageQueueLength: number;
  maxQueueLength: number;
  minQueueLength: number;
  deviceCount: number;
  totalReadings: number;
}

export interface HourlyPatternDTO {
  hour: number;
  averageQueueLength: number;
  maxQueueLength: number;
  minQueueLength: number;
  dataPoints: number;
}

export interface QueueStatistics {
  averageQueueLength: number;
  maxQueueLength: number;
  minQueueLength: number;
  medianQueueLength: number;
  standardDeviation: number;
  totalReadings: number;
  trend: "increasing" | "decreasing" | "stable" | "insufficient_data";
}

// Generic API hook for queue analytics
function useQueueApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (url: string, options?: RequestInit): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
          ...options,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          );
        }

        const result = await response.json();
        setData(result);
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Queue Analytics API Error:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
}

// Queue Trends Hook
export function useQueueTrends() {
  const api = useQueueApi<{
    deviceId: string;
    startTime: string;
    endTime: string;
    interval: string;
    dataPoints: number;
    trends: QueueTrendDTO[];
    statistics: {
      averageQueueLength: number;
      maxQueueLength: number;
      minQueueLength: number;
      trend: string;
    };
  }>();

  const fetchTrends = useCallback(
    async (
      deviceId: string,
      options?: {
        startTime?: string;
        endTime?: string;
        interval?: string;
      },
    ) => {
      const params = new URLSearchParams();
      if (options?.startTime) params.append("startTime", options.startTime);
      if (options?.endTime) params.append("endTime", options.endTime);
      if (options?.interval) params.append("interval", options.interval);

      const queryString = params.toString();
      const url = `/api/queue-analytics/device/${deviceId}/trends${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchTrends };
}

// Queue Comparison Hook
export function useQueueComparison() {
  const api = useQueueApi<{
    deviceIds: string[];
    deviceCount: number;
    startTime: string;
    endTime: string;
    comparison: QueueComparisonDTO[];
    insights: {
      bestPerforming: { deviceId: string; averageQueue: number };
      worstPerforming: { deviceId: string; averageQueue: number };
    };
  }>();

  const fetchComparison = useCallback(
    async (
      deviceIds: string[],
      options?: {
        startTime?: string;
        endTime?: string;
      },
    ) => {
      const params = new URLSearchParams();
      params.append("deviceIds", deviceIds.join(","));
      if (options?.startTime) params.append("startTime", options.startTime);
      if (options?.endTime) params.append("endTime", options.endTime);

      return await api.execute(
        `/api/queue-analytics/comparison?${params.toString()}`,
      );
    },
    [api],
  );

  return { ...api, fetchComparison };
}

// Average Queue Hook
export function useAverageQueue() {
  const api = useQueueApi<{
    location: string | null;
    segment: string | null;
    startTime: string;
    endTime: string;
    groupBy: string;
    dataPoints: number;
    averageData: AverageQueueDTO[];
    summary: {
      overallAverageQueue: number;
      totalDevices: number;
      peakPeriod: { timestamp: string; averageQueue: number };
      lowPeriod: { timestamp: string; averageQueue: number };
    };
  }>();

  const fetchAverage = useCallback(
    async (options: {
      location?: string;
      segment?: string;
      startTime?: string;
      endTime?: string;
      groupBy?: string;
    }) => {
      const params = new URLSearchParams();
      if (options.location) params.append("location", options.location);
      if (options.segment) params.append("segment", options.segment);
      if (options.startTime) params.append("startTime", options.startTime);
      if (options.endTime) params.append("endTime", options.endTime);
      if (options.groupBy) params.append("groupBy", options.groupBy);

      return await api.execute(
        `/api/queue-analytics/average?${params.toString()}`,
      );
    },
    [api],
  );

  return { ...api, fetchAverage };
}

// Hourly Pattern Hook
export function useHourlyPattern() {
  const api = useQueueApi<{
    deviceId: string;
    analyzedDays: number;
    startTime: string;
    endTime: string;
    hourlyPattern: HourlyPatternDTO[];
    peakHours: number[];
    lowHours: number[];
  }>();

  const fetchPattern = useCallback(
    async (deviceId: string, days?: number) => {
      const params = new URLSearchParams();
      if (days) params.append("days", days.toString());

      const queryString = params.toString();
      const url = `/api/queue-analytics/device/${deviceId}/hourly-pattern${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchPattern };
}

// Queue Statistics Hook
export function useQueueStatistics() {
  const api = useQueueApi<{
    deviceId: string;
    period: string;
    startTime: string;
    endTime: string;
    statistics: QueueStatistics;
  }>();

  const fetchStatistics = useCallback(
    async (deviceId: string, period?: string) => {
      const params = new URLSearchParams();
      if (period) params.append("period", period);

      const queryString = params.toString();
      const url = `/api/queue-analytics/device/${deviceId}/statistics${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchStatistics };
}
