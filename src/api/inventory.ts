/* eslint-disable @typescript-eslint/no-explicit-any */
// OPTIMIZED: Inventory API client with improved authentication performance
// Fixed slow authentication checks and added request caching

export type Category = {
  id: number;
  categoryName: string;
  categoryDescription: string;
};

export type ConsumptionRecord = {
  date: string;
  consumedQuantity: number;
  id?: number;
  notes?: string;
  department?: string;
};

export type Item = {
  consumptionRecords?: ConsumptionRecord[];
  lastReceivedQuantity: undefined;
  receivedStock: undefined;
  consumedQuantity: undefined;
  category: any;
  id: number;
  itemName: string;
  itemDescription: string;
  itemCode: string;
  currentQuantity: number;
  totalReceivedStock?: number;  
  totalConsumedStock? : number;
  totalOpeningStock?: number;
  monthConsumedStock?: number; 
  monthReceivedStock?: number;
  openingStock?: number;
  closingStock?: number;
  oldStockQuantity?: number;
  maxStockLevel: number;
  minStockLevel: number;
  reorderLevel?: number;
  reorderQuantity?: number;
  unitOfMeasurement: string;
  unitPrice: number;
  expiryDate?: string;
  totalValue?: number;
  avgDailyConsumption?: number;
  coverageDays?: number;
  stockAlertLevel?: string;
  last_received_date?: string;
  lastConsumptionDate?: string;
  categoryId: number;
  updated_at?: string;
};

export type ConsumptionRequest = {
  quantity: number;
  department?: string;
  notes?: string;
};

export type ReceiptRequest = {
  quantity: number;
  unitPrice?: number;
  referenceNumber?: string;
  supplier?: string;
  notes?: string;
};

export type ConsumptionTrendsResponse = {
  period: string;
  groupBy: string;
  startDate: string;
  endDate: string;
  actualDataRange: string;
  data: Array<{
    [x: string]: any;
    categoryName: string | undefined;
    category?: string;
    itemName?: string;
    itemId?: number;
    dataPoints: Array<{
      periodLabel: string | undefined;
      date?: string;
      day?: number;
      month?: string;
      year?: number;
      week?: string;
      weekStart?: string;
      weekEnd?: string;
      monthStart?: string;
      monthEnd?: string;
      consumption: number;
    }>;
    totalConsumption: number;
    averageConsumption?: number;
  }>;
};

export type StockAnalyticsResponse = {
  stockLevels: Array<{
    category: string;
    totalStock: number;
    itemCount: number;
    averageStock: number;
    percentage: number;
  }>;
  costDistribution: Array<{
    category: string;
    totalValue: number;
    itemCount: number;
    percentage: number;
  }>;
  totalInventoryValue: number;
  totalStock: number;
  riskLevelSummary: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
    SAFE: number;
  };
};

export type TopConsumersResponse = {
  period: string;
  startDate: string;
  endDate: string;
  totalConsumption: number;
  topConsumers: Array<{
    itemId: number;
    itemName: string;
    categoryName: string;
    consumedQuantity: number;
    percentageOfTotal: number;
    totalCost: number;
    unitPrice: number | null;
    dailyPattern: number[];
  }>;
};

export type DataRangeResponse = {
  minDate: string;
  maxDate: string;
  totalDays: number;
  availableMonths: string[];
};

export type CostDistributionResponse = {
  period: string;
  startDate: string;
  endDate: string;
  actualDataRange: string;
  totalCost: number;
  categoryDistribution: Array<{
    category: string;
    categoryId: number;
    totalCost: number;
    totalQuantity: number;
    percentage: number;
    avgUnitPrice: number;
  }>;
  monthlyBreakdown?: Array<{
    month: string;
    monthName: string;
    bins: Array<{
      binPeriod: string;
      totalCost: number;
      categories: Array<{
        categoryName: string;
        totalCost: number;
        items: Array<{
          totalCost: number;
          quantity: number;
          itemName: string;
          consumptionDetails: Array<{
            date: string;
            quantity: number;
            cost: number;
          }>;
        }>;
      }>;
    }>;
  }>;
};

export type BudgetConsumptionResponse = {
  totalVariancePercentage: number;
  totalPlannedBudget: any;
  totalActualSpending: any;
  totalVariance: number;
  budgetData: any[] | undefined;
  period: string;
  budgetType: string;
  startDate: string;
  endDate: string;
  budgetAllocations: {
    monthly: number;
    yearly: number;
  };
  actualData: {
    totalCost: number;
    totalQuantity: number;
    itemCount: number;
    averageUnitCost: number;
    period: string;
    startDate: string;
    endDate: string;
  };
  varianceAnalysis: {
    budgetAmount: number;
    actualAmount: number;
    varianceAmount: number;
    variancePercentage: number;
    status: string;
    severity: string;
    recommendations: string[];
  };
  timeSeriesData: Array<{
    date: string;
    period: string;
    budgetAmount: number;
    actualAmount: number;
    variance: number;
    cumulativeBudget: number;
    cumulativeActual: number;
    utilizationPercentage: number;
  }>;
  summary: {
    budgetUtilization: number;
    remainingBudget: number;
    daysInPeriod: number;
    remainingDays: number;
    dailyBurnRate: number;
    projectedOverrun: number;
    riskLevel: string;
  };
};

export type FootfallData = {
  id: number;
  date: string;
  employeeCount: number;
  visitorCount: number;
  totalFootfall: number;
  department: string;
  notes?: string;
  isWeekend?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type FootfallStatistics = {
  success: boolean;
  period: { startDate: string; endDate: string };
  totalRecords: number;
  statistics: {
    totalDays: number;
    totalEmployees: number;
    totalVisitors: number;
    totalFootfall: number;
    averageEmployeesPerDay: number;
    averageVisitorsPerDay: number;
    averageTotalPerDay: number;
    peakDay?: {
      date: string;
      count: number;
      employees: number;
      visitors: number;
    };
    lowDay?: {
      date: string;
      count: number;
      employees: number;
      visitors: number;
    };
  };
  message?: string;
  error?: string;
};

export type FootfallListResponse = {
  success: boolean;
  data: FootfallData[];
  totalRecords: number;
  statistics: {
    totalEmployees: number;
    totalVisitors: number;
    averageEmployees: number;
    averageVisitors: number;
    totalDays: number;
    maxFootfall: number;
    minFootfall: number;
  };
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: {
    startDate: string;
    endDate: string;
    department: string;
    sortBy: string;
    sortOrder: string;
  };
  error?: string;
};

// API Base URL configuration
const VITE_ENV: any = (import.meta as any).env || {};
const API_BASE: string = 
  VITE_ENV.VITE_INVENTORY_API_BASE_URL || 
  VITE_ENV.VITE_API_BASE_URL || 
  "http://localhost:8082";

// Token refresh state management to avoid multiple concurrent refresh attempts
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// OPTIMIZED: HTTP client with improved authentication performance
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  
  // Skip detailed logging for performance
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔗 API: ${init?.method || 'GET'} ${path}`);
  }
  
  // Get auth token
  const accessToken = localStorage.getItem('accessToken');
  
  // Build headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    ...(init?.headers || {}),
  };
  
  try {
    const response = await fetch(url, {
      ...init,
      headers,
    });

    // Quick success path for performance
    if (response.ok) {
      const data = await response.json();
      return data as T;
    }

    // Handle 401 with optimized token refresh
    if (response.status === 401 && accessToken) {
      // Prevent multiple concurrent refresh attempts
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = (async () => {
          try {
            const { refreshToken } = await import('./auth');
            const newAuth = await refreshToken();
            isRefreshing = false;
            return newAuth;
          } catch (error) {
            isRefreshing = false;
            refreshPromise = null;
            // Only redirect if refresh actually fails
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            throw new Error('Session expired. Please login again.');
          }
        })();
      }
      
      // Wait for the refresh to complete
      if (refreshPromise) {
        const newAuth = await refreshPromise;

        // Retry with new token
        const retryHeaders = {
          ...headers,
          'Authorization': `Bearer ${newAuth.accessToken}`
        };

        const retryResponse = await fetch(url, {
          ...init,
          headers: retryHeaders,
        });

        if (retryResponse.ok) {
          return await retryResponse.json() as T;
        }
      }
    }

    // Handle other error responses
    let errorMessage = `Request failed: ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // JSON parse failed, use default message
    }
    
    if (response.status >= 500) {
      throw new Error(`Server Error (${response.status}): ${errorMessage}`);
    } else if (response.status === 404) {
      throw new Error(`Endpoint not found: ${path}`);
    } else {
      throw new Error(errorMessage);
    }
    
  } catch (error: any) {
    // Network errors
    if (error.message.includes('Failed to fetch') || error.name === 'NetworkError') {
      throw new Error(`Cannot connect to backend server at ${API_BASE}`);
    }
    throw error;
  }
}

// Simple cache implementation for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

async function cachedHttp<T>(path: string, init?: RequestInit): Promise<T> {
  const cacheKey = `${init?.method || 'GET'}:${path}`;
  
  // Only cache GET requests
  if (!init?.method || init.method === 'GET') {
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data as T;
    }
  }
  
  const data = await http<T>(path, init);
  
  // Cache successful GET responses
  if (!init?.method || init.method === 'GET') {
    cache.set(cacheKey, { data, timestamp: Date.now() });
  }
  
  return data;
}

// Categories API
export const CategoriesAPI = {
  list: () => cachedHttp<Category[]>("/api/categories", { method: "GET" }),
  create: (body: { categoryName: string; categoryDescription: string }) =>
    http<Category>("/api/categories", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: { categoryName: string; categoryDescription: string }) =>
    http<Category>(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number) => http<void>(`/api/categories/${id}`, { method: "DELETE" }),
};

// Items API
export const ItemsAPI = {
  list: () => cachedHttp<Item[]>("/api/items", { method: "GET" }),
  get: (id: number) => cachedHttp<Item>(`/api/items/${id}`, { method: "GET" }),
  create: (body: Omit<Item, 'id'>) => http<Item>("/api/items", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: Partial<Omit<Item, 'id'>>) =>
    http<Item>(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number) => http<void>(`/api/items/${id}`, { method: "DELETE" }),
  search: (q: string) => cachedHttp<Item[]>(`/api/items/search?q=${encodeURIComponent(q)}`, { method: "GET" }),
  lowStock: (threshold: number) => cachedHttp<Item[]>(`/api/items/low-stock?threshold=${threshold}`, { method: "GET" }),
  expiring: (days: number) => cachedHttp<Item[]>(`/api/items/expiring?days=${days}`, { method: "GET" }),
  expired: () => cachedHttp<Item[]>(`/api/items/expired`, { method: "GET" }),
  consume: (id: number, body: ConsumptionRequest) =>
    http<{ success: boolean }>(`/api/items/${id}/consume`, { method: "POST", body: JSON.stringify(body) }),
  receive: (id: number, body: ReceiptRequest) =>
    http<{ success: boolean }>(`/api/items/${id}/receive`, { method: "POST", body: JSON.stringify(body) }),
};

// Analytics API with caching for dashboard data
export const AnalyticsAPI = {
  dashboard: () => cachedHttp<any>("/api/analytics/dashboard", { method: "GET" }),
  
  stockAlerts: () => cachedHttp<any>("/api/analytics/stock-alerts", { method: "GET" }),
  
  consumptionTrends: (period?: string, groupBy?: string, categoryId?: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (groupBy) params.append('groupBy', groupBy);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return cachedHttp<ConsumptionTrendsResponse>(`/api/analytics/consumption-trends${query ? `?${query}` : ''}`, { method: "GET" });
  },
  
  topConsumers: (days?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());
    if (limit) params.append('limit', limit.toString());
    const query = params.toString();
    return cachedHttp<TopConsumersResponse>(`/api/analytics/top-consuming-items${query ? `?${query}` : ''}`, { method: "GET" });
  },
  
  stockAnalytics: () => cachedHttp<StockAnalyticsResponse>("/api/analytics/stock-analytics", { method: "GET" }),
  
  dataRange: () => cachedHttp<DataRangeResponse>("/api/analytics/data-range", { method: "GET" }),
  
  verifyData: () => http<any>("/api/analytics/verify-data", { method: "GET" }),
  
  inventoryValue: () => cachedHttp<any>("/api/analytics/inventory-value", { method: "GET" }),
  
  turnoverRatio: () => cachedHttp<any>("/api/analytics/turnover-ratio", { method: "GET" }),
  
  analytics: () => cachedHttp<any>("/api/analytics", { method: "GET" }),
  
  costDistribution: (period?: string, startDate?: string, endDate?: string, includeBins?: boolean) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (includeBins) params.append('includeBins', 'true');
    const query = params.toString();
    return cachedHttp<CostDistributionResponse>(`/api/analytics/cost-distribution${query ? `?${query}` : ''}`, { method: "GET" });
  },
  
  budgetConsumption: (period?: string, startDate?: string, endDate?: string, budgetType?: string, categoryId?: number, department?: string, includeProjections?: boolean) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (budgetType) params.append('budgetType', budgetType);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (department) params.append('department', department);
    if (includeProjections !== undefined) params.append('includeProjections', includeProjections.toString());
    const query = params.toString();
    return cachedHttp<BudgetConsumptionResponse>(`/api/analytics/budget-consumption${query ? `?${query}` : ''}`, { method: "GET" });
  },

  enhancedCostDistribution: (period?: string, startDate?: string, endDate?: string, breakdown?: string, includeProjections?: boolean) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (breakdown) params.append('breakdown', breakdown);
    if (includeProjections !== undefined) params.append('includeProjections', includeProjections.toString());
    const query = params.toString();
    return cachedHttp<any>(`/api/analytics/enhanced-cost-distribution${query ? `?${query}` : ''}`, { method: "GET" });
  },

  budgetVsActual: (year?: number, granularity?: string, categoryId?: number, department?: string, includeForecasts?: boolean, includeVariance?: boolean, quarter?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (granularity) params.append('granularity', granularity);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (department) params.append('department', department);
    if (includeForecasts !== undefined) params.append('includeForecasts', includeForecasts.toString());
    if (includeVariance !== undefined) params.append('includeVariance', includeVariance.toString());
    if (quarter) params.append('quarter', quarter.toString());
    const query = params.toString();
    return cachedHttp<any>(`/api/analytics/budget-vs-actual${query ? `?${query}` : ''}`, { method: "GET" });
  },

  itemHeatmap: (itemId: number, period?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return http<any>(`/api/analytics/item-heatmap/${itemId}${query ? `?${query}` : ''}`, { method: "GET" });
  },

  stockMovements: (period?: string, startDate?: string, endDate?: string, categoryId?: number, itemId?: number) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (itemId) params.append('itemId', itemId.toString());
    const query = params.toString();
    return cachedHttp<any>(`/api/analytics/stock-movements${query ? `?${query}` : ''}`, { method: "GET" });
  },

  stockLevels: (categoryId?: number, alertLevel?: string, sortBy?: string, sortOrder?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (alertLevel) params.append('alertLevel', alertLevel);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    const query = params.toString();
    return cachedHttp<any>(`/api/analytics/stock-levels${query ? `?${query}` : ''}`, { method: "GET" });
  },

  costPerEmployee: (period?: string, startDate?: string, endDate?: string, categoryId?: number, department?: string, includeComparisons?: boolean) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (department) params.append('department', department);
    if (includeComparisons !== undefined) params.append('includeComparisons', includeComparisons.toString());
    const query = params.toString();
    return cachedHttp<any>(`/api/analytics/cost-per-employee${query ? `?${query}` : ''}`, { method: "GET" });
  }
};

// Footfall API (keeping original implementation as it's less frequently called)
export const FootfallAPI = {
  list: async (startDate?: string, endDate?: string, department?: string, page = 0, size = 50): Promise<FootfallListResponse> => {
    const params = new URLSearchParams();
    
    if (!startDate) startDate = '2025-01-01';
    if (!endDate) endDate = '2025-07-31';
    
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    if (department && department !== 'All') params.append('department', department);
    params.append('page', page.toString());
    params.append('size', size.toString());
    params.append('sortBy', 'date');
    params.append('sortOrder', 'ASC');
    
    const query = params.toString();
    return http<FootfallListResponse>(`/api/footfall?${query}`, { method: "GET" });
  },

  getByDate: (date: string) => {
    return http<{ 
      success: boolean;
      found: boolean; 
      data?: FootfallData;
      message?: string;
      error?: string;
    }>(`/api/footfall/date/${date}`, { method: "GET" });
  },

  statistics: async (startDate?: string, endDate?: string): Promise<FootfallStatistics> => {
    const params = new URLSearchParams();
    
    if (!startDate) startDate = '2025-01-01';
    if (!endDate) endDate = '2025-07-31';
    
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    
    const query = params.toString();
    return http<FootfallStatistics>(`/api/footfall/statistics?${query}`, { method: "GET" });
  },

  debug: () => {
    return http<{
      totalRecords: number;
      sampleRecords: Array<{
        id: number;
        date: string;
        employeeCount: number;
        visitorCount: number;
        totalFootfall: number;
        department: string;
        notes?: string;
      }>;
      dateRange?: {
        minDate: string;
        maxDate: string;
      };
      error?: string;
    }>("/api/footfall/debug", { method: "GET" });
  },

  exists: (date?: string) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    const query = params.toString();
    
    return http<{ 
      success: boolean;
      date: string; 
      exists: boolean; 
      message: string; 
    }>(`/api/footfall/exists${query ? `?${query}` : ''}`, { method: "GET" });
  },

  dataRange: () => {
    return http<{ 
      success: boolean;
      totalRecords: number; 
      dateRange?: {
        minDate: string;
        maxDate: string;
      };
      error?: string;
    }>("/api/footfall/data-range", { method: "GET" });
  },

  upload: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    
    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const res = await fetch(`${API_BASE}/api/footfall/upload`, {
      method: 'POST',
      body: form,
      headers,
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} - ${errorText}`);
    }
    
    return res.json().catch(() => ({}));
  },

  health: () => {
    return http<{ 
      status: string; 
      timestamp: string; 
      service: string; 
    }>("/api/footfall/health", { method: "GET" });
  },
};

// Upload API
export const UploadAPI = {
  uploadItems: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    
    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const res = await fetch(`${API_BASE}/api/upload/items`, {
      method: 'POST',
      body: form,
      headers,
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} - ${errorText}`);
    }
    
    return res.json();
  },
  
  uploadConsumption: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    
    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const res = await fetch(`${API_BASE}/api/upload/consumption`, {
      method: 'POST',
      body: form,
      headers,
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} - ${errorText}`);
    }
    
    return res.json();
  },
  
  validateItems: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    
    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const res = await fetch(`${API_BASE}/api/upload/items/validate`, {
      method: 'POST',
      body: form,
      headers,
    });
    
    if (!res.ok) throw new Error(`Validation failed: ${res.status}`);
    return res.json();
  },
  
  validateConsumption: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    
    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const res = await fetch(`${API_BASE}/api/upload/consumption/validate`, {
      method: 'POST',
      body: form,
      headers,
    });
    
    if (!res.ok) throw new Error(`Validation failed: ${res.status}`);
    return res.json();
  },
  
  getItemsTemplate: () => http<any>(`/api/upload/template`, { method: 'GET' }),
  getConsumptionTemplate: () => http<any>(`/api/upload/consumption/template`, { method: 'GET' }),
  getItemsInstructions: () => http<any>(`/api/upload/instructions`, { method: 'GET' }),
  getConsumptionInstructions: () => http<any>(`/api/upload/consumption/instructions`, { method: 'GET' }),
};

export function getApiBase() {
  return API_BASE;
}

// Clear cache function
export function clearApiCache() {
  cache.clear();
}

// Test API connectivity
export async function testApiConnectivity() {
  const results = {
    baseUrl: API_BASE,
    tests: {} as { [key: string]: { success: boolean; error?: string; data?: any } }
  };
  
  // Test basic analytics first
  try {
    const dashboard = await AnalyticsAPI.dashboard();
    results.tests.dashboard = { success: true, data: dashboard };
  } catch (error: any) {
    results.tests.dashboard = { success: false, error: error.message };
  }
  
  // Test cost distribution
  try {
    const costDist = await AnalyticsAPI.costDistribution('monthly');
    results.tests.costDistribution = { success: true, data: costDist };
  } catch (error: any) {
    results.tests.costDistribution = { success: false, error: error.message };
  }
  
  // Test budget consumption
  try {
    const budgetConsump = await AnalyticsAPI.budgetConsumption('monthly');
    results.tests.budgetConsumption = { success: true, data: budgetConsump };
  } catch (error: any) {
    results.tests.budgetConsumption = { success: false, error: error.message };
  }
  
  return results;
}