import React, { useState, useCallback, useMemo } from 'react';
import { 
  Settings, 
  Plus, 
  X, 
  GripVertical, 
  Eye, 
  EyeOff,
  BarChart3,
  Clock,
  TrendingUp,
  Users,
  Activity,
  LineChart as LineChartIcon,
  Save,
  RotateCcw,
  Filter,
  Calendar,
  ChevronDown,
  Sliders,
  Download,
  Share2,
  Maximize2,
  PieChart as PieChartIcon,
  Target,
  Zap
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { useCafeteriaData, useAllRecords } from '../api/hooks/useCafeteriaData';
import { useSmartInsights, usePeakDaysAnalysis } from '../api/hooks/useCafeteriaAnalytics';

// Widget type definitions
type WidgetType = 
  | 'live-counters' 
  | 'total-queue' 
  | 'avg-wait-time' 
  | 'peak-hours-mini'
  | 'traffic-trend'
  | 'session-breakdown'
  | 'throughput-gauge'
  | 'alerts-feed'
  | 'custom-chart';

type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar';

interface ChartConfig {
  type: ChartType;
  dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'custom';
  customFrom?: string;
  customTo?: string;
  selectedCounters: string[];
  interval: number;
  showLegend: boolean;
  showGrid: boolean;
}

interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large' | 'full';
  visible: boolean;
  order: number;
  chartConfig?: ChartConfig;
}

interface DashboardConfig {
  widgets: Widget[];
  layout: 'grid' | 'masonry';
}

// Available widget templates
const WIDGET_TEMPLATES: { 
  type: WidgetType; 
  title: string; 
  icon: any; 
  defaultSize: Widget['size']; 
  description: string;
  category: 'metrics' | 'analytics' | 'live';
  customizable: boolean;
}[] = [
  { 
    type: 'live-counters', 
    title: 'Live Counter Status', 
    icon: Users, 
    defaultSize: 'large',
    description: 'Real-time queue counts for all counters',
    category: 'live',
    customizable: false
  },
  { 
    type: 'total-queue', 
    title: 'Total Queue Count', 
    icon: Activity, 
    defaultSize: 'small',
    description: 'Current total people in all queues',
    category: 'metrics',
    customizable: false
  },
  { 
    type: 'avg-wait-time', 
    title: 'Average Wait Time', 
    icon: Clock, 
    defaultSize: 'small',
    description: 'Current average wait across counters',
    category: 'metrics',
    customizable: false
  },
  { 
    type: 'peak-hours-mini', 
    title: 'Today\'s Peak Hours', 
    icon: TrendingUp, 
    defaultSize: 'medium',
    description: 'Busiest times identified today',
    category: 'analytics',
    customizable: false
  },
  { 
    type: 'traffic-trend', 
    title: 'Traffic Trend', 
    icon: LineChartIcon, 
    defaultSize: 'medium',
    description: 'Customizable traffic patterns with filters',
    category: 'analytics',
    customizable: true
  },
  { 
    type: 'session-breakdown', 
    title: 'Session Breakdown', 
    icon: BarChart3, 
    defaultSize: 'medium',
    description: 'Queue distribution by meal session',
    category: 'analytics',
    customizable: true
  },
  { 
    type: 'throughput-gauge', 
    title: 'Throughput Rate', 
    icon: Zap, 
    defaultSize: 'small',
    description: 'Current service rate (people/min)',
    category: 'metrics',
    customizable: false
  },
  { 
    type: 'alerts-feed', 
    title: 'Active Alerts', 
    icon: Activity, 
    defaultSize: 'medium',
    description: 'Current warnings and notifications',
    category: 'live',
    customizable: false
  },
  {
    type: 'custom-chart',
    title: 'Custom Chart',
    icon: BarChart3,
    defaultSize: 'large',
    description: 'Fully customizable chart with advanced filters',
    category: 'analytics',
    customizable: true
  }
];

const COLORS = {
  TwoGood: '#5B8FF9',
  UttarDakshin: '#9E77ED',
  Tandoor: '#F97316'
};

// Chart Customization Modal
const ChartCustomizationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  config: ChartConfig;
  onSave: (config: ChartConfig) => void;
}> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<ChartConfig>(config);

  if (!isOpen) return null;

  const counterOptions = [
    { value: 'TwoGood', label: 'Two Good', color: COLORS.TwoGood },
    { value: 'UttarDakshin', label: 'Uttar Dakshin', color: COLORS.UttarDakshin },
    { value: 'Tandoor', label: 'Tandoor', color: COLORS.Tandoor }
  ];

  const toggleCounter = (counter: string) => {
    const newCounters = localConfig.selectedCounters.includes(counter)
      ? localConfig.selectedCounters.filter(c => c !== counter)
      : [...localConfig.selectedCounters, counter];
    setLocalConfig({ ...localConfig, selectedCounters: newCounters });
  };

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 1500,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
        borderRadius: 20,
        padding: 32,
        maxWidth: 600,
        width: '90%',
        maxHeight: '85vh',
        overflowY: 'auto',
        zIndex: 1501,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '2px solid rgba(99, 102, 241, 0.1)',
        animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 4 }}>
              Chart Customization
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280' }}>
              Customize your chart display and filters
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 10,
              background: '#F3F4F6',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
          >
            <X size={20} color="#6B7280" />
          </button>
        </div>

        {/* Chart Type Selection */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Chart Type
          </label>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {(['line', 'bar', 'area', 'pie', 'radar'] as ChartType[]).map((type) => {
              const icons = {
                line: LineChartIcon,
                bar: BarChart3,
                area: TrendingUp,
                pie: PieChartIcon,
                radar: Target
              };
              const Icon = icons[type];
              const isSelected = localConfig.type === type;

              return (
                <button
                  key={type}
                  onClick={() => setLocalConfig({ ...localConfig, type })}
                  style={{
                    padding: '12px 20px',
                    background: isSelected ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#6B7280',
                    border: isSelected ? 'none' : '2px solid #E5E7EB',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.2s',
                    textTransform: 'capitalize',
                    boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#F9FAFB';
                      e.currentTarget.style.borderColor = '#6366F1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                    }
                  }}
                >
                  <Icon size={18} />
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Selection */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Date Range
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {(['today', 'yesterday', 'week', 'month'] as const).map((range) => {
              const isSelected = localConfig.dateRange === range;
              return (
                <button
                  key={range}
                  onClick={() => setLocalConfig({ ...localConfig, dateRange: range })}
                  style={{
                    padding: '12px 16px',
                    background: isSelected ? '#EEF2FF' : '#FFFFFF',
                    color: isSelected ? '#6366F1' : '#6B7280',
                    border: `2px solid ${isSelected ? '#6366F1' : '#E5E7EB'}`,
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textTransform: 'capitalize'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#C7D2FE';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                    }
                  }}
                >
                  {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : range}
                </button>
              );
            })}
          </div>
        </div>

        {/* Counter Selection */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Counters to Display
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {counterOptions.map((counter) => {
              const isSelected = localConfig.selectedCounters.includes(counter.value);
              return (
                <div
                  key={counter.value}
                  onClick={() => toggleCounter(counter.value)}
                  style={{
                    padding: '14px 16px',
                    background: isSelected ? `${counter.color}15` : '#FFFFFF',
                    border: `2px solid ${isSelected ? counter.color : '#E5E7EB'}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = '#FFFFFF';
                    }
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 6,
                    border: `2px solid ${counter.color}`,
                    background: isSelected ? counter.color : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: counter.color
                  }} />
                  <span style={{ 
                    flex: 1, 
                    fontSize: 14,
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? counter.color : '#374151'
                  }}>
                    {counter.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interval Selection */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Data Interval (minutes)
          </label>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16,
            padding: '12px 16px',
            background: '#F9FAFB',
            borderRadius: 12,
            border: '2px solid #E5E7EB'
          }}>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={localConfig.interval}
              onChange={(e) => setLocalConfig({ ...localConfig, interval: parseInt(e.target.value) })}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                outline: 'none',
                background: 'linear-gradient(to right, #6366F1 0%, #8B5CF6 100%)',
                cursor: 'pointer'
              }}
            />
            <span style={{
              fontSize: 18,
              fontWeight: 700,
              color: '#6366F1',
              minWidth: 50,
              textAlign: 'center'
            }}>
              {localConfig.interval}
            </span>
          </div>
        </div>

        {/* Display Options */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Display Options
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: '#FFFFFF',
              border: '2px solid #E5E7EB',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={localConfig.showLegend}
                onChange={(e) => setLocalConfig({ ...localConfig, showLegend: e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Show Legend</span>
            </label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: '#FFFFFF',
              border: '2px solid #E5E7EB',
              borderRadius: 10,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                checked={localConfig.showGrid}
                onChange={(e) => setLocalConfig({ ...localConfig, showGrid: e.target.checked })}
                style={{ width: 18, height: 18, cursor: 'pointer' }}
              />
              <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>Show Grid Lines</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '14px',
              background: '#FFFFFF',
              border: '2px solid #E5E7EB',
              borderRadius: 12,
              color: '#6B7280',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#6366F1'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(localConfig);
              onClose();
            }}
            style={{
              flex: 1,
              padding: '14px',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              border: 'none',
              borderRadius: 12,
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
};

// Enhanced Custom Chart Widget
const CustomChartWidget: React.FC<{ config: ChartConfig }> = ({ config }) => {
  const getDateRange = () => {
    const now = new Date();
    let from: Date, to: Date;

    switch (config.dateRange) {
      case 'today':
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59);
        break;
      case 'yesterday': {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        from = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0);
        to = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59);
        break;
      }
      case 'week':
        from = new Date(now);
        from.setDate(from.getDate() - 7);
        from.setHours(0, 0, 0, 0);
        to = new Date(now);
        to.setHours(23, 59, 59, 999);
        break;
      case 'month':
        from = new Date(now);
        from.setDate(from.getDate() - 30);
        from.setHours(0, 0, 0, 0);
        to = new Date(now);
        to.setHours(23, 59, 59, 999);
        break;
      default:
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0);
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59);
    }

    return {
      from: from.toISOString().slice(0, 19),
      to: to.toISOString().slice(0, 19)
    };
  };

  const { from, to } = getDateRange();
  const { data, loading } = useAllRecords(from, to);

  const chartData = useMemo(() => {
    if (!data || !data.counters) return [];

    const timeMap = new Map<string, any>();
    const globalFrom = new Date(from);
    const globalTo = new Date(to);

    config.selectedCounters.forEach(counterName => {
      const records = data.counters[counterName];
      if (!Array.isArray(records)) return;

      records.forEach((record: any) => {
        const timestamp = new Date(record.timestamp);
        
        if (timestamp >= globalFrom && timestamp <= globalTo) {
          const hour = timestamp.getHours();
          const minutes = timestamp.getMinutes();
          const intervalMinutes = Math.floor(minutes / config.interval) * config.interval;
          const timeKey = `${hour.toString().padStart(2, '0')}:${intervalMinutes.toString().padStart(2, '0')}`;
          
          if (!timeMap.has(timeKey)) {
            timeMap.set(timeKey, {
              time: timeKey,
              TwoGood: 0,
              UttarDakshin: 0,
              Tandoor: 0,
              count: 0
            });
          }
          
          const entry = timeMap.get(timeKey);
          if (entry) {
            entry[counterName] = (entry[counterName] || 0) + (record.queueCount || 0);
            entry.count++;
          }
        }
      });
    });

    return Array.from(timeMap.entries())
      .map(([timeKey, entry]) => {
        const count = entry.count || 1;
        const result: any = { time: timeKey };
        config.selectedCounters.forEach(counter => {
          result[counter] = Math.round((entry[counter] || 0) / count);
        });
        return result;
      })
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [data, config, from, to]);

  if (loading) {
    return (
      <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>Loading chart data...</div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={{ height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Activity size={40} color="#D1D5DB" />
        <div style={{ fontSize: 14, color: '#9CA3AF', fontWeight: 500 }}>No data available</div>
      </div>
    );
  }

  const renderChart = () => {
    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 30, left: 0, bottom: 20 }
    };

    const renderLines = () => config.selectedCounters.map(counter => (
      <Line
        key={counter}
        type="monotone"
        dataKey={counter}
        stroke={COLORS[counter as keyof typeof COLORS]}
        strokeWidth={2.5}
        dot={false}
        activeDot={{ r: 4 }}
        name={counter}
      />
    ));

    const renderBars = () => config.selectedCounters.map(counter => (
      <Bar
        key={counter}
        dataKey={counter}
        fill={COLORS[counter as keyof typeof COLORS]}
        radius={[8, 8, 0, 0]}
        name={counter}
      />
    ));

    const renderAreas = () => config.selectedCounters.map(counter => (
      <Area
        key={counter}
        type="monotone"
        dataKey={counter}
        stroke={COLORS[counter as keyof typeof COLORS]}
        fill={`${COLORS[counter as keyof typeof COLORS]}40`}
        name={counter}
      />
    ));

    switch (config.type) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />}
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <Tooltip contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
            {config.showLegend && <Legend />}
            {renderLines()}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />}
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <Tooltip contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
            {config.showLegend && <Legend />}
            {renderBars()}
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {config.showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />}
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <Tooltip contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12 }} />
            {config.showLegend && <Legend />}
            {renderAreas()}
          </AreaChart>
        );

      case 'pie': {
        const pieData = config.selectedCounters.map(counter => ({
          name: counter,
          value: chartData.reduce((sum, item) => sum + (item[counter] || 0), 0),
          color: COLORS[counter as keyof typeof COLORS]
        }));
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        );
      }

      case 'radar': {
        const radarData = chartData.slice(0, 6).map(item => {
          const result: any = { time: item.time };
          config.selectedCounters.forEach(counter => {
            result[counter] = item[counter] || 0;
          });
          return result;
        });
        return (
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="time" />
            <PolarRadiusAxis />
            {config.selectedCounters.map(counter => (
              <Radar
                key={counter}
                name={counter}
                dataKey={counter}
                stroke={COLORS[counter as keyof typeof COLORS]}
                fill={COLORS[counter as keyof typeof COLORS]}
                fillOpacity={0.3}
              />
            ))}
            {config.showLegend && <Legend />}
          </RadarChart>
        );
      }

      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={250}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

// Other widget components (keeping them as before but with better styling)
const LiveCountersWidget: React.FC = () => {
  const { latestData, loading } = useCafeteriaData(true, 15000);
  
  if (loading || !latestData?.counters) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Object.entries(latestData.counters).map(([name, counter]: [string, any]) => (
        <div key={name} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 100%)',
          borderRadius: 12,
          border: '2px solid #E5E7EB',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = COLORS[name as keyof typeof COLORS] || '#6366F1';
          e.currentTarget.style.transform = 'translateX(4px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#E5E7EB';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{name}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: COLORS[name as keyof typeof COLORS] || '#6366F1' }}>
              {counter.queueCount}
            </span>
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>
              {counter.waitTimeText}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const TotalQueueWidget: React.FC = () => {
  const { latestData } = useCafeteriaData(true, 15000);
  
  const total = useMemo(() => {
    if (!latestData?.counters) return 0;
    return Object.values(latestData.counters).reduce((sum, c: any) => sum + (c?.queueCount || 0), 0);
  }, [latestData]);

  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ 
        fontSize: 56, 
        fontWeight: 900, 
        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 12
      }}>
        {total}
      </div>
      <div style={{ fontSize: 14, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
        Total in Queue
      </div>
    </div>
  );
};

const AvgWaitTimeWidget: React.FC = () => {
  const { latestData } = useCafeteriaData(true, 15000);
  
  const avgWait = useMemo(() => {
    if (!latestData?.counters) return 0;
    const counters = Object.values(latestData.counters);
    const total = counters.reduce((sum, c: any) => sum + (c?.waitTimeMinutes || 0), 0);
    return counters.length > 0 ? Math.round(total / counters.length) : 0;
  }, [latestData]);

  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ 
        fontSize: 56, 
        fontWeight: 900, 
        background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 12
      }}>
        {avgWait}
      </div>
      <div style={{ fontSize: 14, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
        Avg Wait (min)
      </div>
    </div>
  );
};

const PeakHoursMiniWidget: React.FC = () => {
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const { data: insights, loading } = useSmartInsights(today);

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ 
        fontSize: 40, 
        fontWeight: 900, 
        background: 'linear-gradient(135deg, #10B981, #3B82F6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 12
      }}>
        {insights?.peakHour?.hourFormatted || 'N/A'}
      </div>
      <div style={{ fontSize: 13, color: '#6B7280', fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Peak Hour Today
      </div>
      {insights?.peakHour && (
        <div style={{ 
          padding: '10px 16px',
          background: 'linear-gradient(135deg, #10B98120, #3B82F620)',
          borderRadius: 10,
          fontSize: 12,
          color: '#059669',
          fontWeight: 600
        }}>
          Avg: {Math.round(insights.peakHour.avgQueue || 0)} people
        </div>
      )}
    </div>
  );
};

const TrafficTrendWidget: React.FC = () => {
  const { data, loading } = usePeakDaysAnalysis(7);

  if (loading || !data?.peakDays) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#9CA3AF' }}>Loading...</div>;
  }

  const chartData = data.peakDays.map((day: any) => ({
    day: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    queue: day.avgQueue || 0
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorQueue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
        <Tooltip 
          contentStyle={{ 
            background: '#FFF', 
            border: '2px solid #E5E7EB', 
            borderRadius: 10,
            fontSize: 13,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }} 
        />
        <Area type="monotone" dataKey="queue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorQueue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const SessionBreakdownWidget: React.FC = () => {
  const { data: insights } = useSmartInsights();

  const sessionData = useMemo(() => {
    if (!insights?.counters) return [];
    
    return Object.entries(insights.counters).map(([name, stats]: [string, any]) => ({
      name,
      queue: Math.round(stats.avgQueue || 0),
      color: COLORS[name as keyof typeof COLORS] || '#6366F1'
    }));
  }, [insights]);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={sessionData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
        <Tooltip 
          contentStyle={{ 
            background: '#FFF', 
            border: '2px solid #E5E7EB', 
            borderRadius: 10,
            fontSize: 13,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }} 
        />
        {sessionData.map((entry, index) => (
          <Bar 
            key={index}
            dataKey="queue" 
            fill={entry.color}
            radius={[10, 10, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

const ThroughputGaugeWidget: React.FC = () => {
  const { data: insights } = useSmartInsights();
  
  const rate = insights?.throughput?.avgRate || 0;

  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ 
        fontSize: 56, 
        fontWeight: 900, 
        background: 'linear-gradient(135deg, #10B981, #06B6D4)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: 12
      }}>
        {rate.toFixed(1)}
      </div>
      <div style={{ fontSize: 14, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
        People/Minute
      </div>
    </div>
  );
};

const AlertsFeedWidget: React.FC = () => {
  const { alerts } = useCafeteriaData(true, 30000);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {alerts && alerts.length > 0 ? (
        alerts.slice(0, 3).map((alert: any, idx: number) => (
          <div key={idx} style={{
            padding: 14,
            background: 'linear-gradient(135deg, #FEF2F2 0%, #FFFFFF 100%)',
            border: '2px solid #FCA5A5',
            borderRadius: 12,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateX(4px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateX(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', marginBottom: 6 }}>
              {alert.counterName}
            </div>
            <div style={{ fontSize: 12, color: '#991B1B', fontWeight: 500 }}>
              {alert.message || 'Long wait time detected'}
            </div>
          </div>
        ))
      ) : (
        <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
          No active alerts
        </div>
      )}
    </div>
  );
};

const WidgetRenderer: React.FC<{ widget: Widget; onCustomize?: () => void }> = ({ widget, onCustomize }) => {
  const defaultConfig: ChartConfig = {
    type: 'line',
    dateRange: 'today',
    selectedCounters: ['TwoGood', 'UttarDakshin', 'Tandoor'],
    interval: 15,
    showLegend: true,
    showGrid: true
  };

  const config = widget.chartConfig || defaultConfig;

  switch (widget.type) {
    case 'live-counters': return <LiveCountersWidget />;
    case 'total-queue': return <TotalQueueWidget />;
    case 'avg-wait-time': return <AvgWaitTimeWidget />;
    case 'peak-hours-mini': return <PeakHoursMiniWidget />;
    case 'traffic-trend': return <TrafficTrendWidget />;
    case 'session-breakdown': return <SessionBreakdownWidget />;
    case 'throughput-gauge': return <ThroughputGaugeWidget />;
    case 'alerts-feed': return <AlertsFeedWidget />;
    case 'custom-chart': return <CustomChartWidget config={config} />;
    default: return <div>Unknown widget</div>;
  }
};

// Main Component
interface CustomizableDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomizableDashboard: React.FC<CustomizableDashboardProps> = ({ isOpen, onClose }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [config, setConfig] = useState<DashboardConfig>(() => {
    try {
      const saved = window.localStorage.getItem('cafeteria-custom-dashboard');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load config');
    }
    
    return {
      widgets: [
        { id: '1', type: 'total-queue', title: 'Total Queue Count', size: 'small', visible: true, order: 0 },
        { id: '2', type: 'avg-wait-time', title: 'Average Wait Time', size: 'small', visible: true, order: 1 },
        { id: '3', type: 'live-counters', title: 'Live Counter Status', size: 'large', visible: true, order: 2 },
        { id: '4', type: 'traffic-trend', title: 'Traffic Trend', size: 'medium', visible: true, order: 3 }
      ],
      layout: 'grid'
    };
  });
  
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [customizingWidget, setCustomizingWidget] = useState<string | null>(null);

  const saveConfig = useCallback((newConfig: DashboardConfig) => {
    try {
      window.localStorage.setItem('cafeteria-custom-dashboard', JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed to save config');
    }
    setConfig(newConfig);
  }, []);

  const visibleWidgets = useMemo(() => 
    config.widgets.filter(w => w.visible).sort((a, b) => a.order - b.order),
    [config.widgets]
  );

  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    const newConfig = {
      ...config,
      widgets: config.widgets.map(w => 
        w.id === widgetId ? { ...w, visible: !w.visible } : w
      )
    };
    saveConfig(newConfig);
  }, [config, saveConfig]);

  const addWidget = useCallback((type: WidgetType) => {
    const template = WIDGET_TEMPLATES.find(t => t.type === type);
    if (!template) return;

    const defaultChartConfig: ChartConfig = {
      type: 'line',
      dateRange: 'today',
      selectedCounters: ['TwoGood', 'UttarDakshin', 'Tandoor'],
      interval: 15,
      showLegend: true,
      showGrid: true
    };

    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      title: template.title,
      size: template.defaultSize,
      visible: true,
      order: config.widgets.length,
      chartConfig: template.customizable ? defaultChartConfig : undefined
    };

    saveConfig({ ...config, widgets: [...config.widgets, newWidget] });
    setShowAddWidget(false);
  }, [config, saveConfig]);

  const removeWidget = useCallback((widgetId: string) => {
    saveConfig({ ...config, widgets: config.widgets.filter(w => w.id !== widgetId) });
  }, [config, saveConfig]);

  const changeWidgetSize = useCallback((widgetId: string, size: Widget['size']) => {
    saveConfig({
      ...config,
      widgets: config.widgets.map(w => w.id === widgetId ? { ...w, size } : w)
    });
  }, [config, saveConfig]);

  const updateWidgetChartConfig = useCallback((widgetId: string, chartConfig: ChartConfig) => {
    saveConfig({
      ...config,
      widgets: config.widgets.map(w => w.id === widgetId ? { ...w, chartConfig } : w)
    });
  }, [config, saveConfig]);

  const handleDragStart = useCallback((widgetId: string) => {
    setDraggedWidget(widgetId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetWidgetId: string) => {
    e.preventDefault();
    if (!draggedWidget || draggedWidget === targetWidgetId) return;

    const draggedIndex = config.widgets.findIndex(w => w.id === draggedWidget);
    const targetIndex = config.widgets.findIndex(w => w.id === targetWidgetId);

    const newWidgets = [...config.widgets];
    const [removed] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, removed);

    const reorderedWidgets = newWidgets.map((w, index) => ({ ...w, order: index }));
    saveConfig({ ...config, widgets: reorderedWidgets });
  }, [draggedWidget, config, saveConfig]);

  const handleDragEnd = useCallback(() => {
    setDraggedWidget(null);
  }, []);

  const resetToDefault = useCallback(() => {
    const defaultConfig: DashboardConfig = {
      widgets: [
        { id: '1', type: 'total-queue', title: 'Total Queue Count', size: 'small', visible: true, order: 0 },
        { id: '2', type: 'avg-wait-time', title: 'Average Wait Time', size: 'small', visible: true, order: 1 },
        { id: '3', type: 'live-counters', title: 'Live Counter Status', size: 'large', visible: true, order: 2 }
      ],
      layout: 'grid'
    };
    saveConfig(defaultConfig);
  }, [saveConfig]);

  const getGridColumns = (size: Widget['size']) => {
    switch (size) {
      case 'small': return 'span 1';
      case 'medium': return 'span 2';
      case 'large': return 'span 3';
      case 'full': return '1 / -1';
      default: return 'span 1';
    }
  };

  const customizingWidgetData = customizingWidget 
    ? config.widgets.find(w => w.id === customizingWidget)
    : null;

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          animation: 'fadeIn 0.3s ease-out'
        }}
        onClick={onClose}
      />

      {/* Main Dashboard Panel from Bottom */}
      <div style={{
        position: 'fixed',
        bottom: isOpen ? 0 : '-100%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '95%',
        maxWidth: '1400px',
        height: '90vh',
        background: 'linear-gradient(135deg, #F9FAFB 0%, #FFFFFF 50%, #F9FAFB 100%)',
        boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.2)',
        zIndex: 999,
        transition: 'bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px 24px 0 0'
      }}>
        {/* Header */}
        <div style={{ 
          padding: '28px 32px',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
          borderBottom: '2px solid #E5E7EB',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
        }}>
          <div>
            <h1 style={{ 
              fontSize: 32, 
              fontWeight: 900, 
              color: '#111827', 
              marginBottom: 6,
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Custom Dashboard
            </h1>
            <p style={{ fontSize: 15, color: '#6B7280', fontWeight: 500 }}>
              Your personalized cafeteria analytics hub • {visibleWidgets.length} active widgets
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setIsPanelOpen(true)}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.4)';
              }}
            >
              <Settings size={18} />
              Customize
            </button>
            <button
              onClick={onClose}
              style={{
                padding: 12,
                background: '#F3F4F6',
                border: 'none',
                borderRadius: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#E5E7EB';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#F3F4F6';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              <X size={20} color="#6B7280" />
            </button>
          </div>
        </div>

        {/* Widget Grid */}
        <div style={{ flex: 1, padding: 32 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24
          }}>
            {visibleWidgets.map((widget) => {
              const template = WIDGET_TEMPLATES.find(t => t.type === widget.type);
              const isCustomizable = template?.customizable;

              return (
                <div
                  key={widget.id}
                  style={{
                    gridColumn: getGridColumns(widget.size),
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
                    border: '2px solid #E5E7EB',
                    borderRadius: 16,
                    padding: 24,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                      {widget.title}
                    </h3>
                    {isCustomizable && (
                      <button
                        onClick={() => setCustomizingWidget(widget.id)}
                        style={{
                          padding: 8,
                          background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
                          border: 'none',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #6366F1, #8B5CF6)';
                          const icon = e.currentTarget.querySelector('svg') as SVGElement;
                          if (icon) {
                            icon.style.color = '#FFFFFF';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #EEF2FF, #E0E7FF)';
                          const icon = e.currentTarget.querySelector('svg') as SVGElement;
                          if (icon) {
                            icon.style.color = '#6366F1';
                          }
                        }}
                      >
                        <Sliders size={16} color="#6366F1" />
                      </button>
                    )}
                  </div>
                  <WidgetRenderer widget={widget} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings Side Panel (opens from right of dashboard) */}
      {isPanelOpen && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1100,
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={() => setIsPanelOpen(false)}
          />

          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 480,
            height: '100vh',
            background: '#FFFFFF',
            boxShadow: '-8px 0 40px rgba(0, 0, 0, 0.2)',
            zIndex: 1101,
            overflowY: 'auto',
            animation: 'slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div style={{ padding: 28 }}>
              {/* Panel Header */}
              <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: '3px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111827' }}>
                    Dashboard Settings
                  </h2>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    style={{
                      padding: 10,
                      background: '#F3F4F6',
                      border: 'none',
                      borderRadius: 10,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#E5E7EB';
                      e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#F3F4F6';
                      e.currentTarget.style.transform = 'rotate(0deg)';
                    }}
                  >
                    <X size={20} color="#6B7280" />
                  </button>
                </div>
                <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>
                  Customize layout and manage widgets
                </p>
              </div>

              {/* Active Widgets */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>
                    Active Widgets
                  </h3>
                  <button
                    onClick={() => setShowAddWidget(true)}
                    style={{
                      padding: '10px 16px',
                      background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
                      border: 'none',
                      borderRadius: 10,
                      color: '#6366F1',
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #6366F1, #8B5CF6)';
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #EEF2FF, #E0E7FF)';
                      e.currentTarget.style.color = '#6366F1';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <Plus size={18} />
                    Add Widget
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {config.widgets.map((widget) => (
                    <div
                      key={widget.id}
                      draggable
                      onDragStart={() => handleDragStart(widget.id)}
                      onDragOver={(e) => handleDragOver(e, widget.id)}
                      onDragEnd={handleDragEnd}
                      style={{
                        padding: 16,
                        background: widget.visible ? 'linear-gradient(135deg, #FFFFFF, #F9FAFB)' : '#F3F4F6',
                        border: `2px solid ${widget.visible ? '#E5E7EB' : '#D1D5DB'}`,
                        borderRadius: 14,
                        cursor: 'grab',
                        opacity: draggedWidget === widget.id ? 0.5 : 1,
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <GripVertical size={20} color="#9CA3AF" />
                        <span style={{ 
                          flex: 1, 
                          fontSize: 15, 
                          fontWeight: 600, 
                          color: widget.visible ? '#111827' : '#9CA3AF' 
                        }}>
                          {widget.title}
                        </span>
                        <button
                          onClick={() => toggleWidgetVisibility(widget.id)}
                          style={{
                            padding: 8,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          {widget.visible ? <Eye size={20} color="#6366F1" /> : <EyeOff size={20} color="#9CA3AF" />}
                        </button>
                        <button
                          onClick={() => removeWidget(widget.id)}
                          style={{
                            padding: 8,
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <X size={20} color="#EF4444" />
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: 8, paddingLeft: 32 }}>
                        {(['small', 'medium', 'large', 'full'] as const).map((size) => (
                          <button
                            key={size}
                            onClick={() => changeWidgetSize(widget.id, size)}
                            style={{
                              padding: '8px 14px',
                              background: widget.size === size ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#F3F4F6',
                              color: widget.size === size ? '#FFFFFF' : '#6B7280',
                              border: 'none',
                              borderRadius: 8,
                              fontSize: 12,
                              fontWeight: 700,
                              cursor: 'pointer',
                              textTransform: 'capitalize',
                              transition: 'all 0.2s'
                            }}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={resetToDefault}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
                    border: 'none',
                    borderRadius: 12,
                    color: '#DC2626',
                    fontSize: 14,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #DC2626, #EF4444)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, #FEF2F2, #FEE2E2)';
                    e.currentTarget.style.color = '#DC2626';
                  }}
                >
                  <RotateCcw size={18} />
                  Reset
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Widget Modal */}
      {showAddWidget && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 1200,
              animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={() => setShowAddWidget(false)}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%)',
            borderRadius: 20,
            padding: 32,
            maxWidth: 700,
            width: '90%',
            maxHeight: '85vh',
            overflowY: 'auto',
            zIndex: 1201,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '2px solid rgba(99, 102, 241, 0.1)',
            animation: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: '#111827', marginBottom: 6 }}>
                  Add New Widget
                </h3>
                <p style={{ fontSize: 14, color: '#6B7280' }}>
                  Choose from our collection of analytics widgets
                </p>
              </div>
              <button
                onClick={() => setShowAddWidget(false)}
                style={{
                  padding: 10,
                  background: '#F3F4F6',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E5E7EB';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#F3F4F6';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                <X size={20} color="#6B7280" />
              </button>
            </div>

            {/* Widget Categories */}
            {(['live', 'metrics', 'analytics'] as const).map((category) => (
              <div key={category} style={{ marginBottom: 28 }}>
                <h4 style={{ 
                  fontSize: 14, 
                  fontWeight: 700, 
                  color: '#6B7280', 
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: 16 
                }}>
                  {category}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {WIDGET_TEMPLATES.filter(t => t.category === category).map((template) => {
                    const Icon = template.icon;
                    const alreadyAdded = config.widgets.some(w => w.type === template.type);
                    
                    return (
                      <button
                        key={template.type}
                        onClick={() => !alreadyAdded && addWidget(template.type)}
                        disabled={alreadyAdded}
                        style={{
                          padding: 18,
                          background: alreadyAdded ? '#F9FAFB' : 'linear-gradient(135deg, #FFFFFF, #F9FAFB)',
                          border: `2px solid ${alreadyAdded ? '#E5E7EB' : '#E5E7EB'}`,
                          borderRadius: 14,
                          cursor: alreadyAdded ? 'not-allowed' : 'pointer',
                          textAlign: 'left',
                          opacity: alreadyAdded ? 0.5 : 1,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          if (!alreadyAdded) {
                            e.currentTarget.style.borderColor = '#6366F1';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #EEF2FF, #E0E7FF)';
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!alreadyAdded) {
                            e.currentTarget.style.borderColor = '#E5E7EB';
                            e.currentTarget.style.background = 'linear-gradient(135deg, #FFFFFF, #F9FAFB)';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                          <div style={{
                            padding: 12,
                            background: alreadyAdded ? '#F3F4F6' : 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Icon size={24} color={alreadyAdded ? '#9CA3AF' : '#6366F1'} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                              <span style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>
                                {template.title}
                              </span>
                              {template.customizable && (
                                <span style={{
                                  padding: '3px 10px',
                                  background: 'linear-gradient(135deg, #10B981, #3B82F6)',
                                  color: '#FFFFFF',
                                  borderRadius: 6,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  Customizable
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.5 }}>
                              {template.description}
                            </div>
                            {alreadyAdded && (
                              <div style={{ 
                                fontSize: 13, 
                                color: '#9CA3AF', 
                                marginTop: 8,
                                fontStyle: 'italic',
                                fontWeight: 500
                              }}>
                                ✓ Already added to dashboard
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Chart Customization Modal */}
      {customizingWidget && customizingWidgetData && customizingWidgetData.chartConfig && (
        <ChartCustomizationModal
          isOpen={true}
          onClose={() => setCustomizingWidget(null)}
          config={customizingWidgetData.chartConfig}
          onSave={(newConfig) => {
            updateWidgetChartConfig(customizingWidget, newConfig);
            setCustomizingWidget(null);
          }}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translate(-50%, -45%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
};

export default CustomizableDashboard;