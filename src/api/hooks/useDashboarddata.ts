// src/api/hooks/useDashboardData.ts
import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../dashboardApi';
import type { DashboardOverview } from '../types';

export const useDashboardData = (autoRefresh: boolean = true, refreshInterval: number = 30000) => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      const data = await dashboardApi.getOverviewStats();
      setOverview(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard overview:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    }
  }, []);

  const fetchSystemHealth = useCallback(async () => {
    try {
      const health = await dashboardApi.getSystemHealth();
      setSystemHealth(health);
    } catch (err: any) {
      console.error('Error fetching system health:', err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchOverview(),
        fetchSystemHealth()
      ]);
      setLoading(false);
    };

    loadData();
  }, [fetchOverview, fetchSystemHealth]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchOverview();
      fetchSystemHealth();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchOverview, fetchSystemHealth]);

  return {
    overview,
    systemHealth,
    loading,
    error,
    refetch: fetchOverview
  };
};

export default useDashboardData;