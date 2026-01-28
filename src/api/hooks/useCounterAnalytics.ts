import { useState, useCallback } from "react";

const API_BASE_URL =
  import.meta.env.REACT_APP_API_BASE_URL || "http://localhost:8091";

// Counter Analytics Types
export interface CounterTrendDTO {
  timestamp: string;
  averageQueueLength: number;
  maxQueueLength: number;
  minQueueLength: number;
  dataPoints: number;
}

export interface CounterComparisonDTO {
  counterCode: string;
  counterName: string;
  counterType: string;
  deviceCount: number;
  averageQueueLength: number;
  maxQueueLength: number;
  minQueueLength: number;
  filterValue: number;
  totalReadings: number;
  efficiency: number;
}

export interface CounterPerformanceDTO {
  counterCode: string;
  counterName: string;
  counterType: string;
  deviceCount: number;
  hourlyPattern: HourlyPatternDTO[];
  statistics: {
    averageQueueLength: number;
    maxQueueLength: number;
    minQueueLength: number;
    totalReadings: number;
    efficiency: number;
  };
  peakHours: number[];
  lowHours: number[];
}

// Add these new types
export interface HistoricalTrendDTO {
  timePeriod: string;
  average_queue_length: number;
  total_queue_length: number;
  peak_queue: number;
  min_queue: number;
  active_device_count: number;
  total_device_count: number;
}

export interface CurrentDayKPIDTO {
  counterCode: string;
  counterName: string;
  date: string;
  average_queue_length: number;
  peak_queue: number;
  efficiency: number;
  total_readings: number;
}

export interface HourlyPatternDTO {
  hour: number;
  averageQueueLength: number;
  maxQueueLength: number;
  minQueueLength: number;
  dataPoints: number;
}

export interface CounterSummaryDTO {
  counterCode: string;
  counterName: string;
  counterType: string;
  deviceCount: number;
  averageQueueLength: number;
  maxQueueLength: number;
  minQueueLength: number;
  totalReadings: number;
  efficiency: number;
}

// Live Counter Status Types
export interface LiveCounterStatusDTO {
  counterCode: string;
  counterName: string;
  counterType: string;
  occupancy: number; // Total occupancy across devices
  queueLength: number;
  waitTime: number;
  estimatedWaitTime: number;
  deviceCount: number;
  activeDeviceCount: number;
  status: "active" | "inactive";
  lastUpdated: string | null;
  devices: Array<{
    deviceId: string;
    deviceName: string;
    occupancy: number;
    queueLength: number;
    waitTime: number;
    status: string;
    lastUpdated: string | null;
  }>;
}

// Footfall Summary Types
export interface FootfallPeriodData {
  date: string;
  count: number;
  percentage: number | null;
}

export interface FootfallSummaryDTO {
  counterCode?: string;
  counterName?: string;
  scope?: string;
  counterCount?: number;
  totalDevices?: number;
  generatedAt: string;
  today: FootfallPeriodData;
  yesterday: FootfallPeriodData;
  lastWeekSameDay: FootfallPeriodData;
  lastMonthSameDay: FootfallPeriodData;
  lastYearSameDay: FootfallPeriodData;
}

// Generic API hook for counter analytics
function useCounterApi<T>() {
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
        console.error("Counter Analytics API Error:", err);
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

// Counter Queue Trends Hook
export function useCounterQueueTrends() {
  const api = useCounterApi<{
    counterCode: string;
    counterName: string;
    deviceCount: number;
    startTime: string;
    endTime: string;
    interval: string;
    dataPoints: number;
    trends: CounterTrendDTO[];
    statistics: {
      averageQueueLength: number;
      maxQueueLength: number;
      minQueueLength: number;
      totalReadings: number;
      trend: string;
    };
    devices: Array<{ deviceId: string; deviceName: string }>;
  }>();

  const fetchTrends = useCallback(
    async (
      counterCode: string,
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
      const url = `/api/counter-analytics/counter/${counterCode}/trends${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchTrends };
}

/**
 * Historical Queue Trends Hook with Granularity
 */
export function useHistoricalQueueTrends() {
  const api = useCounterApi<{
    counterCode: string;
    counterName: string;
    counterType: string;
    deviceCount: number;
    startTime: string;
    endTime: string;
    granularity: string;
    dataPointCount: number;
    trends: HistoricalTrendDTO[];
    statistics: {
      average_queue_length: number;
      peak_queue: number;
      min_queue: number;
      total_readings: number;
    };
  }>();

  const fetchHistoricalTrends = useCallback(
    async (
      counterCode: string,
      options?: {
        startTime?: string;
        endTime?: string;
        granularity?: "hour" | "day" | "week" | "month";
      },
    ) => {
      const params = new URLSearchParams();
      if (options?.startTime) params.append("startTime", options.startTime);
      if (options?.endTime) params.append("endTime", options.endTime);
      if (options?.granularity)
        params.append("granularity", options.granularity);

      const queryString = params.toString();
      const url = `/api/counter-analytics/counter/${counterCode}/historical-trends${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchHistoricalTrends };
}

/**
 * Current Day KPIs Hook
 */
export function useCurrentDayKPIs() {
  const api = useCounterApi<CurrentDayKPIDTO>();

  const fetchCurrentDayKPIs = useCallback(
    async (counterCode: string) => {
      const url = `/api/counter-analytics/counter/${counterCode}/current-day-kpis`;
      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchCurrentDayKPIs };
}

// Counter Comparison Hook
export function useCounterComparison() {
  const api = useCounterApi<{
    counterCodes: string[];
    counterCount: number;
    filterType: string;
    startTime: string;
    endTime: string;
    comparisons: CounterComparisonDTO[];
    insights: {
      bestPerforming: {
        counterCode: string;
        counterName: string;
        averageQueue: number;
        efficiency: number;
      };
      worstPerforming: {
        counterCode: string;
        counterName: string;
        averageQueue: number;
        efficiency: number;
      };
    };
  }>();

  const fetchComparison = useCallback(
    async (
      counterCodes: string[],
      options?: {
        startTime?: string;
        endTime?: string;
        filterType?: "avg" | "max" | "min";
      },
    ) => {
      const params = new URLSearchParams();
      params.append("counterCodes", counterCodes.join(","));
      if (options?.startTime) params.append("startTime", options.startTime);
      if (options?.endTime) params.append("endTime", options.endTime);
      if (options?.filterType) params.append("filterType", options.filterType);

      return await api.execute(
        `/api/counter-analytics/compare?${params.toString()}`,
      );
    },
    [api],
  );

  return { ...api, fetchComparison };
}

// Historic Counter Trends Hook
export function useHistoricCounterTrends() {
  const api = useCounterApi<{
    counterCodes: string[];
    startTime: string;
    endTime: string;
    groupBy: string;
    trends: Array<{
      timestamp: string;
      [key: string]: any;
    }>;
    counterTrends: Record<string, CounterTrendDTO[]>;
  }>();

  const fetchHistoricTrends = useCallback(
    async (
      counterCodes: string[],
      options?: {
        startTime?: string;
        endTime?: string;
        groupBy?: string;
      },
    ) => {
      const params = new URLSearchParams();
      params.append("counterCodes", counterCodes.join(","));
      if (options?.startTime) params.append("startTime", options.startTime);
      if (options?.endTime) params.append("endTime", options.endTime);
      if (options?.groupBy) params.append("groupBy", options.groupBy);

      return await api.execute(
        `/api/counter-analytics/historic-trends?${params.toString()}`,
      );
    },
    [api],
  );

  return { ...api, fetchHistoricTrends };
}

// Counter Performance Analysis Hook
export function useCounterPerformance() {
  const api = useCounterApi<CounterPerformanceDTO>();

  const fetchPerformance = useCallback(
    async (
      counterCode: string,
      options?: {
        startTime?: string;
        endTime?: string;
      },
    ) => {
      const params = new URLSearchParams();
      if (options?.startTime) params.append("startTime", options.startTime);
      if (options?.endTime) params.append("endTime", options.endTime);

      const queryString = params.toString();
      const url = `/api/counter-analytics/counter/${counterCode}/performance${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchPerformance };
}

// All Counters Summary Hook
export function useCountersSummary() {
  const api = useCounterApi<{
    startTime: string;
    endTime: string;
    counterCount: number;
    counters: CounterSummaryDTO[];
  }>();

  const fetchSummary = useCallback(
    async (options?: { startTime?: string; endTime?: string }) => {
      const params = new URLSearchParams();
      if (options?.startTime) params.append("startTime", options.startTime);
      if (options?.endTime) params.append("endTime", options.endTime);

      const queryString = params.toString();
      const url = `/api/counter-analytics/summary${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchSummary };
}

// Live Counter Status Hook - for REAL-TIME MQTT data
export function useLiveCounterStatus() {
  const api = useCounterApi<{
    timestamp: string;
    counterCount: number;
    counters: LiveCounterStatusDTO[];
  }>();

  const fetchLiveStatus = useCallback(
    async (counterCodes?: string[]) => {
      const params = new URLSearchParams();
      if (counterCodes && counterCodes.length > 0) {
        params.append("counterCodes", counterCodes.join(","));
      }

      const queryString = params.toString();
      const url = `/api/counter-analytics/live-status${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchLiveStatus };
}

// Occupancy Trends Hook
export function useOccupancyTrends() {
  const api = useCounterApi<{
    counterCode: string;
    counterName: string;
    counterType: string;
    deviceCount: number;
    startTime: string;
    endTime: string;
    interval: string;
    dataPointCount: number;
    trends: Array<{
      timestamp: string;
      totalOccupancy: number;
      averageOccupancy: number;
      maxOccupancy: number;
      minOccupancy: number;
      activeDeviceCount: number;
    }>;
    statistics: {
      averageTotalOccupancy: number;
      maxTotalOccupancy: number;
      minTotalOccupancy: number;
      averageOccupancyPerDevice: number;
    };
  }>();

  const fetchOccupancyTrends = useCallback(
    async (
      counterCode: string,
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
      const url = `/api/counter-analytics/counter/${counterCode}/occupancy-trends${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchOccupancyTrends };
}

// Footfall Summary Hook
/**
 * Footfall Summary Hook (UPDATED to support multiple counters)
 */
export function useFootfallSummary() {
  const api = useCounterApi<FootfallSummaryDTO>();

  const fetchFootfallSummary = useCallback(
    async (counterCodes?: string | string[]) => {
      const params = new URLSearchParams();

      if (counterCodes) {
        if (Array.isArray(counterCodes)) {
          // Multiple counters
          params.append("counterCodes", counterCodes.join(","));
        } else {
          // Single counter
          params.append("counterCode", counterCodes);
        }
      }

      const queryString = params.toString();
      const url = `/api/counter-analytics/footfall-summary${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchFootfallSummary };
}
