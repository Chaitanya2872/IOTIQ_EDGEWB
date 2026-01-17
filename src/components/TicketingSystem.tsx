// CafeteriaAnalyticsDashboard.tsx - ENHANCED WITH DRAG & DROP
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
} from 'antd';
import {
  LineChart,
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
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// ============================================
// TYPES
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
    inflowOutflow: { id: 'inflowOutflow', enabled: true, size: 'full', order: 4 },
    occupancyTrend: { id: 'occupancyTrend', enabled: true, size: 'full', order: 5 },
    weeklyHeatmap: { id: 'weeklyHeatmap', enabled: true, size: 'full', order: 6 },
    counterStatus: { id: 'counterStatus', enabled: true, size: 'full', order: 7 },
    counterEfficiency: { id: 'counterEfficiency', enabled: true, size: 'full', order: 8 },
    counterCongestionTrend: { id: 'counterCongestionTrend', enabled: true, size: 'full', order: 9 },
    footfallComparison: { id: 'footfallComparison', enabled: true, size: 'full', order: 10 },
  },
  refreshInterval: 30,
  timeRange: 24,
  chartType: 'line',
  colorScheme: 'default',
  compactMode: false,
  dwellTimeChartType: 'bar',
  occupancyTrendType: 'line',
};

// ============================================
// MOCK DATA GENERATOR
// ============================================
const mockCafeteriaData = {
  generateOccupancyData: (): OccupancyData => {
    const capacity = 250;
    const currentOccupancy = Math.floor(Math.random() * capacity);
    const percentage = (currentOccupancy / capacity) * 100;
    
    let congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    if (percentage < 40) congestionLevel = 'LOW';
    else if (percentage < 75) congestionLevel = 'MEDIUM';
    else congestionLevel = 'HIGH';

    return {
      currentOccupancy,
      capacity,
      congestionLevel,
      timestamp: new Date().toISOString(),
    };
  },

  generateFlowData: (hours: number): FlowData[] => {
    const data: FlowData[] = [];
    const now = new Date();
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      let inflow = Math.floor(Math.random() * 50) + 10;
      let outflow = Math.floor(Math.random() * 50) + 10;
      
      if (hour >= 12 && hour <= 14) {
        inflow += 30;
        outflow += 20;
      }
      
      data.push({
        timestamp: time.getHours() + ':00',
        inflow,
        outflow,
        netFlow: inflow - outflow,
      });
    }
    return data;
  },

  generateCounterStatus: (): CounterStatus[] => {
    const counters = ['Bisi Oota/ Mini meals Counter', 'Two Good Counter', 'Healthy Station Counter'];
    return counters.map(counter => {
      const queueLength = Math.floor(Math.random() * 25);
      const waitingTime = Math.floor(queueLength * 1.5);
      let congestionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
      
      if (queueLength < 8) congestionLevel = 'LOW';
      else if (queueLength < 15) congestionLevel = 'MEDIUM';
      else congestionLevel = 'HIGH';

      return {
        counterName: counter,
        queueLength,
        waitingTime,
        congestionLevel,
        lastUpdated: new Date().toISOString(),
      };
    });
  },

  generateOccupancyTrendData: (hours: number) => {
    const data: any[] = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      let occupancy = Math.floor(Math.random() * 100) + 50;
      
      // Peak hours: 12-14 (lunch) and 19-21 (dinner)
      if ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)) {
        occupancy += 100;
      }
      
      data.push({
        timestamp: time.getHours() + ':00',
        occupancy: Math.min(occupancy, 250),
        hour: time.getHours(),
      });
    }
    return data;
  },

  generateCounterCongestionTrendData: (hours: number) => {
    const counters = ['Bisi Oota/ Mini meals Counter', 'Two Good Counter', 'Healthy Station Counter'];
    const data: any[] = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      const entry: any = { timestamp: time.getHours() + ':00' };
      
      counters.forEach(counter => {
        let queueLength = Math.floor(Math.random() * 10) + 2;
        
        // Peak hours
        if ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)) {
          queueLength += 8;
        }
        
        entry[counter] = Math.min(queueLength, 25);
      });
      
      data.push(entry);
    }
    return data;
  },

  generateFootfallComparison: (hours: number): FootfallComparison[] => {
    const data: FootfallComparison[] = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      const cafeteriaFootfall = Math.floor(Math.random() * 100) + 50;
      const countersFootfall = Math.floor(Math.random() * 80) + 30;
      const ratio = cafeteriaFootfall / countersFootfall;
      
      let insight = 'Normal flow';
      if (ratio > 1.5) {
        insight = 'Counter hopping detected - people browsing multiple counters';
      } else if (ratio < 0.8) {
        insight = 'Potential congestion at counters - delays expected';
      }
      
      data.push({
        timestamp: time.getHours() + ':00',
        cafeteriaFootfall,
        countersFootfall,
        ratio,
        insight,
      });
    }
    return data;
  },

  generateDwellTimeData: (): DwellTimeData[] => {
    const ranges = ['0-10 min', '10-20 min', '20-30 min', '30-45 min', '45+ min'];
    const counts = [45, 80, 65, 35, 15];
    const total = counts.reduce((a, b) => a + b, 0);
    
    return ranges.map((range, i) => ({
      timeRange: range,
      count: counts[i],
      percentage: Math.round((counts[i] / total) * 100),
    }));
  },

  generateFootfallComparison: (hours: number): FootfallComparison[] => {
    const data: FootfallComparison[] = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      const cafeteriaFootfall = Math.floor(Math.random() * 100) + 50;
      const countersFootfall = Math.floor(Math.random() * 80) + 30;
      const ratio = cafeteriaFootfall / countersFootfall;
      
      let insight = 'Normal flow';
      if (ratio > 1.5) {
        insight = 'Counter hopping detected - people browsing multiple counters';
      } else if (ratio < 0.8) {
        insight = 'Potential congestion at counters - delays expected';
      }
      
      data.push({
        timestamp: time.getHours() + ':00',
        cafeteriaFootfall,
        countersFootfall,
        ratio,
        insight,
      });
    }
    return data;
  },

  generateOccupancyTrendData: (hours: number) => {
    const data: any[] = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      let occupancy = Math.floor(Math.random() * 100) + 50;
      
      // Peak hours: 12-14 (lunch) and 19-21 (dinner)
      if ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)) {
        occupancy += 100;
      }
      
      data.push({
        timestamp: time.getHours() + ':00',
        occupancy: Math.min(occupancy, 250),
        hour: time.getHours(),
      });
    }
    return data;
  },

  generateCounterCongestionTrendData: (hours: number) => {
    const counters = ['Bisi Oota/ Mini meals Counter', 'Two Good Counter', 'Healthy Station Counter'];
    const data: any[] = [];
    const now = new Date();
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hour = time.getHours();
      const entry: any = { timestamp: time.getHours() + ':00' };
      
      counters.forEach(counter => {
        let queueLength = Math.floor(Math.random() * 10) + 2;
        
        // Peak hours
        if ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 21)) {
          queueLength += 8;
        }
        
        entry[counter] = Math.min(queueLength, 25);
      });
      
      data.push(entry);
    }
    return data;
  },

  generateWeeklyHeatmapData: () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data: any[] = [];
    
    days.forEach((day, dayIndex) => {
      for (let hour = 6; hour <= 22; hour++) {
        let occupancy = Math.floor(Math.random() * 50) + 30;
        const isWeekend = dayIndex >= 5;
        
        // Peak hours
        if ((hour >= 12 && hour <= 14) || (hour >= 19 && hour <= 20)) {
          occupancy += isWeekend ? 30 : 80;
        }
        
        if (isWeekend) {
          occupancy = Math.floor(occupancy * 0.6);
        }
        
        data.push({
          day,
          hour: hour.toString().padStart(2, '0') + ':00',
          hourNum: hour,
          dayIndex,
          value: Math.min(occupancy, 250),
        });
      }
    });
    
    return data;
  },

  generateCounterEfficiencyData: () => {
    const counters = ['Bisi Oota/ Mini meals Counter', 'Two Good Counter', 'Healthy Station Counter'];
    
    return counters.map(counter => {
      const avgServiceTime = Math.floor(Math.random() * 3) + 2; // 2-5 min
      const totalServed = Math.floor(Math.random() * 200) + 150;
      const avgWaitTime = Math.floor(Math.random() * 8) + 3; // 3-11 min
      const efficiency = Math.round((1 / avgServiceTime) * 100);
      const peakWaitTime = avgWaitTime + Math.floor(Math.random() * 5) + 3;
      
      return {
        counterName: counter,
        avgServiceTime,
        totalServed,
        avgWaitTime,
        peakWaitTime,
        efficiency: Math.min(efficiency, 100),
      };
    });
  },

  generateTodaysVisitors: () => {
    const baseVisitors = 1000;
    const variance = Math.floor(Math.random() * 500);
    const totalVisitors = baseVisitors + variance;
    const lastHourVisitors = Math.floor(Math.random() * 150) + 50;
    const percentageChange = Math.floor((Math.random() - 0.5) * 30);
    
    return {
      total: totalVisitors,
      sinceTime: '7:00 AM',
      lastHour: lastHourVisitors,
      percentageChange,
      trend: percentageChange >= 0 ? 'up' : 'down',
    };
  },

  generateAvgDwellTime: () => {
    const minutes = Math.floor(Math.random() * 5) + 1;
    const seconds = Math.floor(Math.random() * 60);
    const totalSeconds = minutes * 60 + seconds;
    const percentageChange = Math.floor((Math.random() - 0.5) * 20);
    
    return {
      minutes,
      seconds,
      totalSeconds,
      formatted: `${minutes}m ${seconds}s`,
      percentageChange,
      trend: percentageChange >= 0 ? 'up' : 'down',
      note: 'Across all counters',
    };
  },
};

// ============================================
// HELPER FUNCTIONS
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
    case 'HIGH': return 'High - Crowded';
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
  useMockData?: boolean 
}> = ({
  config = {},
  useMockData = true,
}) => {
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [mockMode] = useState(useMockData);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  
  // Customizable config state
  const [userConfig, setUserConfig] = useState<DashboardConfig>({ 
    ...DEFAULT_CONFIG, 
    ...config,
    widgets: { ...DEFAULT_CONFIG.widgets, ...config.widgets }
  });
  
  const [occupancyData, setOccupancyData] = useState<OccupancyData | null>(null);
  const [flowData, setFlowData] = useState<FlowData[]>([]);
  const [counterStatus, setCounterStatus] = useState<CounterStatus[]>([]);
  const [dwellTimeData, setDwellTimeData] = useState<DwellTimeData[]>([]);
  const [footfallComparison, setFootfallComparison] = useState<FootfallComparison[]>([]);
  const [occupancyTrendData, setOccupancyTrendData] = useState<any[]>([]);
  const [counterCongestionData, setCounterCongestionData] = useState<any[]>([]);
  const [weeklyHeatmapData, setWeeklyHeatmapData] = useState<any[]>([]);
  const [counterEfficiencyData, setCounterEfficiencyData] = useState<any[]>([]);
  const [todaysVisitors, setTodaysVisitors] = useState<any>(null);
  const [avgDwellTime, setAvgDwellTime] = useState<any>(null);
  
  const [selectedDate] = useState(dayjs());
  const [timeRange, setTimeRange] = useState(userConfig.timeRange || 24);
  const [selectedLocation, setSelectedLocation] = useState<string>('Intel, RMZ Ecoworld, Bangalore');
  const [selectedCafeteria, setSelectedCafeteria] = useState<string>('SRR 4A');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [dateFilter, setDateFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [selectedDwellCounter, setSelectedDwellCounter] = useState<string>('all');
  const [visibleCounters, setVisibleCounters] = useState<{[key: string]: boolean}>({
    'Bisi Oota/ Mini meals Counter': true,
    'Two Good Counter': true,
    'Healthy Station Counter': true,
  });

  const colors = getColorScheme(userConfig.colorScheme || 'default');

  // ============================================
  // DATA FETCHING
  // ============================================
  // Helper function to format timestamp based on date filter
  const formatTimestampForFilter = (dateIndex: number, filter: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date();
    
    if (filter === 'daily') {
      const time = new Date(now.getTime() - dateIndex * 60 * 60 * 1000);
      return time.getHours().toString().padStart(2, '0') + ':00';
    } else if (filter === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const time = new Date(now.getTime() - dateIndex * 60 * 60 * 1000);
      return days[time.getDay()];
    } else { // monthly
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      // Calculate actual date going backwards
      const time = new Date(now.getTime() - dateIndex * 60 * 60 * 1000);
      return months[time.getMonth()];
    }
  };

  // Helper to aggregate data for weekly/monthly views
  const aggregateDataByFilter = (data: any[], filter: 'daily' | 'weekly' | 'monthly') => {
    if (filter === 'daily') return data;
    
    const aggregated: any = {};
    
    data.forEach(item => {
      const key = item.timestamp;
      if (!aggregated[key]) {
        aggregated[key] = { ...item, count: 1 };
      } else {
        // Average the values for weekly/monthly
        Object.keys(item).forEach(k => {
          if (k !== 'timestamp' && typeof item[k] === 'number') {
            aggregated[key][k] = (aggregated[key][k] * aggregated[key].count + item[k]) / (aggregated[key].count + 1);
          }
        });
        aggregated[key].count++;
      }
    });
    
    return Object.values(aggregated).map((item: any) => {
      const { count, ...rest } = item;
      // Round the averaged values
      Object.keys(rest).forEach(k => {
        if (k !== 'timestamp' && typeof rest[k] === 'number') {
          rest[k] = Math.round(rest[k]);
        }
      });
      return rest;
    });
  };

  const fetchMockData = () => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        // Calculate time range based on date filter
        let dataTimeRange = timeRange;
        let samplingInterval = 1; // hours
        
        if (dateFilter === 'weekly') {
          dataTimeRange = 168; // 7 days * 24 hours
          samplingInterval = 24; // Sample every 24 hours (1 per day)
        } else if (dateFilter === 'monthly') {
          dataTimeRange = 8760; // 365 days * 24 hours (1 year)
          samplingInterval = 730; // Sample every ~30 days to get 12 months
        }

        if (userConfig.widgets.occupancyStatus.enabled) {
          setOccupancyData(mockCafeteriaData.generateOccupancyData());
        }
        
        if (userConfig.widgets.inflowOutflow.enabled) {
          const rawData = mockCafeteriaData.generateFlowData(dataTimeRange);
          const formattedData = rawData
            .filter((_, index) => index % Math.ceil(samplingInterval) === 0)
            .map((item, index) => ({
              ...item,
              timestamp: formatTimestampForFilter(index * Math.ceil(samplingInterval), dateFilter)
            }));
          const aggregated = aggregateDataByFilter(formattedData, dateFilter);
          // Reverse for chronological order (oldest to newest)
          setFlowData(aggregated.reverse());
        }
        
        if (userConfig.widgets.counterStatus.enabled) {
          setCounterStatus(mockCafeteriaData.generateCounterStatus());
        }
        
        if (userConfig.widgets.dwellTime.enabled) {
          setDwellTimeData(mockCafeteriaData.generateDwellTimeData());
        }
        
        if (userConfig.widgets.footfallComparison.enabled) {
          const rawData = mockCafeteriaData.generateFootfallComparison(dataTimeRange);
          const formattedData = rawData
            .filter((_, index) => index % Math.ceil(samplingInterval) === 0)
            .map((item, index) => ({
              ...item,
              timestamp: formatTimestampForFilter(index * Math.ceil(samplingInterval), dateFilter)
            }));
          const aggregated = aggregateDataByFilter(formattedData, dateFilter);
          // Reverse for chronological order (oldest to newest)
          setFootfallComparison(aggregated.reverse());
        }
        
        if (userConfig.widgets.occupancyTrend.enabled) {
          const rawData = mockCafeteriaData.generateOccupancyTrendData(dataTimeRange);
          const formattedData = rawData
            .filter((_, index) => index % Math.ceil(samplingInterval) === 0)
            .map((item, index) => ({
              ...item,
              timestamp: formatTimestampForFilter(index * Math.ceil(samplingInterval), dateFilter)
            }));
          const aggregated = aggregateDataByFilter(formattedData, dateFilter);
          // Reverse for chronological order (oldest to newest)
          setOccupancyTrendData(aggregated.reverse());
        }
        
        if (userConfig.widgets.counterCongestionTrend.enabled) {
          const rawData = mockCafeteriaData.generateCounterCongestionTrendData(dataTimeRange);
          const formattedData = rawData
            .filter((_, index) => index % Math.ceil(samplingInterval) === 0)
            .map((item, index) => ({
              ...item,
              timestamp: formatTimestampForFilter(index * Math.ceil(samplingInterval), dateFilter)
            }));
          const aggregated = aggregateDataByFilter(formattedData, dateFilter);
          // Reverse for chronological order (oldest to newest)
          setCounterCongestionData(aggregated.reverse());
        }
        
        if (userConfig.widgets.weeklyHeatmap.enabled) {
          setWeeklyHeatmapData(mockCafeteriaData.generateWeeklyHeatmapData());
        }
        
        if (userConfig.widgets.counterEfficiency.enabled) {
          setCounterEfficiencyData(mockCafeteriaData.generateCounterEfficiencyData());
        }
        
        if (userConfig.widgets.todaysVisitors.enabled) {
          setTodaysVisitors(mockCafeteriaData.generateTodaysVisitors());
        }
        
        if (userConfig.widgets.avgDwellTime.enabled) {
          setAvgDwellTime(mockCafeteriaData.generateAvgDwellTime());
        }
        
        setLastUpdated(new Date().toLocaleTimeString());
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to generate mock data');
        setLoading(false);
      }
    }, 500);
  };

  useEffect(() => {
    if (mockMode) {
      fetchMockData();
    }
    const interval = setInterval(
      () => mockMode && fetchMockData(),
      (userConfig.refreshInterval || 30) * 1000
    );
    return () => clearInterval(interval);
  }, [timeRange, dateFilter, userConfig.refreshInterval]);

  // ============================================
  // CONFIG HANDLERS
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
    // Clear localStorage to prevent conflicts
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
      // Merge loaded config with default config to ensure all widgets exist
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
  const renderOccupancyStatus = () => {
    if (!occupancyData) return null;
    const occupancyPercentage = Math.round((occupancyData.currentOccupancy / occupancyData.capacity) * 100);

    return (
      <Card 
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <TeamOutlined />
            <span>Cafeteria Occupancy</span>
            <Badge status="processing" text="Live" />
          </Space>
        }
        size={userConfig.compactMode ? 'small' : 'default'}
        style={{ height: '100%' }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Row gutter={[16, 16]} align="middle" style={{ flex: 1 }}>
            <Col span={12}>
              <Statistic
                title="Current Occupancy"
                value={occupancyData.currentOccupancy}
                suffix={`/ ${occupancyData.capacity}`}
                prefix={<UserOutlined />}
              />
            </Col>
            <Col span={12}>
              <Progress
                type="dashboard"
                percent={occupancyPercentage}
                strokeColor={getCongestionColor(occupancyData.congestionLevel)}
                size={userConfig.compactMode ? 120 : 160}
                format={(percent) => <span style={{ fontSize: '28px', fontWeight: 'bold' }}>{percent}%</span>}
              />
            </Col>
            <Col span={24}>
              <Alert
                message={getCongestionText(occupancyData.congestionLevel)}
                type={occupancyData.congestionLevel === 'HIGH' ? 'error' : occupancyData.congestionLevel === 'MEDIUM' ? 'warning' : 'success'}
                showIcon
              />
            </Col>
          </Row>
        </div>
      </Card>
    );
  };

  const renderTodaysVisitors = () => {
    if (!todaysVisitors) return null;

    return (
      <Card
        style={{ height: '100%' }}
        bodyStyle={{ padding: '24px' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Today's Visitors
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
              <Badge 
                count={`${todaysVisitors.trend === 'up' ? '↑' : '↓'} ${Math.abs(todaysVisitors.percentageChange)}%`}
                style={{ 
                  backgroundColor: todaysVisitors.trend === 'up' ? '#52c41a' : '#ff4d4f',
                  fontSize: '12px',
                }}
              />
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
              Avg Dwell Time
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

  const renderInflowOutflow = () => {
    if (flowData.length === 0) return null;
    
    const ChartComponent = userConfig.chartType === 'area' ? AreaChart : userConfig.chartType === 'bar' ? BarChart : LineChart;
    const DataComponent = userConfig.chartType === 'area' ? Area : userConfig.chartType === 'bar' ? Bar : Line;

    return (
      <Card 
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            Inflow vs Outflow (People vs Time)
          </Space>
        } 
        size={userConfig.compactMode ? 'small' : 'default'}
        bodyStyle={{ padding: '24px' }}
      >
        <ResponsiveContainer width="100%" height={userConfig.compactMode ? 250 : 300}>
          <ChartComponent data={flowData} margin={{ left: -20, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="timestamp" stroke="#8c8c8c" />
            <YAxis stroke="#8c8c8c" />
            <RechartsTooltip />
            <Legend />
            {userConfig.chartType === 'bar' ? (
              <>
                <Bar dataKey="inflow" fill="#1890ff" name="Inflow" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" fill="#ff4d4f" name="Outflow" radius={[4, 4, 0, 0]} />
              </>
            ) : (
              <>
                <DataComponent type="monotone" dataKey="inflow" stroke="#1890ff" fill="#1890ff" strokeWidth={2} name="Inflow" dot={false} />
                <DataComponent type="monotone" dataKey="outflow" stroke="#ff4d4f" fill="#ff4d4f" strokeWidth={2} name="Outflow" dot={false} />
              </>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </Card>
    );
  };

  const renderCounterStatus = () => {
    if (counterStatus.length === 0) return null;
    const columns = [
      { title: 'Counter', dataIndex: 'counterName', key: 'counterName', render: (text: string) => <Text strong>{text}</Text> },
      { title: 'Queue', dataIndex: 'queueLength', key: 'queueLength', render: (value: number) => <Statistic value={value} valueStyle={{ fontSize: '16px' }} prefix={<TeamOutlined />} /> },
      { title: 'Wait Time', dataIndex: 'waitingTime', key: 'waitingTime', render: (value: number) => <Space><ClockCircleOutlined /><Text>{value} min</Text></Space> },
      { title: 'Status', dataIndex: 'congestionLevel', key: 'congestionLevel', render: (level: string) => <Badge color={getCongestionColor(level)} text={getCongestionText(level)} /> },
    ];

    return (
      <Card 
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <FireOutlined />
            <span>Live Food Counter Status</span>
          </Space>
        } 
        size={userConfig.compactMode ? 'small' : 'default'}
        bodyStyle={{ padding: '24px' }}
      >
        <Table dataSource={counterStatus} columns={columns} pagination={false} size="small" rowKey="counterName" />
      </Card>
    );
  };

  const renderDwellTime = () => {
    if (dwellTimeData.length === 0) return null;
    
    const COLORS = ['#1890ff', '#40a9ff', '#69c0ff', '#91d5ff', '#bae7ff'];

    // Filter data based on selected counter (in real implementation, this would come from API)
    // For now, we'll simulate by adjusting percentages
    let filteredData = dwellTimeData;
    if (selectedDwellCounter !== 'all') {
      // Simulate counter-specific data by adjusting distributions
      filteredData = dwellTimeData.map((item, index) => ({
        ...item,
        count: Math.floor(item.count * (0.3 + Math.random() * 0.4)), // Simulate variation
        percentage: 0
      }));
      const total = filteredData.reduce((sum, item) => sum + item.count, 0);
      filteredData = filteredData.map(item => ({
        ...item,
        percentage: Math.round((item.count / total) * 100)
      }));
    }

    return (
      <Card 
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <ClockCircleOutlined />
            <span>Dwell Time Distribution (Time vs Number of People)</span>
          </Space>
        }
        extra={
          <Select
            value={selectedDwellCounter}
            onChange={setSelectedDwellCounter}
            style={{ width: 220 }}
            size="small"
          >
            <Option value="all">All Counters</Option>
            <Option value="Bisi Oota/ Mini meals Counter">Bisi Oota/ Mini meals</Option>
            <Option value="Two Good Counter">Two Good</Option>
            <Option value="Healthy Station Counter">Healthy Station</Option>
          </Select>
        }
        size={userConfig.compactMode ? 'small' : 'default'}
        style={{ height: '100%' }}
        bodyStyle={{ padding: '24px' }}
      >
        {userConfig.dwellTimeChartType === 'bar' ? (
          <ResponsiveContainer width="100%" height={userConfig.compactMode ? 280 : 340}>
            <BarChart data={filteredData} layout="vertical" margin={{ left: 10, right: 40, top: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#8c8c8c" />
              <YAxis dataKey="timeRange" type="category" stroke="#8c8c8c" width={90} />
              <RechartsTooltip 
                formatter={(value: any, name: string) => {
                  if (name === 'count') return [value + ' people', 'Count'];
                  return [value + '%', 'Percentage'];
                }}
              />
              <Bar dataKey="count" radius={[0, 3, 3, 0]} name="count" barSize={20}>
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Row gutter={16} align="middle" style={{ height: '100%' }}>
            <Col span={12}>
              <ResponsiveContainer width="100%" height={userConfig.compactMode ? 200 : 260}>
                <PieChart>
                  <Pie
                    data={filteredData}
                    cx="50%"
                    cy="50%"
                    innerRadius={userConfig.compactMode ? 40 : 60}
                    outerRadius={userConfig.compactMode ? 70 : 90}
                    dataKey="count"
                    paddingAngle={2}
                  >
                    {filteredData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </Col>
            <Col span={12}>
              <Space direction="vertical" style={{ width: '100%' }} size="small">
                {filteredData.map((item, index) => (
                  <div key={item.timeRange}>
                    <Space style={{ marginBottom: 4 }}>
                      <div style={{ 
                        width: 12, 
                        height: 12, 
                        backgroundColor: COLORS[index % COLORS.length],
                        borderRadius: 2 
                      }} />
                      <Text style={{ fontSize: 13 }}>{item.timeRange}</Text>
                    </Space>
                    <Text strong style={{ fontSize: 16 }}>{item.count}</Text>
                    <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>({item.percentage}%)</Text>
                  </div>
                ))}
              </Space>
            </Col>
          </Row>
        )}
        
        {/* Detailed Statistics */}
        <Divider style={{ margin: '20px 0' }} />
        <Row gutter={16}>
          <Col span={8}>
            <Statistic 
              title="Average Dwell Time" 
              value="18m 32s" 
              valueStyle={{ fontSize: '18px', color: '#1890ff' }}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Peak Hour Dwell Time" 
              value="25m 15s" 
              valueStyle={{ fontSize: '18px', color: '#ff7a45' }}
            />
          </Col>
          <Col span={8}>
            <Statistic 
              title="Off-Peak Dwell Time" 
              value="12m 48s" 
              valueStyle={{ fontSize: '18px', color: '#52c41a' }}
            />
          </Col>
        </Row>
      </Card>
    );
  };

  const renderFootfallComparison = () => {
    if (footfallComparison.length === 0) return null;

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
        <ResponsiveContainer width="100%" height={userConfig.compactMode ? 250 : 300}>
          <ComposedChart data={footfallComparison} margin={{ left: -20, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="timestamp" stroke="#8c8c8c" />
            <YAxis stroke="#8c8c8c" />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="cafeteriaFootfall" fill="#1890ff" name="Cafeteria Footfall" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="countersFootfall" stroke="#ff4d4f" strokeWidth={2} dot={false} name="Counters Footfall" />
          </ComposedChart>
        </ResponsiveContainer>
        <div style={{ marginTop: 16 }}>
          <Title level={5}>Smart Insights</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            {footfallComparison
              .filter((item) => item.insight !== 'Normal flow')
              .slice(0, 3)
              .map((item, index) => (
                <Alert
                  key={index}
                  message={<Space>{getInsightIcon(item.insight)}<Text strong>{item.timestamp}</Text><Text>{item.insight}</Text></Space>}
                  type={item.insight.includes('congestion') ? 'warning' : 'info'}
                  showIcon={false}
                />
              ))}
          </Space>
        </div>
      </Card>
    );
  };

  const renderOccupancyTrend = () => {
    if (occupancyTrendData.length === 0) return null;

    if (userConfig.occupancyTrendType === 'heatmap') {
      // Heatmap visualization
      const maxOccupancy = Math.max(...occupancyTrendData.map(d => d.occupancy));
      
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
          <div style={{ padding: '20px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <Text strong style={{ width: 80 }}>Time</Text>
              <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                {occupancyTrendData.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      height: 60,
                      backgroundColor: `rgba(24, 144, 255, ${item.occupancy / maxOccupancy})`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: item.occupancy / maxOccupancy > 0.5 ? '#fff' : '#000',
                      fontSize: 11,
                      fontWeight: 'bold',
                      border: '1px solid #f0f0f0',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    title={`${item.timestamp}: ${item.occupancy} people`}
                  >
                    {item.timestamp}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Text strong style={{ width: 80 }}>Occupancy</Text>
              <div style={{ flex: 1, display: 'flex', gap: 4 }}>
                {occupancyTrendData.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: 'bold',
                      color: '#1890ff',
                    }}
                  >
                    {item.occupancy}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Text type="secondary">Low</Text>
              <div style={{ 
                width: 200, 
                height: 20, 
                background: 'linear-gradient(to right, rgba(24, 144, 255, 0.1), rgba(24, 144, 255, 1))',
                border: '1px solid #f0f0f0'
              }} />
              <Text type="secondary">High</Text>
            </div>
          </div>
        </Card>
      );
    }

    // Line chart visualization
    return (
      <Card 
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <TeamOutlined />
            <span>Cafeteria Occupancy Trend (People vs Time)</span>
          </Space>
        } 
        size={userConfig.compactMode ? 'small' : 'default'}
        bodyStyle={{ padding: '24px' }}
      >
        <ResponsiveContainer width="100%" height={userConfig.compactMode ? 250 : 300}>
          <LineChart data={occupancyTrendData} margin={{ left: -20, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="timestamp" stroke="#8c8c8c" />
            <YAxis stroke="#8c8c8c" />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="occupancy" stroke="#1890ff" strokeWidth={2} dot={false} name="Occupancy" />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    );
  };

  const renderCounterCongestionTrend = () => {
    if (counterCongestionData.length === 0) return null;

    const COUNTER_COLORS = {
      'Bisi Oota/ Mini meals Counter': '#ff4d4f',
      'Two Good Counter': '#52c41a',
      'Healthy Station Counter': '#1890ff',
    };

    const handleLegendClick = (e: any) => {
      const counterName = e.dataKey;
      
      // Check if this counter is the only one visible
      const isOnlyVisible = visibleCounters[counterName] && 
        Object.entries(visibleCounters).filter(([_, visible]) => visible).length === 1;
      
      if (isOnlyVisible) {
        // If clicking on the only visible counter, show all counters
        setVisibleCounters({
          'Bisi Oota/ Mini meals Counter': true,
          'Two Good Counter': true,
          'Healthy Station Counter': true,
        });
      } else {
        // Otherwise, show only the clicked counter
        setVisibleCounters({
          'Bisi Oota/ Mini meals Counter': counterName === 'Bisi Oota/ Mini meals Counter',
          'Two Good Counter': counterName === 'Two Good Counter',
          'Healthy Station Counter': counterName === 'Healthy Station Counter',
        });
      }
    };

    return (
      <Card 
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <FireOutlined />
            <span>Food Counter Congestion Trend (Queue Length vs Time)</span>
          </Space>
        } 
        size={userConfig.compactMode ? 'small' : 'default'}
        bodyStyle={{ padding: '24px' }}
      >
        <ResponsiveContainer width="100%" height={userConfig.compactMode ? 250 : 300}>
          <LineChart data={counterCongestionData} margin={{ left: -20, right: 20, top: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="timestamp" stroke="#8c8c8c" />
            <YAxis stroke="#8c8c8c" />
            <RechartsTooltip />
            <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer' }} />
            <Line 
              type="monotone" 
              dataKey="Bisi Oota/ Mini meals Counter" 
              stroke={COUNTER_COLORS['Bisi Oota/ Mini meals Counter']} 
              strokeWidth={2} 
              dot={false}
              name="Bisi Oota/ Mini meals"
              hide={!visibleCounters['Bisi Oota/ Mini meals Counter']}
              strokeOpacity={visibleCounters['Bisi Oota/ Mini meals Counter'] ? 1 : 0.3}
            />
            <Line 
              type="monotone" 
              dataKey="Two Good Counter" 
              stroke={COUNTER_COLORS['Two Good Counter']} 
              strokeWidth={2} 
              dot={false}
              name="Two Good"
              hide={!visibleCounters['Two Good Counter']}
              strokeOpacity={visibleCounters['Two Good Counter'] ? 1 : 0.3}
            />
            <Line 
              type="monotone" 
              dataKey="Healthy Station Counter" 
              stroke={COUNTER_COLORS['Healthy Station Counter']} 
              strokeWidth={2} 
              dot={false}
              name="Healthy Station"
              hide={!visibleCounters['Healthy Station Counter']}
              strokeOpacity={visibleCounters['Healthy Station Counter'] ? 1 : 0.3}
            />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 Click on a counter name to filter and show only that line. Click again to show all.
          </Text>
        </div>
      </Card>
    );
  };

  const renderWeeklyHeatmap = () => {
    if (weeklyHeatmapData.length === 0) return null;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from(new Set(weeklyHeatmapData.map(d => d.hourNum))).sort((a, b) => a - b);
    const maxValue = Math.max(...weeklyHeatmapData.map(d => d.value));

    return (
      <Card
        title={
          <Space>
            {dragEnabled && <HolderOutlined style={{ cursor: 'move', color: '#999' }} />}
            <FireOutlined />
            <span>Weekly Occupancy Heatmap</span>
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
    if (counterEfficiencyData.length === 0) return null;

    const columns = [
      { 
        title: 'Counter', 
        dataIndex: 'counterName', 
        key: 'counterName', 
        render: (text: string) => <Text strong>{text}</Text>,
        width: '30%',
      },
      { 
        title: 'Avg Service Time', 
        dataIndex: 'avgServiceTime', 
        key: 'avgServiceTime', 
        render: (value: number) => <Text>{value} min</Text>,
        align: 'center' as const,
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
            text={`${value} min`} 
          />
        ),
        align: 'center' as const,
      },
      { 
        title: 'Peak Wait Time', 
        dataIndex: 'peakWaitTime', 
        key: 'peakWaitTime', 
        render: (value: number) => <Text type="secondary">{value} min</Text>,
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
        {/* Drag Mode Toggle */}
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

        {/* Widget Configuration */}
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
                          {key === 'dwellTime' && 'Dwell Time Distribution'}
                          {key === 'footfallComparison' && 'Footfall Comparison'}
                          {key === 'occupancyTrend' && 'Occupancy Trend'}
                          {key === 'counterCongestionTrend' && 'Counter Congestion Trend'}
                          {key === 'weeklyHeatmap' && 'Weekly Heatmap'}
                          {key === 'counterEfficiency' && 'Counter Efficiency'}
                          {key === 'todaysVisitors' && "Today's Visitors KPI"}
                          {key === 'avgDwellTime' && 'Avg Dwell Time KPI'}
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

        {/* Dwell Time Chart Type */}
        <div>
          <Title level={5}>Dwell Time Chart</Title>
          <Radio.Group 
            value={userConfig.dwellTimeChartType} 
            onChange={(e) => updateConfig('dwellTimeChartType', e.target.value)}
          >
            <Radio.Button value="bar">Horizontal Bar</Radio.Button>
            <Radio.Button value="donut">Donut</Radio.Button>
          </Radio.Group>
        </div>

        <Divider />

        {/* Occupancy Trend Type */}
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

        {/* Chart Type */}
        <div>
          <Title level={5}>Flow Chart Type</Title>
          <Radio.Group value={userConfig.chartType} onChange={(e) => updateConfig('chartType', e.target.value)}>
            <Radio.Button value="line">Line</Radio.Button>
            <Radio.Button value="area">Area</Radio.Button>
            <Radio.Button value="bar">Bar</Radio.Button>
          </Radio.Group>
        </div>

        <Divider />

        {/* Color Scheme */}
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

        {/* Refresh Interval */}
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

        {/* Compact Mode */}
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
  if (loading && !occupancyData) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading cafeteria analytics..." />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error Loading Data" description={error} type="error" showIcon action={<Button onClick={fetchMockData} type="primary">Retry</Button>} />;
  }

  // Sort widgets by order
  const sortedWidgets = Object.entries(userConfig.widgets)
    .sort(([, a], [, b]) => a.order - b.order)
    .filter(([, widget]) => widget.enabled);

  return (
    <div style={{ padding: userConfig.compactMode ? '20px' : '32px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header Section */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 32 }} gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Space size="middle">
            <Title level={2} style={{ margin: 0 }}>Cafeteria Analytics Dashboard</Title>
            {mockMode && <Badge count="DEMO" style={{ backgroundColor: '#52c41a' }} />}
          </Space>
        </Col>
        <Col xs={24} lg={12}>
          <Row gutter={[12, 12]} justify="end">
            <Col>
              <Select 
                value={selectedLocation} 
                onChange={setSelectedLocation} 
                style={{ width: 280 }}
                size={userConfig.compactMode ? 'small' : 'middle'}
              >
                <Option value="Intel, RMZ Ecoworld, Bangalore">Intel, RMZ Ecoworld, Bangalore</Option>
              </Select>
            </Col>
            <Col>
              <Select 
                value={selectedCafeteria} 
                onChange={setSelectedCafeteria} 
                style={{ width: 140 }}
                size={userConfig.compactMode ? 'small' : 'middle'}
              >
                <Option value="SRR 4A">SRR 4A</Option>
                <Option value="SRR 4B">SRR 4B</Option>
              </Select>
            </Col>
            <Col>
              <DatePicker value={selectedDate} disabled size={userConfig.compactMode ? 'small' : 'middle'} />
            </Col>
            <Col>
              <Select 
                value={dateFilter} 
                onChange={setDateFilter} 
                style={{ width: 120 }}
                size={userConfig.compactMode ? 'small' : 'middle'}
              >
                <Option value="daily">Daily</Option>
                <Option value="weekly">Weekly</Option>
                <Option value="monthly">Monthly</Option>
              </Select>
            </Col>
            <Col>
              <Select 
                value={timeRange} 
                style={{ width: 120 }} 
                onChange={setTimeRange} 
                size={userConfig.compactMode ? 'small' : 'middle'}
                disabled={dateFilter !== 'daily'}
              >
                <Option value={6}>Last 6h</Option>
                <Option value={12}>Last 12h</Option>
                <Option value={24}>Last 24h</Option>
                <Option value={48}>Last 48h</Option>
              </Select>
            </Col>
            <Col>
              <Button onClick={fetchMockData} loading={loading} icon={<ReloadOutlined />} size={userConfig.compactMode ? 'small' : 'middle'}>
                Refresh
              </Button>
            </Col>
            <Col>
              <Button onClick={() => setSettingsVisible(true)} icon={<SettingOutlined />} type="primary" size={userConfig.compactMode ? 'small' : 'middle'}>
                Settings
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Tabs Section */}
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
                {/* Overview Widgets */}
                {sortedWidgets
                  .filter(([key]) => ['occupancyStatus', 'todaysVisitors', 'avgDwellTime', 'counterStatus', 'inflowOutflow'].includes(key))
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
                {/* Analytics Widgets */}
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
      
      <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Badge 
            status="processing" 
            text={`Showing ${dateFilter === 'daily' ? 'Daily' : dateFilter === 'weekly' ? 'Weekly' : 'Monthly'} Data`}
            style={{ fontSize: '12px' }}
          />
        </div>
        <div style={{ textAlign: 'right', color: '#999', fontSize: 12 }}>
          Last updated: {lastUpdated}
        </div>
      </div>

      {renderSettingsDrawer()}
    </div>
  );
};

export default CafeteriaAnalyticsDashboard;