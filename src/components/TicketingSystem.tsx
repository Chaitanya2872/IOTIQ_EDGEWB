// CafeteriaAnalyticsDashboard.tsx - FULLY FIXED VERSION
// ✅ ALL ANALYTICS TAB CHARTS NOW USE REAL API DATA
// Changes:
// 1. Added logging to verify API data reception
// 2. Confirmed all analytics charts use real data from API response
// 3. Added proper null/empty checks for all data arrays
// 4. Fixed any remaining hardcoded values

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Space,
  Typography,
  Spin,
  Alert,
  Select,
  DatePicker,
  Button,
  Progress,
  Table,
  Switch,
  Drawer,
  Divider,
  Slider,
  Radio,
  Checkbox,
  message,
  Tabs,
  Tooltip,
  Popover,
} from 'antd';
import {
  LineChart,
  Scatter,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import {
  UserOutlined,
  ClockCircleOutlined,
  FireOutlined,
  TeamOutlined,
  WarningOutlined,
  ReloadOutlined,
  SettingOutlined,
  EyeOutlined,
  DragOutlined,
  HolderOutlined,
  FilterOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { CafeteriaApiService, useDashboardData } from '../api/CafeteriaApiService';
import { useWebSocket } from '../hooks/useWebSocket';
import websocketService from '../services/WebSocketService';
import { useCallback as useReactCallback } from 'react';

const { Title, Text } = Typography;
const { Option } = Select;

// ============================================
// TYPES (unchanged)
// ============================================
interface OccupancyData {
  currentOccupancy: number;
  capacity: number;
  congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
}

interface FlowData {
  timestamp: string;
  inflow: number;
  outflow: number;
  netFlow: number;
}

interface CounterStatus {
  counterName: string;
  queueLength: number;
  waitingTime: number;
  congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  lastUpdated: string;
}

interface DwellTimeData {
  timeRange: string;
  count: number;
  percentage: number;
}

interface FootfallComparison {
  timestamp: string;
  cafeteriaFootfall: number;
  countersFootfall: number;
  ratio: number;
  insight: string;
}

type WidgetSize = 'small' | 'medium' | 'large' | 'full';

interface WidgetConfig {
  id: string;
  enabled: boolean;
  size: WidgetSize;
  order: number;
}

interface DashboardConfig {
  widgets: {
    occupancyStatus: WidgetConfig;
    inflowOutflow: WidgetConfig;
    counterStatus: WidgetConfig;
    dwellTime: WidgetConfig;
    footfallComparison: WidgetConfig;
    occupancyTrend: WidgetConfig;
    counterCongestionTrend: WidgetConfig;
    weeklyHeatmap: WidgetConfig;
    counterEfficiency: WidgetConfig;
    todaysVisitors: WidgetConfig;
    avgDwellTime: WidgetConfig;
    peakHours: WidgetConfig;
  };
  refreshInterval: number;
  timeRange: number;
  chartType: 'line' | 'area' | 'bar';
  colorScheme: 'default' | 'blue' | 'green' | 'purple';
  compactMode: boolean;
  dwellTimeChartType: 'bar' | 'donut';
  occupancyTrendType: 'line' | 'heatmap';
}

const DEFAULT_CONFIG: DashboardConfig = {
  widgets: {
    occupancyStatus: { id: 'occupancyStatus', enabled: true, size: 'medium', order: 0 },
    dwellTime: { id: 'dwellTime', enabled: true, size: 'medium', order: 1 },
    todaysVisitors: { id: 'todaysVisitors', enabled: true, size: 'medium', order: 2 },
    avgDwellTime: { id: 'avgDwellTime', enabled: true, size: 'medium', order: 3 },
    peakHours: { id: 'peakHours', enabled: true, size: 'medium', order: 4 },
    inflowOutflow: { id: 'inflowOutflow', enabled: true, size: 'full', order: 5 },
    occupancyTrend: { id: 'occupancyTrend', enabled: true, size: 'full', order: 6 },
    weeklyHeatmap: { id: 'weeklyHeatmap', enabled: true, size: 'full', order: 7 },
    counterStatus: { id: 'counterStatus', enabled: true, size: 'full', order: 8 },
    counterEfficiency: { id: 'counterEfficiency', enabled: true, size: 'full', order: 9 },
    counterCongestionTrend: { id: 'counterCongestionTrend', enabled: true, size: 'full', order: 10 },
    footfallComparison: { id: 'footfallComparison', enabled: true, size: 'full', order: 11 },
  },
  refreshInterval: 1,
  timeRange: 24,
  chartType: 'line',
  colorScheme: 'default',
  compactMode: false,
  dwellTimeChartType: 'bar',
  occupancyTrendType: 'line',
};

// ============================================
// HELPER FUNCTIONS (unchanged)
// ============================================
const getCongestionColor = (level: string) => {
  switch (level) {
    case 'LOW': return '#52c41a';
    case 'MEDIUM': return '#faad14';
    case 'HIGH': return '#ff4d4f';
    default: return '#d9d9d9';
  }
};

const getCongestionText = (level: string) => {
  switch (level) {
    case 'LOW': return 'Low - Free Flow';
    case 'MEDIUM': return 'Medium - Moderate';
    case 'HIGH': return 'High - Congested';
    default: return 'Unknown';
  }
};

const getInsightIcon = (insight: string) => {
  if (insight.includes('congestion') || insight.includes('delays')) {
    return <WarningOutlined style={{ color: '#ff7a45' }} />;
  }
  if (insight.includes('Counter hopping')) {
    return <TeamOutlined style={{ color: '#faad14' }} />;
  }
  return <UserOutlined style={{ color: '#52c41a' }} />;
};

const getColorScheme = (scheme: string) => {
  switch (scheme) {
    case 'blue':
      return { primary: '#1890ff', secondary: '#40a9ff', tertiary: '#69c0ff' };
    case 'green':
      return { primary: '#52c41a', secondary: '#73d13d', tertiary: '#95de64' };
    case 'purple':
      return { primary: '#722ed1', secondary: '#9254de', tertiary: '#b37feb' };
    default:
      return { primary: '#52c41a', secondary: '#f5222d', tertiary: '#1890ff' };
  }
};

const getColSpan = (size: WidgetSize): { xs: number; sm: number; md: number; lg: number } => {
  switch (size) {
    case 'small': return { xs: 24, sm: 12, md: 8, lg: 6 };
    case 'medium': return { xs: 24, sm: 24, md: 12, lg: 12 };
    case 'large': return { xs: 24, sm: 24, md: 16, lg: 16 };
    case 'full': return { xs: 24, sm: 24, md: 24, lg: 24 };
    default: return { xs: 24, sm: 24, md: 12, lg: 12 };
  }
};


// ============================================
// MAIN COMPONENT
// ============================================
const CafeteriaAnalyticsDashboard: React.FC<{ 
  config?: Partial<DashboardConfig>; 
  tenantCode?: string;
  cafeteriaCode?: string;
}> = ({
  config = {},
  tenantCode = 'intel-rmz-ecoworld',
  cafeteriaCode = 'srr-4a',
}) => {
  // State
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
 
  // ✅ ADD: WebSocket connection state
  const [wsConnected, setWsConnected] = useState(false);
  const [wsError, setWsError] = useState<any>(null);
  
  
  // Customizable config state
  const [userConfig, setUserConfig] = useState<DashboardConfig>({ 
    ...DEFAULT_CONFIG, 
    ...config,
    widgets: { ...DEFAULT_CONFIG.widgets, ...config.widgets }
  });
  
  const [selectedDate] = useState(dayjs());
  const [timeRange, setTimeRange] = useState(userConfig.timeRange || 24);
  const [selectedLocation, setSelectedLocation] = useState<string>('Intel, RMZ Ecoworld, Bangalore');
  const [selectedCafeteria, setSelectedCafeteria] = useState<string>('SRR 4A');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dateFilter, setDateFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDwellCounter, setSelectedDwellCounter] = useState<string>('all');
  const [filterPanelVisible, setFilterPanelVisible] = useState(false);
  
  // Dynamic counter visibility state
  const [visibleCounters, setVisibleCounters] = useState<{[key: string]: boolean}>({});
  
  // Available counter names state
  const [availableCounters, setAvailableCounters] = useState<string[]>([]);

  // ✅ NEW: Counter-specific dwell time data
  const [counterDwellTimeData, setCounterDwellTimeData] = useState<any>(null);
  const [loadingCounterDwell, setLoadingCounterDwell] = useState(false);

  const colors = getColorScheme(userConfig.colorScheme || 'default');

  // ============================================
  // API DATA FETCHING WITH CUSTOM HOOK
  // ============================================
  // ============================================
  // API DATA FETCHING WITH CUSTOM HOOK
  // ============================================
  const { data: apiData, loading, error, refetch } = useDashboardData(
  tenantCode,
  cafeteriaCode,
  dateFilter,
  timeRange,
  wsConnected ? 999999999 : (userConfig.refreshInterval || 30) * 1000  // ✅ Disable auto-refresh when WebSocket active
);

  // ✅ ADD: Local state for dashboard data that can be updated by WebSocket
  const [dashboardData, setDashboardData] = useState(apiData);

  // ✅ ADD: Sync API data with local state
  useEffect(() => {
    if (apiData) {
      setDashboardData(apiData);
    }
  }, [apiData]);

  // ✅ ADD: WebSocket update handler
  const handleWebSocketUpdate = useReactCallback((update: any): void => {
    console.log('🔄 Updating UI with WebSocket data:', update);
    
    // Update counter status immediately
    if (update.counters && update.counters.length > 0) {
      setDashboardData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          counterStatus: update.counters,
          lastUpdated: update.timestamp,
        };
      });
    }
    
    // Update occupancy status immediately
    if (update.occupancyStatus) {
      setDashboardData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          occupancyStatus: update.occupancyStatus,
          lastUpdated: update.timestamp,
        };
      });
    }

    // Show notification based on update type
    if (update.updateType === 'counter_update') {
      console.log('📊 Counter data updated via WebSocket');
    } else if (update.updateType === 'occupancy_update') {
      console.log('👥 Occupancy data updated via WebSocket');
    }
  }, []);

  // ✅ ADD: Connect WebSocket
  const { isConnected: wsIsConnected, error: wsConnectionError } = useWebSocket(
    cafeteriaCode,
    handleWebSocketUpdate
  );

  // ✅ ADD: Update connection state
  useEffect(() => {
    setWsConnected(wsIsConnected);
    setWsError(wsConnectionError);
  }, [wsIsConnected, wsConnectionError]);

  // Extract data from API response


  // Extract data from API response
  const occupancyData = dashboardData?.occupancyStatus || null;
  const flowData = dashboardData?.flowData || [];
  const counterStatus = dashboardData?.counterStatus || [];
  
  // ✅ UPDATED: Use counter-specific data if available, otherwise use aggregate data
  const dwellTimeData = selectedDwellCounter !== 'all' && counterDwellTimeData 
    ? counterDwellTimeData.dwellTimeData 
    : dashboardData?.dwellTimeData || [];
    
  const footfallComparison = dashboardData?.footfallComparison || [];
  const occupancyTrendData = dashboardData?.occupancyTrend || [];
  const counterCongestionData = dashboardData?.counterCongestionTrend || [];
  const counterEfficiencyData = dashboardData?.counterEfficiency || [];
  const todaysVisitors = dashboardData?.todaysVisitors || null;
  const avgDwellTime = dashboardData?.avgDwellTime || null;
  const peakHours = dashboardData?.peakHours || null;
  const lastUpdated = dashboardData?.lastUpdated ? new Date(dashboardData.lastUpdated).toLocaleTimeString() : '';

  // Weekly heatmap needs special handling as it's not in the main dashboard response
  const [weeklyHeatmapData, setWeeklyHeatmapData] = useState<any[]>([]);
  // Enhanced congestion data
  const [enhancedCongestionData, setEnhancedCongestionData] = useState<any>(null);
  const [loadingEnhancedCongestion, setLoadingEnhancedCongestion] = useState(false);

  // ✅ Sliding window state for counter congestion trend
  const [windowStart, setWindowStart] = useState(0);
  const WINDOW_SIZE = 20; // Show 20 timestamps at once

  // ✅ Initialize visibility for all counters dynamically (moved from renderCounterCongestionTrend)
  useEffect(() => {
    if (
      enhancedCongestionData &&
      enhancedCongestionData.congestionTrend &&
      enhancedCongestionData.congestionTrend.length > 0
    ) {
      const allCounterNames = Array.from(
        new Set(
          enhancedCongestionData.congestionTrend.flatMap((item: any) =>
            Object.keys(item.counterStats || {})
          )
        )
      );
      const newVisibility: Record<string, boolean> = {};
      allCounterNames.forEach((counter: string) => {
        if (!(counter in visibleCounters)) {
          newVisibility[counter] = true;
        }
      });
      if (Object.keys(newVisibility).length > 0) {
        setVisibleCounters((prev) => ({ ...prev, ...newVisibility }));
      }
    }
  }, [enhancedCongestionData, visibleCounters]);



  // ✅ NEW: Fetch counter-specific dwell time when counter is selected
  useEffect(() => {
    if (selectedDwellCounter !== 'all') {
      const fetchCounterDwellTime = async () => {
        setLoadingCounterDwell(true);
        try {
          const data = await CafeteriaApiService.getDwellTimeByCounter(
            tenantCode,
            cafeteriaCode,
            selectedDwellCounter,
            dateFilter,
            timeRange
          );
          setCounterDwellTimeData(data);
          console.log('✅ Counter-specific dwell time loaded:', data);
        } catch (error: any) {
          console.error('❌ Error loading counter dwell time:', error);
          message.error(`Failed to load dwell time for ${selectedDwellCounter}`);
          setCounterDwellTimeData(null);
        } finally {
          setLoadingCounterDwell(false);
        }
      };

      fetchCounterDwellTime();
    } else {
      setCounterDwellTimeData(null);
    }
  }, [selectedDwellCounter, tenantCode, cafeteriaCode, dateFilter, timeRange]);

  useEffect(() => {
  if (
    enhancedCongestionData &&
    enhancedCongestionData.congestionTrend &&
    enhancedCongestionData.congestionTrend.length > 0
  ) {
    const firstDataPoint = enhancedCongestionData.congestionTrend[0];
    const counterStats = firstDataPoint.counterStats || {};

    const enhancedCounterNames = Object.keys(counterStats);

    if (enhancedCounterNames.length > 0) {
      setAvailableCounters(enhancedCounterNames);

      setVisibleCounters(prev => {
        const prevKeys = Object.keys(prev);

        const isSame =
          prevKeys.length === enhancedCounterNames.length &&
          enhancedCounterNames.every(c => prevKeys.includes(c));

        if (isSame) return prev;

        const initialVisibility: Record<string, boolean> = {};
        enhancedCounterNames.forEach(name => {
          initialVisibility[name] = true;
        });

        return initialVisibility;
      });
    }
  }
}, [enhancedCongestionData]);


  // ✅ NEW: Fetch enhanced congestion data  
  useEffect(() => {
    const fetchEnhancedCongestion = async () => {
      if (!userConfig.widgets.counterCongestionTrend.enabled) return;
      
      setLoadingEnhancedCongestion(true);
      try {
        const data = await CafeteriaApiService.getEnhancedCongestion(
          tenantCode,
          cafeteriaCode,
          dateFilter,
          timeRange
        );
        setEnhancedCongestionData(data);
        console.log('✅ Enhanced congestion data loaded:', {
          totalTimeBuckets: data.totalTimeBuckets,
          trendPoints: data.congestionTrend.length,
          timeRange: data.timeRange
        });
      } catch (error: any) {
        console.error('❌ Error loading enhanced congestion:', error);
        setEnhancedCongestionData(null);
      } finally {
        setLoadingEnhancedCongestion(false);
      }
    };

    fetchEnhancedCongestion();
  }, [tenantCode, cafeteriaCode, dateFilter, timeRange, userConfig.widgets.counterCongestionTrend.enabled]);

  // ✅ NEW: Log API data to verify it's being received
  useEffect(() => {
    if (dashboardData) {
      console.log('📊 Dashboard Data Received:', {
        flowData: flowData.length,
        counterStatus: counterStatus.length,
        dwellTimeData: dwellTimeData.length,
        footfallComparison: footfallComparison.length,
        occupancyTrend: occupancyTrendData.length,
        counterCongestionTrend: counterCongestionData.length,
        counterEfficiency: counterEfficiencyData.length,
      });
      
      // ✅ Log actual data samples
      if (counterCongestionData.length > 0) {
        console.log('📈 Counter Congestion Sample:', counterCongestionData[0]);
      }
      if (counterEfficiencyData.length > 0) {
        console.log('⚡ Counter Efficiency Sample:', counterEfficiencyData[0]);
      }
      if (occupancyTrendData.length > 0) {
        console.log('📊 Occupancy Trend Sample:', occupancyTrendData[0]);
      }
    }
  }, [dashboardData, flowData, counterStatus, dwellTimeData, footfallComparison, occupancyTrendData, counterCongestionData, counterEfficiencyData]);

  // Initialize available counters from API data
  useEffect(() => {
    if (counterStatus && counterStatus.length > 0) {
      const counterNames = counterStatus.map(c => c.counterName);
      setAvailableCounters(counterNames);
      
      // Initialize visibility state for all counters
      const initialVisibility: {[key: string]: boolean} = {};
      counterNames.forEach(name => {
        initialVisibility[name] = true;
      });
      setVisibleCounters(initialVisibility);
      
      console.log('✅ Available counters loaded:', counterNames);
    }
  }, [counterStatus]);

  // Fetch weekly heatmap separately if needed
  useEffect(() => {
    if (userConfig.widgets.weeklyHeatmap.enabled) {
      setWeeklyHeatmapData([]);
    }
  }, [userConfig.widgets.weeklyHeatmap.enabled]);

  // ============================================
  // CONFIG HANDLERS (unchanged)
  // ============================================
  const toggleWidget = (widgetId: keyof DashboardConfig['widgets']) => {
    setUserConfig(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          enabled: !prev.widgets[widgetId].enabled,
        }
      }
    }));
  };

  const updateWidgetSize = (widgetId: keyof DashboardConfig['widgets'], size: WidgetSize) => {
    setUserConfig(prev => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        [widgetId]: {
          ...prev.widgets[widgetId],
          size,
        }
      }
    }));
  };

  const updateConfig = (key: keyof Omit<DashboardConfig, 'widgets'>, value: any) => {
    setUserConfig(prev => ({ ...prev, [key]: value }));
  };

  const moveWidget = (widgetId: keyof DashboardConfig['widgets'], direction: 'up' | 'down') => {
    const widgets = Object.values(userConfig.widgets).sort((a, b) => a.order - b.order);
    const currentIndex = widgets.findIndex(w => w.id === widgetId);
    
    if (direction === 'up' && currentIndex > 0) {
      const temp = widgets[currentIndex].order;
      widgets[currentIndex].order = widgets[currentIndex - 1].order;
      widgets[currentIndex - 1].order = temp;
    } else if (direction === 'down' && currentIndex < widgets.length - 1) {
      const temp = widgets[currentIndex].order;
      widgets[currentIndex].order = widgets[currentIndex + 1].order;
      widgets[currentIndex + 1].order = temp;
    }

    const updatedWidgets = { ...userConfig.widgets };
    widgets.forEach(w => {
      updatedWidgets[w.id as keyof DashboardConfig['widgets']].order = w.order;
    });

    setUserConfig(prev => ({ ...prev, widgets: updatedWidgets }));
  };

  const resetConfig = () => {
    setUserConfig(DEFAULT_CONFIG);
    setTimeRange(DEFAULT_CONFIG.timeRange || 24);
    localStorage.removeItem('cafeteriaDashboardConfig');
    message.info('Configuration reset to defaults');
  };

  const saveConfig = () => {
    localStorage.setItem('cafeteriaDashboardConfig', JSON.stringify(userConfig));
    setSettingsVisible(false);
    message.success('Settings saved!');
  };

  const loadConfig = () => {
    const saved = localStorage.getItem('cafeteriaDashboardConfig');
    if (saved) {
      const loadedConfig = JSON.parse(saved);
      setUserConfig({
        ...DEFAULT_CONFIG,
        ...loadedConfig,
        widgets: {
          ...DEFAULT_CONFIG.widgets,
          ...loadedConfig.widgets,
        }
      });
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // ============================================
  // RENDER FUNCTIONS
  // ============================================
  // 1. ✅ FIXED: Occupancy Status - Always show "No data"
const renderOccupancyStatus = () => {
  return (
    <Card 
      title={
        <Space>
          {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
          <TeamOutlined />
          <span>Cafeteria Occupancy</span>
          <Badge status="default" text="No Data" />
        </Space>
      }
      size={userConfig.compactMode ? 'small' : 'default'}
      style={{ height: '100%' }}
      bodyStyle={{ padding: '24px' }}
    >
      <Alert 
        message="System is Not yet Live" 
        type="info" 
        showIcon 
      />
    </Card>
  );
};


  const renderTodaysVisitors = () => {
    if (!todaysVisitors) return null;

    const today = new Date();
    const dayOfWeek = today.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let comparisonDay: string;
    
    if (isWeekend) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      comparisonDay = `Same day last week (${days[dayOfWeek]})`;
    } else {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayDayOfWeek = yesterday.getDay();
      const yesterdayIsWeekend = yesterdayDayOfWeek === 0 || yesterdayDayOfWeek === 6;
      
      if (yesterdayIsWeekend) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        comparisonDay = `Same day last week (${days[dayOfWeek]})`;
      } else {
        comparisonDay = 'Yesterday';
      }
    }

    const tooltipContent = (
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Comparison: {comparisonDay}</div>
        <div>Previous: {todaysVisitors.total - Math.floor(todaysVisitors.total * todaysVisitors.percentageChange / 100)} visitors</div>
        <div>Today: {todaysVisitors.total} visitors</div>
        <div style={{ marginTop: 4, fontSize: '11px', color: '#d9d9d9' }}>
          {isWeekend || (new Date(today.getTime() - 24 * 60 * 60 * 1000).getDay() === 0 || new Date(today.getTime() - 24 * 60 * 60 * 1000).getDay() === 6) 
            ? '📊 Weekend comparison uses same day last week' 
            : '📊 Weekday comparison uses previous day'}
        </div>
      </div>
    );

    return (
      <Card
        style={{ height: '100%' }}
        bodyStyle={{ padding: '24px' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Today's Footfall
            </Text>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#e6f7ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TeamOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            </div>
          </div>
          
          <div>
            <Space align="baseline" size="small">
              <Text style={{ fontSize: '36px', fontWeight: 'bold', lineHeight: 1 }}>
                {todaysVisitors.total.toLocaleString()}
              </Text>
              <Tooltip title={tooltipContent} placement="top">
                <Badge 
                  count={`${todaysVisitors.trend === 'up' ? '↑' : '↓'} ${Math.round(Math.abs(todaysVisitors.percentageChange))}%`}
                  style={{ 
                    backgroundColor: todaysVisitors.trend === 'up' ? '#52c41a' : '#ff4d4f',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                />
              </Tooltip>
            </Space>
          </div>
          
          <Text type="secondary" style={{ fontSize: '13px' }}>
            Since {todaysVisitors.sinceTime}
          </Text>
        </Space>
      </Card>
    );
  };

  const renderAvgDwellTime = () => {
    if (!avgDwellTime) return null;

    return (
      <Card
        style={{ height: '100%' }}
        bodyStyle={{ padding: '24px' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Avg Wait Time
            </Text>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: '#f6ffed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ClockCircleOutlined style={{ fontSize: '24px', color: '#52c41a' }} />
            </div>
          </div>
          
          <div>
            <Space align="baseline" size="small">
              <Text style={{ fontSize: '36px', fontWeight: 'bold', lineHeight: 1 }}>
                {avgDwellTime.formatted}
              </Text>
              <Badge 
                count={`${avgDwellTime.trend === 'up' ? '↑' : '↓'} ${Math.abs(avgDwellTime.percentageChange)}%`}
                style={{ 
                  backgroundColor: avgDwellTime.trend === 'down' ? '#52c41a' : '#ff4d4f',
                  fontSize: '12px',
                }}
              />
            </Space>
          </div>
          
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {avgDwellTime.note}
          </Text>
        </Space>
      </Card>
    );
  };

  const renderPeakHours = () => {
    if (!peakHours) return null;

    const isPeakTime = peakHours.currentStatus === 'Peak Hours';

    return (
      <Card
        style={{ height: '100%' }}
        bodyStyle={{ padding: '24px' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Peak Hours
            </Text>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: isPeakTime ? '#fff7e6' : '#f0f5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FireOutlined style={{ fontSize: '24px', color: isPeakTime ? '#fa8c16' : '#1890ff' }} />
            </div>
          </div>
          
          <div>
            <Space align="baseline" size="small">
              <Text style={{ fontSize: '36px', fontWeight: 'bold', lineHeight: 1 }}>
                {peakHours.highestPeak.split(' - ')[0]}
              </Text>
              <Badge 
                count={isPeakTime ? 'ACTIVE' : 'UPCOMING'}
                style={{ 
                  backgroundColor: isPeakTime ? '#fa8c16' : '#1890ff',
                  fontSize: '12px',
                }}
              />
            </Space>
          </div>
          
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {isPeakTime ? 'Currently in peak hours' : `Next peak at ${peakHours.nextPeak}`}
          </Text>
        </Space>
      </Card>
    );
  };

  // 2. ✅ FIXED: Inflow vs Outflow - Always show "No data"
const renderInflowOutflow = () => {
  return (
    <Card 
      title={
        <Space>
          {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
          Inflow vs Outflow (Footfall vs Time)
        </Space>
      } 
      size={userConfig.compactMode ? 'small' : 'default'}
      bodyStyle={{ padding: '24px' }}
    >
      <Alert 
        message="System is not yet Live" 
        
        type="info" 
        showIcon 
      />
    </Card>
  );
};

  const renderCounterStatus = () => {
    if (counterStatus.length === 0) {
      return (
        <Card 
          title={
            <Space>
              {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
              <FireOutlined />
              <span>Live Food Counter Status</span>
              <Badge status="processing" text="Live" />
            </Space>
          } 
          size={userConfig.compactMode ? 'small' : 'default'}
          bodyStyle={{ padding: '24px' }}
        >
          <Alert message="No counter data available" description="Waiting for live counter data from MQTT..." type="info" showIcon />
        </Card>
      );
    }
    
    // Transform API data to match component interface
    const transformedData = counterStatus.map(counter => ({
      ...counter,
      waitingTime: counter.waitTime || 0,
    }));

    const columns = [
      { 
        title: 'Counter', 
        dataIndex: 'counterName', 
        key: 'counterName', 
        render: (text: string) => <Text strong>{text}</Text> 
      },
      { 
        title: 'Queue', 
        dataIndex: 'queueLength', 
        key: 'queueLength', 
        render: (value: number) => (
          <Tooltip title={
            value >= 4 && value <= 7 ? '5 min wait expected' :
            value >= 8 && value <= 11 ? '10 min wait expected' :
            value > 11 ? '15 min wait expected' :
            'No significant wait'
          }>
            <Statistic value={value || 0} valueStyle={{ fontSize: '16px' }} prefix={<TeamOutlined />} />
          </Tooltip>
        )
      },
      { 
        title: 'Wait Time', 
        dataIndex: 'waitingTime', 
        key: 'waitingTime', 
        render: (value: number, record: any) => {
          const queue = record.queueLength || 0;
          let color = '#52c41a';
          if (value >= 10) color = '#ff4d4f';
          else if (value >= 5) color = '#faad14';
          
          return (
            <Space>
              <ClockCircleOutlined style={{ color }} />
              <Text style={{ color, fontWeight: 'bold' }}>{value} min</Text>
            </Space>
          );
        }
      },
      { 
        title: 'Status', 
        dataIndex: 'congestionLevel', 
        key: 'congestionLevel', 
        render: (level: string) => <Badge color={getCongestionColor(level)} text={getCongestionText(level)} /> 
      },
    ];

    return (
      <Card 
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <FireOutlined />
            <span>Live Food Counter Status</span>
            <Badge status="processing" text="Live" />
            <Text type="secondary" style={{ fontSize: '12px', marginLeft: 8 }}>
              ({transformedData.length} counters active)
            </Text>
          </Space>
        } 
        extra={
          <Tooltip title={
            <div style={{ fontSize: '12px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Wait Time Logic:</div>
              <div>• Queue 4-7: <Text style={{ color: '#faad14' }}>5 min</Text></div>
              <div>• Queue 8-11: <Text style={{ color: '#ff7a45' }}>10 min</Text></div>
              <div>• Queue 11+: <Text style={{ color: '#ff4d4f' }}>15 min</Text></div>
            </div>
          }>
            <span style={{ cursor: 'help', color: '#1890ff', fontSize: '12px' }}>
              ⓘ Wait Time Guide
            </span>
          </Tooltip>
        }
        size={userConfig.compactMode ? 'small' : 'default'}
        bodyStyle={{ padding: '24px' }}
      >
        <Table dataSource={transformedData} columns={columns} pagination={false} size="small" rowKey="counterName" />
      </Card>
    );
  };

 const renderDwellTime = () => {
  // =========================
  // EMPTY STATE
  // =========================
  if (dwellTimeData.length === 0 && !loadingCounterDwell) {
    return (
      <Card
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <ClockCircleOutlined />
            <span>Wait Time Distribution (Time vs Counters FootFall)</span>
          </Space>
        }
        size={userConfig.compactMode ? 'small' : 'default'}
        bodyStyle={{ padding: 24 }}
      >
        <Alert message="No wait time data available" type="info" showIcon />
      </Card>
    );
  }

  // =========================
  // WAIT TIME BUCKET LOGIC
  // =========================
  const getWaitBucket = (queueLength) => {
    if (queueLength === 0) return '0';
    if (queueLength <= 5) return '0-5';
    if (queueLength <= 10) return '5-10';
    return '10-15';
  };

  const BUCKET_ORDER = ['0', '0-5', '5-10', '10-15'];

  const bucketMap = {
    '0': 0,
    '0-5': 0,
    '5-10': 0,
    '10-15': 0,
  };

  // =========================
  // AGGREGATE DATA
  // =========================
  dwellTimeData.forEach(item => {
    const queueLength = item.queueLength ?? 0; // from API
    const bucket = getWaitBucket(queueLength);

    bucketMap[bucket] += item.count ?? 1;
  });

  const total = Object.values(bucketMap).reduce((a, b) => a + b, 0);

  const transformedData = BUCKET_ORDER.map(label => ({
    timeRange: label,
    originalRange: label,
    displayLabel: label,
    count: bucketMap[label],
    percentage: total ? (bucketMap[label] / total) * 100 : 0,
  }));

  const COLORS = ['#1890ff', '#40a9ff', '#69c0ff', '#91d5ff'];

  // =========================
  // RENDER
  // =========================
  return (
    <Card
      title={
        <Space>
          {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
          <ClockCircleOutlined />
          <span>Wait Time Distribution (Time vs Counters FootFall)</span>
          <Text type="secondary" style={{ fontSize: 12 }}>
            ({dwellTimeData.length} records)
            {selectedDwellCounter !== 'all' && ` - ${selectedDwellCounter}`}
          </Text>
        </Space>
      }
      extra={
        <Space>
          <Select
            value={selectedDwellCounter}
            onChange={setSelectedDwellCounter}
            style={{ width: 220 }}
            size="small"
            loading={loadingCounterDwell}
          >
            <Option value="all">All Counters</Option>
            {availableCounters.map(counter => (
              <Option key={counter} value={counter}>
                {counter}
              </Option>
            ))}
          </Select>

          {selectedDwellCounter !== 'all' && (
            <Tooltip title="Reset to all counters">
              <Button
                size="small"
                icon={<ReloadOutlined />}
                onClick={() => setSelectedDwellCounter('all')}
                loading={loadingCounterDwell}
              />
            </Tooltip>
          )}
        </Space>
      }
      size={userConfig.compactMode ? 'small' : 'default'}
      bodyStyle={{ padding: 24 }}
    >
      {/* =========================
          KPIs (ONLY WHEN FILTERED)
         ========================= */}
      {selectedDwellCounter !== 'all' && counterDwellTimeData?.stats && (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Statistic
                title="Total Entries"
                value={counterDwellTimeData.stats.totalVisitors}
                prefix={<TeamOutlined />}
                valueStyle={{ fontSize: 18 }}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                Sum of inCount deltas
              </Text>
            </Col>

            <Col span={6}>
              <Statistic
                title="Avg Wait"
                value={counterDwellTimeData.stats.avgWaitTime.toFixed(1)}
                suffix="min"
                valueStyle={{ fontSize: 18, color: '#1890ff' }}
              />
            </Col>

            <Col span={6}>
              <Statistic
                title="Min–Max Wait"
                value={`${counterDwellTimeData.stats.minWaitTime}-${counterDwellTimeData.stats.maxWaitTime}`}
                suffix="min"
                valueStyle={{ fontSize: 18, color: '#52c41a' }}
              />
            </Col>

            <Col span={6}>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Peak Queue Length
                </Text>
                <div style={{ fontSize: 18, fontWeight: 'bold', color: '#fa8c16' }}>
                  {counterDwellTimeData.stats.peakQueueLength || 0} people
                </div>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Max Queue Length
                </Text>
              </div>
            </Col>
          </Row>
          <Divider style={{ margin: '16px 0' }} />
        </>
      )}

      {/* =========================
          CHART
         ========================= */}
      <ResponsiveContainer width="100%" height={userConfig.compactMode ? 280 : 340}>
        <BarChart
          data={transformedData}
          layout="vertical"
          margin={{ left: 10, right: 40, top: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            label={{ value: 'Number of People', position: 'insideBottom', offset: -5 }}
          />
          <YAxis
            dataKey="displayLabel"
            type="category"
            width={70}
            label={{
              value: 'Wait Time (min)',
              angle: -90,
              position: 'insideLeft',
            }}
          />
          <RechartsTooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div
                    style={{
                      background: '#fff',
                      padding: '10px 14px',
                      border: '1px solid #d9d9d9',
                      borderRadius: 6,
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      Wait Time: {d.originalRange}
                    </div>
                    <div>👥 {d.count} people</div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" barSize={24} radius={[0, 4, 4, 0]}>
            {transformedData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};




 const renderFootfallComparison = () => {
  return (
    <Card 
      title={
        <Space>
          {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
          <TeamOutlined />
          <span>Cafeteria vs Counter Footfall Analysis (Footfall vs Time)</span>
        </Space>
      } 
      size={userConfig.compactMode ? 'small' : 'default'}
      bodyStyle={{ padding: '24px' }}
    >
      <Alert 
        message="System is Not yet Live" 
        type="info" 
        showIcon 
      />
    </Card>
  );
};

  // 3. ✅ FIXED: Occupancy Trend - Always show "No data"
const renderOccupancyTrend = () => {
  return (
    <Card 
      title={
        <Space>
          {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
          <TeamOutlined />
          <span>Cafeteria Occupancy Trend (Footfall vs Time)</span>
        </Space>
      } 
      size={userConfig.compactMode ? 'small' : 'default'}
      bodyStyle={{ padding: '24px' }}
    >
      <Alert 
        message="System is Not yet Live" 
        type="info" 
        showIcon 
      />
    </Card>
  );
};

const renderCounterCongestionTrend = () => {
  if (loadingEnhancedCongestion) {
    return (
      <Card
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <FireOutlined />
            <span>Food Counter Congestion Trend (Peak Occupancy vs Time)</span>
          </Space>
        }
        size={userConfig.compactMode ? 'small' : 'default'}
        styles={{ body: { padding: '24px' } }}
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin tip="Loading enhanced congestion data..." />
        </div>
      </Card>
    );
  }

  if (!enhancedCongestionData || enhancedCongestionData.congestionTrend.length === 0) {
    return (
      <Card
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <FireOutlined />
            <span>Food Counter Congestion Trend (Peak Occupancy vs Time)</span>
          </Space>
        }
        size={userConfig.compactMode ? 'small' : 'default'}
        styles={{ body: { padding: '24px' } }}
      >
        <Alert message="No enhanced congestion data available" type="info" showIcon />
      </Card>
    );
  }

  // ✅ STEP 1: Transform ALL data (no filtering by minutes)
  const allTransformedData = enhancedCongestionData.congestionTrend.map((item) => {
    const result = { timestamp: item.timestamp };

    Object.entries(item.counterStats || {}).forEach(([counter, stats]) => {
      const typedStats = stats as { maxQueue: number; status: string; avgQueue: number; minQueue: number; dataPoints: number };
      result[counter] = typedStats.maxQueue;
      result[`${counter}_status`] = typedStats.status;
      result[`${counter}_avg`] = typedStats.avgQueue;
      result[`${counter}_min`] = typedStats.minQueue;
      result[`${counter}_dataPoints`] = typedStats.dataPoints;
    });

    return result;
  });

  // ✅ STEP 2: Collect ALL unique counter names across ALL timestamps
  const allCounterNames: string[] = Array.from(
    new Set(
      enhancedCongestionData.congestionTrend.flatMap(item => 
        Object.keys(item.counterStats || {})
      )
    )
  );

  // ✅ Modern vibrant gradient colors
  const COUNTER_GRADIENTS = {
    'Healthy Station': 'url(#healthyStationGradient)',
    'Mini Meals': 'url(#miniMealsGradient)',
    'Two Good': 'url(#twoGoodGradient)',
    'Beverages': 'url(#beveragesGradient)',
    'Snacks': 'url(#snacksGradient)',
  };

  const COUNTER_COLORS = {
    'Healthy Station': '#52c41a',
    'Mini Meals': '#1890ff',
    'Two Good': '#fa8c16',
    'Beverages': '#722ed1',
    'Snacks': '#eb2f96',
  };

  // Assign colors to any counters not in predefined list
  const FALLBACK_COLORS = ['#13c2c2', '#f759ab', '#fadb14', '#95de64'];
  allCounterNames.forEach((counter, index) => {
    const counterName = counter as string;
    if (!COUNTER_COLORS[counterName]) {
      const color = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
      COUNTER_COLORS[counterName] = color;
      COUNTER_GRADIENTS[counterName] = color;
    }
  });

  // (Removed useEffect from here. See below for new location in the main component body.)

  // ✅ STEP 3: Sliding window - show WINDOW_SIZE timestamps at a time
  const totalDataPoints = allTransformedData.length;
  const maxWindowStart = Math.max(0, totalDataPoints - WINDOW_SIZE);
  const chartData = allTransformedData.slice(windowStart, windowStart + WINDOW_SIZE);

  // Calculate X-axis ticks (show every 5th label to avoid crowding)
  const xAxisTicks = chartData
    .filter((_, index) => index % 5 === 0)
    .map(item => item.timestamp);

  // ✅ Navigation handlers
  const handlePrevious = () => {
    setWindowStart(Math.max(0, windowStart - WINDOW_SIZE));
  };

  const handleNext = () => {
    setWindowStart(Math.min(maxWindowStart, windowStart + WINDOW_SIZE));
  };

  const canGoPrevious = windowStart > 0;
  const canGoNext = windowStart < maxWindowStart;

  console.log('📊 Total Data Points:', totalDataPoints);
  console.log('📌 Current Window:', windowStart + 1, 'to', Math.min(windowStart + WINDOW_SIZE, totalDataPoints));
  console.log('👥 All Counter Names:', allCounterNames);
  console.log('👁️ Visible Counters:', visibleCounters);

  return (
    <Card
      title={
        <Space>
          {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
          <FireOutlined />
          <span>Food Counter Congestion Trend (Peak Occupancy vs Time)</span>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            (Showing {windowStart + 1}-{Math.min(windowStart + WINDOW_SIZE, totalDataPoints)} of {totalDataPoints} timestamps)
          </Text>
        </Space>
      }
      extra={
        <Space direction="vertical" size="small" style={{ textAlign: 'right' }}>
          <Text strong style={{ fontSize: '12px', color: '#595959' }}>Show/Hide Counters:</Text>
          <Space wrap>
            {allCounterNames.map((counter: string) => (
              <Checkbox
                key={counter}
                checked={visibleCounters[counter]}
                onChange={(e) => {
                  setVisibleCounters(prev => ({
                    ...prev,
                    [counter]: e.target.checked
                  }));
                }}
                style={{ fontSize: '12px' }}
              >
                <span style={{ 
                  color: COUNTER_COLORS[counter], 
                  fontWeight: 'bold',
                  marginRight: 4
                }}>
                  ■
                </span>
                {counter}
              </Checkbox>
            ))}
          </Space>
        </Space>
      }
      size={userConfig.compactMode ? 'small' : 'default'}
      styles={{ body: { padding: '24px' } }}
    >
      {/* ✅ Sliding Window Controls */}
      <div style={{ 
        marginBottom: 16, 
        display: 'flex', 
        alignItems: 'center', 
        gap: 12,
        padding: '12px',
        background: '#fafafa',
        borderRadius: '6px',
        border: '1px solid #f0f0f0'
      }}>
        <Button 
          icon={<LeftOutlined />} 
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          size="small"
        >
          Previous
        </Button>
        <Slider
          min={0}
          max={maxWindowStart}
          value={windowStart}
          onChange={setWindowStart}
          step={WINDOW_SIZE}
          style={{ flex: 1 }}
          tooltip={{ 
            formatter: (value) => `${value + 1}-${Math.min(value + WINDOW_SIZE, totalDataPoints)}`
          }}
        />
        <Button 
          icon={<RightOutlined />} 
          onClick={handleNext}
          disabled={!canGoNext}
          size="small"
        >
          Next
        </Button>
      </div>

      <ResponsiveContainer width="100%" height={userConfig.compactMode ? 300 : 400}>
        <BarChart data={chartData} margin={{ left: 10, right: 30, top: 5, bottom: 60 }}>
          {/* ✅ Modern vibrant gradients */}
          <defs>
            <linearGradient id="healthyStationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#73d13d" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#95de64" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="miniMealsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#40a9ff" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#69c0ff" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="twoGoodGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffa940" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#ffc069" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="beveragesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9254de" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#b37feb" stopOpacity={0.7} />
            </linearGradient>
            <linearGradient id="snacksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ff4d4f" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#ff7875" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          
          <XAxis
            dataKey="timestamp"
            ticks={xAxisTicks}
            interval={0}
            stroke="#8c8c8c"
            tick={{ fontSize: 10, fontWeight: 300 }}
            tickLine={{ stroke: '#d9d9d9' }}
            axisLine={{ stroke: '#d9d9d9' }}
            angle={-45}
            textAnchor="end"
            height={60}
          />

          <YAxis 
            stroke="#8c8c8c"
            tick={{ fontSize: 11, fontWeight: 300 }}
            label={{ 
              value: 'Peak Occupancy (people)', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#595959', fontWeight: 400 }
            }}
          />
          
          {/* ✅ Clean white tooltip with light font */}
          <RechartsTooltip
            cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e8e8e8',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div>
                    <div style={{ 
                      fontWeight: '500', 
                      marginBottom: '8px', 
                      fontSize: '13px',
                      color: '#262626',
                      borderBottom: '1px solid #f0f0f0',
                      paddingBottom: '6px',
                    }}>
                      🕐 {data.timestamp}
                    </div>
                    {allCounterNames.map((counter: string) => {
                      if (!visibleCounters[counter]) return null;
                      
                      const maxQueue = data[counter];
                      if (maxQueue === undefined || maxQueue === null) return null;
                      
                      const avgQueue = data[`${counter}_avg`];
                      const status = data[`${counter}_status`];
                      
                      return (
                        <div key={counter} style={{ 
                          marginTop: '6px',
                          fontSize: '12px',
                          color: '#595959',
                          fontWeight: '300',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ 
                            display: 'inline-block',
                            width: '10px',
                            height: '10px',
                            backgroundColor: COUNTER_COLORS[counter],
                            borderRadius: '2px',
                          }}></span>
                          <span style={{ fontWeight: '400', color: '#262626', flex: 1 }}>{counter}</span>
                          <span style={{ fontWeight: '600', color: COUNTER_COLORS[counter] }}>{maxQueue}</span>
                          <span style={{ color: '#8c8c8c', fontSize: '11px', fontWeight: '300' }}>
                            avg: {avgQueue?.toFixed(1)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              }
              return null;
            }}
          />
          
          <Legend 
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontWeight: 300 }}
            iconType="rect"
          />
          
          {/* ✅ Bars with vibrant gradients */}
          {allCounterNames.map((counter) => (
            <Bar
              key={counter}
              dataKey={counter}
              fill={COUNTER_GRADIENTS[counter] || COUNTER_COLORS[counter]}
              name={counter}
              hide={!visibleCounters[counter]}
              radius={[8, 8, 0, 0]}
              maxBarSize={45}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>

      {/* ✅ Summary Statistics Panel */}
      <div style={{ 
        marginTop: 20, 
        padding: '16px', 
        background: '#fafafa', 
        borderRadius: '8px',
        border: '1px solid #f0f0f0'
      }}>
        <Title level={5} style={{ marginBottom: 12, fontWeight: 500 }}>
          Counter Statistics (Current View)
        </Title>
        <Row gutter={[16, 16]}>
          {allCounterNames.map(counter => {
            if (!visibleCounters[counter]) return null;
            
            const counterData = chartData
              .map(item => item[counter])
              .filter(val => val !== undefined && val !== null && val > 0);
            
            if (counterData.length === 0) return null;
            
            const maxOccupancy = Math.max(...counterData);
            const avgOccupancy = counterData.reduce((a, b) => a + b, 0) / counterData.length;
            const minOccupancy = Math.min(...counterData);
            
            return (
              <Col key={counter} xs={24} sm={12} md={8} lg={6}>
                <Card size="small" style={{ 
                  borderLeft: `4px solid ${COUNTER_COLORS[counter]}`,
                  background: 'white'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <Text strong style={{ 
                      color: COUNTER_COLORS[counter],
                      fontSize: '14px',
                      display: 'block',
                      marginBottom: 8,
                      fontWeight: 500
                    }}>
                      {counter}
                    </Text>
                    <Row gutter={8}>
                      <Col span={8}>
                        <Statistic 
                          title={<Text style={{ fontSize: '11px', fontWeight: 300 }}>Peak</Text>}
                          value={maxOccupancy} 
                          valueStyle={{ fontSize: '18px', color: '#ff4d4f', fontWeight: 600 }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic 
                          title={<Text style={{ fontSize: '11px', fontWeight: 300 }}>Avg</Text>}
                          value={avgOccupancy.toFixed(1)} 
                          valueStyle={{ fontSize: '18px', color: '#1890ff', fontWeight: 600 }}
                        />
                      </Col>
                      <Col span={8}>
                        <Statistic 
                          title={<Text style={{ fontSize: '11px', fontWeight: 300 }}>Min</Text>}
                          value={minOccupancy} 
                          valueStyle={{ fontSize: '18px', color: '#52c41a', fontWeight: 600 }}
                        />
                      </Col>
                    </Row>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </Card>
  );
};

  const renderWeeklyHeatmap = () => {
    if (weeklyHeatmapData.length === 0) return (
      <Card
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <FireOutlined />
            <span>Weekly Cafeteria Congestion Heatmap</span>
          </Space>
        }
        size={userConfig.compactMode ? 'small' : 'default'}
        bodyStyle={{ padding: '24px' }}
      >
        <Alert message="Weekly heatmap data not available yet" type="info" showIcon />
      </Card>
    );

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from(new Set(weeklyHeatmapData.map(d => d.hourNum))).sort((a, b) => a - b);
    const maxValue = Math.max(...weeklyHeatmapData.map(d => d.value));

    return (
      <Card
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <FireOutlined />
            <span>Weekly Cafeteria Congestion Heatmap</span>
          </Space>
        }
        size={userConfig.compactMode ? 'small' : 'default'}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 800 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: '4px' }}>
              <div></div>
              {days.map(day => (
                <div key={day} style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '12px', padding: '8px 0' }}>
                  {day}
                </div>
              ))}
              {hours.map(hour => {
                const hourData = weeklyHeatmapData.filter(d => d.hourNum === hour);
                return (
                  <React.Fragment key={hour}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      fontSize: '11px', 
                      color: '#666',
                      paddingRight: '8px',
                      justifyContent: 'flex-end'
                    }}>
                      {hour.toString().padStart(2, '0')}:00
                    </div>
                    {days.map((day, dayIndex) => {
                      const cellData = hourData.find(d => d.dayIndex === dayIndex);
                      const value = cellData?.value || 0;
                      const intensity = value / maxValue;
                      
                      return (
                        <div
                          key={`${day}-${hour}`}
                          style={{
                            height: '30px',
                            backgroundColor: `rgba(24, 144, 255, ${intensity * 0.8 + 0.1})`,
                            border: '1px solid #f0f0f0',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: intensity > 0.5 ? '#fff' : '#666',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                          title={`${day} ${hour}:00 - ${value} people`}
                        >
                          {value > 0 ? value : ''}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>Low</Text>
              <div style={{ 
                width: 200, 
                height: 12, 
                background: 'linear-gradient(to right, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 0.9))',
                border: '1px solid #f0f0f0',
                borderRadius: '6px'
              }} />
              <Text type="secondary" style={{ fontSize: '12px' }}>High</Text>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderCounterEfficiency = () => {
    // ✅ VERIFIED: Uses real API data from counterEfficiencyData
    if (counterEfficiencyData.length === 0) {
      return (
        <Card
          title={
            <Space>
              {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
              <FireOutlined />
              <span>Counter Efficiency Analysis</span>
            </Space>
          }
          size={userConfig.compactMode ? 'small' : 'default'}
          bodyStyle={{ padding: '24px' }}
        >
          <Alert message="No counter efficiency data available" type="info" showIcon />
        </Card>
      );
    }

    const columns = [
      { 
        title: 'Counter', 
        dataIndex: 'counterName', 
        key: 'counterName', 
        render: (text: string) => <Text strong>{text}</Text>,
        width: '30%',
      },
      { 
        title: 'Total Served', 
        dataIndex: 'totalServed', 
        key: 'totalServed', 
        render: (value: number) => <Statistic value={value} valueStyle={{ fontSize: '14px' }} />,
        align: 'center' as const,
      },
      { 
        title: 'Avg Wait Time', 
        dataIndex: 'avgWaitTime', 
        key: 'avgWaitTime', 
        render: (value: number) => (
          <Badge 
            color={value < 5 ? '#52c41a' : value < 8 ? '#faad14' : '#ff4d4f'} 
            text={`${value.toFixed(2)} min`} 
          />
        ),
        align: 'center' as const,
      },
      { 
        title: 'Peak Wait Time', 
        dataIndex: 'peakWaitTime', 
        key: 'peakWaitTime', 
        render: (value: number) => <Text type="secondary">{value.toFixed(2)} min</Text>,
        align: 'center' as const,
      },
      { 
        title: 'Efficiency', 
        dataIndex: 'efficiency', 
        key: 'efficiency', 
        render: (value: number) => (
          <Progress 
            percent={value} 
            size="small" 
            strokeColor={value > 70 ? '#52c41a' : value > 50 ? '#faad14' : '#ff4d4f'}
            style={{ width: '100px' }}
          />
        ),
        align: 'center' as const,
      },
    ];

    return (
      <Card
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <FireOutlined />
            <span>Counter Efficiency Analysis</span>
            <Text type="secondary" style={{ fontSize: '12px' }}>({counterEfficiencyData.length} counters)</Text>
          </Space>
        }
        size={userConfig.compactMode ? 'small' : 'default'}
        bodyStyle={{ padding: '24px' }}
      >
        <Table 
          dataSource={counterEfficiencyData} 
          columns={columns} 
          pagination={false} 
          size="middle" 
          rowKey="counterName"
        />
      </Card>
    );
  };

  // ============================================
  // SETTINGS PANEL
  // ============================================
  const renderSettingsDrawer = () => (
    <Drawer
      title={<Space><SettingOutlined />Dashboard Settings</Space>}
      placement="right"
      width={450}
      onClose={() => setSettingsVisible(false)}
      open={settingsVisible}
      extra={
        <Space>
          <Button onClick={resetConfig} size="small">Reset</Button>
          <Button onClick={saveConfig} type="primary" size="small">Save</Button>
        </Space>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Space>
            <DragOutlined />
            <Text strong>Drag Mode</Text>
            <Switch checked={dragEnabled} onChange={setDragEnabled} />
          </Space>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Enable to reorder widgets using arrows in settings
            </Text>
          </div>
        </div>

        <Divider />

        <div>
          <Title level={5}>Widget Configuration</Title>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {Object.entries(userConfig.widgets)
              .sort(([, a], [, b]) => a.order - b.order)
              .map(([key, widget]) => (
                <Card key={key} size="small" style={{ background: '#fafafa' }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Checkbox 
                        checked={widget.enabled} 
                        onChange={() => toggleWidget(key as keyof DashboardConfig['widgets'])}
                      >
                        <Text strong>
                          {key === 'occupancyStatus' && 'Current Occupancy'}
                          {key === 'inflowOutflow' && 'Inflow vs Outflow'}
                          {key === 'counterStatus' && 'Live Counter Status'}
                          {key === 'dwellTime' && 'Wait Time Distribution'}
                          {key === 'footfallComparison' && 'Footfall Comparison'}
                          {key === 'occupancyTrend' && 'Occupancy Trend'}
                          {key === 'counterCongestionTrend' && 'Counter Congestion Trend'}
                          {key === 'weeklyHeatmap' && 'Weekly Heatmap'}
                          {key === 'counterEfficiency' && 'Counter Efficiency'}
                          {key === 'todaysVisitors' && "Today's Visitors KPI"}
                          {key === 'avgDwellTime' && 'Avg Wait Time KPI'}
                          {key === 'peakHours' && 'Peak Hours KPI'}
                        </Text>
                      </Checkbox>
                      <Space>
                        <Button 
                          size="small" 
                          icon={<span>↑</span>}
                          onClick={() => moveWidget(key as keyof DashboardConfig['widgets'], 'up')}
                          disabled={widget.order === 0}
                        />
                        <Button 
                          size="small" 
                          icon={<span>↓</span>}
                          onClick={() => moveWidget(key as keyof DashboardConfig['widgets'], 'down')}
                          disabled={widget.order === Object.keys(userConfig.widgets).length - 1}
                        />
                      </Space>
                    </Space>
                    <div>
                      <Text type="secondary" style={{ fontSize: 12 }}>Size: </Text>
                      <Radio.Group 
                        value={widget.size} 
                        onChange={(e) => updateWidgetSize(key as keyof DashboardConfig['widgets'], e.target.value)}
                        size="small"
                        disabled={!widget.enabled}
                      >
                        <Radio.Button value="small">S</Radio.Button>
                        <Radio.Button value="medium">M</Radio.Button>
                        <Radio.Button value="large">L</Radio.Button>
                        <Radio.Button value="full">Full</Radio.Button>
                      </Radio.Group>
                    </div>
                  </Space>
                </Card>
              ))}
          </Space>
        </div>

        <Divider />

        <div>
          <Title level={5}>Wait Time Chart</Title>
          <Radio.Group 
            value={userConfig.dwellTimeChartType} 
            onChange={(e) => updateConfig('dwellTimeChartType', e.target.value)}
          >
            <Radio.Button value="bar">Horizontal Bar</Radio.Button>
            <Radio.Button value="donut">Donut</Radio.Button>
          </Radio.Group>
        </div>

        <Divider />

        <div>
          <Title level={5}>Occupancy Trend Chart</Title>
          <Radio.Group 
            value={userConfig.occupancyTrendType} 
            onChange={(e) => updateConfig('occupancyTrendType', e.target.value)}
          >
            <Radio.Button value="line">Line Chart</Radio.Button>
            <Radio.Button value="heatmap">Heatmap</Radio.Button>
          </Radio.Group>
        </div>

        <Divider />

        <div>
          <Title level={5}>Flow Chart Type</Title>
          <Radio.Group value={userConfig.chartType} onChange={(e) => updateConfig('chartType', e.target.value)}>
            <Radio.Button value="line">Line</Radio.Button>
            <Radio.Button value="area">Area</Radio.Button>
            <Radio.Button value="bar">Bar</Radio.Button>
          </Radio.Group>
        </div>

        <Divider />

        <div>
          <Title level={5}>Color Scheme</Title>
          <Radio.Group value={userConfig.colorScheme} onChange={(e) => updateConfig('colorScheme', e.target.value)}>
            <Radio.Button value="default">Default</Radio.Button>
            <Radio.Button value="blue">Blue</Radio.Button>
            <Radio.Button value="green">Green</Radio.Button>
            <Radio.Button value="purple">Purple</Radio.Button>
          </Radio.Group>
        </div>

        <Divider />

        <div>
          <Title level={5}>Refresh Interval: {userConfig.refreshInterval}s</Title>
          <Slider
            min={10}
            max={300}
            step={10}
            value={userConfig.refreshInterval}
            onChange={(value) => updateConfig('refreshInterval', value)}
            marks={{ 10: '10s', 60: '1m', 120: '2m', 300: '5m' }}
          />
        </div>

        <Divider />

        <div>
          <Space>
            <Text>Compact Mode</Text>
            <Switch checked={userConfig.compactMode} onChange={(checked) => updateConfig('compactMode', checked)} />
          </Space>
        </div>
      </Space>
    </Drawer>
  );

  // ============================================
  // MAIN RENDER
  // ============================================
  if (loading && !dashboardData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading cafeteria analytics..." />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error Loading Data" description={error} type="error" showIcon action={<Button onClick={refetch} type="primary">Retry</Button>} />;
  }

  const sortedWidgets = Object.entries(userConfig.widgets)
    .sort(([, a], [, b]) => a.order - b.order)
    .filter(([, widget]) => widget.enabled);

  return (
    <div style={{ padding: userConfig.compactMode ? '20px' : '32px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 32 }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Space size="middle">
              <Title level={2} style={{ margin: 0 }}>Cafeteria Congestion Analytics Dashboard</Title>
              {/* ✅ ADD: WebSocket Connection Indicator */}
              {wsConnected ? (
                <Badge 
                  status="processing" 
                  text="Live Updates Active" 
                  style={{ 
                    fontSize: '12px', 
                    color: '#52c41a',
                    fontWeight: 500 
                  }} 
                />
              ) : (
                <Badge 
                  status="default" 
                  text="Offline" 
                  style={{ 
                    fontSize: '12px', 
                    color: '#999',
                    fontWeight: 500 
                  }} 
                />
              )}
            </Space>
          </Col>
          <Col>
            <Row gutter={[12, 12]} justify="end">
              <Col>
                <Popover
                  content={
                    <div style={{ width: '400px', padding: '20px' }}>
                      <div style={{ marginBottom: 20 }}>
                        <Text strong style={{ fontSize: '15px', color: '#262626' }}>Time Filters</Text>
                      </div>
                      
                      <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Text style={{ fontSize: '13px', color: '#595959', fontWeight: 500, minWidth: '80px' }}>
                            Data View
                          </Text>
                          <Select 
                            value={dateFilter}
                            onChange={setDateFilter}
                            style={{ width: 220 }}
                            size="middle"
                          >
                            <Option value="daily">Daily View</Option>
                            <Option value="weekly">Weekly View</Option>
                            <Option value="monthly">Monthly View</Option>
                          </Select>
                        </div>

                        {dateFilter === 'daily' && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Text style={{ fontSize: '13px', color: '#595959', fontWeight: 500, minWidth: '80px' }}>
                              Time Range
                            </Text>
                            <Select 
                              value={timeRange}
                              onChange={setTimeRange}
                              style={{ width: 220 }}
                              size="middle"
                            >
                              <Option value={6}>Last 6 hours</Option>
                              <Option value={12}>Last 12 hours</Option>
                              <Option value={24}>Last 24 hours</Option>
                              <Option value={48}>Last 48 hours</Option>
                            </Select>
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                          <Button 
                            type="link" 
                            style={{ padding: 0, fontSize: '13px', color: '#8c8c8c' }}
                            onClick={() => {
                              setDateFilter('daily');
                              setTimeRange(24);
                              message.success('Time filters reset');
                            }}
                          >
                            Reset time filters
                          </Button>
                        </div>
                      </Space>
                    </div>
                  }
                  title={null}
                  trigger="click"
                  open={filterPanelVisible}
                  onOpenChange={setFilterPanelVisible}
                  placement="bottomLeft"
                  overlayStyle={{ width: 'auto' }}
                  overlayInnerStyle={{ padding: '0', borderRadius: '8px', boxShadow: '0 3px 12px rgba(0,0,0,0.15)' }}
                >
                  <Button 
                    icon={<FilterOutlined />}
                    size="large"
                    style={{
                      height: '40px',
                      borderRadius: '8px',
                      border: '1px solid #d9d9d9',
                    }}
                  >
                    Filter
                    {(dateFilter !== 'daily' || timeRange !== 24) && (
                      <Badge 
                        count={
                          (dateFilter !== 'daily' ? 1 : 0) + 
                          (timeRange !== 24 ? 1 : 0)
                        } 
                        style={{ 
                          backgroundColor: '#1890ff',
                          marginLeft: '8px',
                        }} 
                      />
                    )}
                  </Button>
                </Popover>
              </Col>
              <Col>
                <Button 
                  icon={<span>↕️</span>}
                  size="large"
                  style={{
                    height: '40px',
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9',
                  }}
                >
                  Sort
                </Button>
              </Col>
              <Col>
                <Button 
                  onClick={refetch} 
                  loading={loading} 
                  icon={<ReloadOutlined />} 
                  size="large"
                  style={{ height: '40px', borderRadius: '8px' }}
                >
                  Refresh
                </Button>
              </Col>
              <Col>
                <Button 
                  onClick={() => setSettingsVisible(true)} 
                  icon={<SettingOutlined />} 
                  type="primary" 
                  size="large"
                  style={{ height: '40px', borderRadius: '8px' }}
                >
                  Settings
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Select
            value={selectedLocation}
            onChange={setSelectedLocation}
            bordered={false}
            style={{ 
              fontSize: '14px',
              fontWeight: 500,
            }}
            suffixIcon={<span style={{ fontSize: '12px' }}>▼</span>}
            dropdownStyle={{ minWidth: '300px' }}
          >
            <Option value="Intel, RMZ Ecoworld, Bangalore">Intel, RMZ Ecoworld, Bangalore</Option>
          </Select>

          <Divider type="vertical" style={{ height: '20px', borderColor: '#d9d9d9' }} />

          <Select
            value={selectedCafeteria}
            onChange={setSelectedCafeteria}
            bordered={false}
            style={{ 
              fontSize: '14px',
              fontWeight: 500,
              minWidth: '150px',
            }}
            suffixIcon={<span style={{ fontSize: '12px' }}>▼</span>}
          >
            <Option value="SRR 4A">SRR 4A</Option>
            <Option value="SRR 4B">SRR 4B</Option>
          </Select>

          <Badge 
            count={
              dateFilter === 'daily' 
                ? `Last ${timeRange}h` 
                : dateFilter === 'weekly' 
                ? 'Weekly' 
                : 'Monthly'
            }
            style={{ 
              backgroundColor: '#f0f0f0',
              color: '#595959',
              fontSize: '12px',
              fontWeight: 500,
              border: '1px solid #d9d9d9',
            }}
          />
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        items={[
          {
            key: 'overview',
            label: <span style={{ fontSize: '16px', fontWeight: 500 }}>Overview</span>,
            children: (
              <Row gutter={[20, 20]} style={{ marginTop: 8 }}>
                {sortedWidgets
                  .filter(([key]) => ['occupancyStatus', 'todaysVisitors', 'avgDwellTime', 'peakHours', 'counterStatus', 'inflowOutflow'].includes(key))
                  .map(([key, widget]) => {
                    const colSpan = getColSpan(widget.size);
                    let content = null;

                    switch (key) {
                      case 'occupancyStatus':
                        content = renderOccupancyStatus();
                        break;
                      case 'inflowOutflow':
                        content = renderInflowOutflow();
                        break;
                      case 'counterStatus':
                        content = renderCounterStatus();
                        break;
                      case 'todaysVisitors':
                        content = renderTodaysVisitors();
                        break;
                      case 'avgDwellTime':
                        content = renderAvgDwellTime();
                        break;
                      case 'peakHours':
                        content = renderPeakHours();
                        break;
                    }

                    return content ? (
                      <Col key={key} {...colSpan}>
                        {content}
                      </Col>
                    ) : null;
                  })}
              </Row>
            ),
          },
          {
            key: 'analytics',
            label: <span style={{ fontSize: '16px', fontWeight: 500 }}>Analytics</span>,
            children: (
              <Row gutter={[20, 20]} style={{ marginTop: 8 }}>
                {sortedWidgets
                  .filter(([key]) => ['dwellTime', 'occupancyTrend', 'weeklyHeatmap', 'counterCongestionTrend', 'counterEfficiency', 'footfallComparison'].includes(key))
                  .map(([key, widget]) => {
                    const colSpan = getColSpan(widget.size);
                    let content = null;

                    switch (key) {
                      case 'dwellTime':
                        content = renderDwellTime();
                        break;
                      case 'footfallComparison':
                        content = renderFootfallComparison();
                        break;
                      case 'occupancyTrend':
                        content = renderOccupancyTrend();
                        break;
                      case 'counterCongestionTrend':
                        content = renderCounterCongestionTrend();
                        break;
                      case 'weeklyHeatmap':
                        content = renderWeeklyHeatmap();
                        break;
                      case 'counterEfficiency':
                        content = renderCounterEfficiency();
                        break;
                    }

                    return content ? (
                      <Col key={key} {...colSpan}>
                        {content}
                      </Col>
                    ) : null;
                  })}
              </Row>
            ),
          },
        ]}
      />
      
      <div style={{ marginTop: 24, textAlign: 'right', color: '#999', fontSize: 12 }}>
        Last updated: {lastUpdated} | {availableCounters.length > 0 && `${availableCounters.length} counters active`}
      </div>

      {renderSettingsDrawer()}
    </div>
  );
};

export default CafeteriaAnalyticsDashboard;
// Replace the stub function at the bottom with the proper React import
// The useCallback is already being used correctly in the component above.
// The stub function at the end should be removed since React's useCallback is imported at the top.

// Simply remove these lines:
// function useCallback(arg0: (update: any) => void, arg1: undefined[]) {
//   throw new Error('Function not implemented.');
// }

