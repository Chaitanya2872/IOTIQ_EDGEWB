import { useState, useCallback } from "react";

const API_BASE_URL = import.meta.env.VITE_DEVICE_API_BASE_URL;

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
  averageOccupancy: number;
  maxOccupancy: number;
  minOccupancy: number;
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
export interface FootfallTrendPoint {
  time: string;
  value: number;
}

export interface FootfallPeriodData {
  totalFootfall: number;
  trendPoints: FootfallTrendPoint[];
  startTime: string;
  endTime: string;
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

// Weekly Peak Queue Types
export interface PeakCongestionDTO {
  level: string;
  weight: number;
  peakWaitTimeInBlock: number;
  start: string;
  end: string;
  durationMinutes: number;
}

export interface WeeklyPeakQueueDataDTO {
  date: string;
  dayName: string;
  peakQueue: number;
  totalCount: number;
  peakWaitTime: number;
  congestionIndex: number | null;
  peakCongestion: PeakCongestionDTO;
  periodStart: string;
}

export interface WeeklyPeakQueueDTO {
  counterCode: string;
  startDate: string;
  endDate: string;
  data: WeeklyPeakQueueDataDTO[];
}

// ==================== NEW: Footfall vs Wait Time Types ====================

/**
 * Hourly breakdown of footfall and wait time metrics
 */
export interface HourlyFootfallWaitTimeDTO {
  hour: number;
  hourLabel: string; // e.g., "09:00 - 10:00"
  totalFootfall: number;
  averageFootfall: number;
  peakFootfall: number;
  minFootfall: number;
  averageWaitTime: number;
  maxWaitTime: number;
  minWaitTime: number;
  footfallWaitRatio: number; // Wait time per person (lower is better)
  dataPointCount: number;
  activeDevices: number;
}

/**
 * Daily summary statistics for footfall vs wait time
 */
export interface DailyFootfallWaitTimeSummaryDTO {
  totalFootfall: number;
  averageFootfall: number;
  peakFootfall: number;
  footfallReadings: number;
  averageWaitTime: number;
  maxWaitTime: number;
  minWaitTime: number;
  waitTimeReadings: number;
  serviceLevel: number; // Percentage of readings with acceptable wait time
  acceptableWaitThreshold: number; // Threshold used (e.g., 5.0 minutes)
  overallFootfallWaitRatio: number;
}

/**
 * Peak period analysis
 */
export interface PeakFootfallWaitTimeAnalysisDTO {
  peakFootfallHour: {
    hour: number;
    hourLabel: string;
    footfall: number;
    waitTime: number;
  };
  peakWaitTimeHour: {
    hour: number;
    hourLabel: string;
    waitTime: number;
    footfall: number;
  };
  bestPerformingHour: {
    hour: number;
    hourLabel: string;
    footfall: number;
    waitTime: number;
    ratio: number;
  };
  worstPerformingHour: {
    hour: number;
    hourLabel: string;
    footfall: number;
    waitTime: number;
    ratio: number;
  };
}

/**
 * Complete daily footfall vs wait time response
 */
export interface DailyFootfallVsWaitTimeDTO {
  counterCode: string;
  counterName: string;
  counterType: string;
  date: string;
  deviceCount: number;
  totalDataPoints: number;
  hourlyBreakdown: HourlyFootfallWaitTimeDTO[];
  dailySummary: DailyFootfallWaitTimeSummaryDTO;
  peakAnalysis: PeakFootfallWaitTimeAnalysisDTO;
}

/**
 * Aggregated summary for date range
 */
export interface AggregatedFootfallWaitTimeSummaryDTO {
  totalFootfallAllDays: number;
  averageDailyFootfall: number;
  averageWaitTimeAllDays: number;
  averageServiceLevel: number;
  overallPeakFootfall: number;
  overallMaxWaitTime: number;
  daysAnalyzed: number;
}

/**
 * Date range response (multiple days)
 */
export interface FootfallVsWaitTimeRangeDTO {
  counterCode: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  dailyBreakdown: DailyFootfallVsWaitTimeDTO[];
  aggregatedSummary: AggregatedFootfallWaitTimeSummaryDTO;
}

// ==================== END: Footfall vs Wait Time Types ====================

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
      averageOccupancy: number;
      maxOccupancy: number;
      minOccupancy: number;
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
      const url = `/counter-analytics/counter/${counterCode}/trends${queryString ? `?${queryString}` : ""}`;

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
      const url = `/counter-analytics/counter/${counterCode}/historical-trends${queryString ? `?${queryString}` : ""}`;

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
      const url = `/counter-analytics/counter/${counterCode}/current-day-kpis`;
      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchCurrentDayKPIs };
}

/**
 * Weekly Peak Queue Hook
 * Fetches peak queue data for daily/weekly/monthly views from MQTT aggregation
 */
export function useWeeklyPeakQueue() {
  const api = useCounterApi<WeeklyPeakQueueDTO>();

  const fetchWeeklyPeakQueue = useCallback(
    async (
      counterCode: string,
      options?: {
        startDate?: string; // Format: YYYY-MM-DD
        endDate?: string; // Format: YYYY-MM-DD
      },
    ) => {
      const params = new URLSearchParams();
      if (options?.startDate) params.append("startDate", options.startDate);
      if (options?.endDate) params.append("endDate", options.endDate);

      const queryString = params.toString();
      const url = `/counter-analytics/${counterCode}/weekly-peak-queue${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchWeeklyPeakQueue };
}

// ==================== NEW: Footfall vs Wait Time Hooks ====================

/**
 * Daily Footfall vs Wait Time Hook
 * Fetches footfall and wait time analysis for a single day
 *
 * @example
 * const { data, loading, error, fetchFootfallVsWaitTime } = useDailyFootfallVsWaitTime();
 *
 * // Get today's data
 * await fetchFootfallVsWaitTime('CNT001');
 *
 * // Get specific date
 * await fetchFootfallVsWaitTime('CNT001', { date: '2024-02-01' });
 */
export function useDailyFootfallVsWaitTime() {
  const api = useCounterApi<DailyFootfallVsWaitTimeDTO>();

  const fetchFootfallVsWaitTime = useCallback(
    async (
      counterCode: string,
      options?: {
        date?: string; // Format: YYYY-MM-DD (defaults to today)
      },
    ) => {
      const params = new URLSearchParams();
      if (options?.date) params.append("date", options.date);

      const queryString = params.toString();
      const url = `/counter-analytics/${counterCode}/footfall-vs-waittime${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchFootfallVsWaitTime };
}

/**
 * Footfall vs Wait Time Range Hook
 * Fetches footfall and wait time analysis for multiple days (date range)
 * Maximum 31 days allowed
 *
 * @example
 * const { data, loading, error, fetchFootfallVsWaitTimeRange } = useFootfallVsWaitTimeRange();
 *
 * // Get last 7 days
 * await fetchFootfallVsWaitTimeRange('CNT001', {
 *   startDate: '2024-02-01',
 *   endDate: '2024-02-07'
 * });
 */
export function useFootfallVsWaitTimeRange() {
  const api = useCounterApi<FootfallVsWaitTimeRangeDTO>();

  const fetchFootfallVsWaitTimeRange = useCallback(
    async (
      counterCode: string,
      options: {
        startDate: string; // Format: YYYY-MM-DD (required)
        endDate: string; // Format: YYYY-MM-DD (required)
      },
    ) => {
      const params = new URLSearchParams();
      params.append("startDate", options.startDate);
      params.append("endDate", options.endDate);

      const url = `/counter-analytics/${counterCode}/footfall-vs-waittime/range?${params.toString()}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchFootfallVsWaitTimeRange };
}

// ==================== END: Footfall vs Wait Time Hooks ====================

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
        `/counter-analytics/compare?${params.toString()}`,
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
        `/counter-analytics/historic-trends?${params.toString()}`,
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
      const url = `/counter-analytics/counter/${counterCode}/performance${queryString ? `?${queryString}` : ""}`;

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
      const url = `/counter-analytics/summary${queryString ? `?${queryString}` : ""}`;

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
      const url = `/counter-analytics/live-status${queryString ? `?${queryString}` : ""}`;

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
      const url = `/counter-analytics/counter/${counterCode}/occupancy-trends${queryString ? `?${queryString}` : ""}`;

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
      const url = `/counter-analytics/footfall-summary${queryString ? `?${queryString}` : ""}`;

      return await api.execute(url);
    },
    [api],
  );

  return { ...api, fetchFootfallSummary };
}
