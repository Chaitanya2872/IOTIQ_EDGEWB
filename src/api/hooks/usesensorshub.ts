// src/hooks/useSensorsHub.ts - Optimized hooks for Sensors Hub

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LocationsAPI,
  DeviceMappingsAPI,
  IAQAPI,
  OdorAPI,
  SensorStatusAPI,
  type Location,
  type DeviceMapping,
  type SensorStatus,
  type IAQData,
  type OdorData
} from '../sensorshub';

// Simple cache with 30 second TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000;

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  Array.from(cache.keys())
    .filter(key => key.includes(pattern))
    .forEach(key => cache.delete(key));
}

// ============================================================================
// LOCATIONS HOOKS
// ============================================================================

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const refresh = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCached<Location[]>('locations-all');
      if (cached) {
        setLocations(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await LocationsAPI.getAll();
      if (isMounted.current) {
        setLocations(data);
        setCache('locations-all', data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load locations');
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: Omit<Location, 'id'>): Promise<Location> => {
    const newLocation = await LocationsAPI.create(data);
    invalidateCache('locations');
    await refresh(true);
    return newLocation;
  }, [refresh]);

  const update = useCallback(async (id: number, data: Partial<Location>): Promise<Location> => {
    const updated = await LocationsAPI.update(id, data);
    invalidateCache('locations');
    await refresh(true);
    return updated;
  }, [refresh]);

  const remove = useCallback(async (id: number): Promise<void> => {
    await LocationsAPI.delete(id);
    invalidateCache('locations');
    await refresh(true);
  }, [refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  return { locations, loading, error, refresh, create, update, remove };
}

// ============================================================================
// DEVICE MAPPINGS HOOKS
// ============================================================================

export function useDeviceMappings() {
  const [mappings, setMappings] = useState<DeviceMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const refresh = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCached<DeviceMapping[]>('mappings-all');
      if (cached) {
        setMappings(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await DeviceMappingsAPI.getAll();
      if (isMounted.current) {
        setMappings(data);
        setCache('mappings-all', data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load mappings');
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  const create = useCallback(async (data: Omit<DeviceMapping, 'id'>): Promise<DeviceMapping> => {
    const newMapping = await DeviceMappingsAPI.create(data);
    invalidateCache('mappings');
    await refresh(true);
    return newMapping;
  }, [refresh]);

  const update = useCallback(async (id: number, data: Partial<DeviceMapping>): Promise<DeviceMapping> => {
    const updated = await DeviceMappingsAPI.update(id, data);
    invalidateCache('mappings');
    await refresh(true);
    return updated;
  }, [refresh]);

  const remove = useCallback(async (id: number): Promise<void> => {
    await DeviceMappingsAPI.delete(id);
    invalidateCache('mappings');
    await refresh(true);
  }, [refresh]);

  useEffect(() => { refresh(); }, [refresh]);

  return { mappings, loading, error, refresh, create, update, remove };
}

// ============================================================================
// SENSOR STATUS HOOKS
// ============================================================================

export function useSensorStatus() {
  const [statuses, setStatuses] = useState<SensorStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const refresh = useCallback(async (force = false) => {
    if (!force) {
      const cached = getCached<SensorStatus[]>('sensor-status-all');
      if (cached) {
        setStatuses(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await SensorStatusAPI.getAll();
      if (isMounted.current) {
        setStatuses(data);
        setCache('sensor-status-all', data);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to load sensor status');
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { statuses, loading, error, refresh };
}

// ============================================================================
// COMBINED HOOK
// ============================================================================

export function useSensorsHub() {
  const locations = useLocations();
  const mappings = useDeviceMappings();
  const sensorStatus = useSensorStatus();

  const refreshAll = useCallback(async () => {
    await Promise.all([
      locations.refresh(true),
      mappings.refresh(true),
      sensorStatus.refresh(true)
    ]);
  }, [locations, mappings, sensorStatus]);

  return {
    locations: locations.locations,
    mappings: mappings.mappings,
    sensorStatuses: sensorStatus.statuses,
    loading: locations.loading || mappings.loading || sensorStatus.loading,
    error: locations.error || mappings.error || sensorStatus.error,
    refreshAll,
    locationActions: {
      create: locations.create,
      update: locations.update,
      remove: locations.remove,
      refresh: locations.refresh
    },
    mappingActions: {
      create: mappings.create,
      update: mappings.update,
      remove: mappings.remove,
      refresh: mappings.refresh
    }
  };
}

export function clearSensorsHubCache() {
  invalidateCache();
}