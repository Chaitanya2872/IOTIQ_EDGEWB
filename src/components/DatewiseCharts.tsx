// src/components/DateWiseCharts.tsx
import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Calendar, TrendingUp, Clock, BarChart3 } from 'lucide-react';
import {
  useDataByDate,
  useHourlyData,
  useDataByDateRange,
  useDailySummaryForRange
} from '../api/hooks/useCafeteriaData';

// Utility function to format date for API
const formatDateForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Utility function to get date range
const getDateRange = (days: number): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return {
    startDate: formatDateForAPI(startDate),
    endDate: formatDateForAPI(endDate)
  };
};

// Counter colors
const COUNTER_COLORS: Record<string, string> = {
  TwoGood: '#6366F1',
  UttarDakshin: '#F59E0B',
  Tandoor: '#10B981'
};

interface DatePickerProps {
  selectedDate: string;
  onChange: (date: string) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onChange }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Calendar size={16} color="#6B7280" />
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
        max={formatDateForAPI(new Date())}
        style={{
          padding: '8px 12px',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 400,
          color: '#111827',
          background: '#FFFFFF',
          cursor: 'pointer'
        }}
      />
    </div>
  );
};

// Single Day Hourly Breakdown Chart
export const HourlyBreakdownChart: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(formatDateForAPI(new Date()));
  const { data, loading, error } = useHourlyData(selectedDate);

  if (loading) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 400
      }}>
        <span style={{ color: '#6B7280', fontSize: 14 }}>Loading...</span>
      </div>
    );
  }

  if (error || !data?.counters) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 12,
        padding: 20
      }}>
        <span style={{ color: '#EF4444', fontSize: 13 }}>
          {error || 'No data available'}
        </span>
      </div>
    );
  }

  // Transform data for chart
  const chartData: any[] = [];
  const hours = new Set<number>();

  // Collect all hours
  Object.values(data.counters).forEach((counterData: any[]) => {
    counterData.forEach((item: any) => {
      hours.add(item.hour);
    });
  });

  // Create chart data
  Array.from(hours).sort((a, b) => a - b).forEach(hour => {
    const dataPoint: any = {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      hourNum: hour
    };

    Object.entries(data.counters).forEach(([counterName, counterData]: [string, any]) => {
      const hourData = counterData.find((d: any) => d.hour === hour);
      if (hourData) {
        dataPoint[`${counterName}_queue`] = hourData.avgQueue;
        dataPoint[`${counterName}_wait`] = hourData.avgWaitMinutes;
      }
    });

    chartData.push(dataPoint);
  });

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F1F3F5',
      borderRadius: 12,
      padding: 20
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
            Hourly Queue Analysis
          </h3>
          <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
            Average queue count per hour for all counters
          </p>
        </div>
        <DatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
          <XAxis
            dataKey="hour"
            stroke="#9CA3AF"
            style={{ fontSize: 11, fontWeight: 400 }}
          />
          <YAxis
            yAxisId="left"
            stroke="#9CA3AF"
            style={{ fontSize: 11, fontWeight: 400 }}
            label={{ value: 'Queue Count', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#9CA3AF"
            style={{ fontSize: 11, fontWeight: 400 }}
            label={{ value: 'Wait Time (min)', angle: 90, position: 'insideRight', style: { fontSize: 11 } }}
          />
          <Tooltip
            contentStyle={{
              background: '#FFF',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 400
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 400 }} />
          
          {Object.keys(COUNTER_COLORS).map(counter => (
            <Bar
              key={`${counter}_queue`}
              yAxisId="left"
              dataKey={`${counter}_queue`}
              fill={COUNTER_COLORS[counter]}
              radius={[4, 4, 0, 0]}
              name={`${counter} Queue`}
            />
          ))}
          
          {Object.keys(COUNTER_COLORS).map(counter => (
            <Line
              key={`${counter}_wait`}
              yAxisId="right"
              type="monotone"
              dataKey={`${counter}_wait`}
              stroke={COUNTER_COLORS[counter]}
              strokeWidth={2}
              dot={{ fill: COUNTER_COLORS[counter], r: 3 }}
              name={`${counter} Wait`}
              strokeDasharray="5 5"
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Daily Comparison Chart (Multiple Days)
export const DailyComparisonChart: React.FC<{ days?: number }> = ({ days = 7 }) => {
  const dateRange = getDateRange(days);
  const { data, loading, error } = useDailySummaryForRange(dateRange.startDate, dateRange.endDate);

  if (loading) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 12,
        padding: 20,
        height: 400,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <span style={{ color: '#6B7280', fontSize: 14 }}>Loading...</span>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 12,
        padding: 20
      }}>
        <span style={{ color: '#EF4444', fontSize: 13 }}>
          {error || 'No data available'}
        </span>
      </div>
    );
  }

  // Group data by date
  const groupedByDate: Record<string, any> = {};
  
  data.forEach((item: any) => {
    const dateKey = item.date;
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = {
        date: new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateKey
      };
    }
    
    groupedByDate[dateKey][`${item.counterName}_avg`] = item.avgQueue;
    groupedByDate[dateKey][`${item.counterName}_max`] = item.maxQueue;
    groupedByDate[dateKey][`${item.counterName}_wait`] = item.avgWaitMinutes;
    groupedByDate[dateKey].criticalCount = (groupedByDate[dateKey].criticalCount || 0) + item.criticalCount;
    groupedByDate[dateKey].warningCount = (groupedByDate[dateKey].warningCount || 0) + item.warningCount;
  });

  const chartData = Object.values(groupedByDate);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F1F3F5',
      borderRadius: 12,
      padding: 20
    }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
          {days}-Day Queue Comparison
        </h3>
        <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
          Average queue count across all counters
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            style={{ fontSize: 11, fontWeight: 400 }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: 11, fontWeight: 400 }}
          />
          <Tooltip
            contentStyle={{
              background: '#FFF',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 400
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 400 }} />
          
          {Object.keys(COUNTER_COLORS).map(counter => (
            <Bar
              key={counter}
              dataKey={`${counter}_avg`}
              fill={COUNTER_COLORS[counter]}
              radius={[4, 4, 0, 0]}
              name={counter}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Peak Hours Heatmap-style Chart
export const PeakHoursHeatmap: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(formatDateForAPI(new Date()));
  const { data, loading, error } = useHourlyData(selectedDate);

  if (loading) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 12,
        padding: 20,
        height: 400,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <span style={{ color: '#6B7280', fontSize: 14 }}>Loading...</span>
      </div>
    );
  }

  if (error || !data?.counters) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 12,
        padding: 20
      }}>
        <span style={{ color: '#EF4444', fontSize: 13 }}>
          {error || 'No data available'}
        </span>
      </div>
    );
  }

  // Find peak hours for each counter
  const peakHours: Record<string, any> = {};
  
  Object.entries(data.counters).forEach(([counterName, counterData]: [string, any]) => {
    const maxQueue = Math.max(...counterData.map((d: any) => d.avgQueue || 0));
    const peakHour = counterData.find((d: any) => d.avgQueue === maxQueue);
    
    peakHours[counterName] = {
      hour: peakHour?.hour || 0,
      avgQueue: maxQueue,
      maxQueue: peakHour?.maxQueue || 0,
      avgWait: peakHour?.avgWaitMinutes || 0,
      recordCount: peakHour?.recordCount || 0
    };
  });

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F1F3F5',
      borderRadius: 12,
      padding: 20
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
      }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
            Peak Hour Analysis
          </h3>
          <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
            Busiest time for each counter
          </p>
        </div>
        <DatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {Object.entries(peakHours).map(([counterName, peakData]) => (
          <div
            key={counterName}
            style={{
              background: `${COUNTER_COLORS[counterName]}10`,
              border: `1px solid ${COUNTER_COLORS[counterName]}30`,
              borderRadius: 8,
              padding: 16
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12
            }}>
              <Clock size={14} color={COUNTER_COLORS[counterName]} />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>
                {counterName}
              </span>
            </div>

            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 24, fontWeight: 600, color: COUNTER_COLORS[counterName] }}>
                {peakData.hour.toString().padStart(2, '0')}:00
              </div>
              <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>
                Peak Hour
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
              <div>
                <div style={{ color: '#6B7280', fontWeight: 400 }}>Avg Queue</div>
                <div style={{ color: '#111827', fontWeight: 500 }}>{peakData.avgQueue.toFixed(1)}</div>
              </div>
              <div>
                <div style={{ color: '#6B7280', fontWeight: 400 }}>Max Queue</div>
                <div style={{ color: '#111827', fontWeight: 500 }}>{peakData.maxQueue}</div>
              </div>
              <div>
                <div style={{ color: '#6B7280', fontWeight: 400 }}>Avg Wait</div>
                <div style={{ color: '#111827', fontWeight: 500 }}>{peakData.avgWait.toFixed(1)}m</div>
              </div>
              <div>
                <div style={{ color: '#6B7280', fontWeight: 400 }}>Readings</div>
                <div style={{ color: '#111827', fontWeight: 500 }}>{peakData.recordCount}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Trend Chart (Line chart showing trends over date range)
export const TrendChart: React.FC<{ days?: number }> = ({ days = 7 }) => {
  const dateRange = getDateRange(days);
  const { data, loading, error } = useDailySummaryForRange(dateRange.startDate, dateRange.endDate);

  if (loading) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 12,
        padding: 20,
        height: 400,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <span style={{ color: '#6B7280', fontSize: 14 }}>Loading...</span>
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 12,
        padding: 20
      }}>
        <span style={{ color: '#EF4444', fontSize: 13 }}>
          {error || 'No data available'}
        </span>
      </div>
    );
  }

  // Group data by date
  const groupedByDate: Record<string, any> = {};
  
  data.forEach((item: any) => {
    const dateKey = item.date;
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = {
        date: new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dateKey
      };
    }
    
    groupedByDate[dateKey][`${item.counterName}_avg`] = item.avgQueue;
    groupedByDate[dateKey][`${item.counterName}_wait`] = item.avgWaitMinutes;
  });

  const chartData = Object.values(groupedByDate);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F1F3F5',
      borderRadius: 12,
      padding: 20
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20
      }}>
        <TrendingUp size={16} color="#6366F1" />
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
            Queue Trends
          </h3>
          <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
            Average queue count trends over the last {days} days
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <defs>
            {Object.entries(COUNTER_COLORS).map(([counter, color]) => (
              <linearGradient key={counter} id={`color${counter}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#9CA3AF"
            style={{ fontSize: 11, fontWeight: 400 }}
          />
          <YAxis
            stroke="#9CA3AF"
            style={{ fontSize: 11, fontWeight: 400 }}
          />
          <Tooltip
            contentStyle={{
              background: '#FFF',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 400
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 400 }} />
          
          {Object.entries(COUNTER_COLORS).map(([counter, color]) => (
            <Area
              key={counter}
              type="monotone"
              dataKey={`${counter}_avg`}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color${counter})`}
              name={counter}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default {
  HourlyBreakdownChart,
  DailyComparisonChart,
  PeakHoursHeatmap,
  TrendChart
};