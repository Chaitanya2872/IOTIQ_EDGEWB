// src/api/restroomApi.ts
import { apiClient } from './config';

export interface OdorSensorData {
  deviceId: string;
  deviceType: string;
  odorIndex: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  quality: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' | 'SEVERE';
  lastUpdate: string;
  location: {
    id: number;
    name: string;
    floor: number;
    zone: string;
  };
}

export interface RestroomData {
  id: string;
  restroomId: string;
  floor: number;
  zone: string;
  location: string;
  occupied: boolean;
  occupancyStatus: 'AVAILABLE' | 'OCCUPIED';
  cleaningStatus: 'CLEAN' | 'NEEDS_CLEANING' | 'CLEANING_IN_PROGRESS';
  usageCount: number;
  lastCleaned: string;
  timestamp: string;
  odorData?: OdorSensorData;
}

export const restroomApi = {
  // Get odor sensor status for all restrooms
  getOdorSensorStatus: async (): Promise<OdorSensorData[]> => {
    const response = await apiClient.get('/sensors/odor/status');
    return response.data;
  },

  // Get odor sensor data by device
  getOdorSensorByDevice: async (deviceId: string): Promise<OdorSensorData> => {
    const response = await apiClient.get(`/sensors/device/${deviceId}/latest`);
    return response.data;
  },

  // Get odor sensors by floor
  getOdorSensorsByFloor: async (floor: number): Promise<OdorSensorData[]> => {
    const response = await apiClient.get(`/sensors/floor/${floor}/type/ODOR_INDEX`);
    return response.data;
  },

  // Get recent odor data for device
  getRecentOdorData: async (deviceId: string, hours: number = 24): Promise<OdorSensorData[]> => {
    const response = await apiClient.get(`/sensors/device/${deviceId}/recent`, {
      params: { hours }
    });
    return response.data;
  },

  // Get restroom occupancy data (if you have this endpoint)
  getRestroomOccupancy: async (): Promise<RestroomData[]> => {
    try {
      const response = await apiClient.get('/restrooms/occupancy');
      return response.data;
    } catch (error) {
      console.warn('Restroom occupancy endpoint not available, using odor data only');
      return [];
    }
  },

  // Get restroom by floor
  getRestroomsByFloor: async (floor: number): Promise<RestroomData[]> => {
    try {
      const response = await apiClient.get(`/restrooms/floor/${floor}`);
      return response.data;
    } catch (error) {
      console.warn('Restroom floor endpoint not available');
      return [];
    }
  },

  // Get restroom stats
  getRestroomStats: async () => {
    try {
      const response = await apiClient.get('/restrooms/stats');
      return response.data;
    } catch (error) {
      console.warn('Restroom stats endpoint not available');
      return null;
    }
  }
};

export default restroomApi;