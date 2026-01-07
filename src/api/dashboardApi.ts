// src/api/dashboardApi.ts
import { apiClient } from './config';
import type { DashboardOverview } from './types';

export const dashboardApi = {
  // Get overview statistics for all modules
  getOverviewStats: async (): Promise<DashboardOverview> => {
    const response = await apiClient.get('/dashboard/overview');
    return response.data;
  },

  // Get stats by floor
  getFloorStats: async (floor: number) => {
    const response = await apiClient.get(`/dashboard/floor/${floor}`);
    return response.data;
  },

  // Get stats by type
  getTypeStats: async (type: string) => {
    const response = await apiClient.get(`/dashboard/type/${type}`);
    return response.data;
  },

  // Health check
  getSystemHealth: async () => {
    const response = await apiClient.get('/dashboard/health');
    return response.data;
  }
};

export default dashboardApi;