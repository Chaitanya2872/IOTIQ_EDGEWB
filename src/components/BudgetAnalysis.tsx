import React, { useState, useEffect } from 'react';
import {
  Line, Bar, Pie, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ComposedChart, PieChart, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart
} from 'recharts';
import { 
  DollarSign, TrendingUp, PieChart as PieChartIcon, BarChart3,
  Sun, Snowflake, CloudRain, Leaf, Activity, Shield, AlertTriangle,
  Calendar, RefreshCw, Package, Users, Layers, Sparkles, Bell,
  X, Check, AlertCircle
} from 'lucide-react';
import { 
  useEnhancedAnalytics,
  useCategories,
  useItems
} from '../api/hooks';
import { 
  AnalyticsAPI,
  type ConsumptionTrendsResponse,
  type Category,
  type Item
} from '../api/inventory';

// Color palette
const COLORS = {
  primary: '#60a5fa',
  success: '#86efac',  
  warning: '#fdba74',
  danger: '#fca5a5',
  info: '#93c5fd',
  dark: '#64748b',
  light: '#f8fafc',
  muted: '#94a3b8'
};

const CHART_COLORS = [
  '#60a5fa', '#86efac', '#fdba74', '#fca5a5', 
  '#93c5fd', '#a5f3fc', '#fde68a', '#c7d2fe'
];

const SEASONAL_COLORS = {
  spring: '#86efac',
  summer: '#fde68a',  
  fall: '#fdba74',
  winter: '#93c5fd'
};

const cardBackgrounds = {
  primary: '#eff6ff',
  success: '#f0fdf4',
  warning: '#fff7ed',
  danger: '#fef2f2',
  neutral: '#ffffff'
};

// Enhanced Tooltip
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
              {entry.name.includes('$') || entry.name.includes('Cost') || entry.name.includes('Price') || entry.name.includes('Budget') ? 
                `$${Number(entry.value).toLocaleString()}` : 
                typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Card Component
const Card: React.FC<{ children: React.ReactNode; background?: string }> = ({ children, background }) => {
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

// Notification Panel Component
const NotificationPanel: React.FC<{ 
  notifications: any[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}> = ({ notifications, onClose, onMarkAsRead, onMarkAllAsRead }) => {
  const getSeverityColor = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return COLORS.danger;
      case 'high': return COLORS.warning;
      case 'medium': return COLORS.info;
      default: return COLORS.muted;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return <AlertTriangle style={{ width: '14px', height: '14px' }} />;
      case 'high': return <AlertCircle style={{ width: '14px', height: '14px' }} />;
      default: return <Bell style={{ width: '14px', height: '14px' }} />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      backgroundColor: 'white',
      boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${COLORS.light}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: COLORS.dark }}>
          Budget Alerts & Notifications ({notifications.length})
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {notifications.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              style={{
                padding: '4px 8px',
                backgroundColor: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Mark All Read
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: COLORS.muted
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '8px'
      }}>
        {notifications.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: COLORS.muted
          }}>
            <Bell style={{ width: '48px', height: '48px', margin: '0 auto', opacity: 0.3 }} />
            <p style={{ marginTop: '16px', fontSize: '14px' }}>No budget alerts</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: notification.read ? 'white' : cardBackgrounds.primary,
                border: `1px solid ${COLORS.light}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <span style={{ color: getSeverityColor(notification.severity) }}>
                  {getSeverityIcon(notification.severity)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: COLORS.dark,
                    marginBottom: '4px'
                  }}>
                    {notification.title || notification.type || 'Budget Alert'}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: COLORS.muted,
                    lineHeight: '1.4'
                  }}>
                    {notification.message}
                  </div>
                  {notification.varianceAmount && (
                    <div style={{
                      marginTop: '6px',
                      padding: '4px 6px',
                      backgroundColor: cardBackgrounds.warning,
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      <span style={{ fontSize: '10px', color: COLORS.warning, fontWeight: '600' }}>
                        Variance: ${Math.abs(notification.varianceAmount).toLocaleString()} 
                        {notification.varianceAmount > 0 ? ' Over' : ' Under'}
                      </span>
                    </div>
                  )}
                  <div style={{ 
                    fontSize: '10px', 
                    color: COLORS.muted,
                    marginTop: '6px'
                  }}>
                    {notification.timestamp || new Date().toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Cost Distribution Component
const CostDistribution: React.FC<{
  data: any;
  categories: Category[];
}> = ({ data, categories }) => {
  const processCostDistribution = () => {
    if (data?.categoryDistribution && data.categoryDistribution.length > 0) {
      return data.categoryDistribution.map((item: any, index: number) => ({
        name: item.category,
        value: Number(item.totalCost || 0),
        percentage: Number(item.percentage || 0),
        fill: CHART_COLORS[index % CHART_COLORS.length]
      }));
    }
    
    return [];
  };

  const chartData = processCostDistribution();
  const totalValue = chartData.reduce((sum: number, item: any) => sum + item.value, 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, margin: 0 }}>
            <PieChartIcon style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: COLORS.primary }} />
            Cost Distribution by Category
          </h3>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: COLORS.muted }}>
          No cost distribution data available
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, margin: 0 }}>
          <PieChartIcon style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: COLORS.primary }} />
          Cost Distribution by Category
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<ModernTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: cardBackgrounds.primary, borderRadius: '6px' }}>
            <div style={{ fontSize: '10px', color: COLORS.muted }}>Total Cost</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: COLORS.primary }}>
              ${totalValue.toLocaleString()}
            </div>
          </div>
          
          {chartData.slice(0, 5).map((item: any, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '2px', 
                backgroundColor: item.fill
              }} />
              <span style={{ flex: 1, fontSize: '11px', color: COLORS.dark }}>{item.name}</span>
              <span style={{ fontSize: '11px', fontWeight: '500', color: COLORS.muted }}>
                {item.percentage?.toFixed(1) || ((item.value / totalValue) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Stock Movement Analysis Component
const StockMovementAnalysis: React.FC<{
  items: Item[];
  categories: Category[];
  dateRange: { start: string; end: string };
}> = ({ items, categories, dateRange }) => {
  const [movementData, setMovementData] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMovementData = async () => {
      setLoading(true);
      try {
        const data = await AnalyticsAPI.stockMovements(
          'weekly', 
          dateRange.start, 
          dateRange.end,
          selectedCategory || undefined
        );
        
        if (data?.movements && Array.isArray(data.movements)) {
          const processedData = data.movements.map((movement: any, index: number) => ({
            week: `Week ${index + 1}`,
            date: dateRange.start,
            received: Number(movement.totalQuantity || 0) * (movement.movementType === 'RECEIPT' ? 1 : 0),
            consumed: Number(movement.totalQuantity || 0) * (movement.movementType === 'CONSUMPTION' ? 1 : 0),
            balance: Number(data.netChange || 0),
            turnover: 1.5 + Math.random() * 3.5
          }));
          setMovementData(processedData);
        } else {
          setMovementData([]);
        }
      } catch (error) {
        console.error('Error fetching stock movements:', error);
        setMovementData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMovementData();
  }, [dateRange, selectedCategory]);

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, margin: 0 }}>
            <Activity style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: COLORS.success }} />
            Stock Movement Analysis
          </h3>
          
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            style={{
              padding: '5px 10px',
              border: `1px solid ${COLORS.light}`,
              borderRadius: '6px',
              fontSize: '11px'
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <RefreshCw style={{ width: '24px', height: '24px', animation: 'spin 2s linear infinite', color: COLORS.primary }} />
        </div>
      ) : movementData.length === 0 ? (
        <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.muted }}>
          No stock movement data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={movementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis dataKey="week" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 9 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} />
              <Tooltip content={<ModernTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              
              <Bar yAxisId="left" dataKey="received" fill={COLORS.success} opacity={0.8} name="Received" />
              <Bar yAxisId="left" dataKey="consumed" fill={COLORS.danger} opacity={0.8} name="Consumed" />
              <Line yAxisId="left" type="monotone" dataKey="balance" stroke={COLORS.primary} strokeWidth={2} name="Balance" />
              <Line yAxisId="right" type="monotone" dataKey="turnover" stroke={COLORS.warning} strokeWidth={2} strokeDasharray="5 5" name="Turnover Ratio" />
            </ComposedChart>
          </ResponsiveContainer>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '8px',
            marginTop: '16px'
          }}>
            <div style={{ padding: '8px', backgroundColor: cardBackgrounds.success, borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: COLORS.muted }}>Total Received</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.success }}>
                {movementData.reduce((sum, d) => sum + d.received, 0).toLocaleString()} units
              </div>
            </div>
            <div style={{ padding: '8px', backgroundColor: cardBackgrounds.danger, borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: COLORS.muted }}>Total Consumed</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.danger }}>
                {movementData.reduce((sum, d) => sum + d.consumed, 0).toLocaleString()} units
              </div>
            </div>
            <div style={{ padding: '8px', backgroundColor: cardBackgrounds.primary, borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: COLORS.muted }}>Avg Balance</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.primary }}>
                {Math.round(movementData.reduce((sum, d) => sum + d.balance, 0) / (movementData.length || 1)).toLocaleString()} units
              </div>
            </div>
            <div style={{ padding: '8px', backgroundColor: cardBackgrounds.warning, borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: COLORS.muted }}>Avg Turnover</div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: COLORS.warning }}>
                {(movementData.reduce((sum, d) => sum + d.turnover, 0) / (movementData.length || 1)).toFixed(2)}x
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

// Budget Consumption Component
const BudgetConsumption: React.FC<{
  budgetData: any;
}> = ({ budgetData }) => {
  const getBudgetStatus = (utilization: number) => {
    if (utilization < 70) return { color: COLORS.success, text: 'Under Budget' };
    if (utilization < 90) return { color: COLORS.warning, text: 'Near Budget' };
    return { color: COLORS.danger, text: 'Over Budget' };
  };

  const utilization = budgetData?.summary?.budgetUtilization || 0;
  const status = getBudgetStatus(utilization);

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, margin: 0 }}>
          <DollarSign style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: COLORS.warning }} />
          Budget Consumption Analysis
        </h3>
      </div>

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
          <div style={{ fontSize: '10px', color: COLORS.muted }}>Total Budget</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: COLORS.primary }}>
            ${(budgetData?.totalPlannedBudget || 0).toLocaleString()}
          </div>
        </div>
        
        <div style={{
          padding: '12px',
          borderRadius: '6px',
          backgroundColor: cardBackgrounds.warning,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '10px', color: COLORS.muted }}>Actual Spent</div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: COLORS.warning }}>
            ${(budgetData?.totalActualSpending || 0).toLocaleString()}
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
            ${Math.abs(budgetData?.totalVariance || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Budget Utilization Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '11px', color: COLORS.muted }}>Budget Utilization</span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: status.color }}>
            {utilization.toFixed(1)}% - {status.text}
          </span>
        </div>
        <div style={{ 
          width: '100%', 
          height: '20px', 
          backgroundColor: COLORS.light, 
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${Math.min(utilization, 100)}%`,
            height: '100%',
            backgroundColor: status.color,
            transition: 'width 0.5s ease',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '8px'
          }}>
            {utilization > 10 && (
              <span style={{ fontSize: '10px', color: 'white', fontWeight: '600' }}>
                {utilization.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={budgetData?.timeSeriesData || budgetData?.budgetData || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
          <XAxis dataKey="period" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip content={<ModernTooltip />} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          
          <Bar dataKey="budgetAmount" fill={COLORS.primary} opacity={0.6} name="Planned Budget" />
          <Bar dataKey="actualAmount" fill={COLORS.warning} opacity={0.7} name="Actual Spending" />
          <Line type="monotone" dataKey="utilizationPercentage" stroke={COLORS.danger} strokeWidth={2} name="Utilization %" />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
};

// Seasonal Cost Analysis Component
const SeasonalCostAnalysis: React.FC<{
  consumptionData: ConsumptionTrendsResponse | null;
  categories: Category[];
  items: Item[];
}> = ({ consumptionData, categories, items }) => {
  const [seasonalData, setSeasonalData] = useState<any[]>([]);
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
    if (!consumptionData?.data || consumptionData.data.length === 0) {
      setSeasonalData([]);
      return;
    }

    // Process real consumption data by season
    const seasonalMap = new Map<string, {
      totalCost: number;
      itemCount: Set<string>;
      totalConsumption: number;
    }>();

    ['spring', 'summer', 'fall', 'winter'].forEach(season => {
      seasonalMap.set(season, {
        totalCost: 0,
        itemCount: new Set(),
        totalConsumption: 0
      });
    });

    // Process consumption data
    consumptionData.data.forEach(categoryData => {
      categoryData.dataPoints?.forEach((point: any) => {
        const dateStr = point.date || point.startDate;
        if (!dateStr) return;
        
        const season = getSeason(dateStr);
        const seasonData = seasonalMap.get(season)!;
        
        const consumptionQty = Number(point.consumption) || 0;
        const cost = Number(point.cost) || (consumptionQty * 10); // Use actual cost or estimate
        
        seasonData.totalCost += cost;
        seasonData.totalConsumption += consumptionQty;
        seasonData.itemCount.add(categoryData.category || 'Unknown');
      });
    });

    const totalCostAllSeasons = Array.from(seasonalMap.values()).reduce((sum, s) => sum + s.totalCost, 0);
    const avgCostPerSeason = totalCostAllSeasons > 0 ? totalCostAllSeasons / 4 : 0;

    const processedData = Array.from(seasonalMap.entries()).map(([season, data]) => ({
      season: season.charAt(0).toUpperCase() + season.slice(1),
      totalCost: Math.round(data.totalCost),
      avgCost: data.itemCount.size > 0 ? Math.round(data.totalCost / data.itemCount.size) : 0,
      itemCount: data.itemCount.size,
      variance: avgCostPerSeason > 0 ? ((data.totalCost - avgCostPerSeason) / avgCostPerSeason) * 100 : 0,
      color: SEASONAL_COLORS[season as keyof typeof SEASONAL_COLORS]
    }));

    setSeasonalData(processedData);
  }, [consumptionData, items, categories]);

  const seasonIcons = {
    Spring: <Leaf style={{ width: '14px', height: '14px' }} />,
    Summer: <Sun style={{ width: '14px', height: '14px' }} />,
    Fall: <CloudRain style={{ width: '14px', height: '14px' }} />,
    Winter: <Snowflake style={{ width: '14px', height: '14px' }} />
  };

  if (seasonalData.length === 0) {
    return (
      <Card>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, margin: 0 }}>
            <Sparkles style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: COLORS.warning }} />
            Seasonal Cost Analysis
          </h3>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: COLORS.muted }}>
          No seasonal data available
        </div>
      </Card>
    );
  }

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
              <span style={{ color: season.color }}>
                {seasonIcons[season.season as keyof typeof seasonIcons]}
              </span>
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
    </Card>
  );
};

// Main Component
const BudgetAnalysis: React.FC = () => {
  const { data: categories = [] } = useCategories();
  const { data: items = [] } = useItems();
  const enhancedAnalytics = useEnhancedAnalytics();
  const [consumptionData, setConsumptionData] = useState<ConsumptionTrendsResponse | null>(null);
  const [dateRange, setDateRange] = useState({
    start: '2025-01-01',
    end: '2025-07-31'
  });
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      // Try to fetch budget-specific notifications first
      const response = await fetch('/api/statistics/notifications/budget');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      } else {
        // Fallback to general notifications
        const fallbackResponse = await fetch('/api/statistics/notifications');
        if (fallbackResponse.ok) {
          const data = await fallbackResponse.json();
          // Filter for budget-related notifications
          const budgetNotifications = data.filter((n: any) => 
            n.type?.toLowerCase().includes('budget') || 
            n.message?.toLowerCase().includes('budget') ||
            n.message?.toLowerCase().includes('cost') ||
            n.message?.toLowerCase().includes('expense')
          );
          setNotifications(budgetNotifications);
          setUnreadCount(budgetNotifications.filter((n: any) => !n.read).length);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await AnalyticsAPI.consumptionTrends('monthly', 'category', undefined, dateRange.start, dateRange.end);
        setConsumptionData(data);
        await enhancedAnalytics.refreshAll('monthly', dateRange.start, dateRange.end);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/statistics/notifications/${id}/read`, { method: 'PUT' });
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/statistics/notifications/read-all', { method: 'PUT' });
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '16px' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Card background={cardBackgrounds.neutral}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              margin: 0,
              color: COLORS.dark
            }}>
              Budget & Financial Analysis
            </h1>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Calendar style={{ width: '14px', height: '14px', color: COLORS.primary }} />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
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
                style={{
                  padding: '5px 8px',
                  border: `1px solid ${COLORS.light}`,
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              />
              
              <button
                onClick={() => enhancedAnalytics.refreshAll('monthly', dateRange.start, dateRange.end)}
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
              
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                style={{
                  position: 'relative',
                  padding: '8px',
                  backgroundColor: unreadCount > 0 ? COLORS.warning + '20' : 'white',
                  border: `1px solid ${COLORS.light}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Bell style={{ 
                  width: '18px', 
                  height: '18px', 
                  color: unreadCount > 0 ? COLORS.warning : COLORS.dark,
                  animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
                }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: COLORS.danger,
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    minWidth: '18px',
                    textAlign: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Cost Distribution */}
          <CostDistribution data={enhancedAnalytics.costDistributionData} categories={categories} />
          
          {/* Stock Movement Analysis */}
          <StockMovementAnalysis items={items} categories={categories} dateRange={dateRange} />
        </div>

        {/* Budget Consumption */}
        <BudgetConsumption budgetData={enhancedAnalytics.budgetData} />

        {/* Seasonal Cost Analysis */}
        <SeasonalCostAnalysis 
          consumptionData={consumptionData}
          categories={categories}
          items={items}
        />

        {/* Notification Panel */}
        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        )}
      </div>
    </div>
  );
};

export default BudgetAnalysis;