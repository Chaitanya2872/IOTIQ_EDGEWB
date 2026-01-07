// src/api/iaqApi.ts
import { apiClient } from './config';
import type { IAQSensor } from './types';

export const iaqApi = {
  // Get sensor data by floor
  getSensorDataByFloor: async (floor: number): Promise<IAQSensor[]> => {
    const response = await apiClient.get(`/sensors/floor/${floor}`);
    return response.data;
  },

  // Get sensor data by floor and type
  getSensorDataByFloorAndType: async (floor: number, type: string): Promise<IAQSensor[]> => {
    const response = await apiClient.get(`/sensors/floor/${floor}/type/${type}`);
    return response.data;
  },

  // Get latest sensor data for device
  getLatestByDeviceId: async (deviceId: string): Promise<IAQSensor> => {
    const response = await apiClient.get(`/sensors/device/${deviceId}/latest`);
    return response.data;
  },

  // Get recent sensor data for device
  getRecentSensorData: async (deviceId: string, hours: number = 24): Promise<IAQSensor[]> => {
    const response = await apiClient.get(`/sensors/device/${deviceId}/recent`, {
      params: { hours }
    });
    return response.data;
  },

  // Get sensor data by location
  getSensorDataByLocation: async (locationId: number): Promise<IAQSensor[]> => {
    const response = await apiClient.get(`/sensors/location/${locationId}`);
    return response.data;
  },

  // Get recent sensor data by location
  getRecentSensorDataByLocation: async (locationId: number, hours: number = 24): Promise<IAQSensor[]> => {
    const response = await apiClient.get(`/sensors/location/${locationId}/recent`, {
      params: { hours }
    });
    return response.data;
  },

  // Get average value by type and floor
  getAverageValue: async (type: string, floor: number, hours: number = 24) => {
    const response = await apiClient.get('/sensors/average', {
      params: { type, floor, hours }
    });
    return response.data;
  },

  // Get latest for all devices
  getLatestForAllDevices: async (): Promise<IAQSensor[]> => {
    const response = await apiClient.get('/sensors/latest/all');
    return response.data;
  },

  // Get sensor data by type
  getSensorDataByType: async (type: string): Promise<IAQSensor[]> => {
    const response = await apiClient.get(`/sensors/type/${type}`);
    return response.data;
  },

  // Get recent sensor data by type
  getRecentSensorDataByType: async (type: string, hours: number = 24): Promise<IAQSensor[]> => {
    const response = await apiClient.get(`/sensors/type/${type}/recent`, {
      params: { hours }
    });
    return response.data;
  }
};

export default iaqApi;