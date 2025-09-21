import React, { useState, useEffect, useMemo, type ReactNode } from 'react';
import {
  Line, Bar, Pie, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ComposedChart, PieChart, AreaChart, LineChart,
  ReferenceLine, BarChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  RefreshCw, Database, Calendar, Filter, ChevronDown, Search,
  Activity, Zap, AlertTriangle, ShoppingCart, Package2, TrendingUp, Users,
  Upload, AlertCircle, CheckCircle, Info, X, ChevronLeft, ChevronRight,
  BarChart3, PieChart as PieChartIcon, Sun, Snowflake, CloudRain, Sparkles,
  DollarSign, Eye, Package, Clock, TrendingDown, Shield, Layers, Leaf, Cloud, Split
} from 'lucide-react';
import { 
  useAnalytics, 
  useItems,
  useCategories,
  useBudgetConsumption,
  useCostDistribution,
  useEnhancedAnalytics
} from '../api/hooks';
import { 
  AnalyticsAPI,
  FootfallAPI,
  testApiConnectivity,
  type ConsumptionTrendsResponse, 
  type StockAnalyticsResponse, 
  type DataRangeResponse,
  type Item,
  type Category,
  type FootfallData
} from '../api/inventory';

// REQUESTED COLOR PALETTE: Light green, blue, orange, and light red only
const COLORS = {
  primary: '#60a5fa',    // Light Blue
  success: '#86efac',    // Light Green  
  warning: '#fdba74',    // Light Orange
  danger: '#fca5a5',     // Light Red
  info: '#93c5fd',       // Lighter Blue
  dark: '#64748b',       // Neutral Gray
  light: '#f8fafc',      // Very Light Gray
  muted: '#94a3b8'       // Muted Gray
};

// Seasonal colors
const SEASONAL_COLORS = {
  spring: '#86efac',  // Light Green
  summer: '#fde68a',  // Light Yellow  
  fall: '#fdba74',    // Light Orange
  winter: '#93c5fd'   // Light Blue
};

// Chart colors using only the requested palette
const CHART_COLORS = [
  '#60a5fa', // Light Blue
  '#86efac', // Light Green
  '#fdba74', // Light Orange
  '#fca5a5', // Light Red
  '#93c5fd', // Lighter Blue
  '#a5f3fc', // Light Cyan
  '#fde68a', // Light Yellow
  '#c7d2fe'  // Light Indigo
];

// Card background colors - very light versions
const cardBackgrounds = {
  primary: '#eff6ff',    // Very light blue
  success: '#f0fdf4',    // Very light green
  warning: '#fff7ed',    // Very light orange
  danger: '#fef2f2',     // Very light red
  neutral: '#ffffff'     // White
};

// Interfaces
interface StockLevel {
  [x: string]: ReactNode;
  id: number;
  itemName: string;
  itemCode: string;
  category: string;
  openingStock: number;
  receivedStock: number;
  closingStock: number;
  consumedStock: number;
  minLevel: number;
  maxLevel: number;
  reorderLevel: number;
  coverageDays: number;
  stockValue: number;
  status: string;
  unitPrice: number;
  unitOfMeasurement: string;
  lastUpdated: string;
}

interface FootfallRecord {
  date: string;
  employeeCount: number;
  visitorCount: number;
  totalFootfall: number;
}

interface ConsumptionDataPoint {
  date: string;
  [key: string]: any;
  employeeCount?: number;
  visitorCount?: number;
  avgEmployees?: number; // For weekly/monthly aggregations
  avgVisitors?: number;  // For weekly/monthly aggregations
}

interface SeasonalData {
  season: string;
  totalCost: number;
  avgCost: number;
  itemCount: number;
  topCategory: string;
  variance: number;
  icon: React.ReactNode;
  color: string;
}

// Enhanced Tooltip Component
const ModernTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.98)', 
        backdropFilter: 'blur(10px)',
        color: COLORS.dark, 
        padding: '12px', 
        borderRadius: '8px',
        border: `1px solid ${COLORS.light}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        fontSize: '12px',
        minWidth: '180px'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '12px', color: COLORS.dark }}>
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            marginBottom: '4px'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: entry.color
            }} />
            <span style={{ flex: 1, color: COLORS.muted, fontSize: '11px' }}>
              {entry.name}:
            </span>
            <span style={{ fontWeight: '500', color: COLORS.dark }}>
              {typeof entry.value === 'number' ? 
                (entry.name.includes('$') || entry.name.includes('Cost') || entry.name.includes('Price') ? 
                  `$${entry.value.toLocaleString()}` : 
                  entry.value.toLocaleString()
                ) : entry.value}
            </span>
          </div>
        ))}
        
        {/* Show employee/visitor data for all periods */}
        {(payload[0]?.payload?.employeeCount || payload[0]?.payload?.totalEmployees || payload[0]?.payload?.avgEmployees) && (
          <div style={{ 
            borderTop: `1px solid ${COLORS.light}`, 
            marginTop: '6px', 
            paddingTop: '4px',
            fontSize: '10px',
            color: COLORS.primary
          }}>
            <Users style={{ width: '10px', height: '10px', display: 'inline', marginRight: '3px' }} />
            {payload[0].payload.totalEmployees ? 
              `Total Employees: ${payload[0].payload.totalEmployees.toLocaleString()}` :
              payload[0].payload.avgEmployees ? 
              `Avg Employees/Day: ${Math.round(payload[0].payload.avgEmployees)}` :
              `Employees: ${payload[0].payload.employeeCount}`
            }
            {(payload[0].payload.visitorCount || payload[0].payload.totalVisitors) && (
              <span style={{ marginLeft: '8px' }}>
                {payload[0].payload.totalVisitors ? 
                  `Total Visitors: ${payload[0].payload.totalVisitors.toLocaleString()}` :
                  `Visitors: ${payload[0].payload.visitorCount}`
                }
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
  return null;
};

// Card Component
const Card: React.FC<{
  children: React.ReactNode;
  background?: string;
}> = ({ children, background }) => {
  return (
    <div style={{
      backgroundColor: background || 'white',
      borderRadius: '10px',
      padding: '18px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${COLORS.light}`,
      marginBottom: '16px'
    }}>
      {children}
    </div>
  );
};

// Seasonal Cost Analysis Component (unchanged)
const SeasonalCostAnalysis: React.FC<{
  consumptionData: ConsumptionTrendsResponse | null;
  dateRange: { start: string; end: string };
  categories: Category[];
  items: Item[];
}> = ({ consumptionData, dateRange, categories, items }) => {
  const [seasonalData, setSeasonalData] = useState<SeasonalData[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null);

  const getSeason = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    if (month >= 9 && month <= 11) return 'fall';
    return 'winter';
  };

  useEffect(() => {
    if (!consumptionData?.data) return;

    const seasonalMap = new Map<string, {
      totalCost: number;
      totalConsumption: number;
      itemCount: Set<string>;
      categories: Map<string, number>;
      categoryCosts: Map<string, number>;
    }>();

    ['spring', 'summer', 'fall', 'winter'].forEach(season => {
      seasonalMap.set(season, {
        totalCost: 0,
        totalConsumption: 0,
        itemCount: new Set(),
        categories: new Map(),
        categoryCosts: new Map()
      });
    });

    const categoryPrices = new Map<string, number>();
    categories.forEach(cat => {
      const categoryItems = items.filter(item => item.categoryId === cat.id);
      if (categoryItems.length > 0) {
        const avgPrice = categoryItems.reduce((sum, item) => sum + (Number(item.unitPrice) || 0), 0) / categoryItems.length;
        categoryPrices.set(cat.categoryName, avgPrice);
      }
    });

    consumptionData.data.forEach(categoryData => {
      const categoryName = categoryData.category || categoryData.categoryName || 'Unknown';
      const categoryId = categoryData.categoryId;
      
      let avgUnitPrice = categoryPrices.get(categoryName) || 10;
      
      if (categoryId) {
        const categoryItems = items.filter(item => item.categoryId === categoryId);
        if (categoryItems.length > 0) {
          avgUnitPrice = categoryItems.reduce((sum, item) => sum + (Number(item.unitPrice) || 0), 0) / categoryItems.length;
        }
      }

      categoryData.dataPoints?.forEach((point: any) => {
        const dateStr = point.startDate || point.date;
        if (!dateStr) return;
        
        const season = getSeason(dateStr);
        const seasonData = seasonalMap.get(season)!;
        
        const consumptionQty = Number(point.consumption) || 0;
        
        let actualCost = 0;
        
        if (point.cost && point.cost > 0) {
          actualCost = Number(point.cost);
        } else if (point.totalCost && point.totalCost > 0) {
          actualCost = Number(point.totalCost);
        } else {
          actualCost = consumptionQty * avgUnitPrice;
        }
        
        seasonData.totalCost += actualCost;
        seasonData.totalConsumption += consumptionQty;
        
        if (point.items && Array.isArray(point.items)) {
          point.items.forEach((item: any) => {
            seasonData.itemCount.add(item.itemName || item.itemId || 'Unknown');
          });
        } else {
          seasonData.itemCount.add(categoryName);
        }
        
        seasonData.categories.set(
          categoryName,
          (seasonData.categories.get(categoryName) || 0) + consumptionQty
        );
        
        seasonData.categoryCosts.set(
          categoryName,
          (seasonData.categoryCosts.get(categoryName) || 0) + actualCost
        );
      });
    });

    const totalCostAllSeasons = Array.from(seasonalMap.values()).reduce((sum, s) => sum + s.totalCost, 0);
    const avgCostPerSeason = totalCostAllSeasons / 4;

    const processedData: SeasonalData[] = Array.from(seasonalMap.entries()).map(([season, data]) => {
      let topCategory = 'None';
      let maxCost = 0;
      data.categoryCosts.forEach((cost, category) => {
        if (cost > maxCost) {
          maxCost = cost;
          topCategory = category;
        }
      });

      const avgCost = data.itemCount.size > 0 ? data.totalCost / data.itemCount.size : 0;
      const variance = avgCostPerSeason > 0 ? 
        ((data.totalCost - avgCostPerSeason) / avgCostPerSeason) * 100 : 0;

      const seasonIcons = {
        spring: <Leaf style={{ width: '14px', height: '14px' }} />,
        summer: <Sun style={{ width: '14px', height: '14px' }} />,
        fall: <Cloud style={{ width: '14px', height: '14px' }} />,
        winter: <Snowflake style={{ width: '14px', height: '14px' }} />
      };

      return {
        season: season.charAt(0).toUpperCase() + season.slice(1),
        totalCost: Math.round(data.totalCost),
        avgCost: Math.round(avgCost),
        itemCount: data.itemCount.size,
        topCategory,
        variance: Math.round(variance * 10) / 10,
        icon: seasonIcons[season as keyof typeof seasonIcons],
        color: SEASONAL_COLORS[season as keyof typeof SEASONAL_COLORS]
      };
    });

    setSeasonalData(processedData);
  }, [consumptionData, items, categories]);

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, margin: 0 }}>
          <Sparkles style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: COLORS.warning }} />
          Seasonal Cost Analysis
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {seasonalData.map(season => (
          <div
            key={season.season}
            onClick={() => setSelectedSeason(season.season === selectedSeason ? null : season.season)}
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: season.season === selectedSeason ? season.color + '20' : cardBackgrounds.neutral,
              border: `1px solid ${season.season === selectedSeason ? season.color : COLORS.light}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <span style={{ color: season.color }}>{season.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: COLORS.dark }}>
                {season.season}
              </span>
            </div>
            
            <div style={{ fontSize: '18px', fontWeight: '600', color: season.color, marginBottom: '4px' }}>
              ${season.totalCost.toLocaleString()}
            </div>
            
            <div style={{ fontSize: '10px', color: COLORS.muted }}>
              {season.itemCount} items
            </div>
            
            <div style={{ 
              fontSize: '9px', 
              color: season.variance > 0 ? COLORS.danger : COLORS.success,
              marginTop: '4px'
            }}>
              {season.variance > 0 ? '↑' : '↓'} {Math.abs(season.variance).toFixed(1)}% vs avg
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={seasonalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
            <XAxis dataKey="season" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip content={<ModernTooltip />} />
            <Bar dataKey="totalCost" name="Total Cost">
              {seasonalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
            <Bar dataKey="avgCost" name="Avg Cost/Item" opacity={0.6}>
              {seasonalData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h4 style={{ fontSize: '12px', fontWeight: '500', marginBottom: '12px', color: COLORS.dark }}>
          Category Distribution by Season
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <RadarChart data={seasonalData}>
            <PolarGrid stroke={COLORS.light} />
            <PolarAngleAxis dataKey="season" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis angle={90} domain={[0, 'auto']} tick={{ fontSize: 9 }} />
            <Radar
              name="Total Cost"
              dataKey="totalCost"
              stroke={COLORS.primary}
              fill={COLORS.primary}
              fillOpacity={0.5}
            />
            <Radar
              name="Item Count"
              dataKey="itemCount"
              stroke={COLORS.success}
              fill={COLORS.success}
              fillOpacity={0.3}
            />
            <Tooltip content={<ModernTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {selectedSeason && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          borderRadius: '6px',
          backgroundColor: cardBackgrounds.primary,
          border: `1px solid ${COLORS.light}`
        }}>
          <h4 style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px', color: COLORS.dark }}>
            {selectedSeason} Details
          </h4>
          {seasonalData.find(s => s.season === selectedSeason) && (
            <div style={{ fontSize: '11px', color: COLORS.muted }}>
              <div>Top Category: <strong>{seasonalData.find(s => s.season === selectedSeason)?.topCategory}</strong></div>
              <div>Average Cost per Item: <strong>${seasonalData.find(s => s.season === selectedSeason)?.avgCost.toLocaleString()}</strong></div>
              <div>Total Items: <strong>{seasonalData.find(s => s.season === selectedSeason)?.itemCount}</strong></div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// Core Inventory Stock Table Component
const CoreInventoryTable: React.FC<{ 
  items: Item[]; 
  categories: Category[];
  onRefresh: () => void;
}> = ({ items, categories, onRefresh }) => {
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [filteredLevels, setFilteredLevels] = useState<StockLevel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const getStatusColor = (status: StockLevel['status']) => {
    switch (status) {
      case 'critical': return COLORS.danger;
      case 'low': return COLORS.warning;
      case 'reorder': return COLORS.info;
      case 'optimal': return COLORS.success;
      case 'excess': return COLORS.primary;
      default: return COLORS.muted;
    }
  };

  useEffect(() => {
    if (items && items.length > 0) {
      const levels: StockLevel[] = items.map(item => {
        const category = categories.find(c => c.id === item.category?.id || item.categoryId);

        const openingStock = Number(item.openingStock ?? item.oldStockQuantity ?? 0);
        const closingStock = Number(item.closingStock ?? item.currentQuantity ?? 0);

        let receivedStock = 0;
        if (item.openingStock !== undefined && item.closingStock !== undefined) {
          receivedStock = closingStock - openingStock;
          if (receivedStock < 0) receivedStock = 0;
        }

        const consumedStock = openingStock + receivedStock - closingStock;
        const dailyConsumption = consumedStock > 0 ? consumedStock / 30 : (item.avgDailyConsumption ?? 1);
        const coverageDays = item.coverageDays ?? (
          dailyConsumption > 0 ? Math.floor(closingStock / dailyConsumption) : 0
        );

        return {
          id: item.id,
          itemName: item.itemName,
          itemCode: item.itemCode || `ITM${String(item.id).padStart(4, '0')}`,
          category: category?.categoryName || 'Unknown',
          openingStock,
          receivedStock,
          consumedStock,
          closingStock,
          minLevel: Number(item.minStockLevel) || 0,
          maxLevel: Number(item.maxStockLevel) || 0,
          reorderLevel: Number(item.reorderLevel ?? Math.floor((Number(item.minStockLevel) || 10) * 1.5)),
          coverageDays,
          stockValue: item.totalValue ?? closingStock * (item.unitPrice || 0),
          status: item.stockAlertLevel || 'SAFE',
          unitPrice: item.unitPrice || 0,
          unitOfMeasurement: item.unitOfMeasurement || 'units',
          lastUpdated: item.updated_at ?? new Date().toISOString()
        };
      });

      setStockLevels(levels);
    }
  }, [items, categories]);

  useEffect(() => {
    let filtered = [...stockLevels];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      const categoryName = categories.find(c => c.id === selectedCategory)?.categoryName;
      if (categoryName) {
        filtered = filtered.filter(item => item.category === categoryName);
      }
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    setFilteredLevels(filtered);
  }, [stockLevels, searchTerm, selectedCategory, selectedStatus, categories]);

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.dark, margin: 0 }}>
            <Layers style={{ width: '18px', height: '18px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: COLORS.primary }} />
            Core Inventory Stock Levels
          </h2>
          <button
            onClick={onRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              backgroundColor: COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            <RefreshCw style={{ width: '12px', height: '12px' }} />
            Refresh
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1',
              minWidth: '150px',
              padding: '6px 10px',
              border: `1px solid ${COLORS.light}`,
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />

          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            style={{
              padding: '6px 10px',
              border: `1px solid ${COLORS.light}`,
              borderRadius: '6px',
              fontSize: '12px'
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '6px 10px',
              border: `1px solid ${COLORS.light}`,
              borderRadius: '6px',
              fontSize: '12px'
            }}
          >
            <option value="all">All Status</option>
            <option value="critical">Critical</option>
            <option value="low">Low</option>
            <option value="reorder">Reorder</option>
            <option value="optimal">Optimal</option>
            <option value="excess">Excess</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ backgroundColor: cardBackgrounds.neutral, borderBottom: `2px solid ${COLORS.light}` }}>
              <th style={{ padding: '8px', textAlign: 'left', color: COLORS.dark }}>Date</th>
              <th style={{ padding: '8px', textAlign: 'left', color: COLORS.dark }}>Item Code</th>
              <th style={{ padding: '8px', textAlign: 'left', color: COLORS.dark }}>Item Name</th>
              <th style={{ padding: '8px', textAlign: 'left', color: COLORS.dark }}>Category</th>
              <th style={{ padding: '8px', textAlign: 'center', color: COLORS.dark }}>Opening Stock</th>
              <th style={{ padding: '8px', textAlign: 'center', color: COLORS.dark }}>Received Stock</th>
              <th style={{ padding: '8px', textAlign: 'center', color: COLORS.dark }}>Consumed Stock</th>
              <th style={{ padding: '8px', textAlign: 'center', color: COLORS.dark }}>Closing Stock (SIH)</th>
              <th style={{ padding: '8px', textAlign: 'center', color: COLORS.dark }}>Unit Price</th>
              <th style={{ padding: '8px', textAlign: 'center', color: COLORS.dark }}>Inventory Value</th>
              <th style={{ padding: '8px', textAlign: 'center', color: COLORS.dark }}>Coverage Days</th>
              <th style={{ padding: '8px', textAlign: 'center', color: COLORS.dark }}>Stock Alert Risk</th>
            </tr>
          </thead>
          <tbody>
            {filteredLevels.map(item => (
              <tr key={item.id} style={{ borderBottom: `1px solid ${COLORS.light}` }}>
                <td style={{ padding: '6px' }}>{item.lastUpdated?.slice(0,10) || '-'}</td>
                <td style={{ padding: '6px' }}>{item.itemCode}</td>
                <td style={{ padding: '6px' }}>{item.itemName}</td>
                <td style={{ padding: '6px' }}>{item.category}</td>
                <td style={{ padding: '6px', textAlign: 'center' }}>{item.openingStock}</td>
                <td style={{ padding: '6px', textAlign: 'center' }}>{item.receivedStock}</td>
                <td style={{ padding: '6px', textAlign: 'center' }}>{item.consumedStock}</td>
                <td style={{ padding: '6px', textAlign: 'center' }}>{item.closingStock} {item.unitOfMeasurement}</td>
                <td style={{ padding: '6px', textAlign: 'center' }}>${item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '6px', textAlign: 'center' }}>${item.stockValue.toLocaleString()}</td>
                <td style={{ padding: '6px', textAlign: 'center' }}>{item.coverageDays} days</td>
                <td style={{ padding: '6px', textAlign: 'center' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    backgroundColor: getStatusColor(item.status) + '20',
                    color: getStatusColor(item.status)
                  }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// Main Component
const InventoryStockUsage: React.FC = () => {
  // Hooks for data fetching
  const { dashboard, loading: dashboardLoading, refresh: refreshDashboard } = useAnalytics();
  const { data: categories = [], loading: catLoading, refresh: refreshCategories } = useCategories();
  const { data: items = [], loading: itemsLoading, refresh: refreshItems } = useItems();
  const enhancedAnalytics = useEnhancedAnalytics();
  
  // State
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'bimonthly'>('daily');
  const [monthlyBin, setMonthlyBin] = useState<'full' | 'bin1' | 'bin2'>('full');
  const [consumptionData, setConsumptionData] = useState<ConsumptionTrendsResponse | null>(null);
  const [footfallData, setFootfallData] = useState<FootfallRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'consumption' | 'inventory' | 'budget' | 'seasonal'>('overview');
  
  // NEW: Filter and view states
  const [selectedConsumptionCategory, setSelectedConsumptionCategory] = useState<number | null>(null);
  const [selectedConsumptionItem, setSelectedConsumptionItem] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'quantity' | 'price'>('quantity');
  const [visibleCategories, setVisibleCategories] = useState<number[]>([]);
  
  const [dateConfig, setDateConfig] = useState({
    current: new Date().toISOString().slice(0, 10),
    yearStart: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
    defaultStart: '2025-01-01',
    defaultEnd: '2025-07-31'
  });

  const [dateRange, setDateRange] = useState({
    start: '2025-01-01',
    end: '2025-07-31'
  });

  // Helper function to toggle category visibility
  const toggleCategoryVisibility = (categoryId: number) => {
    setVisibleCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Initialize visible categories when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && visibleCategories.length === 0) {
      // Show all categories by default, ensuring HK Chemicals is included
      setVisibleCategories(categories.map(cat => cat.id));
    }
  }, [categories]);

  // FIXED: Helper function to aggregate footfall data by week
  const aggregateFootfallByWeek = (footfallRecords: FootfallRecord[]) => {
    const weeklyMap = new Map<string, { 
      employees: number[], 
      visitors: number[], 
      startDate: string 
    }>();

    footfallRecords.forEach(record => {
      const date = new Date(record.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      const weekKey = weekStart.toISOString().slice(0, 10);
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, {
          employees: [],
          visitors: [],
          startDate: weekKey
        });
      }
      
      const week = weeklyMap.get(weekKey)!;
      week.employees.push(record.employeeCount);
      week.visitors.push(record.visitorCount);
    });

    const weeklyData = new Map<string, { totalEmployees: number, totalVisitors: number, avgEmployees: number, avgVisitors: number }>();
    weeklyMap.forEach((data, weekKey) => {
      const totalEmployees = data.employees.reduce((a, b) => a + b, 0);
      const totalVisitors = data.visitors.reduce((a, b) => a + b, 0);
      const avgEmployees = totalEmployees / data.employees.length;
      const avgVisitors = totalVisitors / data.visitors.length;
      
      weeklyData.set(`Week of ${weekKey}`, {
        totalEmployees: totalEmployees,
        totalVisitors: totalVisitors,
        avgEmployees: Math.round(avgEmployees),
        avgVisitors: Math.round(avgVisitors)
      });
    });

    return weeklyData;
  };

  // FIXED: Helper function to aggregate footfall data by month - NOW WITH TOTALS
  const aggregateFootfallByMonth = (footfallRecords: FootfallRecord[], binMode?: 'bin1' | 'bin2' | 'full') => {
    const monthlyMap = new Map<string, { 
      employees: number[], 
      visitors: number[] 
    }>();

    footfallRecords.forEach(record => {
      const date = new Date(record.date);
      const day = date.getDate();
      
      // Filter by bin if needed
      if (binMode === 'bin1' && day > 15) return;
      if (binMode === 'bin2' && day <= 15) return;
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          employees: [],
          visitors: []
        });
      }
      
      const month = monthlyMap.get(monthKey)!;
      month.employees.push(record.employeeCount);
      month.visitors.push(record.visitorCount);
    });

    const monthlyData = new Map<string, { totalEmployees: number, totalVisitors: number, avgEmployees: number, avgVisitors: number }>();
    monthlyMap.forEach((data, monthKey) => {
      const totalEmployees = data.employees.reduce((a, b) => a + b, 0);
      const totalVisitors = data.visitors.reduce((a, b) => a + b, 0);
      const avgEmployees = totalEmployees / data.employees.length;
      const avgVisitors = totalVisitors / data.visitors.length;
      
      // Add bin suffix if in bin mode
      const displayKey = binMode && binMode !== 'full' ? 
        `${monthKey} (${binMode === 'bin1' ? 'Days 1-15' : 'Days 16-31'})` : 
        monthKey;
      
      monthlyData.set(displayKey, {
        totalEmployees: totalEmployees,
        totalVisitors: totalVisitors,
        avgEmployees: Math.round(avgEmployees),
        avgVisitors: Math.round(avgVisitors)
      });
    });

    return monthlyData;
  };

  const fetchDataRange = async () => {
    try {
      console.log('Fetching actual data range from backend...');
      
      const trendsResponse = await AnalyticsAPI.consumptionTrends(
        'monthly', 
        'category',
        undefined,
        undefined,
        undefined
      );
      
      if (trendsResponse && trendsResponse.actualDataRange) {
        const rangeMatch = trendsResponse.actualDataRange.match(/(\d{4}-\d{2}-\d{2})\s+to\s+(\d{4}-\d{2}-\d{2})/);
        if (rangeMatch) {
          const [, minDate, maxDate] = rangeMatch;
          
          setDateConfig({
            current: maxDate,
            yearStart: minDate.slice(0, 4) + '-01-01',
            defaultStart: minDate,
            defaultEnd: maxDate
          });

          setDateRange({
            start: minDate,
            end: maxDate
          });
          
          console.log('✅ Data range initialized from backend:', { minDate, maxDate });
          return { success: true, minDate, maxDate };
        }
      }
      
      const dataRangeResponse = await AnalyticsAPI.dataRange();
      
      if (dataRangeResponse && dataRangeResponse.minDate && dataRangeResponse.maxDate) {
        setDateConfig({
          current: dataRangeResponse.maxDate,
          yearStart: dataRangeResponse.minDate.slice(0, 4) + '-01-01',
          defaultStart: dataRangeResponse.minDate,
          defaultEnd: dataRangeResponse.maxDate
        });

        setDateRange({
          start: dataRangeResponse.minDate,
          end: dataRangeResponse.maxDate
        });
        
        console.log('✅ Data range from fallback endpoint:', dataRangeResponse);
        return { success: true, ...dataRangeResponse };
      }
      
      console.warn('⚠️ Could not fetch data range, using defaults');
      return { success: false };
      
    } catch (error) {
      console.error('❌ Error fetching data range:', error);
      setError('Could not determine data range. Using default dates.');
      return { success: false };
    }
  };

  const fetchFootfallData = async () => {
    try {
      console.log('Fetching footfall data for range:', dateRange);
      
      if (!dateRange.start || !dateRange.end) {
        console.log('Date range not set, skipping footfall fetch');
        return { success: false, message: 'Date range not initialized' };
      }
      
      const response = await FootfallAPI.list(
        dateRange.start, 
        dateRange.end, 
        undefined, 
        0, 
        500
      );
      
      if (response.success && response.data) {
        const footfallRecords: FootfallRecord[] = response.data.map(record => ({
          date: record.date,
          employeeCount: record.employeeCount || 0,
          visitorCount: record.visitorCount || 0,
          totalFootfall: record.totalFootfall || (record.employeeCount + record.visitorCount)
        }));
        
        setFootfallData(footfallRecords);
        console.log(`✅ Loaded ${footfallRecords.length} footfall records`);
        return { success: true, count: footfallRecords.length };
      } else {
        console.warn('⚠️ No footfall data available');
        setFootfallData([]);
        return { success: false, message: 'No footfall data available' };
      }
    } catch (error: any) {
      console.error('❌ Footfall fetch error:', error);
      setFootfallData([]);
      
      if (error.message.includes('Cannot connect')) {
        setError('Cannot connect to server. Please check if the backend is running.');
      } else if (error.message.includes('404')) {
        setError('Footfall data endpoint not found. Please check backend configuration.');
      } else {
        setError('Could not load footfall data. Some charts may be incomplete.');
      }
      
      return { success: false, error: error.message };
    }
  };

  const fetchConsumptionData = async () => {
    try {
      // Adjust period for bimonthly
      const actualPeriod = period === 'bimonthly' ? 'monthly' : period;
      
      console.log('Fetching consumption trends:', {
        period: actualPeriod,
        dateRange,
        groupBy: 'category'
      });
      
      if (!dateRange.start || !dateRange.end) {
        console.warn('Date range not set for consumption data');
        return { success: false };
      }
      
      const data = await AnalyticsAPI.consumptionTrends(
        actualPeriod, 
        'category', 
        undefined,
        dateRange.start,
        dateRange.end
      );
      
      if (data && data.data && data.data.length > 0) {
        setConsumptionData(data);
        console.log(`✅ Consumption data loaded: ${data.data.length} categories`);
        
        if (data.actualDataRange) {
          console.log('Actual data range from consumption:', data.actualDataRange);
        }
        
        return { success: true, count: data.data.length };
      } else {
        console.warn('⚠️ No consumption data returned');
        setConsumptionData(null);
        setError('No consumption data available for the selected period.');
        return { success: false, message: 'No data available' };
      }
    } catch (error: any) {
      console.error('❌ Consumption data error:', error);
      setConsumptionData(null);
      
      if (error.message.includes('500')) {
        setError('Server error loading consumption data. Please check backend logs.');
      } else {
        setError('Could not load consumption trends.');
      }
      
      return { success: false, error: error.message };
    }
  };

  // ENHANCED: Process chart data with weekly/monthly footfall aggregation
  const processChartData = (): ConsumptionDataPoint[] => {
    if (!consumptionData?.data || consumptionData.data.length === 0) {
      console.log('No consumption data to process');
      return [];
    }

    const processed: ConsumptionDataPoint[] = [];
    const dateMap = new Map<string, ConsumptionDataPoint>();

    try {
      // Process consumption data - ENSURE ALL CATEGORIES ARE INCLUDED
      consumptionData.data.forEach(item => {
        const categoryName = item.category || item.categoryName || 'Unknown';
        
        // Log to ensure HK Chemicals is being processed
        if (categoryName.toLowerCase().includes('chemical') || categoryName.toLowerCase().includes('hk')) {
          console.log(`Processing HK Chemicals category: ${categoryName}`);
        }
        
        if (!item.dataPoints || item.dataPoints.length === 0) {
          console.warn(`No data points for category: ${categoryName}`);
          return;
        }

        item.dataPoints.forEach((point: any) => {
          let dateKey = '';
          
          if (period === 'daily') {
            dateKey = point.startDate || point.date || point.periodLabel || '';
          } else if (period === 'weekly') {
            dateKey = point.periodLabel || point.startDate || '';
          } else if (period === 'monthly' || period === 'bimonthly') {
            dateKey = point.periodLabel || point.startDate || '';
            
            // Filter for bi-monthly bins
            if (period === 'bimonthly' && monthlyBin !== 'full') {
              const date = new Date(point.startDate || point.date);
              const day = date.getDate();
              
              if (monthlyBin === 'bin1' && day > 15) return;
              if (monthlyBin === 'bin2' && day <= 15) return;
              
              // Add bin indicator to the key
              dateKey = `${dateKey} (${monthlyBin === 'bin1' ? 'Days 1-15' : 'Days 16-31'})`;
            }
          }

          if (!dateKey) {
            console.warn('Skipping data point with no date key:', point);
            return;
          }

          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, { date: dateKey });
          }
          
          const dataPoint = dateMap.get(dateKey)!;
          
          const consumptionValue = Number(point.consumption) || 0;
          const costValue = Number(point.cost) || 0;
          
          // Accumulate values if category already exists (for aggregated periods)
          dataPoint[categoryName] = (dataPoint[categoryName] || 0) + Math.round(consumptionValue * 100) / 100;
          
          if (costValue > 0) {
            dataPoint[`${categoryName}_cost`] = (dataPoint[`${categoryName}_cost`] || 0) + Math.round(costValue * 100) / 100;
          }
        });
      });

      // ENHANCED: Add aggregated footfall data based on period
      if (footfallData && footfallData.length > 0) {
        if (period === 'daily') {
          // For daily, match directly
          dateMap.forEach((dataPoint, dateKey) => {
            const footfall = footfallData.find(f => {
              return f.date === dateKey || f.date === dateKey.split(' ')[0];
            });
            
            if (footfall) {
              dataPoint.employeeCount = footfall.employeeCount;
              dataPoint.visitorCount = footfall.visitorCount;
            }
          });
        } else if (period === 'weekly') {
          // Aggregate footfall by week
          const weeklyFootfall = aggregateFootfallByWeek(footfallData);
          
          dateMap.forEach((dataPoint, dateKey) => {
            const weekData = weeklyFootfall.get(dateKey);
            if (weekData) {
              dataPoint.totalEmployees = weekData.totalEmployees;
              dataPoint.totalVisitors = weekData.totalVisitors;
              dataPoint.avgEmployees = weekData.avgEmployees;
              dataPoint.avgVisitors = weekData.avgVisitors;
            }
          });
        } else if (period === 'monthly' || period === 'bimonthly') {
          // Aggregate footfall by month (with optional bin filtering)
          const binMode = period === 'bimonthly' ? monthlyBin : 'full';
          const monthlyFootfall = aggregateFootfallByMonth(footfallData, binMode);
          
          dateMap.forEach((dataPoint, dateKey) => {
            const monthData = monthlyFootfall.get(dateKey);
            if (monthData) {
              dataPoint.totalEmployees = monthData.totalEmployees;
              dataPoint.totalVisitors = monthData.totalVisitors;
              dataPoint.avgEmployees = monthData.avgEmployees;
              dataPoint.avgVisitors = monthData.avgVisitors;
            }
          });
        }
      }

      // Convert to array and sort
      dateMap.forEach(dataPoint => {
        processed.push(dataPoint);
      });

      // Sort by date
      processed.sort((a, b) => {
        const extractDate = (str: string) => {
          if (str.includes('Week of')) {
            return str.split('Week of ')[1];
          }
          if (str.match(/^[A-Za-z]+ \d{4}/)) {
            return new Date(str.split(' (')[0] + ' 01').toISOString();
          }
          return str;
        };
        
        const dateA = extractDate(a.date);
        const dateB = extractDate(b.date);
        
        return dateA.localeCompare(dateB);
      });

      console.log(`Processed ${processed.length} chart data points with footfall aggregation`);
      
      // Log categories found in the data
      if (processed.length > 0) {
        const categoriesFound = new Set<string>();
        Object.keys(processed[0]).forEach(key => {
          if (key !== 'date' && !key.includes('_cost') && !key.includes('Employee') && !key.includes('Visitor')) {
            categoriesFound.add(key);
          }
        });
        console.log('Categories found in chart data:', Array.from(categoriesFound));
      }
    } catch (error) {
      console.error('Error processing chart data:', error);
    }

    return processed;
  };

  // Process cost distribution
  const processCostDistribution = () => {
    if (enhancedAnalytics.costDistributionData?.categoryDistribution) {
      return enhancedAnalytics.costDistributionData.categoryDistribution.map((item: any, index: number) => ({
        name: item.category,
        value: item.totalCost,
        percentage: item.percentage,
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }));
    }
    
    return categories.slice(0, 5).map((cat, index) => ({
      name: cat.categoryName,
      value: Math.random() * 10000 + 1000,
      percentage: Math.random() * 30 + 10,
      fill: CHART_COLORS[index % CHART_COLORS.length]
    }));
  };

  // Load all data
  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    
    const results = {
      dataRange: false,
      dashboard: false,
      categories: false,
      items: false,
      consumption: false,
      footfall: false,
      enhanced: false
    };
    
    try {
      console.log('🔄 Starting full data load...');
      
      const rangeResult = await fetchDataRange();
      results.dataRange = rangeResult.success;
      
      if (!rangeResult.success) {
        console.warn('Using default date range as backend range fetch failed');
      }
      
      const basicPromises = [
        refreshDashboard().then(() => { results.dashboard = true; }).catch(e => {
          console.error('Dashboard error:', e);
          return false;
        }),
        refreshCategories().then(() => { results.categories = true; }).catch(e => {
          console.error('Categories error:', e);
          return false;
        }),
        refreshItems().then(() => { results.items = true; }).catch(e => {
          console.error('Items error:', e);
          return false;
        })
      ];
      
      await Promise.allSettled(basicPromises);
      
      const dataPromises = [
        fetchConsumptionData().then(r => { results.consumption = r.success; }),
        fetchFootfallData().then(r => { results.footfall = r.success; })
      ];
      
      await Promise.allSettled(dataPromises);
      
      try {
        await enhancedAnalytics.refreshAll(period === 'bimonthly' ? 'monthly' : period, dateRange.start, dateRange.end);
        results.enhanced = true;
      } catch (e) {
        console.warn('Enhanced analytics failed (non-critical):', e);
      }
      
      const successCount = Object.values(results).filter(r => r).length;
      const totalCount = Object.keys(results).length;
      
      console.log(`✅ Data load complete: ${successCount}/${totalCount} successful`);
      console.log('Load results:', results);
      
      if (successCount < totalCount) {
        const failed = Object.entries(results)
          .filter(([_, success]) => !success)
          .map(([name]) => name);
        
        if (failed.includes('dataRange') || failed.includes('categories') || failed.includes('items')) {
          setError(`Critical data could not be loaded: ${failed.join(', ')}. Please refresh.`);
        } else if (failed.includes('consumption') || failed.includes('footfall')) {
          setError('Some analytics data is unavailable. Charts may be incomplete.');
        }
      }
      
    } catch (error: any) {
      console.error('❌ Fatal error in loadAllData:', error);
      setError('Failed to load data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchDataRange();
  }, []);

  // Load all data when date range is set
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      loadAllData();
    }
  }, [dateRange.start, dateRange.end]);

  // Reload when settings change
  useEffect(() => {
    if (dateRange.start && dateRange.end) {
      fetchConsumptionData();
      fetchFootfallData();
    }
  }, [period, dateRange, monthlyBin]);

  // Handle date range presets
  const handleDatePreset = (preset: string) => {
    const end = new Date(dateConfig.current);
    let start = new Date(dateConfig.current);
    
    switch (preset) {
      case '7days':
        start.setDate(end.getDate() - 7);
        break;
      case '30days':
        start.setDate(end.getDate() - 30);
        break;
      case '60days':
        start.setDate(end.getDate() - 60);
        break;
      case 'ytd':
        start = new Date(dateConfig.yearStart);
        break;
      case 'all':
        setDateRange({
          start: dateConfig.defaultStart,
          end: dateConfig.defaultEnd
        });
        return;
    }
    
    setDateRange({
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10)
    });
  };

  // Show loading state
  if (loading && !dashboard && items.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: cardBackgrounds.neutral
      }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw style={{ 
            width: '32px', 
            height: '32px', 
            color: COLORS.primary,
            animation: 'spin 2s linear infinite',
            margin: '0 auto'
          }} />
          <div style={{ marginTop: '12px', color: COLORS.muted, fontSize: '13px' }}>
            Loading inventory analytics...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '16px' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header */}
        <Card background={cardBackgrounds.neutral}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                margin: '0 0 4px 0',
                color: COLORS.dark
              }}>
                Inventory Analytics Dashboard
              </h1>
              <p style={{ color: COLORS.muted, fontSize: '12px', margin: 0 }}>
                Data Range: {dateRange.start} to {dateRange.end}
              </p>
            </div>
            
            <button
              onClick={loadAllData}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                opacity: loading ? 0.6 : 1
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </Card>

        {/* Date Range Selector */}
        <Card background={cardBackgrounds.primary}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Calendar style={{ width: '14px', height: '14px', color: COLORS.primary }} />
            
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              min={dateConfig.defaultStart}
              max={dateConfig.defaultEnd}
              style={{
                padding: '5px 8px',
                border: `1px solid ${COLORS.light}`,
                borderRadius: '4px',
                fontSize: '11px'
              }}
            />
            
            <span style={{ color: COLORS.muted, fontSize: '11px' }}>to</span>
            
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              min={dateConfig.defaultStart}
              max={dateConfig.defaultEnd}
              style={{
                padding: '5px 8px',
                border: `1px solid ${COLORS.light}`,
                borderRadius: '4px',
                fontSize: '11px'
              }}
            />

            {/* Quick date presets */}
            {[
              { label: '7 Days', value: '7days' },
              { label: '30 Days', value: '30days' },
              { label: '60 Days', value: '60days' },
              { label: 'YTD', value: 'ytd' },
              { label: 'All Data', value: 'all' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleDatePreset(option.value)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'white',
                  border: `1px solid ${COLORS.primary}`,
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  color: COLORS.primary
                }}
              >
                {option.label}
              </button>
            ))}
            
            {/* Data status indicators */}
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              {consumptionData && (
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: cardBackgrounds.success,
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: COLORS.success
                }}>
                  <CheckCircle style={{ width: '10px', height: '10px', display: 'inline', marginRight: '3px' }} />
                  {consumptionData.data?.length || 0} categories
                </span>
              )}
              
              {footfallData.length > 0 && (
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: cardBackgrounds.primary,
                  borderRadius: '4px',
                  fontSize: '10px',
                  color: COLORS.primary
                }}>
                  <Users style={{ width: '10px', height: '10px', display: 'inline', marginRight: '3px' }} />
                  {footfallData.length} days loaded
                </span>
              )}
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card background={cardBackgrounds.warning}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle style={{ width: '16px', height: '16px', color: COLORS.warning }} />
              <span style={{ fontSize: '12px', color: COLORS.dark }}>{error}</span>
            </div>
          </Card>
        )}

        {/* Enhanced Tabs */}
        <Card>
          <div style={{ 
            display: 'flex', 
            gap: '2px', 
            padding: '2px',
            backgroundColor: cardBackgrounds.neutral,
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            {['overview', 'consumption', 'inventory', 'budget', 'seasonal'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                style={{
                  flex: 1,
                  padding: '6px',
                  backgroundColor: activeTab === tab ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: activeTab === tab ? '500' : '400',
                  color: activeTab === tab ? COLORS.primary : COLORS.muted,
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Consumption with Employee Chart */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: COLORS.dark }}>
                  Consumption & Employee Trends
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={processChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="date" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" />
                    <YAxis yAxisId="left" tick={{ fontSize: 9 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                    <Tooltip content={<ModernTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    
                    {/* Show all categories, not just first 3 */}
                    {categories
                      .filter(cat => visibleCategories.includes(cat.id))
                      .slice(0, 5)
                      .map((cat, index) => (
                        <Bar
                          key={cat.id}
                          yAxisId="left"
                          dataKey={cat.categoryName}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          opacity={0.8}
                        />
                      ))}
                    
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey={period === 'daily' ? 'employeeCount' : 'totalEmployees'}
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      name={period === 'daily' ? 'Employees' : 'Total Employees'}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Cost Distribution Pie */}
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: COLORS.dark }}>
                  Cost Distribution
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={processCostDistribution()}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {processCostDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<ModernTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'consumption' && (
            <div>
              {/* Enhanced period selector with bi-monthly */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {['daily', 'weekly', 'monthly', 'bimonthly'].map(p => (
                  <button
                    key={p}
                    onClick={() => {
                      setPeriod(p as any);
                      if (p !== 'bimonthly') {
                        setMonthlyBin('full');
                      }
                    }}
                    style={{
                      padding: '5px 12px',
                      backgroundColor: period === p ? COLORS.primary : 'white',
                      color: period === p ? 'white' : COLORS.dark,
                      border: `1px solid ${period === p ? COLORS.primary : COLORS.light}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      textTransform: 'capitalize'
                    }}
                  >
                    {p === 'bimonthly' ? 'Bi-Monthly' : p}
                  </button>
                ))}
                
                {/* Bi-monthly bin selector */}
                {period === 'bimonthly' && (
                  <>
                    <div style={{ marginLeft: '12px', borderLeft: `1px solid ${COLORS.light}`, paddingLeft: '12px' }}>
                      <Split style={{ width: '14px', height: '14px', display: 'inline', color: COLORS.info, marginRight: '6px' }} />
                    </div>
                    {['full', 'bin1', 'bin2'].map(bin => (
                      <button
                        key={bin}
                        onClick={() => setMonthlyBin(bin as any)}
                        style={{
                          padding: '5px 12px',
                          backgroundColor: monthlyBin === bin ? COLORS.info : 'white',
                          color: monthlyBin === bin ? 'white' : COLORS.dark,
                          border: `1px solid ${monthlyBin === bin ? COLORS.info : COLORS.light}`,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '11px'
                        }}
                      >
                        {bin === 'full' ? 'Full Month' : 
                         bin === 'bin1' ? 'Days 1-15' : 'Days 16-31'}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* NEW: Advanced Filters Row */}
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '16px', 
                padding: '12px',
                backgroundColor: cardBackgrounds.neutral,
                borderRadius: '6px',
                flexWrap: 'wrap',
                alignItems: 'center'
              }}>
                {/* Category Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Filter style={{ width: '14px', height: '14px', color: COLORS.muted }} />
                  <select
                    value={selectedConsumptionCategory || 'all'}
                    onChange={(e) => setSelectedConsumptionCategory(e.target.value === 'all' ? null : Number(e.target.value))}
                    style={{
                      padding: '5px 10px',
                      border: `1px solid ${COLORS.light}`,
                      borderRadius: '4px',
                      fontSize: '11px',
                      minWidth: '150px'
                    }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                    ))}
                  </select>
                </div>

                {/* Item Filter */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package style={{ width: '14px', height: '14px', color: COLORS.muted }} />
                  <select
                    value={selectedConsumptionItem || 'all'}
                    onChange={(e) => setSelectedConsumptionItem(e.target.value === 'all' ? null : Number(e.target.value))}
                    style={{
                      padding: '5px 10px',
                      border: `1px solid ${COLORS.light}`,
                      borderRadius: '4px',
                      fontSize: '11px',
                      minWidth: '150px'
                    }}
                  >
                    <option value="all">All Items</option>
                    {items
                      .filter(item => !selectedConsumptionCategory || item.categoryId === selectedConsumptionCategory)
                      .map(item => (
                        <option key={item.id} value={item.id}>{item.itemName}</option>
                      ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                  <span style={{ fontSize: '11px', color: COLORS.muted }}>View:</span>
                  <button
                    onClick={() => setViewMode('quantity')}
                    style={{
                      padding: '5px 12px',
                      backgroundColor: viewMode === 'quantity' ? COLORS.success : 'white',
                      color: viewMode === 'quantity' ? 'white' : COLORS.dark,
                      border: `1px solid ${viewMode === 'quantity' ? COLORS.success : COLORS.light}`,
                      borderRadius: '4px 0 0 4px',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    <Package style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />
                    Quantity
                  </button>
                  <button
                    onClick={() => setViewMode('price')}
                    style={{
                      padding: '5px 12px',
                      backgroundColor: viewMode === 'price' ? COLORS.warning : 'white',
                      color: viewMode === 'price' ? 'white' : COLORS.dark,
                      border: `1px solid ${viewMode === 'price' ? COLORS.warning : COLORS.light}`,
                      borderRadius: '0 4px 4px 0',
                      cursor: 'pointer',
                      fontSize: '11px',
                      marginLeft: '-1px'
                    }}
                  >
                    <DollarSign style={{ width: '12px', height: '12px', display: 'inline', marginRight: '4px' }} />
                    Price
                  </button>
                </div>

                {/* Categories Visibility Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '100%' }}>
                  <Eye style={{ width: '14px', height: '14px', color: COLORS.muted }} />
                  <span style={{ fontSize: '11px', color: COLORS.muted, marginRight: '8px' }}>Show Categories:</span>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {categories.slice(0, 8).map((cat, index) => (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategoryVisibility(cat.id)}
                        style={{
                          padding: '3px 8px',
                          backgroundColor: visibleCategories.includes(cat.id) ? CHART_COLORS[index % CHART_COLORS.length] : 'white',
                          color: visibleCategories.includes(cat.id) ? 'white' : COLORS.dark,
                          border: `1px solid ${visibleCategories.includes(cat.id) ? CHART_COLORS[index % CHART_COLORS.length] : COLORS.light}`,
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '10px',
                          opacity: visibleCategories.includes(cat.id) ? 1 : 0.5
                        }}
                      >
                        {cat.categoryName}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={processChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="date" tick={{ fontSize: 9 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" tick={{ fontSize: 9 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
                  <Tooltip content={<ModernTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  
                  {/* Render bars for visible categories */}
                  {categories
                    .filter(cat => visibleCategories.includes(cat.id))
                    .map((cat, index) => {
                      const dataKey = viewMode === 'price' && consumptionData?.data?.find(d => d.category === cat.categoryName || d.categoryName === cat.categoryName) ? 
                        `${cat.categoryName}_cost` : 
                        cat.categoryName;
                        
                      return (
                        <Bar
                          key={cat.id}
                          yAxisId="left"
                          dataKey={dataKey}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          opacity={0.8}
                          name={viewMode === 'price' ? `${cat.categoryName} ($)` : cat.categoryName}
                        />
                      );
                    })}
                  
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey={period === 'daily' ? 'employeeCount' : 'totalEmployees'}
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    name={period === 'daily' ? 'Employee Count' : 'Total Employees'}
                  />
                  
                  {period !== 'daily' && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalVisitors"
                      stroke={COLORS.warning}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 2 }}
                      name="Total Visitors"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'budget' && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: cardBackgrounds.primary,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: COLORS.muted }}>Budget</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: COLORS.primary }}>
                    ${enhancedAnalytics.budgetData?.totalPlannedBudget?.toLocaleString() || '120,000'}
                  </div>
                </div>
                
                <div style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: cardBackgrounds.warning,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: COLORS.muted }}>Spent</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: COLORS.warning }}>
                    ${enhancedAnalytics.budgetData?.totalActualSpending?.toLocaleString() || '95,000'}
                  </div>
                </div>
                
                <div style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: cardBackgrounds.success,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: COLORS.muted }}>Remaining</div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: COLORS.success }}>
                    ${Math.abs(enhancedAnalytics.budgetData?.totalVariance || 25000).toLocaleString()}
                  </div>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={enhancedAnalytics.budgetData?.budgetData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip content={<ModernTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  
                  <Bar dataKey="plannedBudget" fill={COLORS.primary} opacity={0.6} />
                  <Bar dataKey="actualSpending" fill={COLORS.warning} opacity={0.7} />
                  <Line type="monotone" dataKey="variancePercentage" stroke={COLORS.danger} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {activeTab === 'inventory' && (
            <CoreInventoryTable 
              items={items} 
              categories={categories} 
              onRefresh={refreshItems}
            />
          )}

          {activeTab === 'seasonal' && (
            <SeasonalCostAnalysis
              consumptionData={consumptionData}
              dateRange={dateRange}
              categories={categories}
              items={items}
            />
          )}
        </Card>

      </div>
    </div>
  );
};

export default InventoryStockUsage;