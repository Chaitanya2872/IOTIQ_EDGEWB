// src/api/hooks/useCafeteriaAnalytics.ts
import { useState, useEffect, useCallback } from 'react';
import { cafeteriaApi } from '../cafeteriaApi';

/**
 * Hook for smart insights
 */
export const useSmartInsights = (date?: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await cafeteriaApi.getSmartInsights(date);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch smart insights');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for wait time trend analysis
 */
export const useWaitTimeTrend = (startDate?: string, endDate?: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await cafeteriaApi.getWaitTimeTrend(startDate, endDate);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wait time trend');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for wait time by meal session
 */
export const useWaitTimeBySession = (date?: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await cafeteriaApi.getWaitTimeBySession(date);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch session data');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for traffic pattern analysis
 */
export const useTrafficPattern = (days: number = 30) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await cafeteriaApi.getTrafficPattern(days);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch traffic pattern');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for weekly summary
 */
export const useWeeklySummaryNew = (weeks: number = 4) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await cafeteriaApi.getWeeklySummaryNew(weeks);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weekly summary');
    } finally {
      setLoading(false);
    }
  }, [weeks]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for peak days analysis
 */
export const usePeakDaysAnalysis = (days: number = 7) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await cafeteriaApi.getPeakDaysAnalysis(days);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch peak days');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for comprehensive dashboard data
 */
export const useDashboardData = (date?: string, autoRefresh: boolean = false, refreshInterval: number = 30000) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const result = await cafeteriaApi.getDashboardData(date);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh || loading) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loading, fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for today's hourly breakdown
 */
export const useTodayHourly = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await cafeteriaApi.getTodayHourly();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch hourly data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

/**
 * Hook for session comparison
 */
export const useSessionComparison = (days: number = 7) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await cafeteriaApi.getSessionComparison(days);
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch session comparison');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

export default {
  useSmartInsights,
  useWaitTimeTrend,
  useWaitTimeBySession,
  useTrafficPattern,
  useWeeklySummaryNew,
  usePeakDaysAnalysis,
  useDashboardData,
  useTodayHourly,
  useSessionComparison
};