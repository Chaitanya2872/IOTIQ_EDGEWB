import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, RadialBarChart, RadialBar,
  LineChart, Line
} from 'recharts';
import {
  AlertTriangle, Package, TrendingDown, Shield, Clock,
  AlertCircle, Activity, Target, CheckCircle, XCircle,
  RefreshCw, DollarSign, Zap, Database, Filter, Bell, ShoppingCart, Calendar, Info
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { 
  useItems, 
  useCategories, 
  useAnalytics, 
  useMonthlyStockValueTrend,
  useStockLevels,
  useBudgetKPIs,
  useDataRange
} from '../api/hooks';

// Vibrant color scheme
const COLORS = {
  primary: '#8b5cf6',
  secondary: '#ec4899',
  dark: '#1e293b',
  gray: '#64748b',
  lightGray: '#94a3b8',
  bg: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#8b5cf6',
  low: '#10b981',
  pink: '#ec4899',
  purple: '#8b5cf6',
  green: '#10b981',
  orange: '#f59e0b',
  cyan: '#06b6d4',
  heatmapCritical: '#1e3a8a',
  heatmapHigh: '#1d4ed8',
  heatmapMedium: '#3b82f6',
  heatmapLow: '#60a5fa',
};

const RISK_COLORS: Record<AlertLevel, string> = {
  CRITICAL: COLORS.critical,
  HIGH: COLORS.high,
  MEDIUM: COLORS.medium,
  LOW: COLORS.low
};

const HEATMAP_COLORS: Record<AlertLevel, string> = {
  CRITICAL: COLORS.heatmapCritical,
  HIGH: COLORS.heatmapHigh,
  MEDIUM: COLORS.heatmapMedium,
  LOW: COLORS.heatmapLow
};

type AlertLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

// CountUp Animation Component
const CountUp: React.FC<{ end: number; duration?: number; decimals?: number }> = ({ 
  end, 
  duration = 1000,
  decimals = 0 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = 0;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = startValue + (end - startValue) * easeOutQuart;
      
      setCount(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <>{decimals > 0 ? count.toFixed(decimals) : Math.round(count).toLocaleString()}</>;
};

// Floating Text Animation Component
const FloatingText: React.FC<{ items: string[]; delay?: number }> = ({ items, delay = 1500 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, items]);

  if (!show || items.length === 0) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 'calc(100% + 10px)',
      left: '50%',
      transform: 'translateX(-50%)',
      animation: 'floatUpSlow 4s ease-out forwards',
      fontSize: '10px',
      fontWeight: '600',
      color: COLORS.white,
      backgroundColor: COLORS.orange,
      padding: '8px 12px',
      borderRadius: '8px',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      textAlign: 'left',
      minWidth: '160px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      zIndex: 10
    }}>
      <div style={{ marginBottom: '4px', fontSize: '11px', fontWeight: '700', textAlign: 'center' }}>
        ⚠️ Reorder Needed
      </div>
      {items.slice(0, 3).map((item, idx) => (
        <div key={idx} style={{ fontSize: '9px', marginTop: '3px', paddingLeft: '4px' }}>
          • {item.length > 20 ? item.substring(0, 20) + '...' : item}
        </div>
      ))}
      {items.length > 3 && (
        <div style={{ fontSize: '9px', marginTop: '3px', fontStyle: 'italic', textAlign: 'center', paddingTop: '2px' }}>
          +{items.length - 3} more items
        </div>
      )}
    </div>
  );
};

const InventoryHealthDashboard: React.FC = () => {
  // Use proper hooks
  const { data: items, loading: itemsLoading, error, refresh: refreshItems } = useItems();
  const { data: categories, refresh: refreshCategories } = useCategories();
  const { stockAnalytics, dashboard, refresh: refreshAnalytics } = useAnalytics();
  const { data: monthlyStockTrend } = useMonthlyStockValueTrend();
  const { data: stockLevelsData, loading: stockLevelsLoading, refresh: refreshStockLevels } = useStockLevels();
  const { data: budgetKPIs, loading: budgetKPIsLoading, refresh: refreshBudgetKPIs } = useBudgetKPIs();
  const { data: dateRangeData } = useDataRange();
  
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [daysFilter, setDaysFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [fullscreenTable, setFullscreenTable] = useState(false);
  const [fullscreenHeatmap, setFullscreenHeatmap] = useState(false);

  const loading = itemsLoading || stockLevelsLoading || budgetKPIsLoading;

  // Helper function to safely get category name from any item type
  const getCategoryName = (item: any): string => {
    if ('categoryName' in item && item.categoryName) {
      return item.categoryName;
    }
    if ('category' in item && item.category?.categoryName) {
      return item.category.categoryName;
    }
    return 'Unknown';
  };

  const parseNumeric = (value: any): number | undefined => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value.replace(/,/g, '').trim());
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
  };

  const isHighRiskItem = (item: any): boolean => {
    const riskLevel = String(item.stockAlertLevel ?? item.alertLevel ?? item.riskLevel ?? '').toUpperCase();
    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') return true;

    const coverage =
      parseNumeric(item.coverageDays) ??
      parseNumeric(item.daysUntilStockout) ??
      parseNumeric(item.daysOfSupply) ??
      parseNumeric(item.daysLeft) ??
      parseNumeric(item.daysToStockOut);

    if (coverage !== undefined && coverage <= 15) return true;

    const threshold =
      parseNumeric(item.reorderLevel) ??
      parseNumeric(item.minStockLevel) ??
      parseNumeric(item.reorderPoint) ??
      parseNumeric(item.minimumStock) ??
      parseNumeric(item.minQuantity);

    if (threshold !== undefined && threshold > 0) {
      const quantity =
        parseNumeric(item.currentQuantity) ??
        parseNumeric(item.currentStock) ??
        parseNumeric(item.stockOnHand) ??
        parseNumeric(item.quantity);

      if (quantity !== undefined && quantity <= threshold) return true;
    }

    return false;
  };

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refreshItems();
      refreshCategories();
      refreshAnalytics();
      refreshStockLevels();
      refreshBudgetKPIs();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshItems, refreshCategories, refreshAnalytics, refreshStockLevels, refreshBudgetKPIs]);

  const handleRefreshAll = () => {
    refreshItems();
    refreshCategories();
    refreshAnalytics();
    refreshStockLevels();
    refreshBudgetKPIs();
  };

  // Use Budget KPIs data for health metrics
  const healthMetrics = useMemo(() => {
    // Fallback to items if budgetKPIs is not available
    const stockItems = stockLevelsData?.items || items || [];
    
    if (budgetKPIs) {
      const itemsBelowROP = parseNumeric(budgetKPIs.reorderAlerts) ?? 0;

      const predictedStockOuts =
        parseNumeric(budgetKPIs.predictedStockOuts) ??
        parseNumeric((budgetKPIs as any).predictedStockouts) ??
        parseNumeric((budgetKPIs as any).predicted_stock_outs) ??
        (budgetKPIs.predictions ? parseNumeric((budgetKPIs as any).predictions.predictedStockOuts) : undefined) ??
        (Array.isArray(budgetKPIs.stockoutItems)
          ? budgetKPIs.stockoutItems.filter((it: any) => {
              const coverage = parseNumeric((it as any).coverageDays);
              return (coverage ?? 0) <= 15;
            }).length
          : undefined) ??
        0;
      const totalItems = parseNumeric(budgetKPIs.totalItems) ?? stockItems.length;
      const totalValue = parseNumeric(budgetKPIs.totalStockValue) ?? 0;

      const criticalItems = Array.isArray(budgetKPIs.stockoutItems)
        ? budgetKPIs.stockoutItems.filter(item => {
            const coverage = parseNumeric(item.coverageDays);
            return (coverage ?? 0) <= 7;
          }).length
        : 0;

      const coverageValues = Array.isArray(budgetKPIs.stockoutItems)
        ? budgetKPIs.stockoutItems
            .map(item => parseNumeric(item.coverageDays))
            .filter((value): value is number => value !== undefined && value > 0)
        : [];
      const avgCoverageDays = coverageValues.length > 0
        ? coverageValues.reduce((a, b) => a + b, 0) / coverageValues.length
        : 30;

      const highRiskItems = Array.isArray(budgetKPIs.stockoutItems)
        ? budgetKPIs.stockoutItems.filter(isHighRiskItem).length
        : 0;

      const healthScore = Math.max(0, 100 - (
        (itemsBelowROP * 2) + 
        (predictedStockOuts * 5) + 
        (criticalItems * 10) +
        Math.max(0, (30 - avgCoverageDays) * 2)
      ));

      return {
        itemsBelowROP,
        predictedStockOuts,
        avgCoverageDays: Math.round(avgCoverageDays),
        highRiskItems,
        criticalItems,
        healthScore: Math.round(healthScore),
        totalValue,
        lowStockValue: 0,
        totalItems
      };
    }

    // Fallback calculation from items
    if (stockItems.length === 0) {
      return {
        itemsBelowROP: 0,
        predictedStockOuts: 0,
        avgCoverageDays: 0,
        highRiskItems: 0,
        criticalItems: 0,
        healthScore: 100,
        totalValue: 0,
        lowStockValue: 0,
        totalItems: 0
      };
    }

    const itemsBelowROP = stockItems.filter(item => {
      const quantity =
        parseNumeric(item.currentQuantity) ??
        parseNumeric(item.currentStock) ??
        parseNumeric(item.quantity) ??
        0;
      const threshold =
        parseNumeric(item.reorderLevel) ??
        parseNumeric(item.minStockLevel) ??
        0;
      return quantity <= threshold;
    }).length;

    const predictedStockOuts = stockItems.filter(item => {
      const coverage =
        parseNumeric(item.coverageDays) ??
        parseNumeric(item.daysUntilStockout) ??
        0;
      return coverage <= 15;
    }).length;

    const criticalItems = stockItems.filter(item => item.stockAlertLevel === 'CRITICAL').length;

    const coverageValues = stockItems
      .map(item => parseNumeric(item.coverageDays))
      .filter((value): value is number => value !== undefined && value > 0);
    const avgCoverageDays = coverageValues.length > 0
      ? coverageValues.reduce((a, b) => a + b, 0) / coverageValues.length
      : 0;

    const highRiskItems = stockItems.filter(isHighRiskItem).length;

    const totalValue = stockItems.reduce((sum, item) => {
      const direct = parseNumeric(item.totalValue);
      if (direct !== undefined) {
        return sum + direct;
      }
      const quantity =
        parseNumeric(item.currentQuantity) ??
        parseNumeric(item.currentStock) ??
        parseNumeric(item.quantity) ??
        0;
      const price = parseNumeric(item.unitPrice) ?? 0;
      return sum + quantity * price;
    }, 0);

    const lowStockItems = stockItems.filter(item => {
      const quantity =
        parseNumeric(item.currentQuantity) ??
        parseNumeric(item.currentStock) ??
        parseNumeric(item.quantity) ??
        0;
      const threshold =
        parseNumeric(item.reorderLevel) ??
        parseNumeric(item.minStockLevel) ??
        0;
      return quantity <= threshold;
    });
    const lowStockValue = lowStockItems.reduce((sum, item) => {
      const direct = parseNumeric(item.totalValue);
      if (direct !== undefined) {
        return sum + direct;
      }
      const quantity =
        parseNumeric(item.currentQuantity) ??
        parseNumeric(item.currentStock) ??
        parseNumeric(item.quantity) ??
        0;
      const price = parseNumeric(item.unitPrice) ?? 0;
      return sum + quantity * price;
    }, 0);

    const healthScore = Math.max(0, 100 - (
      (itemsBelowROP * 2) + 
      (predictedStockOuts * 5) + 
      (criticalItems * 10) +
      Math.max(0, (30 - avgCoverageDays) * 2)
    ));

    return {
      itemsBelowROP,
      predictedStockOuts,
      avgCoverageDays: Math.round(avgCoverageDays),
      highRiskItems,
      criticalItems,
      healthScore: Math.round(healthScore),
      totalValue,
      lowStockValue,
      totalItems: stockItems.length
    };
  }, [budgetKPIs, stockLevelsData, items]);

  // Filter items using stockLevelsData or fallback to items
  const filteredItems = useMemo(() => {
    const sourceItems = stockLevelsData?.items || items || [];
    if (sourceItems.length === 0) return [];
    
    let filtered = [...sourceItems];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => getCategoryName(item) === categoryFilter);
    }

    // Days filter with ranges
    if (daysFilter !== 'all') {
      filtered = filtered.filter(item => {
        const daysLeft = item.coverageDays || 0;
        
        if (daysFilter === '1-7') {
          return daysLeft > 0 && daysLeft <= 7;
        } else if (daysFilter === '7-15') {
          return daysLeft > 7 && daysLeft <= 15;
        } else if (daysFilter === '15-30') {
          return daysLeft > 15 && daysLeft <= 30;
        } else if (daysFilter === '30-60') {
          return daysLeft > 30 && daysLeft <= 60;
        }
        return true;
      });
    }

    // Sort by alert level (most critical first)
    filtered.sort((a, b) => {
      const riskOrder: Record<string, number> = { 
        CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3
      };
      return (riskOrder[a.stockAlertLevel || 'LOW'] || 5) - 
             (riskOrder[b.stockAlertLevel || 'LOW'] || 5);
    });

    return filtered;
  }, [stockLevelsData, items, daysFilter, categoryFilter]);

  // Pagination
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [daysFilter, categoryFilter]);

  // Bar chart data
  const coverageChartData = useMemo(() => {
    return filteredItems.slice(0, 20).map(item => ({
      name: item.itemName.substring(0, 20) + (item.itemName.length > 20 ? '...' : ''),
      fullName: item.itemName,
      daysLeft: item.coverageDays || 0,
      alertLevel: (item.stockAlertLevel || 'LOW') as AlertLevel,
      currentStock: item.currentQuantity,
      unit: 'units'
    }));
  }, [filteredItems]);

  const skusBelowROPData = useMemo(() => {
    const totalItems = budgetKPIs?.totalItems || (stockLevelsData?.items || items || []).length;
    return [
      {
        name: 'Below ROP',
        value: totalItems > 0 
          ? Math.round((healthMetrics.itemsBelowROP / totalItems) * 100) 
          : 0,
        fill: COLORS.green
      }
    ];
  }, [budgetKPIs, stockLevelsData, items, healthMetrics.itemsBelowROP]);

  const daysRangeChartData = useMemo(() => {
    const sourceItems = stockLevelsData?.items || items || [];
    
    const ranges = [
      { label: '1-7 days', min: 1, max: 7, color: COLORS.critical },
      { label: '7-15 days', min: 7, max: 15, color: COLORS.orange },
      { label: '15-30 days', min: 15, max: 30, color: COLORS.purple },
      { label: '30-60 days', min: 30, max: 60, color: COLORS.cyan },
      { label: '60+ days', min: 60, max: Infinity, color: COLORS.green }
    ];

    return ranges.map(range => {
      const count = sourceItems.filter(item => {
        const days = item.coverageDays || 0;
        if (range.min === 60) {
          return days > range.min;
        }
        return days > range.min && days <= range.max;
      }).length;
      
      return {
        name: range.label,
        items: count,
        fill: range.color
      };
    });
  }, [stockLevelsData, items]);

  // Heatmap data from stock levels or items
  const stockLevelTrendData = useMemo(() => {
    const sourceItems = stockLevelsData?.items || items || [];
    if (sourceItems.length === 0) return [];

    const categoryNames = [...new Set(sourceItems.map(item => getCategoryName(item)))];
    const levels = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

    return categoryNames.map(categoryName => {
      const categoryItems = sourceItems.filter(item => getCategoryName(item) === categoryName);
      const levelCounts = levels.map(level =>
        categoryItems.filter(item => item.stockAlertLevel === level).length
      );

      return {
        category: categoryName,
        CRITICAL: levelCounts[0],
        HIGH: levelCounts[1],
        MEDIUM: levelCounts[2],
        LOW: levelCounts[3]
      };
    });
  }, [stockLevelsData, items]);

  const monthlyStockTrendData = useMemo(() => {
    if (!monthlyStockTrend?.trendData) return [];

    return monthlyStockTrend.trendData.map(item => ({
      month: item.monthName,
      stockValue: item.stockValue
    }));
  }, [monthlyStockTrend]);

  // Use Budget KPIs stockout items for predictions
  const stockOutPredictions = useMemo(() => {
    if (budgetKPIs?.stockoutItems && budgetKPIs.stockoutItems.length > 0) {
      return budgetKPIs.stockoutItems.map(item => ({
        id: item.itemId,
        name: item.itemName,
        category: item.categoryName,
        currentStock: item.currentStock,
        unit: 'units',
        unitPrice: 0,
        dailyConsumption: 0,
        daysUntilStockout: item.coverageDays,
        severity: item.coverageDays <= 7 ? 'critical' as const :
                 item.coverageDays <= 15 ? 'warning' as const :
                 'low' as const
      })).sort((a, b) => a.daysUntilStockout - b.daysUntilStockout).slice(0, 10);
    }
    
    // Fallback: calculate from items data
    const sourceItems = stockLevelsData?.items || items || [];
    return sourceItems
      .filter(item => item.currentQuantity <= (item.reorderLevel || item.minStockLevel))
      .map(item => ({
        id: ('itemId' in item ? item.itemId : item.id) as number,
        name: item.itemName,
        category: getCategoryName(item),
        currentStock: item.currentQuantity,
        unit: ('unitOfMeasurement' in item ? item.unitOfMeasurement : undefined) || 'units',
        unitPrice: item.unitPrice || 0,
        dailyConsumption: 0,
        daysUntilStockout: item.coverageDays || 0,
        severity: (item.coverageDays || 0) <= 7 ? 'critical' as const :
                 (item.coverageDays || 0) <= 15 ? 'warning' as const :
                 'low' as const
      }))
      .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
      .slice(0, 10);
  }, [budgetKPIs, stockLevelsData, items]);

  // Get unique category names for filter
  const uniqueCategories = useMemo(() => {
    const sourceItems = stockLevelsData?.items || items || [];
    return [...new Set(sourceItems.map(item => getCategoryName(item)))];
  }, [stockLevelsData, items]);

  // Format date range
  const dateRangeDisplay = useMemo(() => {
    if (!dateRangeData) return 'Loading date range...';
    return `Data from ${dateRangeData.minDate} to ${dateRangeData.maxDate} (${dateRangeData.availableMonths} months)`;
  }, [dateRangeData]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: COLORS.bg,
      padding: '32px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", "Helvetica Neue", Arial, sans-serif'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes floatUpSlow {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(0);
          }
          15% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          85% {
            opacity: 1;
            transform: translateX(-50%) translateY(-80px);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-100px);
          }
        }

        /* Prevent Recharts bar hover from applying grey shading */
        .recharts-bar-rectangle {
          transition: none !important;
          opacity: 1 !important;
        }
        .recharts-bar-rectangle:hover {
          opacity: 1 !important;
          fill-opacity: 1 !important;
          filter: none !important;
        }
      `}</style>
      
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: COLORS.dark,
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px'
            }}>
              Inventory Health Dashboard
            </h1>
            <p style={{ fontSize: '15px', color: COLORS.gray, margin: '0 0 4px 0', fontWeight: '500' }}>
              Monitor stock levels, predict shortages, and manage reorder points
            </p>
            <p style={{ fontSize: '12px', color: COLORS.lightGray, margin: 0, fontWeight: '500' }}>
              <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {dateRangeDisplay}
            </p>
          </div>
          
          {/* Control Buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={handleRefreshAll}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: loading ? COLORS.lightGray : COLORS.primary,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: COLORS.white,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
            >
              <RefreshCw size={16} style={{ 
                animation: loading ? 'spin 1s linear infinite' : 'none'
              }} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: autoRefresh ? COLORS.purple : COLORS.white,
                border: `2px solid ${autoRefresh ? COLORS.purple : COLORS.border}`,
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: autoRefresh ? COLORS.white : COLORS.dark,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
              }}
            >
              <Zap size={16} />
              Auto-Refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div style={{
            backgroundColor: COLORS.white,
            border: `2px solid ${COLORS.purple}`,
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <AlertCircle size={24} color={COLORS.purple} />
            <div>
              <div style={{ fontWeight: '700', color: COLORS.dark, marginBottom: '4px', fontSize: '16px' }}>
                Error Loading Data
              </div>
              <div style={{ fontSize: '14px', color: COLORS.gray, fontWeight: '500' }}>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && filteredItems.length === 0 && (
          <div style={{
            backgroundColor: COLORS.white,
            borderRadius: '12px',
            padding: '60px 20px',
            marginBottom: '24px',
            textAlign: 'center',
            border: `1px solid ${COLORS.border}`,
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{
              display: 'inline-block',
              width: '48px',
              height: '48px',
              border: `4px solid ${COLORS.border}`,
              borderTopColor: COLORS.primary,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '16px'
            }} />
            <div style={{ fontSize: '16px', color: COLORS.dark, fontWeight: '600' }}>
              Loading inventory data...
            </div>
          </div>
        )}

        {/* Main Content Section: KPI Cards */}
        {!loading && filteredItems.length > 0 && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Card 1: Items Below ROP */}
              <div style={{
                backgroundColor: COLORS.white,
                borderRadius: '12px',
                padding: '24px',
                border: `1px solid ${COLORS.border}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
              }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: COLORS.gray, 
                  fontWeight: '500',
                  marginBottom: '12px'
                }}>
                  Items Below ROP
                </div>
                <div 
                  style={{ 
                    fontSize: '36px', 
                    fontWeight: '700', 
                    color: COLORS.dark, 
                    lineHeight: '1',
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}
                  title={budgetKPIs?.stockoutItems?.map(i => i.itemName).slice(0, 10).join('\n') || ''}
                >
                  <CountUp end={healthMetrics.itemsBelowROP} duration={1500} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingDown size={14} color={COLORS.critical} />
                  <span style={{ fontSize: '12px', color: COLORS.gray }}>
                    <CountUp 
                      end={healthMetrics.totalItems > 0 
                        ? ((healthMetrics.itemsBelowROP / healthMetrics.totalItems) * 100) 
                        : 0} 
                      duration={1500}
                      decimals={1}
                    />% of inventory
                  </span>
                </div>
              </div>

              {/* Card 2: Predicted Stock-Outs */}
              <div style={{
                backgroundColor: COLORS.white,
                borderRadius: '12px',
                padding: '24px',
                border: `1px solid ${COLORS.border}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
              }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: COLORS.gray, 
                  fontWeight: '500',
                  marginBottom: '12px'
                }}>
                  Predicted Stock-Outs
                </div>
                <div 
                  style={{ 
                    fontSize: '36px', 
                    fontWeight: '700', 
                    color: COLORS.dark, 
                    lineHeight: '1',
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}
                  title={budgetKPIs?.stockoutItems?.filter(item => item.coverageDays <= 15).map(i => i.itemName).slice(0, 10).join('\n') || ''}
                >
                  <CountUp end={healthMetrics.predictedStockOuts} duration={1500} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} color={COLORS.orange} />
                  <span style={{ fontSize: '12px', color: COLORS.gray }}>
                    Next 15 days
                  </span>
                </div>
              </div>

              {/* Card 3: High-Risk Categories */}
              <div style={{
                backgroundColor: COLORS.white,
                borderRadius: '12px',
                padding: '24px',
                border: `1px solid ${COLORS.border}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
              }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: COLORS.gray, 
                  fontWeight: '500',
                  marginBottom: '12px'
                }}>
                  High-Risk Items
                </div>
                <div 
                  style={{ 
                    fontSize: '36px', 
                    fontWeight: '700', 
                    color: COLORS.dark, 
                    lineHeight: '1',
                    marginBottom: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <CountUp end={healthMetrics.highRiskItems} duration={1500} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} color={COLORS.purple} />
                  <span style={{ fontSize: '12px', color: COLORS.gray }}>
                    {healthMetrics.totalItems} total
                  </span>
                </div>
              </div>


            </div>

            {/* Days Range Distribution Chart */}
            <div style={{
              backgroundColor: COLORS.white,
              borderRadius: '12px',
              padding: '20px',
              border: `1px solid ${COLORS.border}`,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              marginBottom: '24px'
            }}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: COLORS.dark,
                  marginBottom: '4px',
                  margin: 0
                }}>
                  Stock-Out Items by Days Range
                </h3>
                <p style={{ fontSize: '12px', color: COLORS.gray, margin: '4px 0 0 0' }}>
                  Distribution of items across different coverage day ranges
                </p>
              </div>
              
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={daysRangeChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis 
                    dataKey="name" 
                    stroke={COLORS.gray} 
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis stroke={COLORS.gray} tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: COLORS.white,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '8px',
                      padding: '10px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => [
                      <div key="tooltip">
                        <div style={{ fontWeight: '700', color: COLORS.dark }}>
                          {value} items
                        </div>
                      </div>
                    ]}
                  />
                  <Bar dataKey="items" radius={[4, 4, 0, 0]}>
                    {daysRangeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Compact Two-Column Layout: Bar Chart + Heatmap */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '24px'
            }}>
              {/* Days Left per Item */}
              <div style={{
                backgroundColor: COLORS.white,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${COLORS.border}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: COLORS.dark,
                      marginBottom: '4px',
                      margin: 0
                    }}>
                      Days Left per Item
                    </h3>
                    <p style={{ fontSize: '12px', color: COLORS.gray, margin: '4px 0 0 0' }}>
                      Showing top {Math.min(filteredItems.length, 20)} items
                      {daysFilter !== 'all' || categoryFilter !== 'all' ? ' (filtered)' : ''}
                    </p>
                  </div>
                  
                  {/* Filters */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: `2px solid ${COLORS.border}`,
                        backgroundColor: COLORS.white,
                        fontSize: '13px',
                        fontWeight: '600',
                        color: COLORS.dark,
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <option value="all">All Categories</option>
                      {uniqueCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>

                    <select
                      value={daysFilter}
                      onChange={(e) => setDaysFilter(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: `2px solid ${COLORS.border}`,
                        backgroundColor: COLORS.white,
                        fontSize: '13px',
                        fontWeight: '600',
                        color: COLORS.dark,
                        cursor: 'pointer',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                    >
                      <option value="all">All Days</option>
                      <option value="1-7">1-7 days</option>
                      <option value="7-15">7-15 days</option>
                      <option value="15-30">15-30 days</option>
                      <option value="30-60">30-60 days</option>
                    </select>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={coverageChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                    <XAxis 
                      dataKey="name" 
                      stroke={COLORS.gray} 
                      tick={{ fontSize: 10 }}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis stroke={COLORS.gray} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: COLORS.white,
                        border: `1px solid ${COLORS.border}`,
                        borderRadius: '8px',
                        padding: '10px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px'
                      }}
                      // show only the details in tooltip (avoid repeating name twice)
                      formatter={(value: any, name: string, props: any) => {
                        const item = props.payload;
                        return [
                          <div key="tooltip">
                            <div style={{ color: COLORS.gray, fontSize: '11px' }}>
                              Days: <span style={{ fontWeight: '600', color: COLORS.dark }}>{value}</span>
                            </div>
                            <div style={{ color: COLORS.gray, fontSize: '11px' }}>
                              Stock: <span style={{ fontWeight: '600', color: COLORS.dark }}>{item.currentStock} {item.unit}</span>
                            </div>
                          </div>
                        ];
                      }}
                    />
                    <Bar dataKey="daysLeft" radius={[4, 4, 0, 0]}>
                      {coverageChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.alertLevel]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Category Heatmap */}
              <div style={{
                backgroundColor: COLORS.white,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${COLORS.border}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: COLORS.dark,
                      marginBottom: '4px',
                      margin: 0
                    }}>
                      Category Heatmap
                    </h3>
                    <p style={{ fontSize: '12px', color: COLORS.gray, margin: '4px 0 0 0' }}>
                      Alert distribution by category
                    </p>
                  </div>
                  <button
                    onClick={() => setFullscreenHeatmap(true)}
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      border: `1px solid ${COLORS.border}`,
                      backgroundColor: COLORS.white,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    title="Expand to fullscreen"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={COLORS.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                  </button>
                </div>

                <div style={{ overflowX: 'auto', maxHeight: '370px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '6px' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: COLORS.white, zIndex: 1 }}>
                      <tr>
                        <th style={{
                          padding: '8px',
                          textAlign: 'left',
                          fontSize: '10px',
                          fontWeight: '700',
                          color: COLORS.dark,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>Category</th>
                        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
                          <th key={level} style={{
                            padding: '8px',
                            textAlign: 'center',
                            fontSize: '9px',
                            fontWeight: '700',
                            color: HEATMAP_COLORS[level as AlertLevel],
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>{level}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {stockLevelTrendData.map((row) => (
                        <tr key={row.category}>
                          <td style={{
                            padding: '8px',
                            fontSize: '11px',
                            fontWeight: '600',
                            color: COLORS.dark
                          }}>
                            {row.category}
                          </td>
                          {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => {
                            const count = row[level as keyof typeof row] as number;
                            const sourceItems = stockLevelsData?.items || items || [];
                            const categoryItems = sourceItems.filter(item => 
                              getCategoryName(item) === row.category && 
                              item.stockAlertLevel === level
                            );
                            
                            return (
                              <td key={level} style={{ padding: '3px' }}>
                                <div
                                  title={categoryItems.length > 0 ? `${level}: ${categoryItems.map(i => i.itemName).join(', ')}` : 'No items'}
                                  style={{
                                    padding: '10px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: count > 0 ? HEATMAP_COLORS[level as AlertLevel] : COLORS.bg,
                                    color: count > 0 ? COLORS.white : COLORS.lightGray,
                                    textAlign: 'center',
                                    fontSize: '13px',
                                    fontWeight: '700',
                                    cursor: count > 0 ? 'pointer' : 'default',
                                    transition: 'transform 0.2s, box-shadow 0.2s',
                                    minWidth: '35px'
                                  }}
                                  onMouseEnter={(e) => {
                                    if (count > 0) {
                                      e.currentTarget.style.transform = 'scale(1.05)';
                                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  {count}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Two Column Layout: Gauge + Stock Table */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '280px 1fr',
              gap: '20px',
              marginBottom: '24px'
            }}>
              {/* SKUs Below ROP Gauge */}
              <div style={{
                backgroundColor: COLORS.white,
                borderRadius: '12px',
                padding: '20px',
                border: `1px solid ${COLORS.border}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: COLORS.dark,
                    margin: '0 0 8px 0'
                  }}>
                    SKUs Below ROP
                  </h3>
                  <div style={{ 
                    padding: '10px 12px',
                    backgroundColor: COLORS.bg,
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: COLORS.gray,
                    lineHeight: '1.5'
                  }}>
                    <strong>ROP (Reorder Point)</strong> is the minimum stock level that triggers a reorder. 
                    Items below ROP need immediate attention to prevent stock-outs.
                  </div>
                </div>
                
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <ResponsiveContainer width="100%" height={180}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={skusBelowROPData}>
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        fill={COLORS.primary}
                        background={{ fill: COLORS.bg }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none'
                  }}>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: COLORS.dark }}>
                      <CountUp end={skusBelowROPData[0].value} duration={1500} />%
                    </div>
                    <div style={{ fontSize: '10px', color: COLORS.gray, fontWeight: '600', marginTop: '4px' }}>
                      Below ROP
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  paddingTop: '12px',
                  borderTop: `1px solid ${COLORS.border}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: COLORS.gray }}>Below ROP</span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: COLORS.critical }}>
                      <CountUp end={healthMetrics.itemsBelowROP} duration={1500} />
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: COLORS.gray }}>Above ROP</span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: COLORS.green }}>
                      <CountUp end={healthMetrics.totalItems - healthMetrics.itemsBelowROP} duration={1500} />
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: COLORS.gray }}>Total SKUs</span>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: COLORS.dark }}>
                      <CountUp end={healthMetrics.totalItems} duration={1500} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock-Out Risk Predictions Table */}
              {stockOutPredictions.length > 0 && (
                <div style={{
                  backgroundColor: COLORS.white,
                  borderRadius: '12px',
                  padding: '20px',
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '700',
                        color: COLORS.dark,
                        marginBottom: '4px',
                        margin: 0
                      }}>
                        Stock-Out Risk Items
                      </h3>
                      <p style={{ fontSize: '12px', color: COLORS.gray, margin: '4px 0 0 0' }}>
                        Items requiring immediate attention
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ overflowX: 'auto', maxHeight: '450px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead style={{ position: 'sticky', top: 0, backgroundColor: COLORS.white, zIndex: 1 }}>
                        <tr>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'left',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: COLORS.gray,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: `2px solid ${COLORS.border}`,
                            backgroundColor: COLORS.bg
                          }}>Item</th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'right',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: COLORS.gray,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: `2px solid ${COLORS.border}`,
                            backgroundColor: COLORS.bg
                          }}>Stock</th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'center',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: COLORS.gray,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: `2px solid ${COLORS.border}`,
                            backgroundColor: COLORS.bg
                          }}>Days</th>
                          <th style={{
                            padding: '12px 16px',
                            textAlign: 'center',
                            fontSize: '11px',
                            fontWeight: '700',
                            color: COLORS.gray,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            borderBottom: `2px solid ${COLORS.border}`,
                            backgroundColor: COLORS.bg
                          }}>Risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockOutPredictions.map((item, idx) => (
                          <tr key={item.id} style={{
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = COLORS.bg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}>
                            <td style={{
                              padding: '14px 16px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: COLORS.dark,
                              borderBottom: `1px solid ${COLORS.border}`
                            }}>
                              <div>{item.name}</div>
                              <div style={{ 
                                fontSize: '10px', 
                                color: COLORS.gray, 
                                fontWeight: '500',
                                marginTop: '2px'
                              }}>
                                {item.category}
                              </div>
                            </td>
                            <td style={{
                              padding: '14px 16px',
                              fontSize: '13px',
                              fontWeight: '700',
                              color: COLORS.dark,
                              textAlign: 'right',
                              borderBottom: `1px solid ${COLORS.border}`
                            }}>
                              {item.currentStock.toFixed(0)}
                            </td>
                            <td style={{
                              padding: '14px 16px',
                              textAlign: 'center',
                              borderBottom: `1px solid ${COLORS.border}`
                            }}>
                              <span style={{
                                padding: '6px 12px',
                                fontSize: '13px',
                                fontWeight: '700',
                                borderRadius: '8px',
                                backgroundColor: item.daysUntilStockout <= 7 ? `${COLORS.critical}15` : 
                                  item.daysUntilStockout <= 15 ? `${COLORS.orange}15` : 
                                  `${COLORS.purple}15`,
                                color: item.daysUntilStockout <= 7 ? COLORS.critical : 
                                  item.daysUntilStockout <= 15 ? COLORS.orange : 
                                  COLORS.purple,
                                display: 'inline-block',
                                whiteSpace: 'nowrap'
                              }}>
                                {item.daysUntilStockout}d
                              </span>
                            </td>
                            <td style={{ 
                              padding: '14px 16px', 
                              textAlign: 'center',
                              borderBottom: `1px solid ${COLORS.border}`
                            }}>
                              <span style={{
                                padding: '6px 12px',
                                fontSize: '10px',
                                fontWeight: '700',
                                borderRadius: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                display: 'inline-block',
                                backgroundColor: item.severity === 'critical' ? COLORS.critical : 
                                  item.severity === 'warning' ? COLORS.orange : 
                                  COLORS.purple,
                                color: COLORS.white
                              }}>
                                {item.severity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}


            </div>
          </>
        )}
      </div>

      {/* Fullscreen Table Modal */}
      {fullscreenTable && stockOutPredictions.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}
        onClick={() => setFullscreenTable(false)}>
          <div style={{
            backgroundColor: COLORS.white,
            borderRadius: '16px',
            width: '100%',
            maxWidth: '1400px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: COLORS.dark }}>
                  Stock-Out Risk Items - Full View
                </h2>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: COLORS.gray }}>
                  Complete list of items at risk
                </p>
              </div>
              <button
                onClick={() => setFullscreenTable(false)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: COLORS.bg,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: COLORS.white, zIndex: 1 }}>
                  <tr>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: COLORS.dark,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: `2px solid ${COLORS.border}`,
                      backgroundColor: COLORS.bg
                    }}>Item</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: COLORS.dark,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: `2px solid ${COLORS.border}`,
                      backgroundColor: COLORS.bg
                    }}>Category</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'right',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: COLORS.dark,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: `2px solid ${COLORS.border}`,
                      backgroundColor: COLORS.bg
                    }}>Current Stock</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: COLORS.dark,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: `2px solid ${COLORS.border}`,
                      backgroundColor: COLORS.bg
                    }}>Days Left</th>
                    <th style={{
                      padding: '16px',
                      textAlign: 'center',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: COLORS.dark,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      borderBottom: `2px solid ${COLORS.border}`,
                      backgroundColor: COLORS.bg
                    }}>Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {stockOutPredictions.map((item) => (
                    <tr key={item.id} style={{
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.bg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: COLORS.dark,
                        borderBottom: `1px solid ${COLORS.border}`
                      }}>
                        {item.name}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '13px',
                        color: COLORS.gray,
                        fontWeight: '500',
                        borderBottom: `1px solid ${COLORS.border}`
                      }}>
                        {item.category}
                      </td>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        fontWeight: '700',
                        color: COLORS.dark,
                        textAlign: 'right',
                        borderBottom: `1px solid ${COLORS.border}`
                      }}>
                        {item.currentStock.toFixed(0)}
                      </td>
                      <td style={{
                        padding: '16px',
                        textAlign: 'center',
                        borderBottom: `1px solid ${COLORS.border}`
                      }}>
                        <span style={{
                          padding: '8px 16px',
                          fontSize: '14px',
                          fontWeight: '700',
                          borderRadius: '8px',
                          backgroundColor: item.daysUntilStockout <= 7 ? `${COLORS.critical}15` : 
                            item.daysUntilStockout <= 15 ? `${COLORS.orange}15` : 
                            `${COLORS.purple}15`,
                          color: item.daysUntilStockout <= 7 ? COLORS.critical : 
                            item.daysUntilStockout <= 15 ? COLORS.orange : 
                            COLORS.purple,
                          display: 'inline-block'
                        }}>
                          {item.daysUntilStockout} days
                        </span>
                      </td>
                      <td style={{ 
                        padding: '16px', 
                        textAlign: 'center',
                        borderBottom: `1px solid ${COLORS.border}`
                      }}>
                        <span style={{
                          padding: '8px 16px',
                          fontSize: '11px',
                          fontWeight: '700',
                          borderRadius: '8px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'inline-block',
                          backgroundColor: item.severity === 'critical' ? COLORS.critical : 
                            item.severity === 'warning' ? COLORS.orange : 
                            COLORS.purple,
                          color: COLORS.white
                        }}>
                          {item.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Heatmap Modal */}
      {fullscreenHeatmap && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px'
        }}
        onClick={() => setFullscreenHeatmap(false)}>
          <div style={{
            backgroundColor: COLORS.white,
            borderRadius: '16px',
            width: '100%',
            maxWidth: '1200px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
          onClick={(e) => e.stopPropagation()}>
            <div style={{
              padding: '24px',
              borderBottom: `1px solid ${COLORS.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: COLORS.dark }}>
                  Category Heatmap - Full View
                </h2>
                <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: COLORS.gray }}>
                  Complete alert distribution across all inventory categories
                </p>
              </div>
              <button
                onClick={() => setFullscreenHeatmap(false)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: COLORS.bg,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={COLORS.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(90vh - 120px)' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '10px' }}>
                <thead>
                  <tr>
                    <th style={{
                      padding: '16px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: '700',
                      color: COLORS.dark,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>Category</th>
                    {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => (
                      <th key={level} style={{
                        padding: '16px',
                        textAlign: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: HEATMAP_COLORS[level as AlertLevel],
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>{level}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stockLevelTrendData.map((row) => (
                    <tr key={row.category}>
                      <td style={{
                        padding: '16px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: COLORS.dark
                      }}>
                        {row.category}
                      </td>
                      {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(level => {
                        const count = row[level as keyof typeof row] as number;
                        const sourceItems = stockLevelsData?.items || items || [];
                        const categoryItems = sourceItems.filter(item => 
                          getCategoryName(item) === row.category && 
                          item.stockAlertLevel === level
                        );
                        
                        return (
                          <td key={level} style={{ padding: '6px' }}>
                            <div
                              title={categoryItems.length > 0 ? `${level}: ${categoryItems.map(i => i.itemName).join(', ')}` : 'No items'}
                              style={{
                                padding: '20px 16px',
                                borderRadius: '12px',
                                backgroundColor: count > 0 ? HEATMAP_COLORS[level as AlertLevel] : COLORS.bg,
                                color: count > 0 ? COLORS.white : COLORS.lightGray,
                                textAlign: 'center',
                                fontSize: '20px',
                                fontWeight: '800',
                                cursor: count > 0 ? 'pointer' : 'default',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                if (count > 0) {
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = 'none';
                              }}
                            >
                              {count}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryHealthDashboard;