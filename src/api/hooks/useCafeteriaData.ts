// src/api/hooks/useCafeteriaData.ts
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { cafeteriaApi } from '../cafeteriaApi';
import type { CafeteriaCounter, CafeteriaLatestResponse } from '../types';

// Helper to determine UI status based on service status
const getUIStatus = (serviceStatus: string): 'ready' | 'busy' | 'crowded' => {
  switch (serviceStatus) {
    case 'READY_TO_SERVE':
      return 'ready';
    case 'SHORT_WAIT':
      return 'busy';
    case 'MEDIUM_WAIT':
    case 'LONG_WAIT':
      return 'crowded';
    default:
      return 'ready';
  }
};

export const useCafeteriaData = (autoRefresh: boolean = true, refreshInterval: number = 30000) => {
  const [latestData, setLatestData] = useState<CafeteriaLatestResponse | null>(null);
  const [alerts, setAlerts] = useState<CafeteriaCounter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  const isMountedRef = useRef(true);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Fetch latest queue status
  const fetchLatestStatus = useCallback(async () => {
    try {
      const data = await cafeteriaApi.getLatestQueueStatus();
      
      if (isMountedRef.current) {
        setLatestData(data);
        setError(null);
        setLastUpdate(new Date());
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err.message || 'Failed to fetch cafeteria data');
      }
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const alertData = await cafeteriaApi.getActiveAlerts();
      
      if (isMountedRef.current) {
        const safeAlerts = Array.isArray(alertData) ? alertData : [];
        setAlerts(safeAlerts);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setAlerts([]);
      }
    }
  }, []);

  // Combined fetch function
  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchLatestStatus(),
      fetchAlerts()
    ]);
  }, [fetchLatestStatus, fetchAlerts]);

  // Initial load
  useEffect(() => {
    isMountedRef.current = true;

    const loadData = async () => {
      setLoading(true);
      await fetchAllData();
      if (isMountedRef.current) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMountedRef.current = false;
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [fetchAllData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || loading) return;

    const scheduleRefresh = () => {
      refreshTimeoutRef.current = setTimeout(async () => {
        await fetchAllData();
        if (isMountedRef.current && autoRefresh) {
          scheduleRefresh();
        }
      }, refreshInterval);
    };

    scheduleRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, loading, fetchAllData]);

  // Helper to get counters as array with UI-friendly format
  const getCountersArray = useCallback(() => {
    if (!latestData?.counters) return [];
    
    const counters: Array<CafeteriaCounter & { status: 'ready' | 'busy' | 'crowded' }> = [];
    
    // Process each counter
    Object.entries(latestData.counters).forEach(([key, counter]) => {
      if (counter) {
        counters.push({
          ...counter,
          status: getUIStatus(counter.serviceStatus)
        } as CafeteriaCounter & { status: 'ready' | 'busy' | 'crowded' });
      }
    });
    
    return counters;
  }, [latestData]);

  // Helper to get specific counter
  const getCounter = useCallback((counterName: string) => {
    if (!latestData?.counters) return null;
    
    const counter = latestData.counters[counterName as keyof typeof latestData.counters];
    if (!counter) return null;
    
    return {
      ...counter,
      status: getUIStatus(counter.serviceStatus)
    };
  }, [latestData]);

  // Manual refresh function
  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchAllData();
    setLoading(false);
  }, [fetchAllData]);

  return {
    latestData,
    alerts: alerts || [],
    loading,
    error,
    lastUpdate,
    refetch,
    getCountersArray,
    getCounter
  };
};

// Hook for specific counter with statistics
export const useCounterData = (counterName: string, hours: number = 24) => {
  const [data, setData] = useState<CafeteriaCounter | null>(null);
  const [recentData, setRecentData] = useState<CafeteriaCounter[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [counterData, recent, stats] = await Promise.all([
          cafeteriaApi.getCounterStatus(counterName),
          cafeteriaApi.getRecentByCounter(counterName, hours),
          cafeteriaApi.getCounterStatistics(counterName, hours)
        ]);

        setData(counterData);
        setRecentData(recent);
        setStatistics(stats);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch counter data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [counterName, hours]);

  return { data, recentData, statistics, loading, error };
};

export const usePeakHours = (hours: number = 24) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cafeteriaApi.getPeakHours(hours)
      .then(setData)
      .finally(() => setLoading(false));
  }, [hours]);

  return { data, loading };
};

export const useRealtimeAnalytics = () => {
  const { latestData } = useCafeteriaData(true, 15000);

  const totalQueue = useMemo(() => {
    if (!latestData?.counters) return 0;
    return Object.values(latestData.counters)
      .reduce((sum, c) => sum + (c?.queueCount || 0), 0);
  }, [latestData]);

  return {
    totalQueue,
    counters: latestData?.counters
  };
};

export const useWeeklyTraffic = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cafeteriaApi.getWeeklyTraffic()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};

// ==================== NEW DATE-WISE AND HOURLY HOOKS ====================

/**
 * Hook to fetch data for a specific date
 */
export const useDataByDate = (date: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await cafeteriaApi.getDataByDate(date);
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  return { data, loading, error };
};

/**
 * Hook to fetch data for a specific date and counter
 */
export const useDataByDateAndCounter = (date: string, counterName: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !counterName) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await cafeteriaApi.getDataByDateAndCounter(counterName, date);
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, counterName]);

  return { data, loading, error };
};

/**
 * Hook to fetch hourly aggregated data for a date
 */
export const useHourlyData = (date: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await cafeteriaApi.getHourlyData(date);
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch hourly data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date]);

  return { data, loading, error };
};

/**
 * Hook to fetch hourly data for specific counter
 */
export const useHourlyDataByCounter = (date: string, counterName: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !counterName) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await cafeteriaApi.getHourlyDataByCounter(counterName, date);
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch hourly data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, counterName]);

  return { data, loading, error };
};

/**
 * Hook to fetch data for a date range
 */
export const useDataByDateRange = (startDate: string, endDate: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await cafeteriaApi.getDataByDateRange(startDate, endDate);
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch date range data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return { data, loading, error };
};

/**
 * Hook to fetch daily summary for a date range
 */
export const useDailySummaryForRange = (startDate: string, endDate: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await cafeteriaApi.getDailySummaryForRange(startDate, endDate);
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch daily summary');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return { data, loading, error };
};

/**
 * Hook to fetch data by specific timestamp
 */
export const useDataByTimestamp = (timestamp: string, minutesRange: number = 5) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!timestamp) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await cafeteriaApi.getDataByTimestamp(timestamp, minutesRange);
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch timestamp data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timestamp, minutesRange]);

  return { data, loading, error };
};

/**
 * Hook to fetch data for a specific hour
 */
export const useDataByHour = (date: string, hour: number) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || hour === undefined) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await cafeteriaApi.getDataByHour(date, hour);
        setData(result);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch hour data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [date, hour]);

  return { data, loading, error };
};

/**
 * Hook to fetch all records within time range
 */
// In useCafeteriaData.ts, replace lines 488-550 with:
/**
 * Hook to fetch all records within time range
 */
export const useAllRecords = (from?: string, to?: string, counterName?: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await cafeteriaApi.getAllRecords(from, to, counterName);
        
        console.log('getAllRecords API response:', result);
        console.log('Has counters?', !!result?.counters);
        console.log('Has data?', !!result?.data);
        console.log('counterName param:', counterName);
        
        // Handle two different backend response formats:
        
        // Format 1: All counters - Backend returns { counters: {...}, statistics: {...} }
        if (result && result.counters && Object.keys(result.counters).length > 0) {
          console.log('Using counters format (all counters)');
          setData(result);
        } 
        // Format 2: Single counter - Backend returns { data: [...], counterName: "X", statistics: {...} }
        else if (result && result.data && Array.isArray(result.data)) {
          console.log('Using data array format (single counter)');
          
          // Transform single counter response to match expected format
          const transformedData: any = {
            counters: {},
            totalRecords: result.totalRecords || result.data.length,
            from: result.from,
            to: result.to,
            counterName: result.counterName,
            statistics: result.statistics
          };
          
          // Group records by counter name
          result.data.forEach((record: any) => {
            const name = record.counterName;
            if (!transformedData.counters[name]) {
              transformedData.counters[name] = [];
            }
            transformedData.counters[name].push(record);
          });
          
          console.log('Transformed data:', transformedData);
          setData(transformedData);
        } 
        // Format 3: Empty response
        else {
          console.log('No data received, setting empty structure');
          setData({
            counters: {},
            totalRecords: 0
          });
        }
        setError(null);
      } catch (err: any) {
        console.error('Error fetching records:', err);
        setError(err.message || 'Failed to fetch records');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [from, to, counterName]);

  return { data, loading, error };
};



export default useCafeteriaData;