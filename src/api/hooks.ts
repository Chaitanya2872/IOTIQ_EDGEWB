/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { 
  CategoriesAPI, 
  ItemsAPI, 
  AnalyticsAPI, 
  type Category, 
  type Item,
  type BudgetConsumptionResponse,
  type CostDistributionResponse
} from '../api/inventory';

// ============================================================================
// PERFORMANCE OPTIMIZATION: Request Deduplication & Caching
// ============================================================================

// Request cache to prevent duplicate API calls
const requestCache = new Map<string, Promise<any>>();
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Optimized request handler with deduplication and caching
 * Prevents multiple identical requests and caches responses
 */
async function optimizedRequest<T>(
  key: string, 
  requestFn: () => Promise<T>,
  cacheDuration: number = CACHE_DURATION
): Promise<T> {
  // Check response cache first
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < cacheDuration) {
    console.log(`✅ Cache hit: ${key}`);
    return cached.data;
  }

  // Check if request is already in flight
  if (requestCache.has(key)) {
    console.log(`⏳ Request in flight, waiting: ${key}`);
    return requestCache.get(key)!;
  }

  // Make new request
  console.log(`🔄 Making new request: ${key}`);
  const promise = requestFn()
    .then(data => {
      responseCache.set(key, { data, timestamp: Date.now() });
      requestCache.delete(key);
      return data;
    })
    .catch(error => {
      requestCache.delete(key);
      throw error;
    });

  requestCache.set(key, promise);
  return promise;
}

/**
 * Clear all caches - useful for logout or manual refresh
 */
export function clearAllCaches() {
  requestCache.clear();
  responseCache.clear();
  console.log('🧹 All caches cleared');
}

// ============================================================================
// OPTIMIZED HOOKS
// ============================================================================

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true); 
    setError(null);
    try { 
      const categories = await optimizedRequest(
        'categories-list',
        () => CategoriesAPI.list()
      );
      setData(categories); 
    }
    catch (e: any) { 
      setError(e?.message || 'Failed to load categories'); 
    }
    finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { refresh(); }, []);

  const actions = useMemo(() => ({
    create: async (body: { categoryName: string; categoryDescription: string }) => {
      await CategoriesAPI.create(body); 
      responseCache.delete('categories-list'); // Invalidate cache
      await refresh();
    },
    update: async (id: number, body: { categoryName: string; categoryDescription: string }) => {
      await CategoriesAPI.update(id, body); 
      responseCache.delete('categories-list'); // Invalidate cache
      await refresh();
    },
    remove: async (id: number) => { 
      await CategoriesAPI.remove(id); 
      responseCache.delete('categories-list'); // Invalidate cache
      await refresh(); 
    },
  }), []);

  return { data, loading, error, refresh, ...actions };
}

export function useItems() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true); 
    setError(null);
    try { 
      console.log('📦 Fetching items...');
      const items = await optimizedRequest(
        'items-list',
        () => ItemsAPI.list()
      );
      console.log(`✅ Items loaded: ${items.length} items`);
      setData(items); 
    }
    catch (e: any) { 
      console.error('❌ Items fetch error:', e);
      const errorMessage = e?.message || 'Failed to load items';
      setError(errorMessage);
      
      // Check if it's an auth error
      if (errorMessage.includes('Session expired') || errorMessage.includes('401')) {
        console.log('🔐 Redirecting to login due to auth error');
      }
    }
    finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { refresh(); }, []);

  const actions = useMemo(() => ({
    get: (id: number) => ItemsAPI.get(id),
    create: async (body: Omit<Item, 'id'>) => { 
      await ItemsAPI.create(body); 
      responseCache.delete('items-list'); // Invalidate cache
      await refresh(); 
    },
    update: async (id: number, body: Partial<Omit<Item, 'id'>>) => { 
      await ItemsAPI.update(id, body); 
      responseCache.delete('items-list'); // Invalidate cache
      await refresh(); 
    },
    remove: async (id: number) => { 
      await ItemsAPI.remove(id); 
      responseCache.delete('items-list'); // Invalidate cache
      await refresh(); 
    },
    search: (q: string) => ItemsAPI.search(q),
    lowStock: (threshold: number) => ItemsAPI.lowStock(threshold),
    expiring: (days: number) => ItemsAPI.expiring(days),
    expired: () => ItemsAPI.expired(),
    consume: async (id: number, qty: number, department?: string, notes?: string) => {
      await ItemsAPI.consume(id, { quantity: qty, department, notes }); 
      responseCache.delete('items-list'); // Invalidate cache
      await refresh();
    },
    receive: async (id: number, qty: number, unitPrice?: number, referenceNumber?: string, supplier?: string, notes?: string) => {
      await ItemsAPI.receive(id, { quantity: qty, unitPrice, referenceNumber, supplier, notes }); 
      responseCache.delete('items-list'); // Invalidate cache
      await refresh();
    },
  }), []);

  return { data, loading, error, refresh, ...actions };
}

export function useAnalytics() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [stockAnalytics, setStockAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true); 
    setError(null);
    try {
      console.log('📊 Fetching analytics data...');
      
      // Fetch both in parallel with caching
      const [dashboardData, stockData] = await Promise.all([
        optimizedRequest('analytics-dashboard', () => AnalyticsAPI.dashboard())
          .catch(err => {
            console.warn('⚠️ Dashboard data failed:', err);
            return null;
          }),
        optimizedRequest('analytics-stock', () => AnalyticsAPI.stockAnalytics())
          .catch(err => {
            console.warn('⚠️ Stock analytics failed:', err);
            return null;
          })
      ]);
      
      setDashboard(dashboardData);
      setStockAnalytics(stockData);
      console.log('✅ Analytics loaded');
    }
    catch (e: any) {
      console.error('❌ Analytics fetch error:', e);
      setError(e?.message || 'Failed to load analytics');
    }
    finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { refresh(); }, []);

  return {
    dashboard,
    stockAnalytics,
    loading,
    error,
    refresh,
    stockAlerts: AnalyticsAPI.stockAlerts,
    consumptionTrends: AnalyticsAPI.consumptionTrends,
    topConsumers: AnalyticsAPI.topConsumers,
    inventoryValue: AnalyticsAPI.inventoryValue,
    turnoverRatio: AnalyticsAPI.turnoverRatio
  };
}

// ============================================================================
// ENHANCED ANALYTICS HOOKS WITH CACHING
// ============================================================================

export function useBudgetConsumption(
  period?: string, 
  startDate?: string, 
  endDate?: string,
  budgetType?: string,
  categoryId?: number,
  department?: string,
  includeProjections?: boolean
) {
  const [data, setData] = useState<BudgetConsumptionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true); 
    setError(null);
    
    try {
      const cacheKey = `budget-${period}-${startDate}-${endDate}-${budgetType}-${categoryId}-${department}`;
      
      const budgetData = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.budgetConsumption(
          period || 'monthly', 
          startDate, 
          endDate, 
          budgetType || 'category',
          categoryId,
          department,
          includeProjections || false
        ),
        60000 // Cache for 1 minute (budget data changes less frequently)
      );
      
      setData(budgetData);
      console.log('✅ Budget consumption loaded');
    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to load budget consumption data';
      setError(errorMessage);
      console.error('❌ Budget consumption error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [period, startDate, endDate, budgetType, categoryId, department, includeProjections]);

  return { 
    data, 
    loading, 
    error, 
    refresh 
  };
}

export function useCostDistribution(period?: string, startDate?: string, endDate?: string) {
  const [data, setData] = useState<CostDistributionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true); 
    setError(null);
    
    try {
      const cacheKey = `cost-dist-${period}-${startDate}-${endDate}`;
      
      const costData = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.costDistribution(period || 'monthly', startDate, endDate),
        60000 // Cache for 1 minute
      );
      
      setData(costData);
      console.log('✅ Cost distribution loaded');
    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to load cost distribution data';
      setError(errorMessage);
      console.error('❌ Cost distribution error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [period, startDate, endDate]);

  return { 
    data, 
    loading, 
    error, 
    refresh 
  };
}

// ============================================================================
// ENHANCED ANALYTICS WITH BATCH LOADING
// ============================================================================

export function useEnhancedAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Basic analytics with caching
  const analytics = useAnalytics();
  
  // Individual hooks for enhanced features
  const budgetHook = useBudgetConsumption('monthly');
  const costDistHook = useCostDistribution('monthly');
  
  const refreshAll = async (_period?: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Refreshing all analytics...');
      
      // Refresh basic analytics first
      await analytics.refresh();
      
      // Then refresh enhanced features in parallel
      await Promise.allSettled([
        budgetHook.refresh(),
        costDistHook.refresh()
      ]);
      
      console.log('✅ All analytics refreshed');
    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to load enhanced analytics';
      setError(errorMessage);
      console.error('❌ Enhanced analytics error:', e);
    } finally {
      setLoading(false);
    }
  };

  return {
    // Basic analytics
    dashboard: analytics.dashboard,
    stockAlerts: analytics.stockAlerts,
    consumptionTrends: analytics.consumptionTrends,
    topConsumers: analytics.topConsumers,
    inventoryValue: analytics.inventoryValue,
    turnoverRatio: analytics.turnoverRatio,
    
    // Enhanced features
    budgetData: budgetHook.data,
    costDistributionData: costDistHook.data,
    
    // Combined state
    loading: loading || analytics.loading || budgetHook.loading || costDistHook.loading,
    error: error || analytics.error || budgetHook.error || costDistHook.error,
    
    // Actions
    refresh: analytics.refresh,
    refreshAll
  };
}

// ============================================================================
// ANALYTICS FILTERS WITH PERSISTENCE
// ============================================================================

export function useAnalyticsFilters() {
  // Load from localStorage if available
  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(`analytics-filter-${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>(
    () => getInitialState('period', 'monthly')
  );
  const [budgetPeriod, setBudgetPeriod] = useState<'daily' | 'weekly' | 'monthly'>(
    () => getInitialState('budgetPeriod', 'monthly')
  );
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>(
    () => getInitialState('dateRange', {
      startDate: '2025-01-01',
      endDate: '2025-07-31'
    })
  );
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    () => getInitialState('selectedCategory', null)
  );
  const [selectedItem, setSelectedItem] = useState<number | null>(
    () => getInitialState('selectedItem', null)
  );

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem('analytics-filter-period', JSON.stringify(period));
  }, [period]);

  useEffect(() => {
    localStorage.setItem('analytics-filter-budgetPeriod', JSON.stringify(budgetPeriod));
  }, [budgetPeriod]);

  useEffect(() => {
    localStorage.setItem('analytics-filter-dateRange', JSON.stringify(dateRange));
  }, [dateRange]);

  useEffect(() => {
    localStorage.setItem('analytics-filter-selectedCategory', JSON.stringify(selectedCategory));
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem('analytics-filter-selectedItem', JSON.stringify(selectedItem));
  }, [selectedItem]);
  
  const resetFilters = () => {
    setPeriod('monthly');
    setBudgetPeriod('monthly');
    setDateRange({
      startDate: '2025-01-01',
      endDate: '2025-07-31'
    });
    setSelectedCategory(null);
    setSelectedItem(null);
    
    // Clear from localStorage
    localStorage.removeItem('analytics-filter-period');
    localStorage.removeItem('analytics-filter-budgetPeriod');
    localStorage.removeItem('analytics-filter-dateRange');
    localStorage.removeItem('analytics-filter-selectedCategory');
    localStorage.removeItem('analytics-filter-selectedItem');
  };
  
  return {
    // Period filters
    period,
    setPeriod,
    budgetPeriod,
    setBudgetPeriod,
    
    // Date filters
    dateRange,
    setDateRange,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    
    // Category and item filters
    selectedCategory,
    setSelectedCategory,
    selectedItem,
    setSelectedItem,
    
    // Actions
    resetFilters
  };
}

// ============================================================================
// API CONNECTIVITY TESTING
// ============================================================================

export function useApiConnectivity() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnectivity = async () => {
    setLoading(true);
    try {
      const testResults = {
        baseUrl: 'http://localhost:8082',
        tests: {} as { [key: string]: { success: boolean; error?: string; latency?: number } }
      };

      // Test dashboard endpoint
      const dashStart = Date.now();
      try {
        await AnalyticsAPI.dashboard();
        testResults.tests.dashboard = { 
          success: true, 
          latency: Date.now() - dashStart 
        };
      } catch (error: any) {
        testResults.tests.dashboard = { 
          success: false, 
          error: error.message,
          latency: Date.now() - dashStart
        };
      }

      // Test cost distribution
      const costStart = Date.now();
      try {
        await AnalyticsAPI.costDistribution('monthly');
        testResults.tests.costDistribution = { 
          success: true,
          latency: Date.now() - costStart
        };
      } catch (error: any) {
        testResults.tests.costDistribution = { 
          success: false, 
          error: error.message,
          latency: Date.now() - costStart
        };
      }

      // Test budget consumption
      const budgetStart = Date.now();
      try {
        await AnalyticsAPI.budgetConsumption('monthly');
        testResults.tests.budgetConsumption = { 
          success: true,
          latency: Date.now() - budgetStart
        };
      } catch (error: any) {
        testResults.tests.budgetConsumption = { 
          success: false, 
          error: error.message,
          latency: Date.now() - budgetStart
        };
      }

      setResults(testResults);
    } catch (error) {
      console.error('Failed to test API connectivity:', error);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, testConnectivity };
}

// ============================================================================
// PERFORMANCE MONITORING HOOK
// ============================================================================

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<{
    cacheHitRate: number;
    avgResponseTime: number;
    totalRequests: number;
    cachedRequests: number;
  }>({
    cacheHitRate: 0,
    avgResponseTime: 0,
    totalRequests: 0,
    cachedRequests: 0
  });

  const calculateMetrics = () => {
    const totalRequests = requestCache.size + responseCache.size;
    const cachedRequests = responseCache.size;
    const cacheHitRate = totalRequests > 0 ? (cachedRequests / totalRequests) * 100 : 0;

    setMetrics({
      cacheHitRate: Math.round(cacheHitRate),
      avgResponseTime: 0, // Would need to track this separately
      totalRequests,
      cachedRequests
    });
  };

  useEffect(() => {
    const interval = setInterval(calculateMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return metrics;
}