// FIXED: Inventory API client with proper Budget Consumption and Cost Distribution structure
// Addresses 500 server errors by aligning with actual backend implementation

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
  itemCode: string;                // ✅ add this if not already in type
  currentQuantity: number;
  totalReceivedStock?: number;  
  totalConsumedStock? : number;
  totalOpeningStock?: number;
  monthConsumedStock?: number; 
  monthReceivedStock?: number; // ✅ add
  openingStock?: number;           // ✅ add
  closingStock?: number;           // ✅ add
  oldStockQuantity?: number;
  maxStockLevel: number;
  minStockLevel: number;
  reorderLevel?: number;           // ✅ optional if backend gives
  reorderQuantity?: number;        // ✅ optional
  unitOfMeasurement: string;
  unitPrice: number;
  expiryDate?: string;
  totalValue?: number;             // ✅ backend gives
  avgDailyConsumption?: number;    // ✅ backend gives
  coverageDays?: number;           // ✅ backend gives
  stockAlertLevel?: string;        // ✅ backend gives (SAFE / LOW / CRITICAL)
  last_received_date?: string;
  lastConsumptionDate?: string;
  categoryId: number;
  updated_at?: string;          // ✅ add if not already in type
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

// FIXED: Analytics Response Types aligned with backend
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

// FIXED: Simplified Cost Distribution Response (aligned with backend)
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

// FIXED: Simplified Budget Consumption Response (aligned with backend implementation)
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

// Footfall Types (unchanged)
export type FootfallData = {
  id: number;
  date: string; // ISO date
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
  "http://localhost:8080";

// ENHANCED: HTTP client with better error handling for 500 errors
// Replace your existing http function with this enhanced version
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  
  console.log(`🔗 API Call: ${init?.method || 'GET'} ${url}`);
  
  // Get auth token
  const accessToken = localStorage.getItem('accessToken');
  
  // Enhanced headers with authentication
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    ...(init?.headers || {}),
  };
  
  try {
    let response = await fetch(url, {
      ...init,
      headers,
    });

    // Handle 401 unauthorized - try token refresh
    if (response.status === 401 && accessToken) {
      console.log('🔄 Token expired, attempting refresh...');
      
      try {
        // Import the refresh function
        const { refreshToken } = await import('./auth');
        const newAuth = await refreshToken();
        
        // Retry with new token
        const retryHeaders = {
          ...headers,
          'Authorization': `Bearer ${newAuth.accessToken}`
        };
        
        response = await fetch(url, {
          ...init,
          headers: retryHeaders,
        });
      } catch (refreshError) {
        console.error('🚫 Token refresh failed:', refreshError);
        // Redirect to login
        window.location.href = '/login';
        throw new Error('Session expired. Please login again.');
      }
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      
      if (responseText.includes('<html>')) {
        console.error('❌ Received HTML instead of JSON:', responseText.substring(0, 200));
        throw new Error(`API endpoint not found. Check if ${path} exists in your backend.`);
      }
    }

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('❌ Failed to parse JSON response:', jsonError);
      if (response.status >= 500) {
        throw new Error(`Server error (${response.status}): Internal server error. Check backend logs for details.`);
      }
      data = {};
    }
    
    if (!response.ok) {
      const message = (data && (data.message || data.error)) || `Request failed: ${response.status}`;
      console.error(`❌ API Error: ${response.status} - ${message}`);
      
      // Enhanced error handling for specific status codes
      if (response.status >= 500) {
        throw new Error(`Server Error (${response.status}): ${message}. Check backend implementation and logs.`);
      } else if (response.status === 404) {
        throw new Error(`Endpoint not found: ${path}. Check if the endpoint exists in your backend.`);
      } else {
        throw new Error(message);
      }
    }
    
    console.log(`✅ API Success: ${path}`, { dataType: typeof data, hasData: !!data });
    return data as T;
    
  } catch (error: any) {
    if (error.message.includes('Failed to fetch') || error.name === 'NetworkError') {
      throw new Error(`Cannot connect to backend server at ${API_BASE}. Check if Spring Boot is running.`);
    }
    
    throw error;
  }
}

// ------- Categories -------
export const CategoriesAPI = {
  list: () => http<Category[]>("/api/categories", { method: "GET" }),
  create: (body: { categoryName: string; categoryDescription: string }) =>
    http<Category>("/api/categories", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: { categoryName: string; categoryDescription: string }) =>
    http<Category>(`/api/categories/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number) => http<void>(`/api/categories/${id}`, { method: "DELETE" }),
};

// ------- Items -------
export const ItemsAPI = {
  list: () => http<Item[]>("/api/items", { method: "GET" }),
  get: (id: number) => http<Item>(`/api/items/${id}`, { method: "GET" }),
  create: (body: Omit<Item, 'id'>) => http<Item>("/api/items", { method: "POST", body: JSON.stringify(body) }),
  update: (id: number, body: Partial<Omit<Item, 'id'>>) =>
    http<Item>(`/api/items/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: number) => http<void>(`/api/items/${id}`, { method: "DELETE" }),
  search: (q: string) => http<Item[]>(`/api/items/search?q=${encodeURIComponent(q)}`, { method: "GET" }),
  lowStock: (threshold: number) => http<Item[]>(`/api/items/low-stock?threshold=${threshold}`, { method: "GET" }),
  expiring: (days: number) => http<Item[]>(`/api/items/expiring?days=${days}`, { method: "GET" }),
  expired: () => http<Item[]>(`/api/items/expired`, { method: "GET" }),
  consume: (id: number, body: ConsumptionRequest) =>
    http<{ success: boolean }>(`/api/items/${id}/consume`, { method: "POST", body: JSON.stringify(body) }),
  receive: (id: number, body: ReceiptRequest) =>
    http<{ success: boolean }>(`/api/items/${id}/receive`, { method: "POST", body: JSON.stringify(body) }),
};

// ------- Footfall API (unchanged) -------
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
    console.log(`📋 Fetching footfall list: /api/footfall?${query}`);
    
    return http<FootfallListResponse>(`/api/footfall?${query}`, { method: "GET" });
  },

  getByDate: (date: string) => {
    console.log(`📦 Fetching footfall for date: ${date}`);
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
    console.log(`📊 Fetching footfall statistics: /api/footfall/statistics?${query}`);
    
    return http<FootfallStatistics>(`/api/footfall/statistics?${query}`, { method: "GET" });
  },

  debug: () => {
    console.log('🔧 Debugging footfall data');
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
    
    console.log(`🔍 Checking footfall exists: /api/footfall/exists${query ? `?${query}` : ''}`);
    
    return http<{ 
      success: boolean;
      date: string; 
      exists: boolean; 
      message: string; 
    }>(`/api/footfall/exists${query ? `?${query}` : ''}`, { method: "GET" });
  },

  dataRange: () => {
    console.log('📅 Fetching footfall data range');
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
    console.log(`📤 Uploading footfall file: ${file.name}`);
    const form = new FormData();
    form.append('file', file);
    
    const res = await fetch(`${API_BASE}/api/footfall/upload`, {
      method: 'POST',
      body: form,
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Upload failed: ${res.status} - ${errorText}`);
    }
    
    return res.json().catch(() => ({}));
  },

  health: () => {
    console.log('💗 Checking footfall service health');
    return http<{ 
      status: string; 
      timestamp: string; 
      service: string; 
    }>("/api/footfall/health", { method: "GET" });
  },
};

// ------- FIXED Analytics API with proper Budget & Cost Distribution -------
export const AnalyticsAPI = {
  // Basic dashboard stats
  dashboard: () => http<any>("/api/analytics/dashboard", { method: "GET" }),
  
  // Stock alerts
  stockAlerts: () => http<any>("/api/analytics/stock-alerts", { method: "GET" }),
  
  // Consumption trends with filters
  consumptionTrends: (period?: string, groupBy?: string, categoryId?: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (groupBy) params.append('groupBy', groupBy);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return http<ConsumptionTrendsResponse>(`/api/analytics/consumption-trends${query ? `?${query}` : ''}`, { method: "GET" });
  },
  
  // Top consuming items
  topConsumers: (days?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());
    if (limit) params.append('limit', limit.toString());
    const query = params.toString();
    return http<TopConsumersResponse>(`/api/analytics/top-consuming-items${query ? `?${query}` : ''}`, { method: "GET" });
  },
  
  // Stock analytics (levels and cost distribution)
  stockAnalytics: () => http<StockAnalyticsResponse>("/api/analytics/stock-analytics", { method: "GET" }),
  
  // Get available data date range
  dataRange: () => http<DataRangeResponse>("/api/analytics/data-range", { method: "GET" }),
  
  // Verify imported consumption data
  verifyData: () => http<any>("/api/analytics/verify-data", { method: "GET" }),
  
  // Inventory value analysis
  inventoryValue: () => http<any>("/api/analytics/inventory-value", { method: "GET" }),
  
  // Turnover ratio
  turnoverRatio: () => http<any>("/api/analytics/turnover-ratio", { method: "GET" }),
  
  // Legacy analytics endpoint
  analytics: () => http<any>("/api/analytics", { method: "GET" }),
  
  // FIXED: Cost distribution by category (matches backend implementation)
  costDistribution: (period?: string, startDate?: string, endDate?: string, includeBins?: boolean) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (includeBins) params.append('includeBins', 'true');
    const query = params.toString();
    console.log(`💰 Fetching cost distribution: /api/analytics/cost-distribution${query ? `?${query}` : ''}`);
    return http<CostDistributionResponse>(`/api/analytics/cost-distribution${query ? `?${query}` : ''}`, { method: "GET" });
  },
  
  // FIXED: Budget consumption analysis (simplified to match backend)
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
    console.log(`📊 Fetching budget consumption: /api/analytics/budget-consumption${query ? `?${query}` : ''}`);
    return http<BudgetConsumptionResponse>(`/api/analytics/budget-consumption${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // ADDITIONAL: Enhanced cost distribution (alternative endpoint)
  enhancedCostDistribution: (period?: string, startDate?: string, endDate?: string, breakdown?: string, includeProjections?: boolean) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (breakdown) params.append('breakdown', breakdown);
    if (includeProjections !== undefined) params.append('includeProjections', includeProjections.toString());
    const query = params.toString();
    console.log(`💰 Fetching enhanced cost distribution: /api/analytics/enhanced-cost-distribution${query ? `?${query}` : ''}`);
    return http<any>(`/api/analytics/enhanced-cost-distribution${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // ADDITIONAL: Budget vs Actual comparison
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
    return http<any>(`/api/analytics/budget-vs-actual${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Item heatmap
  itemHeatmap: (itemId: number, period?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return http<any>(`/api/analytics/item-heatmap/${itemId}${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Stock movements
  stockMovements: (period?: string, startDate?: string, endDate?: string, categoryId?: number, itemId?: number) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (itemId) params.append('itemId', itemId.toString());
    const query = params.toString();
    return http<any>(`/api/analytics/stock-movements${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Stock levels
  stockLevels: (categoryId?: number, alertLevel?: string, sortBy?: string, sortOrder?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (alertLevel) params.append('alertLevel', alertLevel);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    const query = params.toString();
    return http<any>(`/api/analytics/stock-levels${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Cost per employee
  costPerEmployee: (period?: string, startDate?: string, endDate?: string, categoryId?: number, department?: string, includeComparisons?: boolean) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (department) params.append('department', department);
    if (includeComparisons !== undefined) params.append('includeComparisons', includeComparisons.toString());
    const query = params.toString();
    return http<any>(`/api/analytics/cost-per-employee${query ? `?${query}` : ''}`, { method: "GET" });
  }
};

// ------- Upload -------
export const UploadAPI = {
  uploadItems: async (file: File) => {
    console.log(`📤 Uploading items file: ${file.name}`);
    const form = new FormData();
    form.append('file', file);
    
    // Get auth token for header
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
    
    const result = await res.json();
    console.log('✅ Items upload result:', result);
    return result;
  },
  
  uploadConsumption: async (file: File) => {
    console.log(`📤 Uploading consumption file: ${file.name}`);
    const form = new FormData();
    form.append('file', file);
    
    // Get auth token for header
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
    
    const result = await res.json();
    console.log('✅ Consumption upload result:', result);
    return result;
  },
  
  validateItems: async (file: File) => {
    console.log(`🔍 Validating items file: ${file.name}`);
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
    console.log(`🔍 Validating consumption file: ${file.name}`);
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

// ENHANCED: API connectivity testing with better error reporting
export async function testApiConnectivity() {
  const results = {
    baseUrl: API_BASE,
    tests: {} as { [key: string]: { success: boolean; error?: string; data?: any } }
  };
  
  console.log(`🧪 Testing API connectivity to: ${API_BASE}`);
  
  // Test basic analytics first
  try {
    const dashboard = await AnalyticsAPI.dashboard();
    results.tests.dashboard = { success: true, data: dashboard };
  } catch (error: any) {
    results.tests.dashboard = { success: false, error: error.message };
  }
  
  // Test cost distribution with error handling
  try {
    const costDist = await AnalyticsAPI.costDistribution('monthly');
    results.tests.costDistribution = { success: true, data: costDist };
  } catch (error: any) {
    results.tests.costDistribution = { success: false, error: error.message };
    console.warn('Cost distribution failed - this might be due to missing data or backend implementation issues');
  }
  
  // Test budget consumption with error handling
  try {
    const budgetConsump = await AnalyticsAPI.budgetConsumption('monthly');
    results.tests.budgetConsumption = { success: true, data: budgetConsump };
  } catch (error: any) {
    results.tests.budgetConsumption = { success: false, error: error.message };
    console.warn('Budget consumption failed - this might be due to missing repositories or incomplete implementation');
  }
  
  // Test footfall health
  try {
    const health = await FootfallAPI.health();
    results.tests.footfallHealth = { success: true, data: health };
  } catch (error: any) {
    results.tests.footfallHealth = { success: false, error: error.message };
  }
  
  console.log('🧪 API Connectivity Test Results:', results);
  return results;
}