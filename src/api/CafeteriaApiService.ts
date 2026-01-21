// CafeteriaApiService.ts - COMPLETE VERSION WITH ENHANCED CONGESTION
import axios, { type AxiosInstance } from 'axios';
import { useState, useEffect, useCallback } from 'react';

// ==================== CONFIGURATION ====================

const BASE_URL = import.meta.env.VITE_API_IOT_BASE_URL || 'http://localhost:8085/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const COUNTER_NAME_MAP: Record<string, string> = {
  'Healthy Station': 'Healthy Station',
  'Mini Meals': 'Mini Meals',
  'Two Good': 'Two Good',
};

const REVERSE_COUNTER_MAP: Record<string, string> = {
  'Healthy Station Counter': 'Healthy Station',
  'Bisi Oota/ Mini meals Counter': 'Mini Meals',
  'Two Good Counter': 'Two Good',
};

function normalizeCounterName(backendName: string): string {
  return COUNTER_NAME_MAP[backendName] || backendName;
}

function denormalizeCounterName(frontendName: string): string {
  return REVERSE_COUNTER_MAP[frontendName] || frontendName;
}

// ==================== TYPES ====================

export interface OccupancyStatus {
  currentOccupancy: number;
  capacity: number;
  occupancyPercentage: number;
  congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
}

export interface CounterStatus {
  counterName: string;
  queueLength: number;
  waitTime: number;
  congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  serviceStatus: string;
  lastUpdated: string;
}

export interface FlowData {
  timestamp: string;
  inflow: number;
  outflow: number;
  netFlow: number;
}

export interface DwellTimeData {
  timeRange: string;
  count: number;
  percentage: number;
}

export interface FootfallComparison {
  timestamp: string;
  cafeteriaFootfall: number;
  countersFootfall: number;
  ratio: number;
  insight: string;
}

export interface OccupancyTrend {
  timestamp: string;
  occupancy: number;
  hour: number;
}

export interface CounterCongestionTrend {
  timestamp: string;
  counterQueues: Record<string, number>;
}

export interface CounterEfficiency {
  counterName: string;
  avgServiceTime: number;
  totalServed: number;
  avgWaitTime: number;
  peakWaitTime: number;
  efficiency: number;
}

export interface TodaysVisitors {
  total: number;
  sinceTime: string;
  lastHour: number;
  percentageChange: number;
  trend: 'up' | 'down';
}

export interface AvgDwellTime {
  minutes: number;
  seconds: number;
  totalSeconds: number;
  formatted: string;
  percentageChange: number;
  trend: 'up' | 'down';
  note: string;
}

export interface PeakSlot {
  time: string;
  type: string;
  occupancy: number;
}

export interface PeakHours {
  currentStatus: string;
  nextPeak: string;
  peakSlots: PeakSlot[];
  highestPeak: string;
  averagePeakOccupancy: number;
}

export interface DashboardData {
  occupancyStatus: OccupancyStatus;
  flowData: FlowData[];
  counterStatus: CounterStatus[];
  dwellTimeData: DwellTimeData[];
  footfallComparison: FootfallComparison[];
  occupancyTrend: OccupancyTrend[];
  counterCongestionTrend: CounterCongestionTrend[];
  counterEfficiency: CounterEfficiency[];
  todaysVisitors: TodaysVisitors;
  avgDwellTime: AvgDwellTime;
  peakHours: PeakHours;
  lastUpdated: string;
}

export interface EnhancedCongestionData {
  timeRange: { start: string; end: string };
  timeFilter: string;
  totalTimeBuckets: number;
  congestionTrend: Array<{
    timestamp: string;
    counterStats: {
      [counterName: string]: {
        maxQueue: number;
        avgQueue: number;
        minQueue: number;
        dataPoints: number;
        status: 'LIGHT' | 'MODERATE' | 'HEAVY';
      };
    };
  }>;
  timestamp: string;
}

// ==================== DATA TRANSFORMERS ====================

function calculateWaitTime(queueLength: number): number {
  if (queueLength >= 4 && queueLength <= 7) {
    return 5;
  } else if (queueLength >= 8 && queueLength <= 11) {
    return 10;
  } else if (queueLength > 11) {
    return 15;
  }
  return 0;
}

function transformCounterStatus(backendCounters: any[]): CounterStatus[] {
  if (!Array.isArray(backendCounters)) return [];

  return backendCounters.map(counter => {
    const queueLength = counter.queueLength || 0;
    let waitTime = counter.waitTime || counter.estimatedWaitTime || counter.waiting_time_min;
    
    if (waitTime === undefined || waitTime === null) {
      waitTime = calculateWaitTime(queueLength);
    }
    
    return {
      counterName: normalizeCounterName(counter.counterName),
      queueLength,
      waitTime: Math.round(waitTime),
      congestionLevel: (counter.congestionLevel || 'LOW') as 'LOW' | 'MEDIUM' | 'HIGH',
      serviceStatus: counter.serviceStatus || 'OPEN',
      lastUpdated: counter.lastUpdated || new Date().toISOString(),
    };
  });
}

function transformDwellTimeData(backendData: any[]): DwellTimeData[] {
  if (!Array.isArray(backendData)) {
    console.warn('⚠️ Dwell time data is not an array:', backendData);
    return [];
  }

  console.log('📊 Raw dwell time data from API:', backendData);

  const transformed = backendData.map(item => ({
    timeRange: item.timeRange || '0-10 min',
    count: item.count || 0,
    percentage: item.percentage || 0,
  }));

  console.log('✅ Transformed dwell time data:', transformed);
  
  return transformed;
}

function transformCounterCongestionTrend(backendData: any[]): CounterCongestionTrend[] {
  if (!Array.isArray(backendData)) return [];

  return backendData.map(item => {
    const normalizedQueues: Record<string, number> = {};
    
    if (item.counterQueues) {
      Object.entries(item.counterQueues).forEach(([counterName, value]) => {
        const normalizedName = normalizeCounterName(counterName);
        normalizedQueues[normalizedName] = value as number;
      });
    }

    return {
      timestamp: item.timestamp,
      counterQueues: normalizedQueues,
    };
  });
}

function transformCounterEfficiency(backendData: any[]): CounterEfficiency[] {
  if (!Array.isArray(backendData)) return [];

  return backendData.map(counter => ({
    counterName: normalizeCounterName(counter.counterName),
    avgServiceTime: counter.avgServiceTime || counter.avgDwell || 0,
    totalServed: counter.totalServed || counter.totalInflow || 0,
    avgWaitTime: counter.avgWaitTime || counter.avgWait || 0,
    peakWaitTime: counter.peakWaitTime || counter.maxWait || 0,
    efficiency: counter.efficiency || calculateEfficiency(counter),
  }));
}

function calculateEfficiency(counter: any): number {
  const avgWait = counter.avgWaitTime || counter.avgWait || 0;
  const totalServed = counter.totalServed || counter.totalInflow || 0;
  
  const waitScore = Math.max(0, 100 - (avgWait * 5));
  const throughputScore = Math.min(100, (totalServed / 10) * 20);
  
  return Math.round((waitScore * 0.6 + throughputScore * 0.4));
}

function transformDashboardData(backendData: any): DashboardData {
  console.log('🔄 Transforming dashboard data...');
  
  return {
    occupancyStatus: backendData.occupancyStatus || {
      currentOccupancy: 0,
      capacity: 728,
      occupancyPercentage: 0,
      congestionLevel: 'LOW',
      timestamp: new Date().toISOString(),
    },
    flowData: backendData.flowData || [],
    counterStatus: transformCounterStatus(backendData.counterStatus || []),
    dwellTimeData: transformDwellTimeData(backendData.dwellTimeData || []),
    footfallComparison: backendData.footfallComparison || [],
    occupancyTrend: backendData.occupancyTrend || [],
    counterCongestionTrend: transformCounterCongestionTrend(backendData.counterCongestionTrend || []),
    counterEfficiency: transformCounterEfficiency(backendData.counterEfficiency || []),
    todaysVisitors: backendData.todaysVisitors || {
      total: 0,
      sinceTime: '00:00',
      lastHour: 0,
      percentageChange: 0,
      trend: 'up',
    },
    avgDwellTime: backendData.avgDwellTime || {
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      formatted: '0m 0s',
      percentageChange: 0,
      trend: 'down',
      note: 'No data available',
    },
    peakHours: backendData.peakHours || {
      currentStatus: 'Off-Peak',
      nextPeak: '12:00 PM',
      peakSlots: [],
      highestPeak: '12:00 PM',
      averagePeakOccupancy: 0,
    },
    lastUpdated: backendData.lastUpdated || new Date().toISOString(),
  };
}

// ==================== API SERVICE ====================

export class CafeteriaApiService {
  
  static async getDashboardData(
    tenantCode: string,
    cafeteriaCode: string,
    timeFilter: 'daily' | 'weekly' | 'monthly' = 'daily',
    timeRange?: number
  ): Promise<DashboardData> {
    try {
      const params: any = { timeFilter };
      if (timeRange) params.timeRange = timeRange;

      console.log('📡 Fetching dashboard data:', { tenantCode, cafeteriaCode, params });

      const response = await apiClient.get(
        `/cafeteria/dashboard/${tenantCode}/${cafeteriaCode}`,
        { params }
      );
      
      console.log('📥 Raw API response:', response.data);
      
      const transformed = transformDashboardData(response.data);
      
      console.log('✅ Transformed dashboard data:', transformed);
      
      return transformed;
    } catch (error: any) {
      console.error('❌ Dashboard API Error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch dashboard data');
    }
  }

  static async getOccupancyStatus(
    tenantCode: string,
    cafeteriaCode: string
  ): Promise<{ occupancyStatus: OccupancyStatus; timestamp: string }> {
    try {
      const response = await apiClient.get(
        `/cafeteria/dashboard/${tenantCode}/${cafeteriaCode}/occupancy`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('Occupancy Status API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch occupancy status');
    }
  }

  static async getCounterStatus(
    tenantCode: string,
    cafeteriaCode: string
  ): Promise<{ counters: CounterStatus[]; timestamp: string }> {
    try {
      const response = await apiClient.get(
        `/cafeteria/dashboard/${tenantCode}/${cafeteriaCode}/counters`
      );
      
      return {
        counters: transformCounterStatus(response.data.counters || []),
        timestamp: response.data.timestamp,
      };
    } catch (error: any) {
      console.error('Counter Status API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch counter status');
    }
  }

  static async getKPIs(
    tenantCode: string,
    cafeteriaCode: string
  ): Promise<{
    occupancyStatus: OccupancyStatus;
    todaysVisitors: TodaysVisitors;
    avgDwellTime: AvgDwellTime;
    peakHours: PeakHours;
    timestamp: string;
  }> {
    try {
      const response = await apiClient.get(
        `/cafeteria/dashboard/${tenantCode}/${cafeteriaCode}/kpis`
      );
      
      return response.data;
    } catch (error: any) {
      console.error('KPIs API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch KPIs');
    }
  }

  static async getAnalytics(
    tenantCode: string,
    cafeteriaCode: string,
    timeFilter: 'daily' | 'weekly' | 'monthly' = 'daily',
    timeRange?: number
  ): Promise<{
    flowData: FlowData[];
    dwellTimeData: DwellTimeData[];
    occupancyTrend: OccupancyTrend[];
    counterCongestionTrend: CounterCongestionTrend[];
    footfallComparison: FootfallComparison[];
    counterEfficiency: CounterEfficiency[];
    timestamp: string;
  }> {
    try {
      const params: any = { timeFilter };
      if (timeRange) params.timeRange = timeRange;

      console.log('📡 Fetching analytics data:', { tenantCode, cafeteriaCode, params });

      const response = await apiClient.get(
        `/cafeteria/dashboard/${tenantCode}/${cafeteriaCode}/analytics`,
        { params }
      );
      
      console.log('📥 Raw analytics response:', response.data);
      
      const transformed = {
        ...response.data,
        dwellTimeData: transformDwellTimeData(response.data.dwellTimeData || []),
        counterCongestionTrend: transformCounterCongestionTrend(response.data.counterCongestionTrend || []),
        counterEfficiency: transformCounterEfficiency(response.data.counterEfficiency || []),
      };
      
      console.log('✅ Transformed analytics data:', transformed);
      
      return transformed;
    } catch (error: any) {
      console.error('❌ Analytics API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }

  // In CafeteriaApiService.ts - Update the interface around line 110

static async getDwellTimeByCounter(
  tenantCode: string,
  cafeteriaCode: string,
  counterName: string,
  timeFilter: 'daily' | 'weekly' | 'monthly' = 'daily',
  timeRange?: number
): Promise<{
  counterName: string;
  dwellTimeData: DwellTimeData[];
  stats: {
    totalVisitors: number;
    avgWaitTime: number;
    minWaitTime: number;
    maxWaitTime: number;
    mostCommonWaitTime: string;
    peakQueueLength: number;  // ✅ Made required, not optional
  };
  timestamp: string;
}> {
  try {
    const params: any = { timeFilter };
    if (timeRange) params.timeRange = timeRange;

    console.log('📡 Fetching counter-specific dwell time:', { tenantCode, cafeteriaCode, counterName, params });

    const response = await apiClient.get(
      `/cafeteria/dashboard/${tenantCode}/${cafeteriaCode}/dwell-time/${encodeURIComponent(counterName)}`,
      { params }
    );

    console.log('📥 Raw counter dwell time response:', response.data);
    console.log('🔍 Peak queue length from API:', response.data.stats?.peakQueueLength);

    const transformed = {
      counterName: response.data.counterName,
      dwellTimeData: transformDwellTimeData(response.data.dwellTimeData || []),
      stats: {
        totalVisitors: response.data.stats?.totalVisitors || 0,
        avgWaitTime: response.data.stats?.avgWaitTime || 0,
        minWaitTime: response.data.stats?.minWaitTime || 0,
        maxWaitTime: response.data.stats?.maxWaitTime || 0,
        mostCommonWaitTime: response.data.stats?.mostCommonWaitTime || 'No data',
        peakQueueLength: response.data.stats?.peakQueueLength || 0,
      },
      timestamp: response.data.timestamp
    };

    console.log('✅ Transformed counter dwell time data:', transformed);
    console.log('✅ Peak queue length after transform:', transformed.stats.peakQueueLength);

    return transformed;
  } catch (error: any) {
    console.error('❌ Counter Dwell Time API Error:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch counter dwell time');
  }
}

  static async getEnhancedCongestion(
    tenantCode: string,
    cafeteriaCode: string,
    timeFilter: 'daily' | 'weekly' | 'monthly' = 'daily',
    timeRange?: number
  ): Promise<EnhancedCongestionData> {
    try {
      const params: any = { timeFilter };
      if (timeRange) params.timeRange = timeRange;

      console.log('📡 Fetching enhanced congestion:', { tenantCode, cafeteriaCode, params });

      const response = await apiClient.get(
        `/cafeteria/dashboard/${tenantCode}/${cafeteriaCode}/congestion/enhanced`,
        { params }
      );

      console.log('📥 Enhanced congestion response:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('❌ Enhanced Congestion API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch enhanced congestion');
    }
  }

  static async getAvailableCounters(
    tenantCode: string,
    cafeteriaCode: string
  ): Promise<string[]> {
    try {
      console.log('📡 Fetching available counters:', { tenantCode, cafeteriaCode });

      const response = await apiClient.get(
        `/cafeteria/dashboard/${tenantCode}/${cafeteriaCode}/counters/list`
      );

      console.log('📥 Available counters response:', response.data);

      return response.data.counters || [];
    } catch (error: any) {
      console.error('❌ Available Counters API Error:', error);
      return [];
    }
  }

  static async publishTestData(deviceId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`/cafeteria/dashboard/test/${deviceId}`);
      return response.data;
    } catch (error: any) {
      console.error('Test Data API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to publish test data');
    }
  }

  static async getMqttStatus(): Promise<{ connected: boolean; status: string }> {
    try {
      const response = await apiClient.get('/cafeteria/dashboard/mqtt/status');
      return response.data;
    } catch (error: any) {
      console.error('MQTT Status API Error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get MQTT status');
    }
  }

  static async healthCheck(): Promise<{ status: string; service: string; timestamp: string }> {
    try {
      const response = await apiClient.get('/cafeteria/dashboard/health');
      return response.data;
    } catch (error: any) {
      console.error('Health Check API Error:', error);
      throw new Error(error.response?.data?.message || 'Health check failed');
    }
  }
}

// ==================== REACT HOOKS ====================

export function useDashboardData(
  tenantCode: string,
  cafeteriaCode: string,
  timeFilter: 'daily' | 'weekly' | 'monthly' = 'daily',
  timeRange?: number,
  refreshInterval: number = 30000
) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const dashboardData = await CafeteriaApiService.getDashboardData(
        tenantCode,
        cafeteriaCode,
        timeFilter,
        timeRange
      );
      setData(dashboardData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [tenantCode, cafeteriaCode, timeFilter, timeRange]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}

export function useOccupancyStatus(
  tenantCode: string,
  cafeteriaCode: string,
  refreshInterval: number = 10000
) {
  const [status, setStatus] = useState<OccupancyStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await CafeteriaApiService.getOccupancyStatus(tenantCode, cafeteriaCode);
      setStatus(response.occupancyStatus);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch occupancy status');
    } finally {
      setLoading(false);
    }
  }, [tenantCode, cafeteriaCode]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, refreshInterval]);

  return { status, loading, error, refetch: fetchStatus };
}

export function useCounterStatus(
  tenantCode: string,
  cafeteriaCode: string,
  refreshInterval: number = 15000
) {
  const [counters, setCounters] = useState<CounterStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounters = useCallback(async () => {
    try {
      const response = await CafeteriaApiService.getCounterStatus(tenantCode, cafeteriaCode);
      setCounters(response.counters);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch counter status');
    } finally {
      setLoading(false);
    }
  }, [tenantCode, cafeteriaCode]);

  useEffect(() => {
    fetchCounters();
    const interval = setInterval(fetchCounters, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchCounters, refreshInterval]);

  return { counters, loading, error, refetch: fetchCounters };
}

export default CafeteriaApiService;