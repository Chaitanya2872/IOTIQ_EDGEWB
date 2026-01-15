/**
 * The code defines various types and API functions for managing inventory data, including categories,
 * items, analytics, footfall data, and upload functionality.
 * @param {string} path - The `path` parameter in the `http` and `cachedHttp` functions represents the
 * endpoint URL to which the HTTP request will be made. It is used to specify the specific API endpoint
 * that the request should target.
 * @param {RequestInit} config - The `config` parameter in the `http` and `cachedHttp` functions is a
 * `RequestInit` object that contains configurations for the HTTP request such as method, headers,
 * body, etc. It allows you to customize the request before sending it to the server.
 * @returns The code provided includes TypeScript type definitions for various data structures related
 * to inventory management and analytics. Additionally, it includes API functions for interacting with
 * the backend server to fetch and upload data related to items, consumption, footfall, analytics, and
 * more.
 */
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
  itemSku: string;
  currentQuantity: number;
  totalReceivedStock?: number;
  totalConsumedStock?: number;
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

export type StockDistributionCategoryResponse = {
  totalStockValue: number;
  totalCategories: number;
  distributionData: Array<{
    stockValue: number;
    percentage: number;
    categoryName: string;
    categoryId: number;
  }>;
};

export type MonthlyStockValueTrendResponse = {
  trendData: Array<{
    totalMonthlyConsumptionValue: number;
    month: string;
    monthName: string;
    averageDailyConsumptionValue: number;
  }>;
  totalMonths: number;
  startDate: string;
  endDate: string;
  formula: string;
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


export type SmartInsightsResponse = {
  analysisDepth: string;
  analysisPeriod: {
    startDate: string;
    endDate: string;
    daysAnalyzed: number;
  };
  minConfidence: number;
  generatedAt: string;
  
  criticalAlerts: Array<{
    type: string;
    severity: string;
    priority: number;
    itemId: number;
    itemName: string;
    categoryName: string;
    daysRemaining?: number;
    currentStock?: number;
    avgDailyConsumption?: number;
    spikePercentage?: number;
    recentAvg?: number;
    previousAvg?: number;
    message: string;
    action: string;
  }>;
  
  anomalies: Array<{
    type: string;
    itemId: number;
    itemName: string;
    categoryName: string;
    confidence: number;
    mean: number;
    stdDev: number;
    outlierCount: number;
    totalRecords: number;
    message: string;
    outlierDates: Array<{
      date: string;
      quantity: number;
      deviation: number;
    }>;
  }>;
  
  trendInsights: {
    overallTrend: {
      direction: string;
      strength: string;
      slope: number;
      interpretation: string;
    };
    monthlyData: Record<string, number>;
    volatility: {
      absolute: number;
      percentage: number;
      level: string;
    };
  };
  
  costOpportunities: Array<{
    type: string;
    priority: number;
    itemId: number;
    itemName: string;
    categoryName: string;
    currentTotalCost: number;
    totalConsumption: number;
    potentialSavings: number;
    savingsPercentage: number;
    message: string;
    recommendation: string;
  }>;
  
  forecastAccuracy: {
    overallAccuracy: number;
    rating: string;
    totalForecast: number;
    totalActual: number;
    variance: number;
    itemsAnalyzed: number;
    message: string;
  };
  
  seasonalPatterns: {
    seasonalityDetected: boolean;
    peakMonth?: string;
    peakValue?: number;
    lowMonth?: string;
    lowValue?: number;
    variance?: number;
    variancePercent?: number;
    message: string;
  };
  
  inventoryHealthScore: {
    overallScore: number;
    rating: string;
    healthyItems: number;
    warningItems: number;
    criticalItems: number;
    totalItems: number;
    healthyPercentage: number;
    message: string;
  };
  
  topMovers: {
    topConsumers: Array<{
      itemId: number;
      itemName: string;
      categoryName: string;
      totalConsumption: number;
      totalValue: number;
    }>;
    fastestGrowing: Array<{
      itemId: number;
      itemName: string;
      categoryName: string;
      growthRate: number;
      firstHalfConsumption: number;
      secondHalfConsumption: number;
    }>;
    highestValue: Array<{
      itemId: number;
      itemName: string;
      categoryName: string;
      totalValue: number;
      totalConsumption: number;
      unitPrice: number;
    }>;
  };
  
  predictions: Array<{
    type: string;
    itemId: number;
    itemName: string;
    categoryName: string;
    daysUntilStockout?: number;
    predictedDate?: string;
    currentStock?: number;
    avgDailyConsumption?: number;
    predicted30DayConsumption?: number;
    predicted30DayCost?: number;
    confidence: number;
    message: string;
  }>;
  
  recommendations: Array<{
    priority: number;
    category: string;
    title: string;
    description: string;
    action: string;
    impact: string;
    effort: string;
    estimatedTime: string;
    confidence?: number;
    potentialSavings?: number;
    relatedItems: Array<{
      itemId: number;
      itemName: string;
    }>;
  }>;
  
  summary: {
    totalCriticalAlerts: number;
    totalAnomalies: number;
    totalCostOpportunities: number;
    totalRecommendations: number;
    overallHealthScore: number;
    itemsAnalyzed: number;
    recordsAnalyzed: number;
  };
};

export type SmartInsightsSummaryResponse = {
  summary: SmartInsightsResponse['summary'];
  inventoryHealthScore: SmartInsightsResponse['inventoryHealthScore'];
  criticalAlertsCount: number;
  anomaliesCount: number;
  costOpportunitiesCount: number;
  topAlerts: SmartInsightsResponse['criticalAlerts'];
  forecastAccuracy: SmartInsightsResponse['forecastAccuracy'];
  generatedAt: string;
};

export type SmartRecommendationsResponse = {
  recommendations: SmartInsightsResponse['recommendations'];
  totalRecommendations: number;
  filteredCount: number;
  filters: {
    minPriority: number;
    limit: number;
    categoryId: number | string;
  };
  generatedAt: string;
};

export type SmartAlertsResponse = {
  alerts: SmartInsightsResponse['criticalAlerts'];
  totalAlerts: number;
  filteredCount: number;
  criticalCount: number;
  highCount: number;
  filters: {
    severity: string;
    limit: number;
    categoryId: number | string;
  };
  generatedAt: string;
};

export type SmartAnomaliesResponse = {
  anomalies: SmartInsightsResponse['anomalies'];
  totalAnomalies: number;
  returnedCount: number;
  averageConfidence: number;
  filters: {
    minConfidence: number;
    limit: number;
    categoryId: number | string;
  };
  generatedAt: string;
};

export type SmartHealthResponse = {
  healthScore: SmartInsightsResponse['inventoryHealthScore'];
  categoryFilter: number | string;
  generatedAt: string;
};



export type AvailableDateResponse = {
    minDate: string,
    availableMonths: number,
    maxDate: string
};

export type UploadConsumptionRecord = {
  consumptionDate: string;
  item: {
    itemName: string;
    id: number;
    category: {
      id: number;
      categoryName: string;
    };
    currentQuantity: number;
  };
  openingStock: number;
  receivedQuantity: number;
  closingStock: number;
  id: number;
  consumedQuantity: number;
};

export type UploadItemsRecord = {
  id: number;
  itemName: string;
  itemCode: string;
  itemSku: string;
  category: {
    id: number;
    categoryName: string;
  };
  currentQuantity: number;
  unitOfMeasurement: string;
  unitPrice: number;
  minStockLevel: number;
  maxStockLevel: number;
};

export type UploadResponseBase = {
  creationErrors: string[];
};

export type UploadConsumptionResponse = UploadResponseBase & {
  records: UploadConsumptionRecord[];
  parseErrors?: string[];
  warnings?: string[];
  totalRowsProcessed?: number;
  recordsCreated?: number;
  missingItemsCount?: number;
  success?: boolean;
};

export type UploadItemsResponse = UploadResponseBase & {
  items: UploadItemsRecord[];
  parseErrors?: string[];
  warnings?: string[];
  totalRowsProcessed?: number;
  itemsCreated?: number;
  success?: boolean;
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
  };
  period: {
    startDate: string;
    endDate: string;
  };
};

// ============================================================================
// NEW TYPES FOR ADDITIONAL ENDPOINTS
// ============================================================================

export type DashboardBulkResponse = {
  year: number;
  month: number;
  categoryId?: number;
  summary: {
    totalItems: number;
    totalCategories: number;
    totalStockValue: number;
    totalConsumption: number;
  };
  stockLevels: any[];
  consumptionTrends: any[];
  topConsumingItems: any[];
};

export type StockUsageResponse = {
  categoryId?: number;
  items: Array<{
    itemId: number;
    itemName: string;
    categoryName: string;
    currentQuantity: number;
    avgDailyConsumption: number;
    coverageDays: number;
    stockAlertLevel: string;
    reorderRecommended: boolean;
  }>;
};

export type StockLevelsResponse = {
  items: Array<{
    itemId: number;
    itemName: string;
    categoryName: string;
    currentQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    reorderLevel?: number;
    coverageDays?: number;
    totalValue: number;
    stockAlertLevel: string;
    unitPrice: number;
  }>;
  summary: {
    totalItems: number;
    criticalItems: number;
    warningItems: number;
    normalItems: number;
  };
};


export type MonthlyForecastResponse = {
  year: number;
  month: number;
  categoryId?: number;
  forecast: {
    predictedConsumption: number;
    predictedCost: number;
    confidence: number;
  };
  historical: {
    avgConsumption: number;
    avgCost: number;
  };
  items: Array<{
    itemId: number;
    itemName: string;
    predictedQuantity: number;
    predictedCost: number;
  }>;
};



export type ForecastVsActualBinsResponse = {
  year: number;
  month: number;
  categoryId?: number;
  bins: Array<{
    binNumber: number;
    binPeriod: string;
    dateRange: { start: string; end: string };
    forecast: { quantity: number; cost: number };
    actual: { quantity: number; cost: number };
    variance: { quantity: number; cost: number; percentage: number };
  }>;
};

export type BinVarianceAnalysisResponse = {
  allMonths: Array<{
    bin1: {
      cost: number;
      recordCount: number;
      period: string;
      consumption: number;
    };
    bin2: {
      cost: number;
      recordCount: number;
      period: string;
      consumption: number;
    };
    month: number;
    variance: {
      cost: number;
      costPercent: number;
      consumptionPercent: number;
      consumption: number;
    };
    monthName: string;
    totalMonth: {
      consumption: number;
      cost: number;
    };
    year: number;
  }>;
  formula : {
    costVariance: string;
    consumptionVariance: string;
  };
  lastMonth: {
    bin1: {
      cost: number;
      recordCount: number;
      period: string;
      consumption: number;
    };
    bin2: {
      cost: number;
      recordCount: number;
      period: string;
      consumption: number;
    };
    month: number;
    variance: {
      cost: number;
      costPercent: number;
      consumptionPercent: number;
      consumption: number;
    };
    monthName: string;
    totalMonth: {
      consumption: number;
      cost: number;
    };
    year: number;
  };
  trendSummary?: {
    highestVarianceMonth: string;
    totalCost: number;
    averageConsumptionVariancePercent: number;
    averageCostVariancePercent: number;
    lowestVarianceMonth: string;
    totalConsumption: number;
  };
};

export type ItemHeatmapResponse = {
  itemId: number;
  itemName: string;
  period: string;
  heatmapData: Array<{
    date: string;
    dayOfWeek: string;
    consumption: number;
    intensity: number;
  }>;
};

export type ConsumptionPatternsResponse = {
  itemId: number;
  itemName: string;
  patterns: {
    daily: { avgConsumption: number; peakDay: string };
    weekly: { avgConsumption: number; peakWeek: string };
    monthly: { avgConsumption: number; peakMonth: string };
  };
  trends: {
    increasing: boolean;
    trendPercentage: number;
  };
};

export type PriceTrendsResponse = {
  itemId: number;
  itemName: string;
  priceHistory: Array<{
    date: string;
    unitPrice: number;
  }>;
  statistics: {
    currentPrice: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    priceVolatility: number;
  };
};

export type LeadTimeAnalysisResponse = {
  suppliers: Array<{
    supplierName: string;
    avgLeadTime: number;
    minLeadTime: number;
    maxLeadTime: number;
    reliability: number;
  }>;
  overallStats: {
    avgLeadTime: number;
    recommendedBufferDays: number;
  };
};



export type BudgetKPIResponse = {
  predictions: any;
  reorderAlerts: number;
  totalStockValue: number;
  totalItems: number;
  stockoutItems: Array<{
    itemId: number;
    itemName: string;
    coverageDays: number;
    currentStock: number;
    categoryName: string;
  }>;
  forecastAccuracy: number;
  predictedStockOuts: number;
};

export type BudgetComparisonResponse = {
  periods: Array<{
    period: string;
    budget: number;
    actual: number;
    variance: number;
  }>;
  categoryComparison: Array<{
    categoryName: string;
    budget: number;
    actual: number;
    variance: number;
  }>;
};

export type InventoryTurnoverResponse = {
  period: string;
  overallTurnover: {
    turnoverRatio: number;
    daysOfInventory: number;
  };
  byCategory: Array<{
    categoryName: string;
    turnoverRatio: number;
    daysOfInventory: number;
    fastMoving: boolean;
  }>;
};

export type SupplierPerformanceResponse = {
  suppliers: Array<{
    supplierName: string;
    totalOrders: number;
    onTimeDeliveries: number;
    lateDeliveries: number;
    onTimePercentage: number;
    avgLeadTime: number;
    qualityScore: number;
  }>;
};

export type costConsumptionResponse = {
  scatterData: Array<{
    unitPrice: number;
    itemId: number;
    itemName: string;
    cost: number;
    consumption: number;
    avgDailyConsumption: number;
    categoryName: string;
  }>;
  endDate: string;
  totalPoints: number;
  startDate: string;
};

export type ReorderRecommendationsResponse = {
  recommendations: Array<{
    itemId: number;
    itemName: string;
    categoryName: string;
    currentStock: number;
    reorderLevel: number;
    reorderQuantity: number;
    urgency: string;
    estimatedStockoutDate: string;
  }>;
};

export type ExpiryAnalysisResponse = {
  expiringSoon: Array<{
    itemId: number;
    itemName: string;
    currentQuantity: number;
    expiryDate: string;
    daysUntilExpiry: number;
    totalValue: number;
  }>;
  expired: Array<{
    itemId: number;
    itemName: string;
    quantity: number;
    expiryDate: string;
    totalValue: number;
  }>;
  summary: {
    totalExpiringSoon: number;
    totalExpired: number;
    totalValueAtRisk: number;
  };
};

export type DepartmentCostAnalysisResponse = {
  period: string;
  startDate: string;
  endDate: string;
  departments: Array<{
    departmentName: string;
    totalCost: number;
    totalQuantity: number;
    percentage: number;
    topItems: Array<{
      itemName: string;
      cost: number;
      quantity: number;
    }>;
  }>;
  totalCost: number;
};

export type FootfallTrendsResponse = {
  period: string;
  startDate: string;
  endDate: string;
  trends: Array<{
    date: string;
    period: string;
    employeeCount: number;
    visitorCount: number;
    totalFootfall: number;
  }>;
  statistics: {
    avgEmployees: number;
    avgVisitors: number;
    avgTotal: number;
    peakFootfall: number;
    peakDate: string;
  };
};

export type PerEmployeeConsumptionResponse = {
  startDate: string;
  endDate: string;
  categoryId?: number;
  itemId?: number;
  perEmployeeMetrics: {
    avgConsumptionPerEmployee: number;
    totalConsumption: number;
    totalEmployeeDays: number;
    avgCostPerEmployee: number;
  };
  trends: Array<{
    period: string;
    consumptionPerEmployee: number;
    costPerEmployee: number;
    employeeCount: number;
  }>;
};

// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8082";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://inventoryservice-jwh6.onrender.com";


const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

async function http<T>(path: string, config: RequestInit): Promise<T> {
  const accessToken = localStorage.getItem("accessToken");
  
  const request = new Request(API_BASE + path, {
    ...config,
    headers: {
      ...(config.headers || {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(config.method === "POST" || config.method === "PUT" || config.method === "PATCH"
        ? { "Content-Type": "application/json" }
        : {}),
    },
  });

  const response = await fetch(request);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP Error: ${response.status}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return response.text() as any;
}

async function cachedHttp<T>(path: string, config: RequestInit): Promise<T> {
  const cacheKey = `${config.method || 'GET'}-${path}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const data = await http<T>(path, config);
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

export const CategoriesAPI = {
  list: () => http<Category[]>("categories", { method: "GET" }),
  get: (id: number) => http<Category>(`categories/${id}`, { method: "GET" }),
  create: (body: { categoryName: string; categoryDescription: string }) =>
    http<Category>("categories", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: { categoryName: string; categoryDescription: string }) =>
    http<Category>(`categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  remove: (id: number) => http<void>(`categories/${id}`, { method: "DELETE" }),
};

export const ItemsAPI = {
  list: () => http<Item[]>("/items", { method: "GET" }),
  get: (id: number) => http<Item>(`/items/${id}`, { method: "GET" }),
  create: (body: Omit<Item, "id">) =>
    http<Item>("/items", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: number, body: Partial<Omit<Item, "id">>) =>
    http<Item>(`/api/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: number) => http<void>(`/api/items/${id}`, { method: "DELETE" }),
  search: (q: string) => http<Item[]>(`/api/items/search?q=${encodeURIComponent(q)}`, { method: "GET" }),
  lowStock: (threshold = 10) => http<Item[]>(`/api/items/low-stock?threshold=${threshold}`, { method: "GET" }),
  expiring: (days = 30) => http<Item[]>(`/api/items/expiring?days=${days}`, { method: "GET" }),
  expired: () => http<Item[]>("/items/expired", { method: "GET" }),
  consume: (id: number, req: ConsumptionRequest) =>
    http<Item>(`/api/items/${id}/consume`, {
      method: "POST",
      body: JSON.stringify(req),
    }),
  receive: (id: number, req: ReceiptRequest) =>
    http<Item>(`/api/items/${id}/receive`, {
      method: "POST",
      body: JSON.stringify(req),
    }),
};

export const AnalyticsAPI = {
  // Dashboard & Basic Stats
  basic: () => cachedHttp<any>('/analytics', { method: "GET" }),
  
  dashboard: () => cachedHttp<any>('/analytics/dashboard', { method: "GET" }),
  
  dashboardBulk: (year?: number, month?: number, categoryId?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    if (categoryId) params.append('categoryId', categoryId.toString());
    const query = params.toString();
    return cachedHttp<DashboardBulkResponse>(`/analytics/dashboard-bulk${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Consumption & Trends
  consumptionTrends: (period?: string, groupBy?: string, categoryId?: number) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (groupBy) params.append('groupBy', groupBy);
    if (categoryId) params.append('categoryId', categoryId.toString());
    const query = params.toString();
    return cachedHttp<ConsumptionTrendsResponse>(`/analytics/consumption-trends${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Add inside AnalyticsAPI object

costConsumption: (startDate?: string, endDate?: string) => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  const query = params.toString();
  return cachedHttp<costConsumptionResponse>(`/analytics/cost-consumption-scatter${query ? `?${query}` : ''}`, { method: "GET" });
},

  topConsumingItems: (days?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (days) params.append('days', days.toString());
    if (limit) params.append('limit', limit.toString());
    const query = params.toString();
    return cachedHttp<TopConsumersResponse>(`/analytics/top-consuming-items${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Stock Analysis
  stockUsage: (categoryId?: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    const query = params.toString();
    return cachedHttp<StockUsageResponse>(`/analytics/stock-usage${query ? `?${query}` : ''}`, { method: "GET" });
  },

  stockLevels: (categoryId?: number, alertLevel?: string, sortBy?: string, sortOrder?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (alertLevel) params.append('alertLevel', alertLevel);
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    const query = params.toString();
    return cachedHttp<StockLevelsResponse>(`/analytics/stock-levels${query ? `?${query}` : ''}`, { method: "GET" });
  },

  stockDistributionCategory: () => 
    cachedHttp<StockDistributionCategoryResponse>('/analytics/stock-distribution-category', { method: "GET" }),

  monthlyStockValueTrend: (startDate?: string, endDate?: string, categoryId?: number) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (categoryId) params.append('categoryId', categoryId.toString());
    const query = params.toString();
    return cachedHttp<MonthlyStockValueTrendResponse>(`/analytics/monthly-stock-value-trend${query ? `?${query}` : ''}`, { method: "GET" });
  },

  stockMovements: (period?: string, startDate?: string, endDate?: string, categoryId?: number, itemId?: number) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (itemId) params.append('itemId', itemId.toString());
    const query = params.toString();
    return cachedHttp<any>(`/analytics/stock-movements${query ? `?${query}` : ''}`, { method: "GET" });
  },

  
  // Smart Insights - Full Analysis
  smartInsights: (analysisDepth?: string, categoryId?: number, minConfidence?: number, includeRecommendations?: boolean) => {
    const params = new URLSearchParams();
    if (analysisDepth) params.append('analysisDepth', analysisDepth);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (minConfidence !== undefined) params.append('minConfidence', minConfidence.toString());
    if (includeRecommendations !== undefined) params.append('includeRecommendations', includeRecommendations.toString());
    const query = params.toString();
    return cachedHttp<SmartInsightsResponse>(`/analytics/smart-insights${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Smart Insights - Summary Only
  smartInsightsSummary: (categoryId?: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    const query = params.toString();
    return cachedHttp<SmartInsightsSummaryResponse>(`/analytics/smart-insights/summary${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Smart Insights - Recommendations
  smartRecommendations: (categoryId?: number, minPriority?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (minPriority) params.append('minPriority', minPriority.toString());
    if (limit) params.append('limit', limit.toString());
    const query = params.toString();
    return cachedHttp<SmartRecommendationsResponse>(`/analytics/smart-insights/recommendations${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Smart Insights - Alerts
  smartAlerts: (categoryId?: number, severity?: string, limit?: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (severity) params.append('severity', severity);
    if (limit) params.append('limit', limit.toString());
    const query = params.toString();
    return cachedHttp<SmartAlertsResponse>(`/analytics/smart-insights/alerts${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Smart Insights - Anomalies
  smartAnomalies: (categoryId?: number, minConfidence?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (minConfidence) params.append('minConfidence', minConfidence.toString());
    if (limit) params.append('limit', limit.toString());
    const query = params.toString();
    return cachedHttp<SmartAnomaliesResponse>(`/analytics/smart-insights/anomalies${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Smart Insights - Health Check
  smartHealth: (categoryId?: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    const query = params.toString();
    return cachedHttp<SmartHealthResponse>(`/analytics/smart-insights/health${query ? `?${query}` : ''}`, { method: "GET" });
  },


  // Legacy stock analytics (keep for backward compatibility)
  stockAnalytics: () => cachedHttp<StockAnalyticsResponse>('/analytics/stock-levels', { method: "GET" }),
  stockAlerts: () => cachedHttp<any>('/analytics/stock-alerts', { method: "GET" }),
  topConsumers: (days?: number) => {
    const query = days ? `?days=${days}` : '';
    return cachedHttp<TopConsumersResponse>(`/analytics/top-consuming-items${query}`, { method: "GET" });
  },
  inventoryValue: () => cachedHttp<any>('/analytics/inventory-value', { method: "GET" }),
  turnoverRatio: () => cachedHttp<any>('/analytics/turnover-ratio', { method: "GET" }),

  // Forecasting & Predictions
  monthlyForecast: (year?: number, month?: number, categoryId?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    if (categoryId) params.append('categoryId', categoryId.toString());
    const query = params.toString();
    return cachedHttp<MonthlyForecastResponse>(`/analytics/monthly-forecast${query ? `?${query}` : ''}`, { method: "GET" });
  },

  forecastVsActualBins: (year?: number, month?: number, categoryId?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (month) params.append('month', month.toString());
    if (categoryId) params.append('categoryId', categoryId.toString());
    const query = params.toString();
    return cachedHttp<ForecastVsActualBinsResponse>(`/analytics/forecast-vs-actual-bins${query ? `?${query}` : ''}`, { method: "GET" });
  },

  binVarianceAnalysis: () => 
    cachedHttp<BinVarianceAnalysisResponse>('/analytics/bin-variance-analysis', { method: "GET" }),

  itemHeatmap: (itemId: number, period?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    const query = params.toString();
    return cachedHttp<ItemHeatmapResponse>(`/analytics/item-heatmap/${itemId}${query ? `?${query}` : ''}`, { method: "GET" });
  },

  consumptionPatterns: (itemId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return cachedHttp<ConsumptionPatternsResponse>(`/analytics/consumption-patterns/${itemId}${query ? `?${query}` : ''}`, { method: "GET" });
  },

  priceTrends: (itemId: number, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return cachedHttp<PriceTrendsResponse>(`/analytics/price-trends/${itemId}${query ? `?${query}` : ''}`, { method: "GET" });
  },

  leadTimeAnalysis: (supplierId?: number) => {
    const params = new URLSearchParams();
    if (supplierId) params.append('supplierId', supplierId.toString());
    const query = params.toString();
    return cachedHttp<LeadTimeAnalysisResponse>(`/analytics/lead-time-analysis${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Budget Analysis
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
    return cachedHttp<BudgetConsumptionResponse>(`/analytics/budget-consumption${query ? `?${query}` : ''}`, { method: "GET" });
  },

  budgetKPIs: () => 
    cachedHttp<BudgetKPIResponse>('/analytics/budget-kpis', { method: "GET" }),

  budgetComparison: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return cachedHttp<BudgetComparisonResponse>(`/analytics/budget-comparison${query ? `?${query}` : ''}`, { method: "GET" });
  },

  costDistribution: (period?: string, startDate?: string, endDate?: string, categoryId?: number, groupBy?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (groupBy) params.append('groupBy', groupBy);
    const query = params.toString();
    return cachedHttp<CostDistributionResponse>(`/analytics/cost-distribution${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Performance Metrics
  availableDateRange: () => 
    cachedHttp<AvailableDateResponse>('/analytics/available-date-range', { method: "GET" }),

  inventoryTurnover: (period?: string, categoryId?: number) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (categoryId) params.append('categoryId', categoryId.toString());
    const query = params.toString();
    return cachedHttp<InventoryTurnoverResponse>(`/analytics/inventory-turnover${query ? `?${query}` : ''}`, { method: "GET" });
  },

  supplierPerformance: (startDate?: string, endDate?: string, supplierId?: number) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (supplierId) params.append('supplierId', supplierId.toString());
    const query = params.toString();
    return cachedHttp<SupplierPerformanceResponse>(`/analytics/supplier-performance${query ? `?${query}` : ''}`, { method: "GET" });
  },

  reorderRecommendations: (categoryId?: number, urgencyLevel?: string) => {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (urgencyLevel) params.append('urgencyLevel', urgencyLevel);
    const query = params.toString();
    return cachedHttp<ReorderRecommendationsResponse>(`/analytics/reorder-recommendations${query ? `?${query}` : ''}`, { method: "GET" });
  },

  expiryAnalysis: (daysThreshold?: number, categoryId?: number) => {
    const params = new URLSearchParams();
    if (daysThreshold) params.append('daysThreshold', daysThreshold.toString());
    if (categoryId) params.append('categoryId', categoryId.toString());
    const query = params.toString();
    return cachedHttp<ExpiryAnalysisResponse>(`/analytics/expiry-analysis${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Department & Footfall
  departmentCostAnalysis: (period?: string, startDate?: string, endDate?: string, department?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (department) params.append('department', department);
    const query = params.toString();
    return cachedHttp<DepartmentCostAnalysisResponse>(`/analytics/department-cost-analysis${query ? `?${query}` : ''}`, { method: "GET" });
  },

  footfallTrends: (period?: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return cachedHttp<FootfallTrendsResponse>(`/analytics/footfall-trends${query ? `?${query}` : ''}`, { method: "GET" });
  },

  perEmployeeConsumption: (startDate?: string, endDate?: string, categoryId?: number, itemId?: number) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (itemId) params.append('itemId', itemId.toString());
    const query = params.toString();
    return cachedHttp<PerEmployeeConsumptionResponse>(`/analytics/footfall/per-employee-consumption${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Legacy methods kept for backward compatibility
  costPerEmployee: (period?: string, startDate?: string, endDate?: string, categoryId?: number, department?: string, includeComparisons?: boolean) => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (categoryId) params.append('categoryId', categoryId.toString());
    if (department) params.append('department', department);
    if (includeComparisons !== undefined) params.append('includeComparisons', includeComparisons.toString());
    const query = params.toString();
    return cachedHttp<any>(`/analytics/cost-per-employee${query ? `?${query}` : ''}`, { method: "GET" });
  }
};

// Footfall API
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
    return http<FootfallListResponse>(`/footfall?${query}`, { method: "GET" });
  },

  getByDate: (date: string) => {
    return http<{ 
      success: boolean;
      found: boolean; 
      data?: FootfallData;
      message?: string;
      error?: string;
    }>(`/footfall/date/${date}`, { method: "GET" });
  },

  statistics: async (startDate?: string, endDate?: string): Promise<FootfallStatistics> => {
    const params = new URLSearchParams();
    
    if (!startDate) startDate = '2025-01-01';
    if (!endDate) endDate = '2025-07-31';
    
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    
    const query = params.toString();
    return http<FootfallStatistics>(`/footfall/statistics?${query}`, { method: "GET" });
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
    }>("/footfall/debug", { method: "GET" });
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
    }>(`/footfall/exists${query ? `?${query}` : ''}`, { method: "GET" });
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
    }>("/footfall/data-range", { method: "GET" });
  },

  // Upload footfall data
  upload: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    
    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const res = await fetch(`${API_BASE}/analytics/footfall/upload`, {
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

  // Check if footfall data exists for a specific date
  check: (date?: string) => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    const query = params.toString();
    return http<{
      success: boolean;
      exists: boolean;
      date: string;
      data?: FootfallData;
      message?: string;
    }>(`/analytics/footfall/check${query ? `?${query}` : ''}`, { method: "GET" });
  },

  // Get footfall data range
  getDataRange: () => {
    return http<{
      success: boolean;
      dateRange?: {
        minDate: string;
        maxDate: string;
        totalDays: number;
      };
      totalRecords: number;
      message?: string;
    }>("/analytics/footfall/data-range", { method: "GET" });
  },

  health: () => {
    return http<{ 
      status: string; 
      timestamp: string; 
      service: string; 
    }>("/footfall/health", { method: "GET" });
  },
};

// Upload API
// Upload API with better error handling and logging
export const UploadAPI = {
  /**
   * Upload items Excel file
   */
  uploadItems: async (file: File): Promise<UploadItemsResponse> => {
    console.log('📤 Uploading items file:', file.name, file.size, 'bytes');
    
    const form = new FormData();
    form.append('file', file);
    
    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    try {
      const res = await fetch(`${API_BASE}/upload/items`, {
        method: 'POST',
        body: form,
        headers,
      });
      
      console.log('📥 Upload response status:', res.status);
      
      // Try to parse response as JSON first
      const contentType = res.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json();
      } else {
        const text = await res.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 200)}`);
      }
      
      console.log('📋 Upload response data:', responseData);
      
      if (!res.ok) {
        const errorMsg = responseData?.message || responseData?.error || `Upload failed: ${res.status}`;
        console.error('❌ Upload failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('✅ Upload successful:', responseData.itemsCreated || 0, 'items created');
      return responseData;
      
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      throw new Error(error?.message || 'Upload failed. Check console for details.');
    }
  },
  
  /**
   * Upload consumption Excel file
   */
  uploadConsumption: async (file: File): Promise<UploadConsumptionResponse> => {
    console.log('📤 Uploading consumption file:', file.name, file.size, 'bytes');
    
    const form = new FormData();
    form.append('file', file);
    
    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    try {
      const res = await fetch(`${API_BASE}/upload/consumption`, {
        method: 'POST',
        body: form,
        headers,
      });
      
      console.log('📥 Upload response status:', res.status);
      
      // Try to parse response as JSON first
      const contentType = res.headers.get('content-type');
      let responseData;
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json();
      } else {
        const text = await res.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 200)}`);
      }
      
      console.log('📋 Upload response data:', responseData);
      
      if (!res.ok) {
        const errorMsg = responseData?.message || responseData?.error || `Upload failed: ${res.status}`;
        console.error('❌ Upload failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('✅ Upload successful:', responseData.recordsCreated || 0, 'records created');
      return responseData;
      
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      throw new Error(error?.message || 'Upload failed. Check console for details.');
    }
  },
  
  /**
   * Download items template
   */
  getItemsTemplate: async (): Promise<Blob> => {
    console.log('📥 Downloading items template from:', `${API_BASE}/templates/items`);
    
    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(`${API_BASE}/templates/items`, {
        method: 'GET',
        headers,
      });

      console.log('📋 Template response status:', response.status);
      console.log('📋 Template response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Template download failed:', errorText);
        throw new Error(`Failed to download items template: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log('✅ Template downloaded:', blob.size, 'bytes, type:', blob.type);
      
      return blob;
      
    } catch (error: any) {
      console.error('❌ Template download error:', error);
      throw new Error(error?.message || 'Failed to download template. Check console for details.');
    }
  },

  /**
   * Download consumption template
   */
  getConsumptionTemplate: async (daysToGenerate?: number, categoryId?: number): Promise<Blob> => {
    const params = new URLSearchParams();
    if (daysToGenerate) params.append('daysToGenerate', daysToGenerate.toString());
    if (categoryId) params.append('categoryId', categoryId.toString());
    const query = params.toString();
    
    const url = `${API_BASE}/templates/consumption${query ? `?${query}` : ''}`;
    console.log('📥 Downloading consumption template from:', url);

    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('📋 Template response status:', response.status);
      console.log('📋 Template response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Template download failed:', errorText);
        throw new Error(`Failed to download consumption template: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log('✅ Template downloaded:', blob.size, 'bytes, type:', blob.type);
      
      return blob;
      
    } catch (error: any) {
      console.error('❌ Template download error:', error);
      throw new Error(error?.message || 'Failed to download template. Check console for details.');
    }
  },
  
  /**
   * Validate items file before upload
   */
  validateItems: async (file: File) => {
    console.log('🔍 Validating items file:', file.name);
    
    const form = new FormData();
    form.append('file', file);
    
    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const res = await fetch(`${API_BASE}/upload/items/validate`, {
      method: 'POST',
      body: form,
      headers,
    });
    
    if (!res.ok) {
      const error = await res.text();
      console.error('❌ Validation failed:', error);
      throw new Error(`Validation failed: ${res.status} - ${error}`);
    }
    
    const result = await res.json();
    console.log('✅ Validation result:', result);
    return result;
  },
  
  /**
   * Validate consumption file before upload
   */
  validateConsumption: async (file: File) => {
    console.log('🔍 Validating consumption file:', file.name);
    
    const form = new FormData();
    form.append('file', file);
    
    const accessToken = localStorage.getItem('accessToken');
    const headers: HeadersInit = {};
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    const res = await fetch(`${API_BASE}/upload/consumption/validate`, {
      method: 'POST',
      body: form,
      headers,
    });
    
    if (!res.ok) {
      const error = await res.text();
      console.error('❌ Validation failed:', error);
      throw new Error(`Validation failed: ${res.status} - ${error}`);
    }
    
    const result = await res.json();
    console.log('✅ Validation result:', result);
    return result;
  },
  
  /**
   * Get upload instructions
   */
  getItemsInstructions: () => http<any>(`/upload/instructions`, { method: 'GET' }),
  getConsumptionInstructions: () => http<any>(`/upload/consumption/instructions`, { method: 'GET' }),
};

// API Base URL - log it for debugging
console.log('🌐 API Base URL:', API_BASE);
console.log('🔑 Access Token:', localStorage.getItem('accessToken') ? 'Present' : 'Missing');

// Health check function to test API connectivity
export async function testAPIConnection() {
  console.log('🏥 Testing API connection...');
  
  try {
    const response = await fetch(`${API_BASE}/upload/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API is reachable:', data);
      return { success: true, data };
    } else {
      console.error('❌ API returned error:', response.status);
      return { success: false, status: response.status };
    }
  } catch (error: any) {
    console.error('❌ Cannot reach API:', error.message);
    return { success: false, error: error.message };
  }
}

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