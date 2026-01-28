import { useState, useCallback } from "react";

const API_BASE_URL = import.meta.env.VITE_DEVICE_API_BASE_URL;

export interface Device {
  id: number;
  deviceId: string;
  deviceName: string;
  location: string;
  segment: string;
  counterName: string;
  deviceType: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  firmwareVersion?: string;
  status: "Active" | "Inactive" | "Maintenance" | "Offline";
  ipAddress?: string;
  macAddress?: string;
  active: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  id: number;
  locationCode: string;
  locationName: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  active: boolean;
}

export interface Segment {
  id: number;
  segmentCode: string;
  segmentName: string;
  description?: string;
  category?: string;
  businessUnit?: string;
  department?: string;
  active: boolean;
}

export interface Counter {
  id: number;
  counterCode: string;
  counterName: string;
  description?: string;
  counterType?: string;
  measurementUnit?: string;
  currentValue: number;
  maxValue?: number;
  minValue?: number;
  active: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Generic API hook
function useApi<T>() {
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
        console.error("API Error:", err);
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

// Device API Hooks
export function useDevices() {
  const api = useApi<Device[]>();

  const fetchDevices = useCallback(async () => {
    return await api.execute("/api/devices");
  }, [api]);

  const searchDevices = useCallback(
    async (term: string) => {
      return await api.execute(
        `/api/devices/search?term=${encodeURIComponent(term)}`,
      );
    },
    [api],
  );

  const getDeviceByDeviceId = useCallback(
    async (deviceId: string) => {
      return await api.execute(`/api/devices/device-id/${deviceId}`);
    },
    [api],
  );

  const getDevicesByLocation = useCallback(
    async (locationCode: string) => {
      return await api.execute(`/api/devices/location/${locationCode}`);
    },
    [api],
  );

  const getDevicesBySegment = useCallback(
    async (segmentCode: string) => {
      return await api.execute(`/api/devices/segment/${segmentCode}`);
    },
    [api],
  );

  const getDevicesByCounter = useCallback(
    async (counterCode: string) => {
      return await api.execute(`/api/devices/counter/${counterCode}`);
    },
    [api],
  );

  return {
    ...api,
    fetchDevices,
    searchDevices,
    getDeviceByDeviceId,
    getDevicesByLocation,
    getDevicesBySegment,
    getDevicesByCounter,
  };
}

export function useDeviceOperations() {
  const api = useApi<Device>();

  const createDevice = useCallback(
    async (device: Partial<Device>) => {
      return await api.execute("/api/devices", {
        method: "POST",
        body: JSON.stringify(device),
      });
    },
    [api],
  );

  const updateDevice = useCallback(
    async (id: number, device: Partial<Device>) => {
      return await api.execute(`/api/devices/${id}`, {
        method: "PUT",
        body: JSON.stringify(device),
      });
    },
    [api],
  );

  const deleteDevice = useCallback(
    async (id: number) => {
      return await api.execute(`/api/devices/${id}`, {
        method: "DELETE",
      });
    },
    [api],
  );

  return {
    ...api,
    createDevice,
    updateDevice,
    deleteDevice,
  };
}

// Location API Hooks
export function useLocations() {
  const api = useApi<Location[]>();

  const fetchLocations = useCallback(async () => {
    return await api.execute("/api/locations");
  }, [api]);

  const getLocation = useCallback(
    async (id: number) => {
      return await api.execute(`/api/locations/${id}`);
    },
    [api],
  );

  return {
    ...api,
    fetchLocations,
    getLocation,
  };
}

export function useLocationOperations() {
  const api = useApi<Location>();

  const createLocation = useCallback(
    async (location: Partial<Location>) => {
      return await api.execute("/api/locations", {
        method: "POST",
        body: JSON.stringify(location),
      });
    },
    [api],
  );

  const updateLocation = useCallback(
    async (id: number, location: Partial<Location>) => {
      return await api.execute(`/api/locations/${id}`, {
        method: "PUT",
        body: JSON.stringify(location),
      });
    },
    [api],
  );

  const deleteLocation = useCallback(
    async (id: number) => {
      return await api.execute(`/api/locations/${id}`, {
        method: "DELETE",
      });
    },
    [api],
  );

  return {
    ...api,
    createLocation,
    updateLocation,
    deleteLocation,
  };
}

// Segment API Hooks
export function useSegments() {
  const api = useApi<Segment[]>();

  const fetchSegments = useCallback(async () => {
    return await api.execute("/api/segments");
  }, [api]);

  const getSegment = useCallback(
    async (id: number) => {
      return await api.execute(`/api/segments/${id}`);
    },
    [api],
  );

  return {
    ...api,
    fetchSegments,
    getSegment,
  };
}

export function useSegmentOperations() {
  const api = useApi<Segment>();

  const createSegment = useCallback(
    async (segment: Partial<Segment>) => {
      return await api.execute("/api/segments", {
        method: "POST",
        body: JSON.stringify(segment),
      });
    },
    [api],
  );

  const updateSegment = useCallback(
    async (id: number, segment: Partial<Segment>) => {
      return await api.execute(`/api/segments/${id}`, {
        method: "PUT",
        body: JSON.stringify(segment),
      });
    },
    [api],
  );

  const deleteSegment = useCallback(
    async (id: number) => {
      return await api.execute(`/api/segments/${id}`, {
        method: "DELETE",
      });
    },
    [api],
  );

  return {
    ...api,
    createSegment,
    updateSegment,
    deleteSegment,
  };
}

// Counter API Hooks
export function useCounters() {
  const api = useApi<Counter[]>();

  const fetchCounters = useCallback(async () => {
    return await api.execute("/api/counters");
  }, [api]);

  const getCounter = useCallback(
    async (id: number) => {
      return await api.execute(`/api/counters/${id}`);
    },
    [api],
  );

  return {
    ...api,
    fetchCounters,
    getCounter,
  };
}

export function useCounterOperations() {
  const api = useApi<Counter>();

  const createCounter = useCallback(
    async (counter: Partial<Counter>) => {
      return await api.execute("/api/counters", {
        method: "POST",
        body: JSON.stringify(counter),
      });
    },
    [api],
  );

  const updateCounter = useCallback(
    async (id: number, counter: Partial<Counter>) => {
      return await api.execute(`/api/counters/${id}`, {
        method: "PUT",
        body: JSON.stringify(counter),
      });
    },
    [api],
  );

  const deleteCounter = useCallback(
    async (id: number) => {
      return await api.execute(`/api/counters/${id}`, {
        method: "DELETE",
      });
    },
    [api],
  );

  return {
    ...api,
    createCounter,
    updateCounter,
    deleteCounter,
  };
}

// MQTT Data Hook
export function useMqttData() {
  const api = useApi<any>();

  const getDeviceWithMqttData = useCallback(
    async (deviceId: string) => {
      return await api.execute(`/api/device-data/${deviceId}/with-mqtt-data`);
    },
    [api],
  );

  const getDevicesByCounterWithMqttData = useCallback(
    async (counterCode: string) => {
      return await api.execute(
        `/api/device-data/counter/${counterCode}/with-mqtt-data`,
      );
    },
    [api],
  );

  const getLatestMqttData = useCallback(
    async (deviceId: string) => {
      return await api.execute(`/api/mqtt-data/device/${deviceId}/latest`);
    },
    [api],
  );

  return {
    ...api,
    getDeviceWithMqttData,
    getDevicesByCounterWithMqttData,
    getLatestMqttData,
  };
}
