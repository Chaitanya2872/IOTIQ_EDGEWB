// src/api/hooks/useIAQData.ts
import { useState, useEffect, useCallback } from 'react';
import { iaqApi } from '../iaqApi';
import type { IAQSensor } from '../types';

export const useIAQData = (floor?: number, autoRefresh: boolean = true, refreshInterval: number = 30000) => {
  const [sensors, setSensors] = useState<IAQSensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensors = useCallback(async () => {
    try {
      let data: IAQSensor[];
      
      if (floor !== undefined) {
        data = await iaqApi.getSensorDataByFloor(floor);
      } else {
        data = await iaqApi.getLatestForAllDevices();
      }
      
      setSensors(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching IAQ data:', err);
      setError(err.message || 'Failed to fetch IAQ data');
    }
  }, [floor]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchSensors();
      setLoading(false);
    };

    loadData();
  }, [fetchSensors]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchSensors, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchSensors]);

  // Group sensors by floor
  const getSensorsByFloor = useCallback(() => {
    const grouped: Record<number, IAQSensor[]> = {};
    sensors.forEach(sensor => {
      if (sensor.floor) {
        if (!grouped[sensor.floor]) {
          grouped[sensor.floor] = [];
        }
        grouped[sensor.floor].push(sensor);
      }
    });
    return grouped;
  }, [sensors]);

  // Get sensors by type
  const getSensorsByType = useCallback((type: string) => {
    return sensors.filter(s => s.type === type);
  }, [sensors]);

  // Calculate averages for a floor
  const getFloorAverages = useCallback((floorNum: number) => {
    const floorSensors = sensors.filter(s => s.floor === floorNum);
    
    if (floorSensors.length === 0) {
      return { temperature: 0, humidity: 0, co2: 0, count: 0 };
    }

    const temps = floorSensors.filter(s => s.type === 'TEMPERATURE');
    const humidity = floorSensors.filter(s => s.type === 'HUMIDITY');
    const co2 = floorSensors.filter(s => s.type === 'CO2');

    return {
      temperature: temps.length > 0 ? temps.reduce((sum, s) => sum + s.value, 0) / temps.length : 0,
      humidity: humidity.length > 0 ? humidity.reduce((sum, s) => sum + s.value, 0) / humidity.length : 0,
      co2: co2.length > 0 ? co2.reduce((sum, s) => sum + s.value, 0) / co2.length : 0,
      count: floorSensors.length
    };
  }, [sensors]);

  // Get alerts (sensors with WARNING or CRITICAL status)
  const getAlerts = useCallback(() => {
    return sensors.filter(s => s.status === 'WARNING' || s.status === 'CRITICAL');
  }, [sensors]);

  return {
    sensors,
    loading,
    error,
    refetch: fetchSensors,
    getSensorsByFloor,
    getSensorsByType,
    getFloorAverages,
    getAlerts
  };
};

// Hook for specific device
export const useDeviceIAQData = (deviceId: string, hours: number = 24) => {
  const [latest, setLatest] = useState<IAQSensor | null>(null);
  const [history, setHistory] = useState<IAQSensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [latestData, historyData] = await Promise.all([
          iaqApi.getLatestByDeviceId(deviceId),
          iaqApi.getRecentSensorData(deviceId, hours)
        ]);

        setLatest(latestData);
        setHistory(historyData);
        setError(null);
      } catch (err: any) {
        console.error(`Error fetching data for device ${deviceId}:`, err);
        setError(err.message || 'Failed to fetch device data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deviceId, hours]);

  return { latest, history, loading, error };
};

export default useIAQData;