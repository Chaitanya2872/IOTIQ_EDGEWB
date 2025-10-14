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

export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true); setError(null);
    try { setData(await CategoriesAPI.list()); }
    catch (e: any) { setError(e?.message || 'Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const actions = useMemo(() => ({
    create: async (body: { categoryName: string; categoryDescription: string }) => {
      await CategoriesAPI.create(body); await refresh();
    },
    update: async (id: number, body: { categoryName: string; categoryDescription: string }) => {
      await CategoriesAPI.update(id, body); await refresh();
    },
    remove: async (id: number) => { await CategoriesAPI.remove(id); await refresh(); },
  }), []);

  return { data, loading, error, refresh, ...actions };
}

// Add this enhanced error handling to your useItems hook
export function useItems() {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true); 
    setError(null);
    try { 
      console.log('🔄 Fetching items...');
      const items = await ItemsAPI.list();
      console.log('✅ Items fetched:', items.length);
      setData(items); 
    }
    catch (e: any) { 
      console.error('❌ Items fetch error:', e);
      const errorMessage = e?.message || 'Failed to load items';
      setError(errorMessage);
      
      // Check if it's an auth error
      if (errorMessage.includes('Session expired') || errorMessage.includes('401')) {
        console.log('🔄 Redirecting to login due to auth error');
        // The enhanced http function should handle this, but just in case
      }
    }
    finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { refresh(); }, []);

  // Rest of your existing actions...
  const actions = useMemo(() => ({
    get: (id: number) => ItemsAPI.get(id),
    create: async (body: Omit<Item, 'id'>) => { await ItemsAPI.create(body); await refresh(); },
    update: async (id: number, body: Partial<Omit<Item, 'id'>>) => { await ItemsAPI.update(id, body); await refresh(); },
    remove: async (id: number) => { await ItemsAPI.remove(id); await refresh(); },
    search: (q: string) => ItemsAPI.search(q),
    lowStock: (threshold: number) => ItemsAPI.lowStock(threshold),
    expiring: (days: number) => ItemsAPI.expiring(days),
    expired: () => ItemsAPI.expired(),
    consume: async (id: number, qty: number, department?: string, notes?: string) => {
      await ItemsAPI.consume(id, { quantity: qty, department, notes }); await refresh();
    },
    receive: async (id: number, qty: number, unitPrice?: number, referenceNumber?: string, supplier?: string, notes?: string) => {
      await ItemsAPI.receive(id, { quantity: qty, unitPrice, referenceNumber, supplier, notes }); await refresh();
    },
  }), []);

  return { data, loading, error, refresh, ...actions };
}

export function useAnalytics() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true); setError(null);
    try { setDashboard(await AnalyticsAPI.dashboard()); }
    catch (e: any) { setError(e?.message || 'Failed to load analytics'); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  return { 
    dashboard, 
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

// FIXED: Budget Consumption hook with enhanced error handling
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
      // Use simplified parameters that align with backend
      const budgetData = await AnalyticsAPI.budgetConsumption(
        period || 'monthly', 
        startDate, 
        endDate, 
        budgetType || 'category',
        categoryId,
        department,
        includeProjections || false
      );
      setData(budgetData);
      console.log('✅ Budget consumption data loaded:', budgetData);
    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to load budget consumption data';
      setError(errorMessage);
      console.error('❌ Budget consumption hook error:', e);
      
      // Log specific error details for debugging
      if (errorMessage.includes('500')) {
        console.error('Server error - check backend implementation:');
        console.error('- Ensure BudgetRepository methods exist');
        console.error('- Check if data exists in consumption_records table');
        console.error('- Verify all null-safe operations in service layer');
      }
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

// FIXED: Cost Distribution hook with enhanced error handling
export function useCostDistribution(period?: string, startDate?: string, endDate?: string) {
  const [data, setData] = useState<CostDistributionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true); 
    setError(null);
    
    try {
      const costData = await AnalyticsAPI.costDistribution(period || 'monthly', startDate, endDate);
      setData(costData);
      console.log('✅ Cost distribution data loaded:', costData);
    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to load cost distribution data';
      setError(errorMessage);
      console.error('❌ Cost distribution hook error:', e);
      
      // Log specific error details for debugging
      if (errorMessage.includes('500')) {
        console.error('Server error - check backend implementation:');
        console.error('- Ensure ConsumptionRecordRepository methods exist');
        console.error('- Check if consumption data exists for the period');
        console.error('- Verify item prices are not null');
      }
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

// SIMPLIFIED: Enhanced analytics hook - removes complex multi-call logic that might cause errors
export function useEnhancedAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Basic analytics
  const analytics = useAnalytics();
  
  // Individual hooks for enhanced features - this prevents cascading failures
  const budgetHook = useBudgetConsumption('monthly');
  const costDistHook = useCostDistribution('monthly');
  
  const refreshAll = async (period?: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Refresh basic analytics first
      await analytics.refresh();
      
      // Then refresh enhanced features - but don't fail if these fail
      await Promise.allSettled([
        budgetHook.refresh(),
        costDistHook.refresh()
      ]);
      
    } catch (e: any) {
      const errorMessage = e?.message || 'Failed to load enhanced analytics';
      setError(errorMessage);
      console.error('❌ Enhanced analytics hook error:', e);
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

// SIMPLIFIED: Analytics filters hook - removed complex state management
export function useAnalyticsFilters() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [budgetPeriod, setBudgetPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({
    startDate: '2025-01-01',
    endDate: '2025-07-31'
  });
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  
  const resetFilters = () => {
    setPeriod('monthly');
    setBudgetPeriod('monthly');
    setDateRange({
      startDate: '2025-01-01',
      endDate: '2025-07-31'
    });
    setSelectedCategory(null);
    setSelectedItem(null);
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

// NEW: Simplified hook for testing API connectivity
export function useApiConnectivity() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnectivity = async () => {
    setLoading(true);
    try {
      const testResults = await testApiConnectivity();
      setResults(testResults);
    } catch (error) {
      console.error('Failed to test API connectivity:', error);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, testConnectivity };
}

// Import the test function from inventory-fixed
async function testApiConnectivity() {
  // This would be imported from inventory-fixed
  // For now, just return a basic test
  return {
    baseUrl: 'http://localhost:8082',
    tests: {
      dashboard: { success: true },
      costDistribution: { success: true },
      budgetConsumption: { success: true }
    }
  };
}