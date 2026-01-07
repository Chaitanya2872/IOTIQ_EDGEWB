// src/components/WaitTimeAnalysisChart.tsx
import React, { useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Clock, TrendingUp, Calendar } from 'lucide-react';

interface WaitTimeAnalysisChartProps {
  trendData: any;
  sessionData: any;
  loading?: boolean;
}

const WaitTimeAnalysisChart: React.FC<WaitTimeAnalysisChartProps> = ({ 
  trendData, 
  sessionData,
  loading 
}) => {
  // Process hourly trend data
  const hourlyChartData = useMemo(() => {
    if (!trendData?.hourly) return [];
    
    return trendData.hourly.map((item: any) => ({
      hour: item.hourFormatted || `${item.hour}:00`,
      avgWait: Math.round(item.avgWait || 0),
      maxWait: Math.round(item.maxWait || 0),
      minWait: Math.round(item.minWait || 0)
    }));
  }, [trendData]);

  // Process daily trend data
  const dailyChartData = useMemo(() => {
    if (!trendData?.daily) return [];
    
    return trendData.daily.map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      avgWait: Math.round(item.avgWait || 0),
      peakWait: Math.round(item.peakWait || 0)
    }));
  }, [trendData]);

  // Process session data
  const sessionStats = useMemo(() => {
    if (!sessionData) return [];
    
    const sessions = ['breakfast', 'lunch', 'dinner'];
    return sessions.map(session => {
      const data = sessionData[session] || {};
      return {
        session: session.charAt(0).toUpperCase() + session.slice(1),
        avgWait: Math.round(data.avgWaitTime || 0),
        maxWait: Math.round(data.maxWaitTime || 0),
        avgQueue: Math.round(data.avgQueueLength || 0),
        peakTime: data.peakTime || 'N/A'
      };
    });
  }, [sessionData]);

  if (loading) {
    return (
      <div style={{
        background: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        minHeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#6B7280' }}>
          Loading wait time analysis...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: 12,
      padding: 24,
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ 
          fontSize: 18, 
          fontWeight: 600, 
          color: '#111827', 
          marginBottom: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <Clock size={20} color="#6366F1" />
          Wait Time Analysis
        </h3>
        <p style={{ 
          fontSize: 13, 
          color: '#6B7280', 
          fontWeight: 400 
        }}>
          Detailed breakdown of wait times across different time periods
        </p>
      </div>

      {/* Hourly Trend Chart */}
      {hourlyChartData.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h4 style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#111827', 
            marginBottom: 16 
          }}>
            Hourly Wait Time Trend
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={hourlyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="hour" 
                stroke="#6B7280"
                style={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: 11 }}
                label={{ value: 'Wait Time (min)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
              />
              <Tooltip 
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 12
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: 12 }}
              />
              <Line 
                type="monotone" 
                dataKey="avgWait" 
                stroke="#6366F1" 
                strokeWidth={2}
                name="Average Wait"
                dot={{ fill: '#6366F1', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="maxWait" 
                stroke="#DC2626" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Max Wait"
                dot={{ fill: '#DC2626', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Daily Trend Chart */}
      {dailyChartData.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h4 style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#111827', 
            marginBottom: 16 
          }}>
            Daily Wait Time Comparison
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                style={{ fontSize: 11 }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: 11 }}
                label={{ value: 'Wait Time (min)', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
              />
              <Tooltip 
                contentStyle={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8,
                  fontSize: 12
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar 
                dataKey="avgWait" 
                fill="#6366F1" 
                name="Average Wait"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="peakWait" 
                fill="#DC2626" 
                name="Peak Wait"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Meal Session Breakdown */}
      {sessionStats.length > 0 && (
        <div>
          <h4 style={{ 
            fontSize: 14, 
            fontWeight: 600, 
            color: '#111827', 
            marginBottom: 16 
          }}>
            Meal Session Breakdown
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16
          }}>
            {sessionStats.map((session) => {
              const sessionColors: Record<string, string> = {
                'Breakfast': '#F59E0B',
                'Lunch': '#6366F1',
                'Dinner': '#8B5CF6'
              };
              
              const color = sessionColors[session.session] || '#6B7280';

              return (
                <div 
                  key={session.session}
                  style={{
                    padding: 16,
                    background: `${color}08`,
                    border: `1px solid ${color}30`,
                    borderRadius: 8
                  }}
                >
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 12
                  }}>
                    <div 
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: color
                      }}
                    />
                    <span style={{ 
                      fontSize: 14, 
                      fontWeight: 600, 
                      color: '#111827' 
                    }}>
                      {session.session}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>Avg Wait:</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                        {session.avgWait} min
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>Max Wait:</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                        {session.maxWait} min
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>Avg Queue:</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>
                        {session.avgQueue} people
                      </span>
                    </div>
                    <div style={{ 
                      marginTop: 4,
                      paddingTop: 8,
                      borderTop: '1px solid #E5E7EB'
                    }}>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>Peak Time: </span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: color }}>
                        {session.peakTime}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {hourlyChartData.length === 0 && dailyChartData.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#6B7280' 
        }}>
          <Calendar size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: 14, marginBottom: 8 }}>No wait time data available</p>
          <p style={{ fontSize: 12 }}>Data will appear once cafeteria operations begin</p>
        </div>
      )}
    </div>
  );
};

export default WaitTimeAnalysisChart;