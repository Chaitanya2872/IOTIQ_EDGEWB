// src/api/sensorsHub.ts - Optimized API integration for Sensors Hub

export interface Location {
  id?: number;
  name: string;
  type: 'CAFETERIA' | 'IAQ' | 'RESTROOM' | 'ENERGY';
  floor: number;
  zone: string;
  building?: string;
  description?: string;
  active?: boolean;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeviceMapping {
  id?: number;
  deviceId: string;
  locationId: number;
  locationName?: string;
  floor?: number;
  zone?: string;
  deviceType: 'IAQ_SENSOR' | 'ODOR_SENSOR' | 'PEOPLE_COUNTING' | 'ENERGY_METER';
  description?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SensorStatus {
  deviceId: string;
  locationId: number;
  locationName: string;
  floor: number;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING' | 'CRITICAL';
  lastUpdate?: Date;
  isOnline: boolean;
  quality?: string;
}

export interface IAQData {
  deviceId: string;
  hours: number;
  data: {
    temperature?: Array<{ timestamp: Date; value: number; quality: string }>;
    humidity?: Array<{ timestamp: Date; value: number; quality: string }>;
    co2?: Array<{ timestamp: Date; value: number; quality: string }>;
    pm2_5?: Array<{ timestamp: Date; value: number; quality: string }>;
    pm10?: Array<{ timestamp: Date; value: number; quality: string }>;
  };
}

export interface OdorData {
  deviceId: string;
  hours: number;
  data: {
    odor_index?: Array<{ timestamp: Date; value: number; quality: string }>;
    nh3?: Array<{ timestamp: Date; value: number; quality: string }>;
    h2s?: Array<{ timestamp: Date; value: number; quality: string }>;
    battery?: Array<{ timestamp: Date; value: number }>;
    temperature?: Array<{ timestamp: Date; value: number }>;
    humidity?: Array<{ timestamp: Date; value: number }>;
  };
}

// Configuration - Use VITE_API_IOT_BASE_URL from .env
const BASE_URL = (() => {
  const envURL = import.meta.env.VITE_API_IOT_BASE_URL;
  
  if (envURL) {
    // Append /api if not already present
    const baseURL = envURL.endsWith('/api') ? envURL : `${envURL}/api`;
    console.log('✅ API BASE URL:', baseURL);
    return baseURL;
  }
  
  // Fallback
  const fallbackURL = 'http://localhost:8085/api';
  console.warn('⚠️ VITE_API_IOT_BASE_URL not set, using:', fallbackURL);
  return fallbackURL;
})();

// Authentication utilities
const getAuthToken = (): string | null => {
  const token = localStorage.getItem('accessToken');
  return token && token !== 'undefined' ? token : null;
};

const getTokenType = (): string => {
  return localStorage.getItem('tokenType') || 'Bearer';
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const tokenType = getTokenType();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `${tokenType} ${token}`;
  }
  
  return headers;
};

// HTTP request wrapper with optimized error handling and request timeout
async function authenticatedFetch(url: string, options: RequestInit & { timeout?: number } = {}): Promise<Response> {
  const headers = getAuthHeaders();
  // Default timeout of 10s can be overridden by passing { timeout: ms } in options
  const timeoutMs = (options as any).timeout ?? 10000;
  const controller = new AbortController();
  const signal = controller.signal;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      signal,
    });

    clearTimeout(timer);

    if (response.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }

    if (response.status === 403) {
      throw new Error('You do not have permission to perform this action.');
    }

    if (response.status === 404) {
      throw new Error('The requested resource was not found.');
    }

    if (response.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }

    return response;
  } catch (error: any) {
    clearTimeout(timer);

    if (error && error.name === 'AbortError') {
      throw new Error('Request timed out. The server did not respond in time.');
    }

    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection and backend server.');
    }

    throw error;
  }
} 

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    return await response.json();
  }
  
  throw new Error('Invalid response format from server');
}

// ============================================================================
// LOCATIONS API
// ============================================================================

export const LocationsAPI = {
  getAll: async (): Promise<Location[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/locations`);
    if (!res.ok) throw new Error('Failed to fetch locations');
    return parseResponse<Location[]>(res);
  },

  getById: async (id: number): Promise<Location> => {
    const res = await authenticatedFetch(`${BASE_URL}/locations/${id}`);
    if (!res.ok) throw new Error(`Location not found: ${id}`);
    return parseResponse<Location>(res);
  },

  getByType: async (type: Location['type']): Promise<Location[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/locations/type/${type}`);
    if (!res.ok) throw new Error(`Failed to fetch locations by type: ${type}`);
    return parseResponse<Location[]>(res);
  },

  getByFloor: async (floor: number): Promise<Location[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/locations/floor/${floor}`);
    if (!res.ok) throw new Error(`Failed to fetch locations by floor: ${floor}`);
    return parseResponse<Location[]>(res);
  },

  getByFloorAndZone: async (floor: number, zone: string): Promise<Location[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/locations/floor/${floor}/zone/${zone}`);
    if (!res.ok) throw new Error(`Failed to fetch locations by floor ${floor} and zone ${zone}`);
    return parseResponse<Location[]>(res);
  },

  getActive: async (): Promise<Location[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/locations/active`);
    if (!res.ok) throw new Error('Failed to fetch active locations');
    return parseResponse<Location[]>(res);
  },

  getActiveByType: async (type: Location['type']): Promise<Location[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/locations/active/type/${type}`);
    if (!res.ok) throw new Error(`Failed to fetch active locations by type: ${type}`);
    return parseResponse<Location[]>(res);
  },

  getActiveFloors: async (): Promise<number[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/locations/floors`);
    if (!res.ok) throw new Error('Failed to fetch active floors');
    return parseResponse<number[]>(res);
  },

  create: async (data: Omit<Location, 'id'>): Promise<Location> => {
    const res = await authenticatedFetch(`${BASE_URL}/locations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create location');
    return parseResponse<Location>(res);
  },

  update: async (id: number, data: Partial<Location>): Promise<Location> => {
    const res = await authenticatedFetch(`${BASE_URL}/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update location');
    return parseResponse<Location>(res);
  },

  deactivate: async (id: number): Promise<Location> => {
    const res = await authenticatedFetch(`${BASE_URL}/locations/${id}/deactivate`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to deactivate location');
    return parseResponse<Location>(res);
  },

  delete: async (id: number): Promise<void> => {
    const res = await authenticatedFetch(`${BASE_URL}/locations/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete location');
  },
};

// ============================================================================
// DEVICE MAPPINGS API
// ============================================================================

export const DeviceMappingsAPI = {
  getAll: async (): Promise<DeviceMapping[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/device-mappings`);
    if (!res.ok) throw new Error('Failed to fetch device mappings');
    return parseResponse<DeviceMapping[]>(res);
  },

  getByDeviceId: async (deviceId: string): Promise<DeviceMapping> => {
    const res = await authenticatedFetch(`${BASE_URL}/device-mappings/device/${deviceId}`);
    if (!res.ok) throw new Error(`Device mapping not found: ${deviceId}`);
    return parseResponse<DeviceMapping>(res);
  },

  getByLocation: async (locationId: number): Promise<DeviceMapping[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/device-mappings/location/${locationId}`);
    if (!res.ok) throw new Error(`Failed to fetch mappings for location: ${locationId}`);
    return parseResponse<DeviceMapping[]>(res);
  },

  getByDeviceType: async (deviceType: DeviceMapping['deviceType']): Promise<DeviceMapping[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/device-mappings/type/${deviceType}`);
    if (!res.ok) throw new Error(`Failed to fetch mappings by device type: ${deviceType}`);
    return parseResponse<DeviceMapping[]>(res);
  },

  getActive: async (): Promise<DeviceMapping[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/device-mappings/active`);
    if (!res.ok) throw new Error('Failed to fetch active device mappings');
    return parseResponse<DeviceMapping[]>(res);
  },

  create: async (data: Omit<DeviceMapping, 'id'>): Promise<DeviceMapping> => {
    const res = await authenticatedFetch(`${BASE_URL}/device-mappings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create device mapping');
    return parseResponse<DeviceMapping>(res);
  },

  update: async (id: number, data: Partial<DeviceMapping>): Promise<DeviceMapping> => {
    const res = await authenticatedFetch(`${BASE_URL}/device-mappings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update device mapping');
    return parseResponse<DeviceMapping>(res);
  },

  deactivate: async (id: number): Promise<DeviceMapping> => {
    const res = await authenticatedFetch(`${BASE_URL}/device-mappings/${id}/deactivate`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to deactivate device mapping');
    return parseResponse<DeviceMapping>(res);
  },

  delete: async (id: number): Promise<void> => {
    const res = await authenticatedFetch(`${BASE_URL}/device-mappings/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete device mapping');
  },
};

// ============================================================================
// IAQ API (Uses /sensors endpoints)
// ============================================================================

export const IAQAPI = {
  getByDevice: async (deviceId: string, hours: number = 24): Promise<IAQData> => {
    const res = await authenticatedFetch(`${BASE_URL}/sensors/device/${deviceId}/recent?hours=${hours}`);
    if (!res.ok) throw new Error(`Failed to fetch IAQ data for device: ${deviceId}`);
    
    const data = await parseResponse<any[]>(res);
    
    return {
      deviceId,
      hours,
      data: {
        temperature: data.filter(d => d.type === 'TEMPERATURE').map(d => ({
          timestamp: new Date(d.timestamp),
          value: d.value,
          quality: d.quality || 'UNKNOWN'
        })),
        humidity: data.filter(d => d.type === 'HUMIDITY').map(d => ({
          timestamp: new Date(d.timestamp),
          value: d.value,
          quality: d.quality || 'UNKNOWN'
        })),
        co2: data.filter(d => d.type === 'CO2').map(d => ({
          timestamp: new Date(d.timestamp),
          value: d.value,
          quality: d.quality || 'UNKNOWN'
        })),
        pm2_5: data.filter(d => d.type === 'PM2_5').map(d => ({
          timestamp: new Date(d.timestamp),
          value: d.value,
          quality: d.quality || 'UNKNOWN'
        })),
        pm10: data.filter(d => d.type === 'PM10').map(d => ({
          timestamp: new Date(d.timestamp),
          value: d.value,
          quality: d.quality || 'UNKNOWN'
        }))
      }
    };
  },

  getAllStatus: async (): Promise<SensorStatus[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/sensors/latest/all`);
    if (!res.ok) throw new Error('Failed to fetch IAQ sensors status');
    
    const allSensors = await parseResponse<any[]>(res);
    const iaqTypes = ['TEMPERATURE', 'HUMIDITY', 'CO2', 'PM2_5', 'PM10'];
    
    return allSensors
      .filter(sensor => iaqTypes.includes(sensor.type))
      .map(sensor => ({
        deviceId: sensor.deviceId,
        locationId: sensor.locationId || 0,
        locationName: sensor.locationName || 'Unknown',
        floor: sensor.floor || 0,
        status: sensor.status || 'OFFLINE',
        lastUpdate: sensor.timestamp ? new Date(sensor.timestamp) : undefined,
        isOnline: sensor.timestamp ? (new Date().getTime() - new Date(sensor.timestamp).getTime()) < 600000 : false,
        quality: sensor.quality
      }));
  },
};

// ============================================================================
// ODOR API (Uses /sensors/odor endpoints)
// ============================================================================

export const OdorAPI = {
  getByDevice: async (deviceId: string, hours: number = 24): Promise<OdorData> => {
    const res = await authenticatedFetch(`${BASE_URL}/sensors/odor/device/${deviceId}?hours=${hours}`);
    if (!res.ok) throw new Error(`Failed to fetch odor data for device: ${deviceId}`);
    return parseResponse<OdorData>(res);
  },

  getAllStatus: async (): Promise<SensorStatus[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/sensors/odor/status`);
    if (!res.ok) throw new Error('Failed to fetch odor sensors status');
    return parseResponse<SensorStatus[]>(res);
  },
};

// ============================================================================
// COMBINED SENSOR STATUS
// ============================================================================

export const SensorStatusAPI = {
  getAll: async (): Promise<SensorStatus[]> => {
    const [iaqStatus, odorStatus] = await Promise.all([
      IAQAPI.getAllStatus().catch(() => []),
      OdorAPI.getAllStatus().catch(() => [])
    ]);
    
    return [...iaqStatus, ...odorStatus];
  },
};