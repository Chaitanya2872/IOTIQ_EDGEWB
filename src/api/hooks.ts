/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useMemo, useState, useCallback } from 'react';
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
  type costConsumptionResponse
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
    console.log(`âœ… Cache hit: ${key}`);
    return cached.data;
  }

  // Check if request is already in flight
  if (requestCache.has(key)) {
    console.log(`â³ Request in flight, waiting: ${key}`);
    return requestCache.get(key)!;
  }

  // Make new request
  console.log(`ðŸ”„ Making new request: ${key}`);
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
  console.log('ðŸ§¹ All caches cleared');
}

export function clearCache(key: string) {
  responseCache.delete(key);
  requestCache.delete(key);
  console.log(`🗑️ Cleared cache: ${key}`);
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
      console.log('ðŸ“¦ Fetching items...');
      const items = await optimizedRequest(
        'items-list',
        () => ItemsAPI.list()
      );
      console.log(`âœ… Items loaded: ${items.length} items`);
      setData(items); 
    }
    catch (e: any) { 
      console.error('âŒ Items fetch error:', e);
      const errorMessage = e?.message || 'Failed to load items';
      setError(errorMessage);
      
      // Check if it's an auth error
      if (errorMessage.includes('Session expired') || errorMessage.includes('401')) {
        console.log('ðŸ” Redirecting to login due to auth error');
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
      console.log('ðŸ“Š Fetching analytics data...');
      
      // Fetch both in parallel with caching
      const [dashboardData, stockData] = await Promise.all([
        optimizedRequest('analytics-dashboard', () => AnalyticsAPI.dashboard())
          .catch(err => {
            console.warn('âš ï¸ Dashboard data failed:', err);
            return null;
          }),
        optimizedRequest('analytics-stock', () => AnalyticsAPI.stockAnalytics())
          .catch(err => {
            console.warn('âš ï¸ Stock analytics failed:', err);
            return null;
          })
      ]);
      
      setDashboard(dashboardData);
      setStockAnalytics(stockData);
      console.log('âœ… Analytics loaded');
    }
    catch (e: any) {
      console.error('âŒ Analytics fetch error:', e);
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
// NEW ANALYTICS HOOKS - Dashboard & Basic Stats
// ============================================================================

export function useDashboardBulk(year?: number, month?: number, categoryId?: number) {
  const [data, setData] = useState<DashboardBulkResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `dashboard-bulk-${year}-${month}-${categoryId}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.dashboardBulk(year, month, categoryId)
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
// NEW ANALYTICS HOOKS - Consumption & Trends
// ============================================================================

export function useConsumptionTrends(period?: string, groupBy?: string, categoryId?: number) {
  const [data, setData] = useState<ConsumptionTrendsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `consumption-trends-${period}-${groupBy}-${categoryId}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.consumptionTrends(period, groupBy, categoryId)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `top-consuming-items-${days}-${limit}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.topConsumingItems(days, limit)
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
// NEW ANALYTICS HOOKS - Stock Analysis
// ============================================================================

export function useStockUsage(categoryId?: number) {
  const [data, setData] = useState<StockUsageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `stock-usage-${categoryId}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.stockUsage(categoryId)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `stock-levels-${categoryId}-${alertLevel}-${sortBy}-${sortOrder}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.stockLevels(categoryId, alertLevel, sortBy, sortOrder)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        'stock-distribution-category',
        () => AnalyticsAPI.stockDistributionCategory()
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

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Fetching monthly stock trend data...');
      
      clearCache(cacheKey);
      
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.monthlyStockValueTrend(startDate, endDate, categoryId),
        0
      );
      
      if (result?.trendData) {
        console.log(`✅ Received ${result.trendData.length} months of data`);
      }
      
      setData(result);
    } catch (e: any) {
      console.error('❌ Error:', e);
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `monthly-forecast-${year}-${month}-${categoryId}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.monthlyForecast(year, month, categoryId)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `forecast-vs-actual-bins-${year}-${month}-${categoryId}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.forecastVsActualBins(year, month, categoryId)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        'bin-variance-analysis',
        () => AnalyticsAPI.binVarianceAnalysis()
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `item-heatmap-${itemId}-${period}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.itemHeatmap(itemId, period)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `consumption-patterns-${itemId}-${startDate}-${endDate}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.consumptionPatterns(itemId, startDate, endDate)
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

// Add this hook in hooks.ts

export function useCostConsumption(startDate?: string, endDate?: string) {
  const [data, setData] = useState<costConsumptionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `cost-consumption-${startDate}-${endDate}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.costConsumption(startDate, endDate)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `price-trends-${itemId}-${startDate}-${endDate}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.priceTrends(itemId, startDate, endDate)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `lead-time-analysis-${supplierId}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.leadTimeAnalysis(supplierId)
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
      const cacheKey = `budget-consumption-${period}-${startDate}-${endDate}-${budgetType}-${categoryId}-${department}-${includeProjections}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.budgetConsumption(period, startDate, endDate, budgetType, categoryId, department, includeProjections)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        'budget-kpis',
        () => AnalyticsAPI.budgetKPIs()
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `budget-comparison-${startDate}-${endDate}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.budgetComparison(startDate, endDate)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `cost-distribution-${period}-${startDate}-${endDate}-${categoryId}-${groupBy}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.costDistribution(period, startDate, endDate, categoryId, groupBy)
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
// NEW ANALYTICS HOOKS - Performance Metrics
// ============================================================================

export function useDataRange() {
  const [data, setData] = useState<AvailableDateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await optimizedRequest(
        'data-range',
        () => AnalyticsAPI.availableDateRange()
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `inventory-turnover-${period}-${categoryId}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.inventoryTurnover(period, categoryId)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `supplier-performance-${startDate}-${endDate}-${supplierId}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.supplierPerformance(startDate, endDate, supplierId)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `reorder-recommendations-${categoryId}-${urgencyLevel}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.reorderRecommendations(categoryId, urgencyLevel)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `expiry-analysis-${daysThreshold}-${categoryId}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.expiryAnalysis(daysThreshold, categoryId)
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
// NEW ANALYTICS HOOKS - Department & Footfall
// ============================================================================

export function useDepartmentCostAnalysis(period?: string, startDate?: string, endDate?: string, department?: string) {
  const [data, setData] = useState<DepartmentCostAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `department-cost-analysis-${period}-${startDate}-${endDate}-${department}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.departmentCostAnalysis(period, startDate, endDate, department)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `footfall-trends-${period}-${startDate}-${endDate}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.footfallTrends(period, startDate, endDate)
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

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const cacheKey = `per-employee-consumption-${startDate}-${endDate}-${categoryId}-${itemId}`;
      const result = await optimizedRequest(
        cacheKey,
        () => AnalyticsAPI.perEmployeeConsumption(startDate, endDate, categoryId, itemId)
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
// COMPOSITE HOOK - Enhanced Analytics (Backward Compatibility)
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
      console.log('ðŸ”„ Refreshing all analytics...');
      
      // Refresh basic analytics first
      await analytics.refresh();
      
      // Then refresh enhanced features in parallel
      await Promise.allSettled([
        budgetHook.refresh(),
        costDistHook.refresh()
      ]);
      
      console.log('âœ… All analytics refreshed');
    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to load enhanced analytics';
      setError(errorMessage);
      console.error('âŒ Enhanced analytics error:', e);
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

// Removed stray local stub for useCallback; using React's useCallback imported from 'react' instead.
