/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, Package,
  Calendar, Filter, X, ChevronDown, Activity,
  Zap, ArrowUp, ArrowDown,
  RefreshCw, Layers
} from 'lucide-react';
import {
  useItems,
  useCategories
} from '../api/hooks';
import { 
  AnalyticsAPI,
  type ConsumptionTrendsResponse,
  type Item,
  type Category
} from '../api/inventory';

const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  dark: '#0f172a',
  gray: '#64748b',
  bg: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0'
};

const currencyFormatter = new Intl.NumberFormat('en-IN', { 
  style: 'currency', 
  currency: 'INR',
  maximumFractionDigits: 0
});

const Card: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void;
}> = ({ children, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: '12px',
        padding: '16px',
        border: `1px solid ${COLORS.border}`,
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </div>
  );
};

const CleanTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '11px', color: COLORS.gray, marginBottom: '6px', fontWeight: '500' }}>
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            fontSize: '13px',
            fontWeight: '600',
            color: COLORS.dark
          }}>
            <div style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: entry.color 
            }} />
            {entry.name}: {entry.value?.toLocaleString()}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// REAL DATA HEATMAP using consumptionRecords - Detailed Calendar View
type HeatmapDataItem = {
  date: string;
  day: number;
  consumption: number;
  intensity: number;
};

const CompactHeatmap: React.FC<{
  item: any;
  dateRange: { start: string; end: string };
  onClose: () => void;
}> = ({ item, dateRange, onClose }) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapDataItem[]>([]);

  useEffect(() => {
    const records = item.consumptionRecords || [];
    
    console.log('📅 Heatmap opened for:', item.itemName, 'Records:', records.length);
    
    if (records.length === 0) {
      const avgDaily = Number(item.avgDailyConsumption) || 0;
      const data: HeatmapDataItem[] = [];
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < Math.min(daysDiff, 90); i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        data.push({
          date: date.toISOString().slice(0, 10),
          day: date.getDate(),
          consumption: Math.round(avgDaily * (0.8 + Math.random() * 0.4)),
          intensity: 0.5
        });
      }
      setHeatmapData(data);
      return;
    }

    const maxConsumption = Math.max(...records.map((r: any) => Number(r.consumedQuantity || 0)));

    const data: HeatmapDataItem[] = records.map((record: any) => {
      const consumed = Number(record.consumedQuantity || 0);
      return {
        date: record.date,
        day: new Date(record.date).getDate(),
        consumption: consumed,
        intensity: maxConsumption > 0 ? consumed / maxConsumption : 0
      };
    }).filter((d: any) => {
      const recordDate = new Date(d.date);
      return recordDate >= new Date(dateRange.start) && recordDate <= new Date(dateRange.end);
    }).sort((a: any, b: any) => a.date.localeCompare(b.date));

    setHeatmapData(data);
  }, [item, dateRange]);

  const getColor = (intensity: number) => {
    if (intensity < 0.25) return '#dbeafe';
    if (intensity < 0.5) return '#93c5fd';
    if (intensity < 0.75) return '#3b82f6';
    return '#1e40af';
  };

  const groupedByMonth = heatmapData.reduce((acc, data) => {
    const monthKey = data.date.slice(0, 7);
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(data);
    return acc;
  }, {} as Record<string, HeatmapDataItem[]>);

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 1999
        }}
      />
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '480px',
        backgroundColor: COLORS.white,
        padding: '20px',
        overflowY: 'auto',
        zIndex: 2000,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: COLORS.dark, margin: 0 }}>
              {item.itemName}
            </h3>
            <p style={{ fontSize: '13px', color: COLORS.gray, margin: '4px 0 0 0' }}>
              Daily consumption pattern • {heatmapData.length} records
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.white,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} color={COLORS.gray} />
          </button>
        </div>

        {heatmapData.length > 0 && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={heatmapData.slice(-30)}>
                  <defs>
                    <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.info} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.info} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: COLORS.gray }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: COLORS.gray }} />
                  <Tooltip content={<CleanTooltip />} />
                  <Area type="monotone" dataKey="consumption" stroke={COLORS.info} fill="url(#gradientBlue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {Object.entries(groupedByMonth).map(([monthKey, monthData]) => (
                <div key={monthKey}>
                  <h4 style={{ fontSize: '12px', fontWeight: '600', color: COLORS.dark, marginBottom: '6px' }}>
                    {new Date(monthKey + '-01').toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                      <div key={d} style={{ fontSize: '9px', color: COLORS.gray, textAlign: 'center', fontWeight: '600' }}>
                        {d}
                      </div>
                    ))}
                    {monthData.length > 0 && Array.from({ length: new Date(monthData[0].date).getDay() }, (_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {monthData.map(data => (
                      <div
                        key={data.date}
                        title={`${data.date}: ${data.consumption} units`}
                        style={{
                          aspectRatio: '1',
                          backgroundColor: getColor(data.intensity),
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                          fontWeight: '600',
                          color: data.intensity > 0.5 ? COLORS.white : COLORS.dark,
                          cursor: 'pointer'
                        }}
                      >
                        {data.day}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {heatmapData.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: COLORS.gray }}>
            No consumption records available for this period
          </div>
        )}
      </div>
    </>
  );
};

// HEATMAP - Redesigned with month navigation and filters
const HeatmapRightPanel: React.FC<{
  isOpen: boolean;
  items: Item[];
  categories: Category[];
  dateRange: { start: string; end: string };
  selectedCategory: number | null;
  selectedItems: number[];
  onClose: () => void;
}> = ({ isOpen, items, categories, dateRange, selectedCategory: propSelectedCategory, selectedItems: propSelectedItems, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<number | null>(propSelectedCategory);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);

  // Get available months from date range
  const availableMonths = useMemo(() => {
    const months: Date[] = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  }, [dateRange]);

  // Initialize current month
  useEffect(() => {
    if (isOpen && availableMonths.length > 0) {
      setCurrentMonth(availableMonths[availableMonths.length - 1]); // Most recent month
    }
  }, [isOpen, availableMonths]);

  // Filter items
  const filteredItems = useMemo(() => {
    let result = items;
    
    if (selectedCategory) {
      result = result.filter(item => item.categoryId === selectedCategory);
    }
    
    if (selectedItem) {
      result = result.filter(item => item.id === selectedItem);
    }
    
    return result.filter(item => (item.consumptionRecords || []).length > 0);
  }, [items, selectedCategory, selectedItem]);

  // Calculate monthly data
  const monthlyData = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    return filteredItems.map(item => {
      const records = (item.consumptionRecords || []) as any[];
      
      const monthRecords = records.filter((r: any) => {
        const recordDate = new Date(r.date);
        return recordDate >= monthStart && recordDate <= monthEnd;
      });

      const totalConsumption = monthRecords.reduce((sum: number, r: any) => 
        sum + Number(r.consumedQuantity || 0), 0
      );

      const dailyData = monthRecords.map((r: any) => ({
        date: r.date,
        day: new Date(r.date).getDate(),
        consumption: Number(r.consumedQuantity || 0)
      }));

      return {
        item,
        itemName: item.itemName,
        categoryName: categories.find(c => c.id === item.categoryId)?.categoryName || 'Unknown',
        totalConsumption,
        dailyData,
        avgDaily: monthRecords.length > 0 ? totalConsumption / monthRecords.length : 0
      };
    }).filter(d => d.totalConsumption > 0)
      .sort((a, b) => b.totalConsumption - a.totalConsumption);
  }, [filteredItems, currentMonth, categories]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentIndex = availableMonths.findIndex(
      m => m.getMonth() === currentMonth.getMonth() && m.getFullYear() === currentMonth.getFullYear()
    );
    
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentMonth(availableMonths[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < availableMonths.length - 1) {
      setCurrentMonth(availableMonths[currentIndex + 1]);
    }
  };

  const canGoPrev = availableMonths.findIndex(
    m => m.getMonth() === currentMonth.getMonth() && m.getFullYear() === currentMonth.getFullYear()
  ) > 0;

  const canGoNext = availableMonths.findIndex(
    m => m.getMonth() === currentMonth.getMonth() && m.getFullYear() === currentMonth.getFullYear()
  ) < availableMonths.length - 1;

  if (!isOpen) return null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '90%',
        maxWidth: '900px',
        backgroundColor: COLORS.white,
        padding: '24px',
        overflowY: 'auto',
        zIndex: 999,
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from { 
              opacity: 0;
              transform: translateX(20px);
            }
            to { 
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>

        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: `2px solid ${COLORS.border}`
        }}>
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '800', 
              color: COLORS.dark, 
              margin: 0,
              marginBottom: '4px'
            }}>
              Consumption Heatmap
            </h2>
            <p style={{ fontSize: '14px', color: COLORS.gray, margin: 0 }}>
              Monthly consumption patterns
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: `2px solid ${COLORS.border}`,
              backgroundColor: COLORS.white,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.danger + '15';
              e.currentTarget.style.borderColor = COLORS.danger;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.white;
              e.currentTarget.style.borderColor = COLORS.border;
            }}
          >
            <X size={20} color={COLORS.gray} />
          </button>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px', 
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: COLORS.bg,
          borderRadius: '12px'
        }}>
          <div>
            <label style={{ 
              fontSize: '11px', 
              fontWeight: '600', 
              color: COLORS.gray, 
              marginBottom: '8px', 
              display: 'block',
              textTransform: 'uppercase'
            }}>
              Category
            </label>
            <select 
              value={selectedCategory || ''} 
              onChange={(e) => {
                setSelectedCategory(e.target.value ? Number(e.target.value) : null);
                setSelectedItem(null);
              }}
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: COLORS.white, 
                border: `2px solid ${COLORS.border}`, 
                borderRadius: '8px', 
                fontSize: '14px', 
                color: COLORS.dark, 
                cursor: 'pointer', 
                fontWeight: '500'
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ 
              fontSize: '11px', 
              fontWeight: '600', 
              color: COLORS.gray, 
              marginBottom: '8px', 
              display: 'block',
              textTransform: 'uppercase'
            }}>
              Item
            </label>
            <select 
              value={selectedItem || ''} 
              onChange={(e) => setSelectedItem(e.target.value ? Number(e.target.value) : null)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: COLORS.white, 
                border: `2px solid ${COLORS.border}`, 
                borderRadius: '8px', 
                fontSize: '14px', 
                color: COLORS.dark, 
                cursor: 'pointer', 
                fontWeight: '500'
              }}
            >
              <option value="">All Items</option>
              {items
                .filter(item => !selectedCategory || item.categoryId === selectedCategory)
                .map(item => (
                  <option key={item.id} value={item.id}>
                    {item.itemName}
                  </option>
                ))
              }
            </select>
          </div>
        </div>

        {/* Month Navigation */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: COLORS.bg,
          borderRadius: '12px'
        }}>
          <button
            onClick={() => navigateMonth('prev')}
            disabled={!canGoPrev}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: `2px solid ${canGoPrev ? COLORS.border : COLORS.bg}`,
              backgroundColor: COLORS.white,
              cursor: canGoPrev ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canGoPrev ? 1 : 0.3,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (canGoPrev) {
                e.currentTarget.style.backgroundColor = COLORS.primary + '10';
                e.currentTarget.style.borderColor = COLORS.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (canGoPrev) {
                e.currentTarget.style.backgroundColor = COLORS.white;
                e.currentTarget.style.borderColor = COLORS.border;
              }
            }}
          >
            <ChevronDown size={20} color={canGoPrev ? COLORS.dark : COLORS.gray} style={{ transform: 'rotate(90deg)' }} />
          </button>

          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: COLORS.dark }}>
              {currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '12px', color: COLORS.gray, marginTop: '4px' }}>
              {monthlyData.length} items with consumption
            </div>
          </div>

          <button
            onClick={() => navigateMonth('next')}
            disabled={!canGoNext}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: `2px solid ${canGoNext ? COLORS.border : COLORS.bg}`,
              backgroundColor: COLORS.white,
              cursor: canGoNext ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canGoNext ? 1 : 0.3,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (canGoNext) {
                e.currentTarget.style.backgroundColor = COLORS.primary + '10';
                e.currentTarget.style.borderColor = COLORS.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (canGoNext) {
                e.currentTarget.style.backgroundColor = COLORS.white;
                e.currentTarget.style.borderColor = COLORS.border;
              }
            }}
          >
            <ChevronDown size={20} color={canGoNext ? COLORS.dark : COLORS.gray} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </div>

        {/* Monthly Data */}
        {monthlyData.length === 0 ? (
          <div style={{ 
            padding: '60px', 
            textAlign: 'center', 
            color: COLORS.gray,
            backgroundColor: COLORS.bg,
            borderRadius: '12px'
          }}>
            <Activity size={48} color={COLORS.gray} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              No consumption data
            </div>
            <div style={{ fontSize: '13px' }}>
              No records found for this month
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {monthlyData.map((data, idx) => {
              const maxConsumption = Math.max(...monthlyData.map(d => d.totalConsumption));
              const percentage = (data.totalConsumption / maxConsumption) * 100;
              
              return (
                <div 
                  key={idx}
                  style={{
                    padding: '16px',
                    backgroundColor: COLORS.white,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.bg;
                    e.currentTarget.style.borderColor = COLORS.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.white;
                    e.currentTarget.style.borderColor = COLORS.border;
                  }}
                  onClick={() => setDetailItem(data.item)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: COLORS.dark, marginBottom: '2px' }}>
                        {data.itemName}
                      </div>
                      <div style={{ fontSize: '12px', color: COLORS.gray }}>
                        {data.categoryName}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: COLORS.primary }}>
                        {data.totalConsumption.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '11px', color: COLORS.gray }}>
                        {data.avgDaily.toFixed(1)} avg/day
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: COLORS.bg,
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      backgroundColor: COLORS.primary,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailItem && (
        <CompactHeatmap 
          item={detailItem} 
          dateRange={dateRange} 
          onClose={() => setDetailItem(null)} 
        />
      )}
    </>
  );
};

// SMART INSIGHTS - Clean grid with professional colors
const SmartInsightsFeed: React.FC<{
  items: Item[];
  categories: Category[];
  dateRange: { start: string; end: string };
}> = ({ items, categories, dateRange }) => {
  const insights = useMemo(() => {
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    const now = new Date();
    const lastWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const itemAnalytics = (items || []).map(item => {
      const records = (item.consumptionRecords || []) as any[];
      
      const periodRecords = records.filter((r: any) => {
        const recordDate = new Date(r.date);
        return recordDate >= startDate && recordDate <= endDate;
      });

      const lastWeekRecords = records.filter((r: any) => {
        const recordDate = new Date(r.date);
        return recordDate >= lastWeekStart && recordDate <= now;
      });

      const lastMonthRecords = records.filter((r: any) => {
        const recordDate = new Date(r.date);
        return recordDate >= lastMonthStart && recordDate < lastWeekStart;
      });

      const totalConsumed = periodRecords.reduce((sum: number, r: any) => 
        sum + Number(r.consumedQuantity || 0), 0
      );

      const lastWeekTotal = lastWeekRecords.reduce((sum: number, r: any) => 
        sum + Number(r.consumedQuantity || 0), 0
      );

      const lastMonthTotal = lastMonthRecords.reduce((sum: number, r: any) => 
        sum + Number(r.consumedQuantity || 0), 0
      );

      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
      const avgDaily = totalConsumed / daysDiff;
      const lastWeekAvg = lastWeekTotal / 7;
      const lastMonthAvg = lastMonthTotal / 30;
      
      const currentStock = Number(item.currentQuantity || item.closingStock || 0);
      const coverage = avgDaily > 0 ? currentStock / avgDaily : 999;
      const unitPrice = Number(item.unitPrice || 0);
      
      const trend = lastMonthAvg > 0 ? ((lastWeekAvg - lastMonthAvg) / lastMonthAvg) * 100 : 0;
      
      return {
        item,
        avgDaily,
        lastWeekAvg,
        lastMonthAvg,
        currentStock,
        coverage,
        totalConsumed,
        lastWeekTotal,
        trend,
        unitPrice,
        category: categories.find(c => c.id === item.categoryId)?.categoryName || 'Unknown',
        categoryId: item.categoryId,
        recordCount: periodRecords.length
      };
    }).filter(d => d.totalConsumed > 0);

    const insights: any[] = [];

    // 1. Stock Running Low
    const criticalItems = itemAnalytics
      .filter(d => d.coverage > 0 && d.coverage <= 7)
      .sort((a, b) => a.coverage - b.coverage)
      .slice(0, 1);
    
    if (criticalItems.length > 0) {
      const item = criticalItems[0];
      const reorderQty = Math.ceil(item.avgDaily * 30);
      const fillPercentage = Math.round((item.currentStock / (item.item.maxStockLevel || item.currentStock + 100)) * 100);
      
      insights.push({
        type: 'reorder',
        title: 'Stock Running Low',
        icon: '⚠️',
        item: item.item.itemName,
        category: item.category,
        mainValue: Math.floor(item.coverage),
        mainLabel: 'Days Left',
        secondaryValue: item.currentStock,
        secondaryLabel: 'Current Stock',
        fill: fillPercentage,
        recommendation: `Order ${reorderQty} units to maintain 30-day supply`,
        color: '#ef4444',
        bgColor: '#fef2f2'
      });
    }

    // 2. Usage Spike
    const spikes = itemAnalytics
      .filter(d => d.trend > 50 && d.lastWeekAvg > 5)
      .sort((a, b) => b.trend - a.trend)
      .slice(0, 1);
    
    if (spikes.length > 0) {
      const item = spikes[0];
      const projectedDays = Math.floor(item.currentStock / item.lastWeekAvg);
      const fillPercentage = Math.round((item.currentStock / (item.item.maxStockLevel || item.currentStock + 100)) * 100);
      
      insights.push({
        type: 'spike',
        title: 'Usage Increased',
        icon: '📈',
        item: item.item.itemName,
        category: item.category,
        mainValue: `+${item.trend.toFixed(0)}%`,
        mainLabel: 'Increase',
        secondaryValue: item.lastWeekAvg.toFixed(1),
        secondaryLabel: 'Units/Day',
        fill: fillPercentage,
        recommendation: `Only ${projectedDays} days left at current rate`,
        color: '#10b981',
        bgColor: '#f0fdf4'
      });
    }

    // 3. Usage Drop
    const drops = itemAnalytics
      .filter(d => d.trend < -50 && d.lastMonthAvg > 5)
      .sort((a, b) => a.trend - b.trend)
      .slice(0, 1);
    
    if (drops.length > 0) {
      const item = drops[0];
      const fillPercentage = Math.round((item.currentStock / (item.item.maxStockLevel || item.currentStock + 100)) * 100);
      
      insights.push({
        type: 'drop',
        title: 'Usage Decreased',
        icon: '📉',
        item: item.item.itemName,
        category: item.category,
        mainValue: `${item.trend.toFixed(0)}%`,
        mainLabel: 'Decrease',
        secondaryValue: item.lastWeekAvg.toFixed(1),
        secondaryLabel: 'Units/Day',
        fill: fillPercentage,
        recommendation: 'Consider reducing next order quantity',
        color: '#3b82f6',
        bgColor: '#eff6ff'
      });
    }

    // 4. Overstock
    const overstocked = itemAnalytics
      .filter(d => d.coverage > 60 && d.avgDaily > 0)
      .sort((a, b) => b.coverage - a.coverage)
      .slice(0, 1);
    
    if (overstocked.length > 0) {
      const item = overstocked[0];
      const fillPercentage = Math.min(100, Math.round((item.currentStock / (item.item.maxStockLevel || item.currentStock)) * 100));
      
      insights.push({
        type: 'overstock',
        title: 'Excess Inventory',
        icon: '📦',
        item: item.item.itemName,
        category: item.category,
        mainValue: Math.floor(item.coverage),
        mainLabel: 'Days Supply',
        secondaryValue: item.currentStock,
        secondaryLabel: 'Units',
        fill: fillPercentage,
        recommendation: 'Pause ordering until stock normalizes',
        color: '#8b5cf6',
        bgColor: '#faf5ff'
      });
    }

    // 5. High-Cost Item
    const highValueItems = itemAnalytics
      .filter(d => d.unitPrice > 0 && d.lastWeekTotal > 0)
      .map(d => ({
        ...d,
        weekCost: d.lastWeekTotal * d.unitPrice
      }))
      .sort((a, b) => b.weekCost - a.weekCost)
      .slice(0, 1);
    
    if (highValueItems.length > 0 && highValueItems[0].weekCost > 1000) {
      const item = highValueItems[0];
      const monthlyCost = item.weekCost * 4.33;
      const fillPercentage = Math.round((item.currentStock / (item.item.maxStockLevel || item.currentStock + 100)) * 100);
      
      insights.push({
        type: 'cost',
        title: 'High Cost Item',
        icon: '💰',
        item: item.item.itemName,
        category: item.category,
        mainValue: currencyFormatter.format(item.weekCost),
        mainLabel: 'Weekly Cost',
        secondaryValue: currencyFormatter.format(monthlyCost),
        secondaryLabel: 'Monthly Projection',
        fill: fillPercentage,
        recommendation: 'Monitor usage to optimize costs',
        color: '#f59e0b',
        bgColor: '#fffbeb'
      });
    }

    // 6. Top Category
    const categoryStats = new Map<number, { name: string; total: number; items: number; avgDaily: number }>();
    itemAnalytics.forEach(d => {
      const existing = categoryStats.get(d.categoryId) || { name: d.category, total: 0, items: 0, avgDaily: 0 };
      existing.total += d.lastWeekTotal;
      existing.items += 1;
      existing.avgDaily += d.lastWeekAvg;
      categoryStats.set(d.categoryId, existing);
    });

    const categoryArray = Array.from(categoryStats.values()).filter(c => c.items >= 2);
    if (categoryArray.length >= 1) {
      const topCategory = categoryArray.sort((a, b) => b.avgDaily - a.avgDaily)[0];
      const totalItems = itemAnalytics.length;
      const categoryPercentage = Math.round((topCategory.items / totalItems) * 100);
      
      insights.push({
        type: 'category',
        title: 'Top Category',
        icon: '🏷️',
        item: topCategory.name,
        category: `${topCategory.items} items`,
        mainValue: topCategory.avgDaily.toFixed(1),
        mainLabel: 'Units/Day',
        secondaryValue: topCategory.total.toFixed(0),
        secondaryLabel: 'Weekly Total',
        fill: categoryPercentage,
        recommendation: `${categoryPercentage}% of total inventory activity`,
        color: '#06b6d4',
        bgColor: '#ecfeff'
      });
    }

    return insights;
  }, [items, categories, dateRange]);

  if (insights.length === 0) {
    return (
      <Card>
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>✓</div>
          <div style={{ fontSize: '16px', fontWeight: '600', color: COLORS.dark, marginBottom: '8px' }}>
            All Clear
          </div>
          <div style={{ fontSize: '13px', color: COLORS.gray }}>
            No insights to display at this time
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: '16px'
    }}>
      {insights.map((insight, idx) => (
        <div
          key={idx}
          style={{
            backgroundColor: COLORS.white,
            borderRadius: '12px',
            padding: '24px',
            border: `1px solid ${COLORS.border}`,
            transition: 'all 0.2s',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {/* Icon Badge */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: insight.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            {insight.icon}
          </div>

          {/* Header */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              fontSize: '11px', 
              fontWeight: '700', 
              color: insight.color, 
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '12px'
            }}>
              {insight.title}
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.dark, marginBottom: '4px' }}>
              {insight.item}
            </div>
            <div style={{ fontSize: '13px', color: COLORS.gray }}>
              {insight.category}
            </div>
          </div>

          {/* Main Metrics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '20px',
            paddingBottom: '20px',
            borderBottom: `1px solid ${COLORS.border}`
          }}>
            <div>
              <div style={{ 
                fontSize: '32px', 
                fontWeight: '800', 
                color: insight.color,
                lineHeight: '1',
                marginBottom: '6px'
              }}>
                {insight.mainValue}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: COLORS.gray,
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                {insight.mainLabel}
              </div>
            </div>
            <div>
              <div style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: COLORS.dark,
                lineHeight: '1',
                marginBottom: '6px'
              }}>
                {insight.secondaryValue}
              </div>
              <div style={{ 
                fontSize: '11px', 
                color: COLORS.gray,
                textTransform: 'uppercase',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>
                {insight.secondaryLabel}
              </div>
            </div>
          </div>

          {/* Stock Fill Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '11px', color: COLORS.gray, fontWeight: '600', textTransform: 'uppercase' }}>
                Stock Level
              </div>
              <div style={{ fontSize: '13px', color: COLORS.dark, fontWeight: '700' }}>
                {insight.fill}%
              </div>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: COLORS.bg,
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: `${insight.fill}%`, 
                height: '100%', 
                backgroundColor: insight.color,
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Recommendation */}
          <div style={{ 
            padding: '14px',
            backgroundColor: insight.bgColor,
            borderRadius: '8px',
            borderLeft: `4px solid ${insight.color}`
          }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600',
              color: COLORS.gray,
              marginBottom: '6px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Recommendation
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: COLORS.dark,
              lineHeight: '1.5',
              fontWeight: '500'
            }}>
              {insight.recommendation}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ENHANCED Date Filter UI
const DatePresets: React.FC<{
  onSelectPreset: (start: string, end: string) => void;
  currentStart: string;
  currentEnd: string;
}> = ({ onSelectPreset, currentStart, currentEnd }) => {
  const presets = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'This Month', days: 'month' as const },
    { label: 'Last Month', days: 'lastMonth' as const },
    { label: 'This Year', days: 'year' as const },
  ];

  const handlePreset = (preset: typeof presets[0]) => {
    const end = new Date();
    let start: Date;

    if (preset.days === 'year') {
      start = new Date(end.getFullYear(), 0, 1);
    } else if (preset.days === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (preset.days === 'lastMonth') {
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end.setDate(0);
    } else {
      start = new Date();
      start.setDate(start.getDate() - preset.days);
    }

    onSelectPreset(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
  };

  const isActive = (preset: typeof presets[0]) => {
    const end = new Date();
    let start: Date;

    if (preset.days === 'year') {
      start = new Date(end.getFullYear(), 0, 1);
    } else if (preset.days === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (preset.days === 'lastMonth') {
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end.setDate(0);
    } else {
      start = new Date();
      start.setDate(start.getDate() - preset.days);
    }

    return currentStart === start.toISOString().slice(0, 10) && 
           currentEnd === end.toISOString().slice(0, 10);
  };

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {presets.map(preset => {
        const active = isActive(preset);
        return (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset)}
            style={{
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: '600',
              color: active ? COLORS.white : COLORS.primary,
              backgroundColor: active ? COLORS.primary : COLORS.primary + '10',
              border: `1px solid ${COLORS.primary}${active ? '' : '30'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = COLORS.primary + '20';
              }
            }}
            onMouseLeave={(e) => {
              if (!active) {
                e.currentTarget.style.backgroundColor = COLORS.primary + '10';
              }
            }}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
};

// ANIMATED FILTER PANEL
const AnimatedFilterPanel: React.FC<{
  isOpen: boolean;
  categories: Category[];
  items: Item[];
  dateRange: { start: string; end: string };
  selectedCategory: number | null;
  selectedItems: number[];
  onCategoryChange: (id: number | null) => void;
  onItemsChange: (ids: number[]) => void;
  onDateChange: (range: { start: string; end: string }) => void;
  onClose: () => void;
}> = ({ isOpen, categories, items, dateRange, selectedCategory, selectedItems, onCategoryChange, onItemsChange, onDateChange, onClose }) => {
  const filteredItems = items.filter(item => 
    selectedCategory ? item.categoryId === selectedCategory : true
  );

  if (!isOpen) return null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        width: '480px',
        maxHeight: 'calc(100vh - 100px)',
        backgroundColor: COLORS.white,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        zIndex: 999,
        overflowY: 'auto',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from { 
              opacity: 0;
              transform: translateX(20px);
            }
            to { 
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes slideDown {
            from { 
              opacity: 0;
              transform: translateY(-10px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: `2px solid ${COLORS.border}`
        }}>
          <div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '800', 
              color: COLORS.dark, 
              margin: 0,
              marginBottom: '4px'
            }}>
              🎯 Filters
            </h3>
            <p style={{ fontSize: '13px', color: COLORS.gray, margin: 0 }}>
              Customize your analytics view
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.bg,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.danger + '15';
              e.currentTarget.style.borderColor = COLORS.danger;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.bg;
              e.currentTarget.style.borderColor = COLORS.border;
            }}
          >
            <X size={18} color={COLORS.gray} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <label style={{ 
              fontSize: '13px', 
              fontWeight: '700', 
              color: COLORS.dark, 
              marginBottom: '12px', 
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Calendar size={16} color={COLORS.primary} />
              Date Range
            </label>
            <DatePresets 
              onSelectPreset={(start, end) => onDateChange({ start, end })} 
              currentStart={dateRange.start}
              currentEnd={dateRange.end}
            />
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px', 
              marginTop: '12px'
            }}>
              <div>
                <label style={{ 
                  fontSize: '11px', 
                  color: COLORS.gray, 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  From
                </label>
                <input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={(e) => onDateChange({ ...dateRange, start: e.target.value })} 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: `2px solid ${COLORS.border}`, 
                    borderRadius: '10px', 
                    fontSize: '13px', 
                    backgroundColor: COLORS.white,
                    fontWeight: '500',
                    transition: 'border-color 0.2s'
                  }} 
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                  }}
                />
              </div>
              <div>
                <label style={{ 
                  fontSize: '11px', 
                  color: COLORS.gray, 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  To
                </label>
                <input 
                  type="date" 
                  value={dateRange.end} 
                  onChange={(e) => onDateChange({ ...dateRange, end: e.target.value })} 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: `2px solid ${COLORS.border}`, 
                    borderRadius: '10px', 
                    fontSize: '13px', 
                    backgroundColor: COLORS.white,
                    fontWeight: '500',
                    transition: 'border-color 0.2s'
                  }} 
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = COLORS.border;
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ 
              fontSize: '13px', 
              fontWeight: '700', 
              color: COLORS.dark, 
              marginBottom: '10px', 
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Filter size={16} color={COLORS.primary} />
              Category
            </label>
            <select 
              value={selectedCategory || ''} 
              onChange={(e) => { 
                onCategoryChange(e.target.value ? Number(e.target.value) : null); 
                onItemsChange([]);
              }} 
              style={{ 
                width: '100%', 
                padding: '14px 16px', 
                backgroundColor: COLORS.white, 
                border: `2px solid ${COLORS.border}`, 
                borderRadius: '10px', 
                fontSize: '14px', 
                color: COLORS.dark, 
                cursor: 'pointer', 
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = COLORS.primary;
                e.currentTarget.style.backgroundColor = COLORS.bg;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.backgroundColor = COLORS.white;
              }}
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <div style={{ animation: 'slideDown 0.3s ease-out' }}>
              <label style={{ 
                fontSize: '13px', 
                fontWeight: '700', 
                color: COLORS.dark, 
                marginBottom: '10px', 
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Package size={16} color={COLORS.primary} />
                Specific Items
                <span style={{ 
                  fontSize: '11px', 
                  color: COLORS.gray, 
                  fontWeight: '500',
                  marginLeft: 'auto'
                }}>
                  {selectedItems.length} / {filteredItems.length} selected
                </span>
              </label>
              
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '10px'
              }}>
                <button
                  onClick={() => onItemsChange(filteredItems.map(i => i.id))}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: COLORS.primary,
                    backgroundColor: COLORS.primary + '10',
                    border: `1px solid ${COLORS.primary}30`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primary + '20';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primary + '10';
                  }}
                >
                  Select All
                </button>
                <button
                  onClick={() => onItemsChange([])}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: COLORS.gray,
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.border;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.bg;
                  }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ 
                padding: '12px', 
                backgroundColor: COLORS.bg, 
                border: `2px solid ${COLORS.border}`, 
                borderRadius: '10px', 
                maxHeight: '300px', 
                overflowY: 'auto'
              }}>
                {filteredItems.length === 0 ? (
                  <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: COLORS.gray,
                    fontSize: '13px'
                  }}>
                    No items in this category
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <label 
                      key={item.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '10px', 
                        cursor: 'pointer', 
                        fontSize: '13px', 
                        fontWeight: '500', 
                        color: COLORS.dark,
                        borderRadius: '8px',
                        transition: 'background-color 0.2s',
                        marginBottom: '4px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.white;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(item.id)} 
                        onChange={() => { 
                          if (selectedItems.includes(item.id)) { 
                            onItemsChange(selectedItems.filter(id => id !== item.id)); 
                          } else { 
                            onItemsChange([...selectedItems, item.id]); 
                          } 
                        }} 
                        style={{ 
                          width: '18px', 
                          height: '18px', 
                          cursor: 'pointer',
                          accentColor: COLORS.primary
                        }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div>{item.itemName}</div>
                        {item.avgDailyConsumption && (
                          <div style={{ 
                            fontSize: '11px', 
                            color: COLORS.gray,
                            marginTop: '2px'
                          }}>
                            {Number(item.avgDailyConsumption).toFixed(1)} units/day
                          </div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              onCategoryChange(null);
              onItemsChange([]);
              onDateChange({ start: '2025-01-01', end: '2025-07-31' });
            }}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              fontWeight: '700',
              color: COLORS.white,
              backgroundColor: COLORS.gray,
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.dark;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.gray;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <RefreshCw size={16} />
            Reset All Filters
          </button>
        </div>
      </div>
    </>
  );
};

const ActiveFilterChips: React.FC<{
  dateRange: { start: string; end: string };
  selectedCategory: number | null;
  selectedItems: number[];
  categories: Category[];
  onCategoryChange: (id: number | null) => void;
  onItemsChange: (ids: number[]) => void;
}> = ({ dateRange, selectedCategory, selectedItems, categories, onCategoryChange, onItemsChange }) => {
  const categoryName = categories.find(c => c.id === selectedCategory)?.categoryName;
  
  const getDaysCount = () => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDateRangeLabel = () => {
    const days = getDaysCount();
    if (days === 7) return 'Last 7 days';
    if (days === 30) return 'Last 30 days';
    if (days === 90) return 'Last 90 days';
    
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    return `${start.toLocaleDateString('en', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })} (${days} days)`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: COLORS.info + '15', border: `1px solid ${COLORS.info}40`, borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: COLORS.info }}>
        <Calendar size={14} />
        {getDateRangeLabel()}
      </div>

      {selectedCategory && categoryName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: COLORS.primary + '15', border: `1px solid ${COLORS.primary}40`, borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: COLORS.primary }}>
          <Filter size={14} />
          {categoryName}
          <button onClick={() => { onCategoryChange(null); onItemsChange([]); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: COLORS.primary }}>
            <X size={14} />
          </button>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: COLORS.secondary + '15', border: `1px solid ${COLORS.secondary}40`, borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: COLORS.secondary }}>
          <Package size={14} />
          {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
          <button onClick={() => onItemsChange([])} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: COLORS.secondary }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

// Enhanced metric card showing specific item details
const EnhancedMetricCard: React.FC<{
  icon: React.ElementType;
  iconColor: string;
  label: string;
  itemName: string;
  category: string;
  value: string;
  subtext: string;
}> = ({ icon: Icon, iconColor, label, itemName, category, value, subtext }) => {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: iconColor + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} color={iconColor} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: COLORS.gray, fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: COLORS.dark, marginBottom: '2px' }}>
            {itemName}
          </div>
          <div style={{ fontSize: '11px', color: COLORS.gray, marginBottom: '6px' }}>
            {category}
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: iconColor, marginBottom: '4px' }}>
            {value}
          </div>
          <div style={{ fontSize: '11px', color: COLORS.gray }}>
            {subtext}
          </div>
        </div>
      </div>
    </Card>
  );
};

const ConsumptionChart: React.FC<{
  categories: Category[];
  items: Item[];
  dateRange: { start: string; end: string };
  selectedCategory: number | null;
  selectedItems: number[];
}> = ({ categories, items, dateRange, selectedCategory, selectedItems }) => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    
    try {
      const dateMap = new Map<string, number>();
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      console.log('📊 Chart filtering:', {
        dateRange,
        selectedCategory,
        selectedItems: selectedItems.length,
        totalItems: items.length
      });

      let filteredItems = items;
      
      if (selectedCategory) {
        filteredItems = filteredItems.filter(item => item.categoryId === selectedCategory);
        console.log('  After category filter:', filteredItems.length, 'items');
      }
      
      if (selectedItems.length > 0) {
        filteredItems = filteredItems.filter(item => selectedItems.includes(item.id));
        console.log('  After item filter:', filteredItems.length, 'items');
      }

      filteredItems.forEach(item => {
        const records = (item.consumptionRecords || []) as any[];
        
        records.forEach((record: any) => {
          const recordDate = new Date(record.date);
          
          if (recordDate >= startDate && recordDate <= endDate) {
            const dateKey = record.date.slice(0, 10);
            const consumption = Number(record.consumedQuantity || 0);
            
            dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + consumption);
          }
        });
      });

      const processed: any[] = [];
      dateMap.forEach((consumption, date) => {
        processed.push({ date, consumption });
      });
      processed.sort((a, b) => a.date.localeCompare(b.date));
      
      console.log('  Chart data points:', processed.length);
      setChartData(processed);
      
    } catch (error) {
      console.error('Chart processing error:', error);
    } finally {
      setLoading(false);
    }
  }, [items, dateRange, selectedCategory, selectedItems]);

  const total = chartData.reduce((sum, item) => sum + item.consumption, 0);
  const avg = chartData.length > 0 ? total / chartData.length : 0;

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: COLORS.dark, margin: 0, marginBottom: '2px' }}>
              Consumption Trends
            </h3>
            <p style={{ fontSize: '12px', color: COLORS.gray, margin: 0 }}>
              Daily usage patterns over time
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: COLORS.gray, fontWeight: '600', marginBottom: '2px' }}>TOTAL</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.dark }}>{total.toLocaleString()}</div>
            </div>
            <div style={{ width: '1px', backgroundColor: COLORS.border }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: COLORS.gray, fontWeight: '600', marginBottom: '2px' }}>AVG/DAY</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.primary }}>{Math.round(avg).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.gray }}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : chartData.length === 0 ? (
        <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.gray, fontSize: '13px' }}>
          No data available for selected items
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: COLORS.gray }} tickFormatter={(value) => { const date = new Date(value); return `${date.getMonth() + 1}/${date.getDate()}`; }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: COLORS.gray }} />
            <Tooltip content={<CleanTooltip />} />
            <Bar dataKey="consumption" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="consumption" stroke={COLORS.primary} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};



const ConsumptionInventory: React.FC = () => {
   const { data: categoriesData = [], loading: categoriesLoading } = useCategories();
  const { data: itemsData = [], loading: itemsLoading } = useItems();
  
  const categories = (categoriesData || []) as Category[];
  const items = (itemsData || []) as Item[];
  
  const [dateRange, setDateRange] = useState({ start: '2025-01-01', end: '2025-07-31' });
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowFilters(false);
        setShowHeatmap(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Calculate top metrics
  const topMetrics = useMemo(() => {
    if (!items || items.length === 0) {
      return {
        topConsumed: null,
        fastMoving: null,
        slowMoving: null,
        lowCategory: null
      };
    }

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    const storiesData = items.map(item => {
      const records = (item.consumptionRecords || []) as any[];
      const periodRecords = records.filter((r: any) => {
        const recordDate = new Date(r.date);
        return recordDate >= startDate && recordDate <= endDate;
      });

      const totalConsumed = periodRecords.reduce((sum: number, r: any) => 
        sum + Number(r.consumedQuantity || 0), 0
      );

      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
      const avgDaily = totalConsumed / daysDiff;
      
      return {
        item,
        avgDaily,
        totalConsumed,
        category: categories.find(c => c.id === item.categoryId)?.categoryName || 'Unknown',
        categoryId: item.categoryId
      };
    }).filter(d => d.totalConsumed > 0);

    // Top consumed item
    const topConsumed = [...storiesData].sort((a, b) => b.totalConsumed - a.totalConsumed)[0];

    // Fast moving (>5 units/day)
    const fastMoving = [...storiesData].filter(d => d.avgDaily > 5).sort((a, b) => b.avgDaily - a.avgDaily)[0];

    // Slow moving (≤2 units/day)
    const slowMoving = [...storiesData].filter(d => d.avgDaily > 0 && d.avgDaily <= 2).sort((a, b) => a.avgDaily - b.avgDaily)[0];

    // Low consumed category
    const categoryConsumption = new Map<number, { name: string; daily: number; total: number }>();
    storiesData.forEach(item => {
      const existing = categoryConsumption.get(item.categoryId) || { name: item.category, daily: 0, total: 0 };
      existing.daily += item.avgDaily;
      existing.total += item.totalConsumed;
      categoryConsumption.set(item.categoryId, existing);
    });
    const lowCategory = Array.from(categoryConsumption.values()).sort((a, b) => a.daily - b.daily)[0];

    return {
      topConsumed: topConsumed ? {
        itemName: topConsumed.item.itemName,
        category: topConsumed.category,
        value: topConsumed.totalConsumed.toLocaleString(),
        subtext: `${topConsumed.avgDaily.toFixed(1)} units per day`
      } : null,
      fastMoving: fastMoving ? {
        itemName: fastMoving.item.itemName,
        category: fastMoving.category,
        value: fastMoving.avgDaily.toFixed(1),
        subtext: `${fastMoving.totalConsumed.toLocaleString()} total consumed`
      } : null,
      slowMoving: slowMoving ? {
        itemName: slowMoving.item.itemName,
        category: slowMoving.category,
        value: slowMoving.avgDaily.toFixed(1),
        subtext: `${slowMoving.totalConsumed.toLocaleString()} total consumed`
      } : null,
      lowCategory: lowCategory ? {
        itemName: lowCategory.name,
        category: 'Category-level',
        value: lowCategory.daily.toFixed(1),
        subtext: `${lowCategory.total.toLocaleString()} total consumed`
      } : null
    };
  }, [items, categories, dateRange]);

  const loading = categoriesLoading || itemsLoading;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg, padding: '20px' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: COLORS.dark, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
            Inventory Analytics
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.gray, margin: 0 }}>
            Real-time consumption insights and stock intelligence
          </p>
        </div>

        {loading ? (
          <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.gray }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              {topMetrics.topConsumed && (
                <EnhancedMetricCard 
                  icon={Zap} 
                  iconColor={COLORS.warning} 
                  label="TOP CONSUMED ITEM" 
                  itemName={topMetrics.topConsumed.itemName}
                  category={topMetrics.topConsumed.category}
                  value={topMetrics.topConsumed.value}
                  subtext={topMetrics.topConsumed.subtext}
                />
              )}
              {topMetrics.fastMoving && (
                <EnhancedMetricCard 
                  icon={TrendingUp} 
                  iconColor={COLORS.success} 
                  label="FAST MOVING ITEM" 
                  itemName={topMetrics.fastMoving.itemName}
                  category={topMetrics.fastMoving.category}
                  value={`${topMetrics.fastMoving.value} /day`}
                  subtext={topMetrics.fastMoving.subtext}
                />
              )}
              {topMetrics.slowMoving && (
                <EnhancedMetricCard 
                  icon={TrendingDown} 
                  iconColor={COLORS.info} 
                  label="SLOW MOVING ITEM" 
                  itemName={topMetrics.slowMoving.itemName}
                  category={topMetrics.slowMoving.category}
                  value={`${topMetrics.slowMoving.value} /day`}
                  subtext={topMetrics.slowMoving.subtext}
                />
              )}
              {topMetrics.lowCategory && (
                <EnhancedMetricCard 
                  icon={Package} 
                  iconColor={COLORS.secondary} 
                  label="LOW CONSUMED CATEGORY" 
                  itemName={topMetrics.lowCategory.itemName}
                  category={topMetrics.lowCategory.category}
                  value={`${topMetrics.lowCategory.value} /day`}
                  subtext={topMetrics.lowCategory.subtext}
                />
              )}
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <ActiveFilterChips dateRange={dateRange} selectedCategory={selectedCategory} selectedItems={selectedItems} categories={categories} onCategoryChange={setSelectedCategory} onItemsChange={setSelectedItems} />
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => {
                    console.log('🔥 Heatmap button clicked');
                    setShowHeatmap(!showHeatmap);
                  }} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '10px 16px', 
                    backgroundColor: showHeatmap ? COLORS.success : COLORS.white, 
                    border: `2px solid ${showHeatmap ? COLORS.success : COLORS.border}`, 
                    borderRadius: '10px', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: showHeatmap ? COLORS.white : COLORS.dark, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: showHeatmap ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                >
                  <Activity size={16} />
                  Heatmap
                </button>
                <button 
                  onClick={() => setShowFilters(!showFilters)} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '10px 16px', 
                    backgroundColor: showFilters ? COLORS.primary : COLORS.white, 
                    border: `2px solid ${showFilters ? COLORS.primary : COLORS.border}`, 
                    borderRadius: '10px', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: showFilters ? COLORS.white : COLORS.dark, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: showFilters ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                  }}
                >
                  <Filter size={16} />
                  Filters
                  <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <ConsumptionChart categories={categories} items={items} dateRange={dateRange} selectedCategory={selectedCategory} selectedItems={selectedItems} />
            </div>

            <div>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: COLORS.dark, margin: '0 0 2px 0' }}>
                  Smart Insights
                </h2>
                <p style={{ fontSize: '12px', color: COLORS.gray, margin: 0 }}>
                  Real-time recommendations based on consumption patterns
                </p>
              </div>
              
              <SmartInsightsFeed items={items} categories={categories} dateRange={dateRange} />
            </div>

            <div style={{ marginTop: '20px' }}>
              <CoreInventoryTable items={items} categories={categories} initialRows={6} dateRange={dateRange} />
            </div>
          </>
        )}
      </div>

      <AnimatedFilterPanel
        isOpen={showFilters}
        categories={categories}
        items={items}
        dateRange={dateRange}
        selectedCategory={selectedCategory}
        selectedItems={selectedItems}
        onCategoryChange={setSelectedCategory}
        onItemsChange={setSelectedItems}
        onDateChange={setDateRange}
        onClose={() => setShowFilters(false)}
      />

      <HeatmapRightPanel
        isOpen={showHeatmap}
        items={items}
        categories={categories}
        dateRange={dateRange}
        selectedCategory={selectedCategory}
        selectedItems={selectedItems}
        onClose={() => setShowHeatmap(false)}
      />
    </div>
  );
};

export default ConsumptionInventory;

/* New component — CoreInventoryTable */
const CoreInventoryTable: React.FC<{
  items: Item[];
  categories: Category[];
  initialRows?: number;
  dateRange: { start: string; end: string };
}> = ({ items, categories, initialRows = 5, dateRange }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? items : items.slice(0, initialRows);

  const computeAvgDaily = (item: Item) => {
    const records = (item.consumptionRecords || []) as any[];
    if (records.length === 0) return 0;
    // use last 30 days or available range
    const last30 = records.slice(-30);
    const total = last30.reduce((s, r) => s + Number(r.consumedQuantity || 0), 0);
    return +(total / Math.max(1, last30.length)).toFixed(1);
  };

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: COLORS.dark, margin: 0 }}>Core Inventory</h3>
          <div style={{ fontSize: 12, color: COLORS.gray }}>{items.length} items</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: COLORS.gray }}>{expanded ? 'Showing all' : `Showing ${visibleItems.length}`}</div>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: '8px 12px',
              backgroundColor: expanded ? COLORS.primary : COLORS.white,
              color: expanded ? COLORS.white : COLORS.dark,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700
            }}
          >
            {expanded ? 'Show less' : `Show all (${items.length})`}
          </button>
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: COLORS.gray, fontSize: 12 }}>
              <th style={{ padding: '10px 8px' }}>Item</th>
              <th style={{ padding: '10px 8px' }}>Category</th>
              <th style={{ padding: '10px 8px', textAlign: 'right' }}>Current Stock</th>
              <th style={{ padding: '10px 8px', textAlign: 'right' }}>Avg /day</th>
              <th style={{ padding: '10px 8px', textAlign: 'right' }}>Days Coverage</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((it) => {
              const avg = computeAvgDaily(it);
              const current = Number(it.currentQuantity || it.closingStock || 0);
              const coverage = avg > 0 ? Math.floor(current / avg) : Infinity;
              const categoryName = categories.find(c => c.id === it.categoryId)?.categoryName || 'Unknown';

              return (
                <tr key={it.id} style={{ borderTop: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px 8px', verticalAlign: 'middle' }}>
                    <div style={{ fontWeight: 700, color: COLORS.dark }}>{it.itemName}</div>
                    {it.itemCode && <div style={{ fontSize: 11, color: COLORS.gray }}>{it.itemCode}</div>}
                  </td>
                  <td style={{ padding: '12px 8px', verticalAlign: 'middle', color: COLORS.gray }}>{categoryName}</td>
                  <td style={{ padding: '12px 8px', verticalAlign: 'middle', textAlign: 'right', fontWeight: 700 }}>{current.toLocaleString()}</td>
                  <td style={{ padding: '12px 8px', verticalAlign: 'middle', textAlign: 'right' }}>{avg}</td>
                  <td style={{ padding: '12px 8px', verticalAlign: 'middle', textAlign: 'right', color: coverage <= 7 ? COLORS.danger : COLORS.dark }}>
                    {coverage === Infinity ? '∞' : `${coverage}d`}
                  </td>
                </tr>
              );
            })}

            {visibleItems.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: COLORS.gray }}>
                  No items to display
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};