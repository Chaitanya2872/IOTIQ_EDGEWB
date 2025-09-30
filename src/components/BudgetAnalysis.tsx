import React, { useState, useEffect } from 'react';
import {
  Line, Bar, Pie, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, ComposedChart, PieChart, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, ScatterChart, Scatter
} from 'recharts';
import { 
  DollarSign, TrendingUp, PieChart as PieChartIcon, BarChart3,
  Activity, Shield, AlertTriangle, Calendar, RefreshCw, Package, 
  Users, Layers, Sparkles, Bell, X, Check, AlertCircle, Zap,
  TrendingDown, Archive, ShoppingCart
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
  danger: '#dc2626',
  info: '#93c5fd',
  dark: '#64748b',
  light: '#f8fafc',
  muted: '#94a3b8',
  purple: '#c084fc',
  teal: '#5eead4'
};

const CHART_COLORS = [
  '#60a5fa', '#86efac', '#fdba74', '#dc2626', 
  '#93c5fd', '#a5f3fc', '#fde68a', '#c7d2fe'
];

const STOCK_MOVEMENT_COLORS = {
  fast: '#86efac',
  slow: '#fdba74',  
  dead: '#dc2626'
};

const cardBackgrounds = {
  primary: '#eff6ff',
  success: '#f0fdf4',
  warning: '#fff7ed',
  danger: '#fee2e2',
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
        border: `1px solid ₹{COLORS.light}`,
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
              {entry.name.includes('₹') || entry.name.includes('Cost') || entry.name.includes('Price') || entry.name.includes('Value') ? 
                `₹₹{Number(entry.value).toLocaleString()}` : 
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
      border: `1px solid ₹{COLORS.light}`,
      marginBottom: '16px'
    }}>
      {children}
    </div>
  );
};

// Stock Movement Classification Component (Fast/Slow/Dead Stock)
const StockMovementClassification: React.FC<{
  items: Item[];
  categories: Category[];
}> = ({ items, categories }) => {
  const [stockData, setStockData] = useState<any>({
    fast: [],
    slow: [],
    dead: [],
    chartData: []
  });
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [selectedStockType, setSelectedStockType] = useState<'all' | 'fast' | 'slow' | 'dead'>('all');
  const [showCalculationInfo, setShowCalculationInfo] = useState(false);

  useEffect(() => {
    classifyStock();
  }, [items, selectedCategory]);

  const classifyStock = () => {
    // Filter items by category if selected
    let filteredItems = selectedCategory 
      ? items.filter(item => item.categoryId === selectedCategory)
      : items;

    const fast: any[] = [];
    const slow: any[] = [];
    const dead: any[] = [];

    filteredItems.forEach(item => {
      const avgConsumption = Number(item.avgDailyConsumption || 0);
      const currentStock = Number(item.currentQuantity || 0);
      const coverageDays = Number(item.coverageDays || 999);
      const lastConsumedDate = item.lastConsumptionDate ? new Date(item.lastConsumptionDate) : null;
      const daysSinceLastConsumption = lastConsumedDate 
        ? Math.floor((Date.now() - lastConsumedDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      const stockValue = currentStock * Number(item.unitPrice || 0);
      const category = categories.find(c => c.id === item.categoryId);

      const stockItem = {
        id: item.id,
        itemName: item.itemName,
        itemCode: item.itemCode,
        category: category?.categoryName || 'Unknown',
        currentStock,
        avgConsumption,
        coverageDays,
        stockValue,
        daysSinceLastConsumption,
        unitPrice: Number(item.unitPrice || 0)
      };

      // Classification logic
      if (avgConsumption > 5 && coverageDays < 30) {
        // Fast moving: High consumption, low coverage
        fast.push(stockItem);
      } else if (avgConsumption > 0 && avgConsumption <= 5 && coverageDays < 90) {
        // Slow moving: Low consumption but still moving
        slow.push(stockItem);
      } else if (avgConsumption === 0 || daysSinceLastConsumption > 90 || coverageDays > 180) {
        // Dead stock: No consumption or very old stock
        dead.push(stockItem);
      } else {
        // Default to slow moving
        slow.push(stockItem);
      }
    });

    // Sort by stock value descending
    fast.sort((a, b) => b.stockValue - a.stockValue);
    slow.sort((a, b) => b.stockValue - a.stockValue);
    dead.sort((a, b) => b.stockValue - a.stockValue);

    // Prepare chart data
    const chartData = [
      { 
        name: 'Fast Moving', 
        value: fast.reduce((sum, item) => sum + item.stockValue, 0),
        count: fast.length,
        fill: STOCK_MOVEMENT_COLORS.fast
      },
      { 
        name: 'Slow Moving', 
        value: slow.reduce((sum, item) => sum + item.stockValue, 0),
        count: slow.length,
        fill: STOCK_MOVEMENT_COLORS.slow
      },
      { 
        name: 'Dead Stock', 
        value: dead.reduce((sum, item) => sum + item.stockValue, 0),
        count: dead.length,
        fill: STOCK_MOVEMENT_COLORS.dead
      }
    ];

    setStockData({ fast, slow, dead, chartData });
  };

  const totalValue = stockData.chartData.reduce((sum: number, item: any) => sum + item.value, 0);

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, margin: 0 }}>
            <Package style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: COLORS.primary }} />
            Stock Movement Classification
          </h3>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
              style={{
                padding: '5px 10px',
                border: `1px solid ₹{COLORS.light}`,
                borderRadius: '6px',
                fontSize: '11px'
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
              ))}
            </select>
            
            <div style={{ display: 'flex', gap: '0' }}>
              <button
                onClick={() => setViewMode('chart')}
                style={{
                  padding: '5px 10px',
                  backgroundColor: viewMode === 'chart' ? COLORS.primary : 'white',
                  color: viewMode === 'chart' ? 'white' : COLORS.dark,
                  border: `1px solid ₹{COLORS.light}`,
                  borderRadius: '6px 0 0 6px',
                  cursor: 'pointer',
                  fontSize: '11px'
                }}
              >
                Chart
              </button>
              <button
                onClick={() => setViewMode('table')}
                style={{
                  padding: '5px 10px',
                  backgroundColor: viewMode === 'table' ? COLORS.primary : 'white',
                  color: viewMode === 'table' ? 'white' : COLORS.dark,
                  border: `1px solid ₹{COLORS.light}`,
                  borderRadius: '0 6px 6px 0',
                  cursor: 'pointer',
                  fontSize: '11px',
                  marginLeft: '-1px'
                }}
              >
                Table
              </button>
            </div>
            
            <button
              onClick={() => setShowCalculationInfo(!showCalculationInfo)}
              style={{
                padding: '5px 10px',
                backgroundColor: showCalculationInfo ? COLORS.info : 'white',
                color: showCalculationInfo ? 'white' : COLORS.info,
                border: `1px solid ${COLORS.info}`,
                borderRadius: '6px',
                fontSize: '11px',
                cursor: 'pointer',
                marginLeft: '8px',
                fontWeight: '500'
              }}
              title="How are these calculated?"
            >
              ℹ️ How it's calculated
            </button>
          </div>
        </div>
      </div>


      {/* Calculation Explanation Panel */}
      {showCalculationInfo && (
        <div style={{
          padding: '16px',
          backgroundColor: cardBackgrounds.primary,
          borderRadius: '8px',
          marginBottom: '16px',
          border: `2px solid ${COLORS.info}`
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: COLORS.dark }}>
            📊 Stock Classification Calculation Method:
          </h4>
          <div style={{ fontSize: '12px', lineHeight: '1.6', color: COLORS.dark }}>
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: STOCK_MOVEMENT_COLORS.fast }}>🚀 Fast Moving Stock:</strong>
              <ul style={{ marginTop: '4px', marginLeft: '20px' }}>
                <li>Average Daily Consumption &gt; 5 units AND</li>
                <li>Coverage Days &lt; 30 days</li>
                <li>High turnover items that need frequent replenishment</li>
              </ul>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: STOCK_MOVEMENT_COLORS.slow }}>⚡ Slow Moving Stock:</strong>
              <ul style={{ marginTop: '4px', marginLeft: '20px' }}>
                <li>Average Daily Consumption between 0.1 - 5 units AND</li>
                <li>Coverage Days &lt; 90 days</li>
                <li>Items with moderate turnover</li>
              </ul>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ color: STOCK_MOVEMENT_COLORS.dead }}>⛔ Dead Stock:</strong>
              <ul style={{ marginTop: '4px', marginLeft: '20px' }}>
                <li>Average Daily Consumption = 0 OR</li>
                <li>No consumption in last 90 days OR</li>
                <li>Coverage Days &gt; 180 days</li>
                <li>Items with no or negligible movement</li>
              </ul>
            </div>
            <div style={{ marginTop: '12px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
              <strong>Key Metrics:</strong>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                • <strong>Coverage Days</strong> = Current Stock ÷ Average Daily Consumption<br/>
                • <strong>Stock Value</strong> = Current Stock × Unit Price<br/>
                • <strong>Days Since Last Consumption</strong> = Today - Last Consumption Date
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <div 
          onClick={() => {
            setSelectedStockType(selectedStockType === 'fast' ? 'all' : 'fast');
            if (viewMode === 'chart') setViewMode('table');
          }}
          style={{ 
            padding: '12px', 
            backgroundColor: selectedStockType === 'fast' ? STOCK_MOVEMENT_COLORS.fast + '30' : cardBackgrounds.success, 
            borderRadius: '8px',
            cursor: 'pointer',
            border: selectedStockType === 'fast' ? `2px solid ${STOCK_MOVEMENT_COLORS.fast}` : '2px solid transparent',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Zap style={{ width: '14px', height: '14px', color: STOCK_MOVEMENT_COLORS.fast }} />
            <span style={{ fontSize: '11px', color: COLORS.muted, fontWeight: '500' }}>Fast Moving</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: COLORS.dark }}>
            {stockData.fast.length} items
          </div>
          <div style={{ fontSize: '12px', color: STOCK_MOVEMENT_COLORS.fast, fontWeight: '500' }}>
            ₹{stockData.fast.reduce((sum: number, item: any) => sum + item.stockValue, 0).toLocaleString()}
          </div>
        </div>

        <div 
          onClick={() => {
            setSelectedStockType(selectedStockType === 'slow' ? 'all' : 'slow');
            if (viewMode === 'chart') setViewMode('table');
          }}
          style={{ 
            padding: '12px', 
            backgroundColor: selectedStockType === 'slow' ? STOCK_MOVEMENT_COLORS.slow + '30' : cardBackgrounds.warning, 
            borderRadius: '8px',
            cursor: 'pointer',
            border: selectedStockType === 'slow' ? `2px solid ${STOCK_MOVEMENT_COLORS.slow}` : '2px solid transparent',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <TrendingDown style={{ width: '14px', height: '14px', color: STOCK_MOVEMENT_COLORS.slow }} />
            <span style={{ fontSize: '11px', color: COLORS.muted, fontWeight: '500' }}>Slow Moving</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: COLORS.dark }}>
            {stockData.slow.length} items
          </div>
          <div style={{ fontSize: '12px', color: STOCK_MOVEMENT_COLORS.slow, fontWeight: '500' }}>
            ₹{stockData.slow.reduce((sum: number, item: any) => sum + item.stockValue, 0).toLocaleString()}
          </div>
        </div>

        <div 
          onClick={() => {
            setSelectedStockType(selectedStockType === 'dead' ? 'all' : 'dead');
            if (viewMode === 'chart') setViewMode('table');
          }}
          style={{ 
            padding: '12px', 
            backgroundColor: selectedStockType === 'dead' ? STOCK_MOVEMENT_COLORS.dead + '30' : cardBackgrounds.danger, 
            borderRadius: '8px',
            cursor: 'pointer',
            border: selectedStockType === 'dead' ? `2px solid ${STOCK_MOVEMENT_COLORS.dead}` : '2px solid transparent',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Archive style={{ width: '14px', height: '14px', color: STOCK_MOVEMENT_COLORS.dead }} />
            <span style={{ fontSize: '11px', color: COLORS.muted, fontWeight: '500' }}>Dead Stock</span>
          </div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: COLORS.dark }}>
            {stockData.dead.length} items
          </div>
          <div style={{ fontSize: '12px', color: STOCK_MOVEMENT_COLORS.dead, fontWeight: '500' }}>
            ₹{stockData.dead.reduce((sum: number, item: any) => sum + item.stockValue, 0).toLocaleString()}
          </div>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
          {/* Donut Chart */}
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stockData.chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {stockData.chartData.map((entry: any, index: number) => (
                  <Cell key={`cell-₹{index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<ModernTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend and Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ marginBottom: '16px', padding: '10px', backgroundColor: cardBackgrounds.primary, borderRadius: '6px' }}>
              <div style={{ fontSize: '10px', color: COLORS.muted }}>Total Inventory Value</div>
              <div style={{ fontSize: '22px', fontWeight: '600', color: COLORS.primary }}>
                ₹{totalValue.toLocaleString()}
              </div>
            </div>
            
            {stockData.chartData.map((item: any, index: number) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '8px',
                marginBottom: '6px',
                backgroundColor: cardBackgrounds.neutral,
                borderRadius: '6px',
                border: `1px solid ₹{COLORS.light}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '4px', 
                    backgroundColor: item.fill
                  }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: COLORS.dark }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '10px', color: COLORS.muted }}>
                      {item.count} items
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.dark }}>
                    ₹{item.value.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: COLORS.muted }}>
                    {totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {/* Table View */}
          {['fast', 'slow', 'dead'].filter(type => selectedStockType === 'all' || selectedStockType === type).map(type => {
            const typeData = stockData[type];
            const typeColor = STOCK_MOVEMENT_COLORS[type as keyof typeof STOCK_MOVEMENT_COLORS];
            const typeLabel = type === 'fast' ? 'Fast Moving' : type === 'slow' ? 'Slow Moving' : 'Dead Stock';
            const typeIcon = type === 'fast' ? <Zap /> : type === 'slow' ? <TrendingDown /> : <Archive />;

            if (typeData.length === 0) return null;

            return (
              <div key={type} style={{ marginBottom: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '10px',
                  padding: '8px',
                  backgroundColor: cardBackgrounds[type === 'fast' ? 'success' : type === 'slow' ? 'warning' : 'danger'],
                  borderRadius: '6px'
                }}>
                  <span style={{ color: typeColor, width: '16px', height: '16px' }}>
                    {React.cloneElement(typeIcon, { style: { width: '16px', height: '16px' } })}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: COLORS.dark }}>
                    {typeLabel} ({typeData.length})
                  </span>
                </div>
                
                <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ₹{COLORS.light}` }}>
                      <th style={{ padding: '6px', textAlign: 'left', color: COLORS.muted }}>Item</th>
                      <th style={{ padding: '6px', textAlign: 'left', color: COLORS.muted }}>Category</th>
                      <th style={{ padding: '6px', textAlign: 'right', color: COLORS.muted }}>Stock</th>
                      <th style={{ padding: '6px', textAlign: 'right', color: COLORS.muted }}>Avg Daily</th>
                      <th style={{ padding: '6px', textAlign: 'right', color: COLORS.muted }}>Coverage</th>
                      <th style={{ padding: '6px', textAlign: 'right', color: COLORS.muted }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeData.map((item: any) => (
                      <tr key={item.id} style={{ borderBottom: `1px solid ₹{COLORS.light}` }}>
                        <td style={{ padding: '6px', fontWeight: '500' }}>{item.itemName}</td>
                        <td style={{ padding: '6px', color: COLORS.muted }}>{item.category}</td>
                        <td style={{ padding: '6px', textAlign: 'right' }}>{item.currentStock}</td>
                        <td style={{ padding: '6px', textAlign: 'right' }}>{item.avgConsumption.toFixed(1)}</td>
                        <td style={{ padding: '6px', textAlign: 'right' }}>{item.coverageDays}d</td>
                        <td style={{ padding: '6px', textAlign: 'right', fontWeight: '500', color: typeColor }}>
                          ₹{item.stockValue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

// Item Correlations and Anomalies Component
const ItemCorrelationsAndAnomalies: React.FC<{
  items: Item[];
  categories: Category[];
  consumptionData: ConsumptionTrendsResponse | null;
}> = ({ items, categories, consumptionData }) => {
  const [correlationData, setCorrelationData] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [selectedView, setSelectedView] = useState<'correlations' | 'anomalies'>('correlations');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analyzeCorrelationsAndAnomalies();
  }, [items, consumptionData]);

  const analyzeCorrelationsAndAnomalies = () => {
    // Analyze item correlations (items frequently consumed together)
    const correlations: any[] = [];
    const anomalyList: any[] = [];

    // Find correlations based on consumption patterns
    if (consumptionData?.data) {
      const itemPairs = new Map<string, number>();
      
      // Group items that are consumed on the same dates
      consumptionData.data.forEach(categoryData => {
        categoryData.dataPoints?.forEach((point: any) => {
          if (point.items && Array.isArray(point.items) && point.items.length > 1) {
            // Found multiple items consumed on same date
            for (let i = 0; i < point.items.length - 1; i++) {
              for (let j = i + 1; j < point.items.length; j++) {
                const item1 = point.items[i];
                const item2 = point.items[j];
                const pairKey = [item1.itemName, item2.itemName].sort().join('::');
                itemPairs.set(pairKey, (itemPairs.get(pairKey) || 0) + 1);
              }
            }
          }
        });
      });

      // Convert to correlation array
      itemPairs.forEach((count, pairKey) => {
        const [item1, item2] = pairKey.split('::');
        if (count > 2) { // Only show if items appear together more than twice
          correlations.push({
            item1,
            item2,
            strength: Math.min(count / 10, 1), // Normalize strength to 0-1
            occurrences: count
          });
        }
      });
    }

    // No sample data - only use real correlations from API

    // Detect anomalies (unusual consumption patterns)
    items.forEach(item => {
      const avgConsumption = Number(item.avgDailyConsumption || 0);
      const currentStock = Number(item.currentQuantity || 0);
      const minLevel = Number(item.minStockLevel || 0);
      const maxLevel = Number(item.maxStockLevel || 0);
      
      // Check for various anomaly conditions
      if (currentStock > maxLevel * 1.5) {
        anomalyList.push({
          type: 'overstock',
          severity: 'medium',
          itemName: item.itemName,
          category: categories.find(c => c.id === item.categoryId)?.categoryName || 'Unknown',
          value: currentStock,
          threshold: maxLevel,
          message: `Stock exceeds max level by ₹{((currentStock/maxLevel - 1) * 100).toFixed(0)}%`
        });
      }
      
      if (currentStock < minLevel * 0.5 && currentStock > 0) {
        anomalyList.push({
          type: 'critical_low',
          severity: 'high',
          itemName: item.itemName,
          category: categories.find(c => c.id === item.categoryId)?.categoryName || 'Unknown',
          value: currentStock,
          threshold: minLevel,
          message: `Stock critically below minimum level`
        });
      }
      
      if (avgConsumption === 0 && currentStock > 0) {
        anomalyList.push({
          type: 'no_movement',
          severity: 'low',
          itemName: item.itemName,
          category: categories.find(c => c.id === item.categoryId)?.categoryName || 'Unknown',
          value: currentStock,
          threshold: 0,
          message: `No consumption activity detected`
        });
      }

      // Check for sudden consumption spike (if we have consumption records)
      const consumedStock = Number(item.totalConsumedStock || 0);
      if (consumedStock > avgConsumption * 30 * 2) { // More than 2x monthly average
        anomalyList.push({
          type: 'consumption_spike',
          severity: 'medium',
          itemName: item.itemName,
          category: categories.find(c => c.id === item.categoryId)?.categoryName || 'Unknown',
          value: consumedStock,
          threshold: avgConsumption * 30,
          message: `Consumption spike detected - ₹{((consumedStock/(avgConsumption * 30) - 1) * 100).toFixed(0)}% above normal`
        });
      }
    });

    setCorrelationData(correlations);
    setAnomalies(anomalyList);
  };

  const getAnomalyIcon = (type: string) => {
    switch(type) {
      case 'overstock': return <Package />;
      case 'critical_low': return <AlertTriangle />;
      case 'no_movement': return <Archive />;
      case 'consumption_spike': return <TrendingUp />;
      default: return <AlertCircle />;
    }
  };

  const getAnomalyColor = (severity: string) => {
    switch(severity) {
      case 'high': return COLORS.danger;
      case 'medium': return COLORS.warning;
      case 'low': return COLORS.info;
      default: return COLORS.muted;
    }
  };

  // Prepare scatter plot data for correlations
  const scatterData = correlationData.map((corr, index) => ({
    x: index + 1,
    y: corr.strength * 100,
    strength: corr.strength,
    label: `₹{corr.item1} - ₹{corr.item2}`
  }));

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: COLORS.dark, margin: 0 }}>
            <Sparkles style={{ width: '16px', height: '16px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: COLORS.purple }} />
            Item Correlations & Anomalies
          </h3>
          
          <div style={{ display: 'flex', gap: '0' }}>
            <button
              onClick={() => setSelectedView('correlations')}
              style={{
                padding: '5px 12px',
                backgroundColor: selectedView === 'correlations' ? COLORS.purple : 'white',
                color: selectedView === 'correlations' ? 'white' : COLORS.dark,
                border: `1px solid ₹{selectedView === 'correlations' ? COLORS.purple : COLORS.light}`,
                borderRadius: '6px 0 0 6px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500'
              }}
            >
              Correlations
            </button>
            <button
              onClick={() => setSelectedView('anomalies')}
              style={{
                padding: '5px 12px',
                backgroundColor: selectedView === 'anomalies' ? COLORS.warning : 'white',
                color: selectedView === 'anomalies' ? 'white' : COLORS.dark,
                border: `1px solid ₹{selectedView === 'anomalies' ? COLORS.warning : COLORS.light}`,
                borderRadius: '0 6px 6px 0',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: '500',
                marginLeft: '-1px'
              }}
            >
              Anomalies ({anomalies.length})
            </button>
          </div>
        </div>
      </div>

      {selectedView === 'correlations' ? (
        <div>
          {correlationData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: COLORS.muted }}>
              <Sparkles style={{ width: '32px', height: '32px', margin: '0 auto', opacity: 0.3 }} />
              <p style={{ marginTop: '12px', fontSize: '13px' }}>No significant item correlations detected</p>
            </div>
          ) : (
            <>
              {/* Correlation Strength Chart */}
              <ResponsiveContainer width="100%" height={250}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                  <XAxis 
                    dataKey="x" 
                    tick={{ fontSize: 9 }}
                    label={{ value: 'Item Pairs', position: 'insideBottom', offset: -5, style: { fontSize: 10 } }}
                  />
                  <YAxis 
                    tick={{ fontSize: 9 }}
                    label={{ value: 'Correlation Strength (%)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                  />
                  <Tooltip content={<ModernTooltip />} />
                  <Scatter 
                    name="Correlation Strength" 
                    data={scatterData} 
                    fill={COLORS.purple}
                    fillOpacity={0.6}
                    strokeWidth={2}
                    stroke={COLORS.purple}
                  />
                </ScatterChart>
              </ResponsiveContainer>

              {/* Correlation Details */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: COLORS.dark, marginBottom: '12px' }}>
                  Strong Item Correlations
                </div>
                {correlationData.map((corr, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px',
                    marginBottom: '8px',
                    backgroundColor: cardBackgrounds.neutral,
                    borderRadius: '6px',
                    border: `1px solid ₹{COLORS.light}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: `₹{COLORS.purple}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <ShoppingCart style={{ width: '20px', height: '20px', color: COLORS.purple }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '500', color: COLORS.dark }}>
                          {corr.item1}
                        </div>
                        <div style={{ fontSize: '10px', color: COLORS.muted }}>
                          frequently bought with
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: '500', color: COLORS.dark }}>
                          {corr.item2}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: COLORS.purple
                      }}>
                        {(corr.strength * 100).toFixed(0)}%
                      </div>
                      <div style={{ fontSize: '10px', color: COLORS.muted }}>
                        {corr.occurrences} times
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          {anomalies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: COLORS.muted }}>
              <Shield style={{ width: '32px', height: '32px', margin: '0 auto', opacity: 0.3, color: COLORS.success }} />
              <p style={{ marginTop: '12px', fontSize: '13px', color: COLORS.success }}>No anomalies detected - All items within normal parameters</p>
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {anomalies.map((anomaly, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  marginBottom: '10px',
                  backgroundColor: cardBackgrounds.neutral,
                  borderRadius: '8px',
                  border: `1px solid ₹{getAnomalyColor(anomaly.severity)}30`
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: `₹{getAnomalyColor(anomaly.severity)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {React.cloneElement(getAnomalyIcon(anomaly.type), {
                      style: { width: '16px', height: '16px', color: getAnomalyColor(anomaly.severity) }
                    })}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12', fontWeight: '600', color: COLORS.dark }}>
                        {anomaly.itemName}
                      </span>
                      <span style={{
                        fontSize: '9px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: `₹{getAnomalyColor(anomaly.severity)}20`,
                        color: getAnomalyColor(anomaly.severity),
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {anomaly.severity}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: COLORS.muted, marginBottom: '2px' }}>
                      {anomaly.category}
                    </div>
                    <div style={{ fontSize: '11px', color: COLORS.dark }}>
                      {anomaly.message}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                      <div style={{ fontSize: '10px' }}>
                        <span style={{ color: COLORS.muted }}>Current: </span>
                        <span style={{ fontWeight: '600', color: COLORS.dark }}>{anomaly.value}</span>
                      </div>
                      <div style={{ fontSize: '10px' }}>
                        <span style={{ color: COLORS.muted }}>Expected: </span>
                        <span style={{ fontWeight: '600', color: COLORS.primary }}>{anomaly.threshold}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// Cost Distribution Component (keep existing)
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

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
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
                <Cell key={`cell-₹{index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<ModernTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: cardBackgrounds.primary, borderRadius: '6px' }}>
            <div style={{ fontSize: '10px', color: COLORS.muted }}>Total Cost</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: COLORS.primary }}>
              ₹{totalValue.toLocaleString()}
            </div>
          </div>
          
          {chartData.map((item: any, index: number) => (
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

// Stock Movement Analysis Component (keep existing)
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
            week: `Week ₹{index + 1}`,
            date: dateRange.start,
            received: Number(movement.totalQuantity || 0) * (movement.movementType === 'RECEIPT' ? 1 : 0),
            consumed: Number(movement.totalQuantity || 0) * (movement.movementType === 'CONSUMPTION' ? 1 : 0),
            balance: Number(data.netChange || 0),
            turnover: movement.turnoverRatio || (movement.consumed > 0 ? movement.consumed / (movement.balance || 1) : 0)
          }));
          setMovementData(processedData);
        } else {
          setMovementData([]);
        }
      } catch (error) {
        console.error('Stock movements component available but not displayed in main dashboard', error);
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
              border: `1px solid ₹{COLORS.light}`,
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
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              margin: 0,
              color: COLORS.dark
            }}>
              Inventory Analytics Dashboard
            </h1>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Calendar style={{ width: '14px', height: '14px', color: COLORS.primary }} />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{
                  padding: '5px 8px',
                  border: `1px solid ₹{COLORS.light}`,
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
                  border: `1px solid ₹{COLORS.light}`,
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
            </div>
          </div>
        </Card>

        {/* Cost Distribution - Full Width */}
        <CostDistribution data={enhancedAnalytics.costDistributionData} categories={categories} />

        {/* Stock Movement Classification (Fast/Slow/Dead) */}
        <StockMovementClassification items={items} categories={categories} />


      </div>
    </div>
  );
};

export default BudgetAnalysis;