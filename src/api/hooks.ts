/* eslint-disable prefer-const */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { 
  CategoriesAPI, 
  ItemsAPI, 
  AnalyticsAPI, 
  type Category, 
  type Item,
  type BudgetConsumptionResponse,
  type CostDistributionResponse,
  type DashboardBulkResponse,
  type StockUsageResponse,
  type StockLevelsResponse,
  type StockDistributionCategoryResponse,
  type MonthlyStockValueTrendResponse,
  type MonthlyForecastResponse,
  type ForecastVsActualBinsResponse,
  type BinVarianceAnalysisResponse,
  type ItemHeatmapResponse,
  type ConsumptionPatternsResponse,
  type PriceTrendsResponse,
  type LeadTimeAnalysisResponse,
  type BudgetKPIResponse,
  type BudgetComparisonResponse,
  type InventoryTurnoverResponse,
  type SupplierPerformanceResponse,
  type ReorderRecommendationsResponse,
  type ExpiryAnalysisResponse,
  type DepartmentCostAnalysisResponse,
  type FootfallTrendsResponse,
  type PerEmployeeConsumptionResponse,
  type ConsumptionTrendsResponse,
  type TopConsumersResponse,
  type AvailableDateResponse,
  type costConsumptionResponse,
  type SmartInsightsResponse,
  type SmartInsightsSummaryResponse,
  type SmartRecommendationsResponse,
  type SmartAlertsResponse,
  type SmartAnomaliesResponse,
  type SmartHealthResponse
} from '../api/inventory';

// ============================================================================
// OPTIMIZED REQUEST MANAGEMENT
// ============================================================================

const requestCache = new Map<string, Promise<any>>();
const responseCache = new Map<string, { data: any; timestamp: number; priority: number }>();

// Different cache durations based on data volatility
const CACHE_DURATIONS = {
  CRITICAL: 10000,      // 10s - frequently changing data
  STANDARD: 30000,      // 30s - moderately stable data
  STABLE: 60000,        // 60s - rarely changing data
  REFERENCE: 300000,    // 5min - reference data (categories, etc.)
} as const;

// Request priority levels
const PRIORITY = {
  CRITICAL: 1,    // Must load immediately (auth, dashboard summary)
  HIGH: 2,        // Load next (key metrics)
  MEDIUM: 3,      // Load when available (detailed analytics)
  LOW: 4,         // Load last (historical data)
  BACKGROUND: 5,  // Load in background (non-essential)
} as const;

// Request queue for priority-based loading
let requestQueue: Array<{ key: string; priority: number; fn: () => Promise<any> }> = [];
let isProcessingQueue = false;
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 4; // Limit concurrent requests

/**
 * Process request queue with priority
 */
async function processRequestQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    // Sort by priority
    requestQueue.sort((a, b) => a.priority - b.priority);
    
    const request = requestQueue.shift();
    if (!request) break;

    activeRequests++;
    request.fn()
      .finally(() => {
        activeRequests--;
        processRequestQueue(); // Process next item
      });
  }

  isProcessingQueue = false;
}

/**
 * Optimized request with priority and caching
 */
async function optimizedRequest<T>(
  key: string, 
  requestFn: () => Promise<T>,
  options: {
    cacheDuration?: number;
    priority?: number;
    force?: boolean;
  } = {}
): Promise<T> {
  const {
    cacheDuration = CACHE_DURATIONS.STANDARD,
    priority = PRIORITY.MEDIUM,
    force = false
  } = options;

  // Check cache first (unless force refresh)
  if (!force) {
    const cached = responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheDuration) {
      console.log(`✓ Cache hit: ${key}`);
      return cached.data;
    }
  }

  // Check if request already in flight
  if (requestCache.has(key)) {
    console.log(`⏳ Request in flight: ${key}`);
    return requestCache.get(key)!;
  }

  // Create promise
  const promise = new Promise<T>((resolve, reject) => {
    const execute = async () => {
      try {
        console.log(`🚀 Request [P${priority}]: ${key}`);
        const data = await requestFn();
        responseCache.set(key, { data, timestamp: Date.now(), priority });
        requestCache.delete(key);
        resolve(data);
      } catch (error) {
        requestCache.delete(key);
        reject(error);
      }
    };

    // Add to queue based on priority
    if (priority <= PRIORITY.HIGH || activeRequests < MAX_CONCURRENT_REQUESTS) {
      execute(); // Execute immediately for high priority or if capacity available
    } else {
      requestQueue.push({ key, priority, fn: execute });
      processRequestQueue();
    }
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

export function clearCache(pattern?: string) {
  if (!pattern) {
    clearAllCaches();
    return;
  }

  // Clear caches matching pattern
  const keysToDelete: string[] = [];
  responseCache.forEach((_, key) => {
    if (key.includes(pattern)) keysToDelete.push(key);
  });
  
  keysToDelete.forEach(key => {
    responseCache.delete(key);
    requestCache.delete(key);
  });
  
  console.log(`🧹 Cleared ${keysToDelete.length} cache entries matching "${pattern}"`);
}

/**
 * Smart cache invalidation - only clear related caches
 */
function invalidateRelatedCaches(entity: 'categories' | 'items' | 'analytics') {
  const patterns: Record<string, string[]> = {
    categories: ['categories-', 'analytics-', 'dashboard-'],
    items: ['items-', 'stock-', 'analytics-', 'dashboard-'],
    analytics: ['analytics-', 'dashboard-', 'smart-']
  };

  patterns[entity].forEach(pattern => clearCache(pattern));
}

// ============================================================================
// CATEGORIES
// ============================================================================

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true); 
    setError(null);
    try { 
      const categories = await optimizedRequest(
        'categories-list',
        () => CategoriesAPI.list(),
        { 
          cacheDuration: CACHE_DURATIONS.REFERENCE, 
          priority: PRIORITY.HIGH,
          force 
        }
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
      invalidateRelatedCaches('categories');
      await refresh(true);
    },
    update: async (id: number, body: { categoryName: string; categoryDescription: string }) => {
      await CategoriesAPI.update(id, body); 
      invalidateRelatedCaches('categories');
      await refresh(true);
    },
    remove: async (id: number) => { 
      await CategoriesAPI.remove(id); 
      invalidateRelatedCaches('categories');
      await refresh(true); 
    },
  }), []);

  return { data, loading, error, refresh, ...actions };
}

// ============================================================================
// ITEMS
// ============================================================================

export function useItems() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const refresh = async (force = false) => {
    if (!isMounted.current) return;
    
    setLoading(true); 
    setError(null);
    try { 
      const items = await optimizedRequest(
        'items-list',
        () => ItemsAPI.list(),
        { 
          cacheDuration: CACHE_DURATIONS.CRITICAL,
          priority: PRIORITY.HIGH,
          force
        }
      );
      
      if (isMounted.current) {
        setData(items); 
      }
    }
    catch (e: any) { 
      if (isMounted.current) {
        setError(e?.message || 'Failed to load items');
      }
    }
    finally { 
      if (isMounted.current) {
        setLoading(false); 
      }
    }
  };

  useEffect(() => { refresh(); }, []);

  const actions = useMemo(() => ({
    get: (id: number) => ItemsAPI.get(id),
    create: async (body: Omit<Item, 'id'>) => { 
      await ItemsAPI.create(body); 
      invalidateRelatedCaches('items');
      await refresh(true); 
    },
    update: async (id: number, body: Partial<Omit<Item, 'id'>>) => { 
      await ItemsAPI.update(id, body); 
      invalidateRelatedCaches('items');
      await refresh(true); 
    },
    remove: async (id: number) => { 
      await ItemsAPI.remove(id); 
      invalidateRelatedCaches('items');
      await refresh(true); 
    },
    search: (q: string) => ItemsAPI.search(q),
    lowStock: (threshold: number) => ItemsAPI.lowStock(threshold),
    expiring: (days: number) => ItemsAPI.expiring(days),
    expired: () => ItemsAPI.expired(),
    consume: async (id: number, qty: number, department?: string, notes?: string) => {
      await ItemsAPI.consume(id, { quantity: qty, department, notes }); 
      invalidateRelatedCaches('items');
      await refresh(true);
    },
    receive: async (id: number, qty: number, unitPrice?: number, referenceNumber?: string, supplier?: string, notes?: string) => {
      await ItemsAPI.receive(id, { quantity: qty, unitPrice, referenceNumber, supplier, notes }); 
      invalidateRelatedCaches('items');
      await refresh(true);
    },
  }), []);

  return { data, loading, error, refresh, ...actions };
}

// ============================================================================
// SMART INSIGHTS
// ============================================================================

export function useSmartInsights(
  analysisDepth?: string,
  categoryId?: number,
  minConfidence?: number,
  includeRecommendations?: boolean
) {
  const [data, setData] = useState<SmartInsightsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `smart-insights-${analysisDepth}-${categoryId}-${minConfidence}-${includeRecommendations}`;
      
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.smartInsights(analysisDepth, categoryId, minConfidence, includeRecommendations),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.LOW,
          force
        }
      );
      
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load smart insights');
    } finally {
      setLoading(false);
    }
  }, [analysisDepth, categoryId, minConfidence, includeRecommendations]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

export function useSmartInsightsSummary(categoryId?: number) {
  const [data, setData] = useState<SmartInsightsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `smart-insights-summary-${categoryId}`,
        () => AnalyticsAPI.smartInsightsSummary(categoryId),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.MEDIUM,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load insights summary');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

export function useSmartRecommendations(
  categoryId?: number,
  minPriority?: number,
  limit?: number
) {
  const [data, setData] = useState<SmartRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `smart-recommendations-${categoryId}-${minPriority}-${limit}`,
        () => AnalyticsAPI.smartRecommendations(categoryId, minPriority, limit),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.BACKGROUND,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  }, [categoryId, minPriority, limit]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

export function useSmartAlerts(
  categoryId?: number,
  severity?: string,
  limit?: number
) {
  const [data, setData] = useState<SmartAlertsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `smart-alerts-${categoryId}-${severity}-${limit}`,
        () => AnalyticsAPI.smartAlerts(categoryId, severity, limit),
        {
          cacheDuration: CACHE_DURATIONS.CRITICAL,
          priority: PRIORITY.HIGH,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [categoryId, severity, limit]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

export function useSmartAnomalies(
  categoryId?: number,
  minConfidence?: number,
  limit?: number
) {
  const [data, setData] = useState<SmartAnomaliesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `smart-anomalies-${categoryId}-${minConfidence}-${limit}`,
        () => AnalyticsAPI.smartAnomalies(categoryId, minConfidence, limit),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.BACKGROUND,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load anomalies');
    } finally {
      setLoading(false);
    }
  }, [categoryId, minConfidence, limit]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

export function useSmartHealth(categoryId?: number) {
  const [data, setData] = useState<SmartHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `smart-health-${categoryId}`,
        () => AnalyticsAPI.smartHealth(categoryId),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.MEDIUM,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load health score');
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

export function useSmartInsightsDashboard(categoryId?: number) {
  const insights = useSmartInsights('standard', categoryId, 0.7, true);
  const summary = useSmartInsightsSummary(categoryId);
  const health = useSmartHealth(categoryId);

  const loading = insights.loading || summary.loading || health.loading;
  const error = insights.error || summary.error || health.error;

  const refreshAll = useCallback(async () => {
    await Promise.all([
      insights.refresh(),
      summary.refresh(),
      health.refresh()
    ]);
  }, [insights, summary, health]);

  return {
    insights: insights.data,
    summary: summary.data,
    health: health.data,
    loading,
    error,
    refreshAll
  };
}

// ============================================================================
// ANALYTICS
// ============================================================================

export function useAnalytics() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [stockAnalytics, setStockAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true); 
    setError(null);
    try {
      // Fetch both in parallel with caching
      const [dashboardData, stockData] = await Promise.all([
        optimizedRequest(
          'analytics-dashboard', 
          () => AnalyticsAPI.dashboard(),
          {
            cacheDuration: CACHE_DURATIONS.CRITICAL,
            priority: PRIORITY.CRITICAL,
            force
          }
        ).catch(err => {
          console.warn('⚠️ Dashboard data failed:', err);
          return null;
        }),
        optimizedRequest(
          'analytics-stock', 
          () => AnalyticsAPI.stockAnalytics(),
          {
            cacheDuration: CACHE_DURATIONS.STANDARD,
            priority: PRIORITY.HIGH,
            force
          }
        ).catch(err => {
          console.warn('⚠️ Stock analytics failed:', err);
          return null;
        })
      ]);
      
      setDashboard(dashboardData);
      setStockAnalytics(stockData);
    }
    catch (e: any) {
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
// DASHBOARD & BASIC STATS
// ============================================================================

export function useDashboardBulk(year?: number, month?: number, categoryId?: number) {
  const [data, setData] = useState<DashboardBulkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `dashboard-bulk-${year}-${month}-${categoryId}`,
        () => AnalyticsAPI.dashboardBulk(year, month, categoryId),
        {
          cacheDuration: CACHE_DURATIONS.CRITICAL,
          priority: PRIORITY.CRITICAL,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load dashboard bulk data');
    } finally {
      setLoading(false);
    }
  }, [year, month, categoryId]);

  useEffect(() => { refresh(); }, [year, month, categoryId, refresh]);

  return { data, loading, error, refresh };
}

// ============================================================================
// CONSUMPTION & TRENDS
// ============================================================================

export function useConsumptionTrends(period?: string, groupBy?: string, categoryId?: number) {
  const [data, setData] = useState<ConsumptionTrendsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `consumption-trends-${period}-${groupBy}-${categoryId}`,
        () => AnalyticsAPI.consumptionTrends(period, groupBy, categoryId),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.MEDIUM,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load consumption trends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [period, groupBy, categoryId]);

  return { data, loading, error, refresh };
}

export function useTopConsumingItems(days?: number, limit?: number) {
  const [data, setData] = useState<TopConsumersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `top-consuming-items-${days}-${limit}`,
        () => AnalyticsAPI.topConsumingItems(days, limit),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.MEDIUM,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load top consuming items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [days, limit]);

  return { data, loading, error, refresh };
}

// ============================================================================
// STOCK ANALYSIS
// ============================================================================

export function useStockUsage(categoryId?: number) {
  const [data, setData] = useState<StockUsageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `stock-usage-${categoryId}`,
        () => AnalyticsAPI.stockUsage(categoryId),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.MEDIUM,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load stock usage');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [categoryId]);

  return { data, loading, error, refresh };
}

export function useStockLevels(categoryId?: number, alertLevel?: string, sortBy?: string, sortOrder?: string) {
  const [data, setData] = useState<StockLevelsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `stock-levels-${categoryId}-${alertLevel}-${sortBy}-${sortOrder}`,
        () => AnalyticsAPI.stockLevels(categoryId, alertLevel, sortBy, sortOrder),
        {
          cacheDuration: CACHE_DURATIONS.CRITICAL,
          priority: PRIORITY.HIGH,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load stock levels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [categoryId, alertLevel, sortBy, sortOrder]);

  return { data, loading, error, refresh };
}

export function useStockDistributionCategory() {
  const [data, setData] = useState<StockDistributionCategoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        'stock-distribution-category',
        () => AnalyticsAPI.stockDistributionCategory(),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.MEDIUM,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load stock distribution');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { data, loading, error, refresh };
}

export function useMonthlyStockValueTrend(startDate?: string, endDate?: string, categoryId?: number) {
  const [data, setData] = useState<MonthlyStockValueTrendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cacheKey = useMemo(() => {
    const start = startDate || 'all';
    const end = endDate || 'all';
    const cat = categoryId || 'all';
    return `monthly-stock-value-trend-${start}-${end}-${cat}`;
  }, [startDate, endDate, categoryId]);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.monthlyStockValueTrend(startDate, endDate, categoryId),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.LOW,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load stock value trend');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, categoryId, cacheKey]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

export function useMonthlyForecast(year?: number, month?: number, categoryId?: number) {
  const [data, setData] = useState<MonthlyForecastResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `monthly-forecast-${year}-${month}-${categoryId}`,
        () => AnalyticsAPI.monthlyForecast(year, month, categoryId),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.LOW,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load monthly forecast');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [year, month, categoryId]);

  return { data, loading, error, refresh };
}

export function useForecastVsActualBins(year?: number, month?: number, categoryId?: number) {
  const [data, setData] = useState<ForecastVsActualBinsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `forecast-vs-actual-bins-${year}-${month}-${categoryId}`,
        () => AnalyticsAPI.forecastVsActualBins(year, month, categoryId),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.BACKGROUND,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load forecast vs actual');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [year, month, categoryId]);

  return { data, loading, error, refresh };
}

export function useBinVarianceAnalysis() {
  const [data, setData] = useState<BinVarianceAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        'bin-variance-analysis',
        () => AnalyticsAPI.binVarianceAnalysis(),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.BACKGROUND,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load bin variance analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { data, loading, error, refresh };
}

export function useItemHeatmap(itemId: number, period?: string) {
  const [data, setData] = useState<ItemHeatmapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `item-heatmap-${itemId}-${period}`,
        () => AnalyticsAPI.itemHeatmap(itemId, period),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.LOW,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load item heatmap');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (itemId) refresh(); }, [itemId, period]);

  return { data, loading, error, refresh };
}

export function useConsumptionPatterns(itemId: number, startDate?: string, endDate?: string) {
  const [data, setData] = useState<ConsumptionPatternsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `consumption-patterns-${itemId}-${startDate}-${endDate}`,
        () => AnalyticsAPI.consumptionPatterns(itemId, startDate, endDate),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.LOW,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load consumption patterns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (itemId) refresh(); }, [itemId, startDate, endDate]);

  return { data, loading, error, refresh };
}

export function useCostConsumption(startDate?: string, endDate?: string) {
  const [data, setData] = useState<costConsumptionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `cost-consumption-${startDate}-${endDate}`,
        () => AnalyticsAPI.costConsumption(startDate, endDate),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.MEDIUM,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load cost consumption data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [startDate, endDate]);

  return { data, loading, error, refresh };
}

export function usePriceTrends(itemId: number, startDate?: string, endDate?: string) {
  const [data, setData] = useState<PriceTrendsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `price-trends-${itemId}-${startDate}-${endDate}`,
        () => AnalyticsAPI.priceTrends(itemId, startDate, endDate),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.LOW,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load price trends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (itemId) refresh(); }, [itemId, startDate, endDate]);

  return { data, loading, error, refresh };
}

export function useLeadTimeAnalysis(supplierId?: number) {
  const [data, setData] = useState<LeadTimeAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `lead-time-analysis-${supplierId}`,
        () => AnalyticsAPI.leadTimeAnalysis(supplierId),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.LOW,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load lead time analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [supplierId]);

  return { data, loading, error, refresh };
}

// ============================================================================
// BUDGET ANALYTICS
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

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `budget-consumption-${period}-${startDate}-${endDate}-${budgetType}-${categoryId}-${department}-${includeProjections}`,
        () => AnalyticsAPI.budgetConsumption(period, startDate, endDate, budgetType, categoryId, department, includeProjections),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.MEDIUM,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load budget consumption');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [period, startDate, endDate, budgetType, categoryId, department, includeProjections]);

  return { data, loading, error, refresh };
}

export function useBudgetKPIs() {
  const [data, setData] = useState<BudgetKPIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        'budget-kpis',
        () => AnalyticsAPI.budgetKPIs(),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.HIGH,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load budget KPIs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { data, loading, error, refresh };
}

export function useBudgetComparison(startDate?: string, endDate?: string) {
  const [data, setData] = useState<BudgetComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `budget-comparison-${startDate}-${endDate}`,
        () => AnalyticsAPI.budgetComparison(startDate, endDate),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.MEDIUM,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load budget comparison');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [startDate, endDate]);

  return { data, loading, error, refresh };
}

export function useCostDistribution(
  period?: string,
  startDate?: string,
  endDate?: string,
  categoryId?: number,
  groupBy?: string
) {
  const [data, setData] = useState<CostDistributionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `cost-distribution-${period}-${startDate}-${endDate}-${categoryId}-${groupBy}`,
        () => AnalyticsAPI.costDistribution(period, startDate, endDate, categoryId, groupBy),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.MEDIUM,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load cost distribution');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [period, startDate, endDate, categoryId, groupBy]);

  return { data, loading, error, refresh };
}

// ============================================================================
// PERFORMANCE METRICS
// ============================================================================

export function useDataRange() {
  const [data, setData] = useState<AvailableDateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        'data-range',
        () => AnalyticsAPI.availableDateRange(),
        {
          cacheDuration: CACHE_DURATIONS.REFERENCE,
          priority: PRIORITY.LOW,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load data range');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  return { data, loading, error, refresh };
}

export function useInventoryTurnover(period?: string, categoryId?: number) {
  const [data, setData] = useState<InventoryTurnoverResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `inventory-turnover-${period}-${categoryId}`,
        () => AnalyticsAPI.inventoryTurnover(period, categoryId),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.MEDIUM,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load inventory turnover');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [period, categoryId]);

  return { data, loading, error, refresh };
}

export function useSupplierPerformance(startDate?: string, endDate?: string, supplierId?: number) {
  const [data, setData] = useState<SupplierPerformanceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `supplier-performance-${startDate}-${endDate}-${supplierId}`,
        () => AnalyticsAPI.supplierPerformance(startDate, endDate, supplierId),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.LOW,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load supplier performance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [startDate, endDate, supplierId]);

  return { data, loading, error, refresh };
}

export function useReorderRecommendations(categoryId?: number, urgencyLevel?: string) {
  const [data, setData] = useState<ReorderRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `reorder-recommendations-${categoryId}-${urgencyLevel}`,
        () => AnalyticsAPI.reorderRecommendations(categoryId, urgencyLevel),
        {
          cacheDuration: CACHE_DURATIONS.CRITICAL,
          priority: PRIORITY.HIGH,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load reorder recommendations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [categoryId, urgencyLevel]);

  return { data, loading, error, refresh };
}

export function useExpiryAnalysis(daysThreshold?: number, categoryId?: number) {
  const [data, setData] = useState<ExpiryAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `expiry-analysis-${daysThreshold}-${categoryId}`,
        () => AnalyticsAPI.expiryAnalysis(daysThreshold, categoryId),
        {
          cacheDuration: CACHE_DURATIONS.CRITICAL,
          priority: PRIORITY.HIGH,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load expiry analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [daysThreshold, categoryId]);

  return { data, loading, error, refresh };
}

// ============================================================================
// DEPARTMENT & FOOTFALL
// ============================================================================

export function useDepartmentCostAnalysis(period?: string, startDate?: string, endDate?: string, department?: string) {
  const [data, setData] = useState<DepartmentCostAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `department-cost-analysis-${period}-${startDate}-${endDate}-${department}`,
        () => AnalyticsAPI.departmentCostAnalysis(period, startDate, endDate, department),
        {
          cacheDuration: CACHE_DURATIONS.STANDARD,
          priority: PRIORITY.MEDIUM,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load department cost analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [period, startDate, endDate, department]);

  return { data, loading, error, refresh };
}

export function useFootfallTrends(period?: string, startDate?: string, endDate?: string) {
  const [data, setData] = useState<FootfallTrendsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `footfall-trends-${period}-${startDate}-${endDate}`,
        () => AnalyticsAPI.footfallTrends(period, startDate, endDate),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.LOW,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load footfall trends');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [period, startDate, endDate]);

  return { data, loading, error, refresh };
}

export function usePerEmployeeConsumption(startDate?: string, endDate?: string, categoryId?: number, itemId?: number) {
  const [data, setData] = useState<PerEmployeeConsumptionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        `per-employee-consumption-${startDate}-${endDate}-${categoryId}-${itemId}`,
        () => AnalyticsAPI.perEmployeeConsumption(startDate, endDate, categoryId, itemId),
        {
          cacheDuration: CACHE_DURATIONS.STABLE,
          priority: PRIORITY.LOW,
          force
        }
      );
      setData(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to load per-employee consumption');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, [startDate, endDate, categoryId, itemId]);

  return { data, loading, error, refresh };
}

// ============================================================================
// COMPOSITE HOOKS
// ============================================================================

export function useEnhancedAnalytics() {
  const analytics = useAnalytics();
  const budgetHook = useBudgetConsumption('monthly');
  const costDistHook = useCostDistribution('monthly');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAll = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await analytics.refresh();
      
      await Promise.allSettled([
        budgetHook.refresh(),
        costDistHook.refresh()
      ]);
    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to load enhanced analytics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboard: analytics.dashboard,
    stockAlerts: analytics.stockAlerts,
    consumptionTrends: analytics.consumptionTrends,
    topConsumers: analytics.topConsumers,
    inventoryValue: analytics.inventoryValue,
    turnoverRatio: analytics.turnoverRatio,
    budgetData: budgetHook.data,
    costDistributionData: costDistHook.data,
    loading: loading || analytics.loading || budgetHook.loading || costDistHook.loading,
    error: error || analytics.error || budgetHook.error || costDistHook.error,
    refresh: analytics.refresh,
    refreshAll
  };
}

// ============================================================================
// ANALYTICS FILTERS WITH PERSISTENCE
// ============================================================================

export function useAnalyticsFilters() {
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
    
    localStorage.removeItem('analytics-filter-period');
    localStorage.removeItem('analytics-filter-budgetPeriod');
    localStorage.removeItem('analytics-filter-dateRange');
    localStorage.removeItem('analytics-filter-selectedCategory');
    localStorage.removeItem('analytics-filter-selectedItem');
  };
  
  return {
    period,
    setPeriod,
    budgetPeriod,
    setBudgetPeriod,
    dateRange,
    setDateRange,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    selectedCategory,
    setSelectedCategory,
    selectedItem,
    setSelectedItem,
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
// PERFORMANCE MONITORING
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
      avgResponseTime: 0,
      totalRequests,
      cachedRequests
    });
  };

  useEffect(() => {
    const interval = setInterval(calculateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Export utility functions
export { PRIORITY, CACHE_DURATIONS };