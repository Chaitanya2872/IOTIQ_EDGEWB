// src/api/cafeteriaApi.ts - Enhanced with Analytics Endpoints
import axios from 'axios';
import type { 
  CafeteriaCounter, 
  CafeteriaLatestResponse, 
  CafeteriaStatistics,
  ApiResponse 
} from './types';

const apiClient = axios.create({
  baseURL: '/api/iot',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for HTML detection
apiClient.interceptors.response.use(
  (response) => {
    const contentType = response.headers['content-type'];
    const responseData = response.data;
    
    if (
      (contentType && contentType.includes('text/html')) ||
      (typeof responseData === 'string' && (responseData.trim().startsWith('<!DOCTYPE') || responseData.trim().startsWith('<html')))
    ) {
      throw new Error(`API endpoint not found: ${response.config.url}. Received HTML instead of JSON.`);
    }
    
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const cafeteriaApi = {
  // ==================== EXISTING ENDPOINTS ====================
  
  fetchAndSaveFromNodeJs: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/cafeteria/node/cafe');
    return response.data;
  },

  getLatestQueueStatus: async (): Promise<CafeteriaLatestResponse> => {
    const response = await apiClient.get('/cafeteria/queue/latest');
    return response.data;
  },

  getCounterStatus: async (counterName: string): Promise<CafeteriaCounter> => {
    const response = await apiClient.get(`/cafeteria/counter/${counterName}`);
    return response.data;
  },

  getAllCountersStatus: async (): Promise<CafeteriaCounter[]> => {
    const response = await apiClient.get('/cafeteria/status');
    return response.data;
  },

  getHistoricalData: async (hours: number = 24) => {
    const response = await apiClient.get('/cafeteria/queue/history', {
      params: { hours }
    });
    return response.data;
  },

  getRecentByCounter: async (counterName: string, hours: number = 24): Promise<CafeteriaCounter[]> => {
    const response = await apiClient.get(`/cafeteria/counter/${counterName}/recent`, {
      params: { hours }
    });
    return response.data;
  },

  getCounterStatistics: async (counterName: string, hours: number = 24): Promise<CafeteriaStatistics> => {
    const response = await apiClient.get(`/cafeteria/counter/${counterName}/stats`, {
      params: { hours }
    });
    return response.data;
  },

  getActiveAlerts: async (): Promise<CafeteriaCounter[]> => {
    try {
      const response = await apiClient.get('/cafeteria/alerts');
      const data = response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  },

  getPeakHours: async (hours: number = 24) => {
    const res = await apiClient.get('/cafeteria/analytics/peak-hours', {
      params: { hours }
    });
    return res.data;
  },

  getHourlyTraffic: async (hours: number = 24) => {
    const res = await apiClient.get('/cafeteria/analytics/hourly-traffic', {
      params: { hours }
    });
    return res.data;
  },

  getWeeklyTraffic: async () => {
    const res = await apiClient.get('/cafeteria/analytics/weekly');
    return res.data;
  },

  getDailySummary: async (days: number = 7) => {
    const res = await apiClient.get('/cafeteria/analytics/daily-summary', {
      params: { days }
    });
    return res.data;
  },

  getDataByDate: async (date: string) => {
    const response = await apiClient.get('/cafeteria/data/by-date', {
      params: { date }
    });
    return response.data;
  },

  getDataByDateAndCounter: async (counterName: string, date: string) => {
    const response = await apiClient.get(`/cafeteria/data/by-date/${counterName}`, {
      params: { date }
    });
    return response.data;
  },

  getHourlyData: async (date: string) => {
    const response = await apiClient.get('/cafeteria/data/hourly', {
      params: { date }
    });
    return response.data;
  },

  getHourlyDataByCounter: async (counterName: string, date: string) => {
    const response = await apiClient.get(`/cafeteria/data/hourly/${counterName}`, {
      params: { date }
    });
    return response.data;
  },

  getDataByDateRange: async (startDate: string, endDate: string) => {
    const response = await apiClient.get('/cafeteria/data/date-range', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getDailySummaryForRange: async (startDate: string, endDate: string) => {
    const response = await apiClient.get('/cafeteria/data/daily-summary', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  getDataByTimestamp: async (timestamp: string, minutesRange: number = 5) => {
    const response = await apiClient.get('/cafeteria/data/by-timestamp', {
      params: { timestamp, minutesRange }
    });
    return response.data;
  },

  getDataByHour: async (date: string, hour: number) => {
    const response = await apiClient.get('/cafeteria/data/by-hour', {
      params: { date, hour }
    });
    return response.data;
  },

  getAllRecords: async (from?: string, to?: string, counterName?: string) => {
    const response = await apiClient.get('/cafeteria/data/all-records', {
      params: { from, to, counterName }
    });
    return response.data;
  },

  testConnection: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/cafeteria/test-connection');
    return response.data;
  },

  // ==================== NEW ANALYTICS ENDPOINTS ====================

  /**
   * Get smart insights for a specific date
   * GET /api/cafeteria/insights/smart?date=2024-12-30
   */
  getSmartInsights: async (date?: string) => {
    const response = await apiClient.get('/cafeteria/insights/smart', {
      params: { date }
    });
    return response.data;
  },

  /**
   * Get wait time trend analysis
   * GET /api/cafeteria/analytics/wait-time-trend?startDate=2024-12-23&endDate=2024-12-30
   */
  getWaitTimeTrend: async (startDate?: string, endDate?: string) => {
    const response = await apiClient.get('/cafeteria/analytics/wait-time-trend', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  /**
   * Get wait time by meal session
   * GET /api/cafeteria/analytics/wait-time-by-session?date=2024-12-30
   */
  getWaitTimeBySession: async (date?: string) => {
    const response = await apiClient.get('/cafeteria/analytics/wait-time-by-session', {
      params: { date }
    });
    return response.data;
  },

  /**
   * Get traffic pattern analysis (weekday vs weekend, peak days)
   * GET /api/cafeteria/analytics/traffic-pattern?days=30
   */
  getTrafficPattern: async (days: number = 30) => {
    const response = await apiClient.get('/cafeteria/analytics/traffic-pattern', {
      params: { days }
    });
    return response.data;
  },

  /**
   * Get weekly summary for all counters
   * GET /api/cafeteria/analytics/weekly-summary?weeks=4
   */
  getWeeklySummaryNew: async (weeks: number = 4) => {
    const response = await apiClient.get('/cafeteria/analytics/weekly-summary', {
      params: { weeks }
    });
    return response.data;
  },

  /**
   * Get peak days analysis
   * GET /api/cafeteria/analytics/peak-days?days=7
   */
  getPeakDaysAnalysis: async (days: number = 7) => {
    const response = await apiClient.get('/cafeteria/analytics/peak-days', {
      params: { days }
    });
    return response.data;
  },

  /**
   * Get comprehensive dashboard data (all analytics in one call)
   * GET /api/cafeteria/analytics/dashboard?date=2024-12-30
   */
  getDashboardData: async (date?: string) => {
    const response = await apiClient.get('/cafeteria/analytics/dashboard', {
      params: { date }
    });
    return response.data;
  },

  /**
   * Get hourly breakdown for today
   * GET /api/cafeteria/analytics/today-hourly
   */
  getTodayHourly: async () => {
    const response = await apiClient.get('/cafeteria/analytics/today-hourly');
    return response.data;
  },

  /**
   * Get meal session performance comparison
   * GET /api/cafeteria/analytics/session-comparison?days=7
   */
  getSessionComparison: async (days: number = 7) => {
    const response = await apiClient.get('/cafeteria/analytics/session-comparison', {
      params: { days }
    });
    return response.data;
  }
};

export default cafeteriaApi;