// src/api/hooks/useRestroomData.ts
import { useState, useEffect, useCallback } from 'react';
import { restroomApi, type OdorSensorData, type RestroomData } from '../Restroomapi';

export const useRestroomData = (autoRefresh: boolean = true, refreshInterval: number = 30000) => {
  const [odorSensors, setOdorSensors] = useState<OdorSensorData[]>([]);
  const [restrooms, setRestrooms] = useState<RestroomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      // Fetch odor sensor data (this endpoint exists based on your example)
      const odorData = await restroomApi.getOdorSensorStatus();
      setOdorSensors(odorData);

      // Try to fetch restroom occupancy data (may not exist yet)
      try {
        const restroomData = await restroomApi.getRestroomOccupancy();
        
        // Merge odor data with restroom data
        const mergedData = restroomData.map(restroom => {
          const matchingOdor = odorData.find(
            odor => odor.location.floor === restroom.floor && odor.location.zone === restroom.zone
          );
          return {
            ...restroom,
            odorData: matchingOdor
          };
        });
        
        setRestrooms(mergedData);
      } catch (err) {
        // If restroom occupancy doesn't exist, create dummy data from odor sensors
        const restroomFromOdor: RestroomData[] = odorData.map((odor, index) => ({
          id: odor.deviceId,
          restroomId: odor.location.name.replace('Restroom', '').trim() || `RM${index + 1}`,
          floor: odor.location.floor,
          zone: odor.location.zone,
          location: odor.location.name,
          occupied: Math.random() > 0.5, // Random occupancy (replace with real data when available)
          occupancyStatus: (Math.random() > 0.5 ? 'OCCUPIED' : 'AVAILABLE') as 'OCCUPIED' | 'AVAILABLE',
          cleaningStatus: (odor.quality === 'EXCELLENT' || odor.quality === 'GOOD') ? 'CLEAN' : 'NEEDS_CLEANING' as 'CLEAN' | 'NEEDS_CLEANING',
          usageCount: Math.floor(Math.random() * 60) + 10,
          lastCleaned: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
          timestamp: odor.lastUpdate,
          odorData: odor
        }));
        
        setRestrooms(restroomFromOdor);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error fetching restroom data:', err);
      setError(err.message || 'Failed to fetch restroom data');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    };

    loadData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  // Get restrooms by floor
  const getRestroomsByFloor = useCallback((floor: number) => {
    return restrooms.filter(r => r.floor === floor);
  }, [restrooms]);

  // Get alerts (restrooms needing attention)
  const getAlerts = useCallback(() => {
    return restrooms.filter(r => 
      r.cleaningStatus === 'NEEDS_CLEANING' || 
      r.odorData?.status === 'WARNING' ||
      r.odorData?.status === 'CRITICAL'
    );
  }, [restrooms]);

  // Calculate statistics
  const getStats = useCallback(() => {
    const totalRestrooms = restrooms.length;
    const available = restrooms.filter(r => r.occupancyStatus === 'AVAILABLE').length;
    const occupied = restrooms.filter(r => r.occupancyStatus === 'OCCUPIED').length;
    const needsCleaning = restrooms.filter(r => r.cleaningStatus === 'NEEDS_CLEANING').length;
    const totalUsage = restrooms.reduce((sum, r) => sum + r.usageCount, 0);
    const avgUsage = totalRestrooms > 0 ? Math.round(totalUsage / totalRestrooms) : 0;
    const occupancyRate = totalRestrooms > 0 ? Math.round((occupied / totalRestrooms) * 100) : 0;

    return {
      totalRestrooms,
      available,
      occupied,
      needsCleaning,
      totalUsage,
      avgUsage,
      occupancyRate
    };
  }, [restrooms]);

  // Get usage by floor
  const getUsageByFloor = useCallback(() => {
    const floors = [...new Set(restrooms.map(r => r.floor))].sort();
    return floors.map(floor => {
      const floorRestrooms = restrooms.filter(r => r.floor === floor);
      const totalUsage = floorRestrooms.reduce((sum, r) => sum + r.usageCount, 0);
      return {
        floor,
        usage: totalUsage,
        count: floorRestrooms.length
      };
    });
  }, [restrooms]);

  return {
    odorSensors,
    restrooms,
    loading,
    error,
    refetch: fetchData,
    getRestroomsByFloor,
    getAlerts,
    getStats,
    getUsageByFloor
  };
};

export default useRestroomData;