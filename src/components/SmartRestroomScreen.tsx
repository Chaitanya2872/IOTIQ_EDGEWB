import React, { useState, useEffect, memo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import {
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react';

// Font styles
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  * {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

// Loading skeleton
const SkeletonBlock: React.FC<{ 
  width?: string | number; 
  height?: string | number; 
  borderRadius?: number | string; 
}> = ({ width = '100%', height = 12, borderRadius = 6 }) => (
  <div style={{
    width,
    height,
    background: 'linear-gradient(90deg, rgba(226,232,240,0.7) 25%, rgba(243,244,246,0.9) 50%, rgba(226,232,240,0.7) 75%)',
    backgroundSize: '200px 100%',
    borderRadius,
    animation: 'skeletonShimmer 1.2s ease-in-out infinite'
  }} />
);

// Loading Spinner
const LoadingSpinner: React.FC<{ message?: string }> = memo(({ message = 'Loading...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '280px',
    gap: 12
  }}>
    <div style={{
      width: 40,
      height: 40,
      border: '3px solid #F3F4F6',
      borderTop: '3px solid #6366F1',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>{message}</span>
  </div>
));

// Animated counter
const CountUp: React.FC<{ end: number; duration?: number; decimals?: number }> = ({ 
  end, 
  duration = 1200, 
  decimals = 0 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(easeOutQuart * end);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}</>;
};

// KPI Card Component
const KPICard: React.FC<{
  title: string;
  value: number;
  suffix?: string;
  icon: any;
  trend?: number;
  iconColor: string;
  loading?: boolean;
}> = memo(({ title, value, suffix = '', icon: Icon, trend, iconColor, loading = false }) => {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F1F3F5',
      borderRadius: 12,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      e.currentTarget.style.borderColor = '#E5E7EB';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = '#F1F3F5';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${iconColor}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {!loading ? <Icon size={16} color={iconColor} strokeWidth={1.5} /> : <SkeletonBlock width={16} height={16} />}
          </div>
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>
            {!loading ? title : <SkeletonBlock width={120} height={12} />}
          </span>
        </div>
        {!loading && trend !== undefined && (
          <div style={{
            fontSize: 12,
            fontWeight: 500,
            color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: 3
          }}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      
      <div style={{
        fontSize: 28,
        fontWeight: 600,
        color: '#111827',
        letterSpacing: '-0.5px',
        lineHeight: 1
      }}>
        {loading ? <SkeletonBlock width={80} height={28} /> : (
          <>
            <CountUp end={value} decimals={suffix === '%' ? 1 : 0} />
            {suffix && <span style={{ fontSize: 18, fontWeight: 500 }}>{suffix}</span>}
          </>
        )}
      </div>
    </div>
  );
});

interface RestroomData {
  id: string;
  location: string;
  floor: number;
  occupancy: number;
  maxCapacity: number;
  cleanliness: number;
  odorLevel: number;
  lastCleaned: string;
  alerts: string[];
  status: 'available' | 'busy' | 'maintenance';
}

const SmartRestroomScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<number>(3);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Mock data - replace with actual API calls
  const restrooms: RestroomData[] = [
    {
      id: 'RR-301',
      location: 'East Wing',
      floor: 3,
      occupancy: 3,
      maxCapacity: 8,
      cleanliness: 92,
      odorLevel: 15,
      lastCleaned: '45 min ago',
      alerts: [],
      status: 'available'
    },
    {
      id: 'RR-302',
      location: 'West Wing',
      floor: 3,
      occupancy: 7,
      maxCapacity: 8,
      cleanliness: 78,
      odorLevel: 35,
      lastCleaned: '2 hours ago',
      alerts: ['High traffic'],
      status: 'busy'
    },
    {
      id: 'RR-401',
      location: 'East Wing',
      floor: 4,
      occupancy: 5,
      maxCapacity: 10,
      cleanliness: 88,
      odorLevel: 20,
      lastCleaned: '1 hour ago',
      alerts: [],
      status: 'available'
    },
    {
      id: 'RR-402',
      location: 'West Wing',
      floor: 4,
      occupancy: 0,
      maxCapacity: 8,
      cleanliness: 45,
      odorLevel: 65,
      lastCleaned: '4 hours ago',
      alerts: ['Cleaning required', 'High odor'],
      status: 'maintenance'
    },
    {
      id: 'RR-501',
      location: 'Central',
      floor: 5,
      occupancy: 4,
      maxCapacity: 12,
      cleanliness: 95,
      odorLevel: 10,
      lastCleaned: '30 min ago',
      alerts: [],
      status: 'available'
    }
  ];

  const filteredRestrooms = restrooms.filter(r => r.floor === selectedFloor);

  // Calculate KPIs
  const avgOccupancy = filteredRestrooms.reduce((sum, r) => sum + (r.occupancy / r.maxCapacity) * 100, 0) / filteredRestrooms.length;
  const avgCleanliness = filteredRestrooms.reduce((sum, r) => sum + r.cleanliness, 0) / filteredRestrooms.length;
  const totalAlerts = filteredRestrooms.reduce((sum, r) => sum + r.alerts.length, 0);
  const availableRestrooms = filteredRestrooms.filter(r => r.status === 'available').length;

  // Usage pattern data
  const usagePatternData = [
    { time: '6 AM', usage: 12, optimal: 25 },
    { time: '8 AM', usage: 45, optimal: 40 },
    { time: '10 AM', usage: 68, optimal: 55 },
    { time: '12 PM', usage: 85, optimal: 70 },
    { time: '2 PM', usage: 78, optimal: 65 },
    { time: '4 PM', usage: 62, optimal: 50 },
    { time: '6 PM', usage: 38, optimal: 35 },
    { time: '8 PM', usage: 15, optimal: 20 }
  ];

  // Cleanliness trend data
  const cleanlinessData = [
    { hour: '8 AM', score: 95 },
    { hour: '10 AM', score: 88 },
    { hour: '12 PM', score: 82 },
    { hour: '2 PM', score: 75 },
    { hour: '4 PM', score: 85 },
    { hour: '6 PM', score: 92 }
  ];

  // Restroom utilization by floor
  const floorUtilizationData = [
    { floor: 'Floor 3', utilization: 65, alerts: 2 },
    { floor: 'Floor 4', utilization: 48, alerts: 3 },
    { floor: 'Floor 5', utilization: 42, alerts: 0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10B981';
      case 'busy': return '#F59E0B';
      case 'maintenance': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'busy': return 'Busy';
      case 'maintenance': return 'Maintenance';
      default: return 'Unknown';
    }
  };

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>
      <style>{`
        ${fontStyle}
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes skeletonShimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 4, letterSpacing: '-0.3px' }}>
              Smart Restroom Monitoring
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>
              Real-time occupancy, cleanliness, and maintenance insights
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[3, 4, 5].map(floor => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: selectedFloor === floor ? 500 : 400,
                  color: selectedFloor === floor ? '#111827' : '#9CA3AF',
                  background: selectedFloor === floor ? '#F3F4F6' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Floor {floor}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 16, 
        marginBottom: 24 
      }}>
        <KPICard
          title="Avg Occupancy Rate"
          value={avgOccupancy}
          suffix="%"
          icon={Users}
          trend={-5.2}
          iconColor="#6366F1"
          loading={loading}
        />
        <KPICard
          title="Avg Cleanliness Score"
          value={avgCleanliness}
          suffix="%"
          icon={CheckCircle2}
          trend={3.1}
          iconColor="#10B981"
          loading={loading}
        />
        <KPICard
          title="Active Alerts"
          value={totalAlerts}
          icon={AlertTriangle}
          trend={-12.5}
          iconColor="#F59E0B"
          loading={loading}
        />
        <KPICard
          title="Available Restrooms"
          value={availableRestrooms}
          suffix={`/${filteredRestrooms.length}`}
          icon={Activity}
          iconColor="#8B5CF6"
          loading={loading}
        />
      </div>

      {/* Restroom Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: 16, 
        marginBottom: 24 
      }}>
        {filteredRestrooms.map((restroom) => (
          <div
            key={restroom.id}
            style={{
              background: '#FFFFFF',
              border: '1px solid #F1F3F5',
              borderRadius: 12,
              padding: '20px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
                  {restroom.id}
                </h3>
                <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
                  {restroom.location} • Floor {restroom.floor}
                </p>
              </div>
              <span style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 500,
                color: getStatusColor(restroom.status),
                background: `${getStatusColor(restroom.status)}15`
              }}>
                {getStatusLabel(restroom.status)}
              </span>
            </div>

            {/* Occupancy Bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>Occupancy</span>
                <span style={{ fontSize: 12, color: '#111827', fontWeight: 500 }}>
                  {restroom.occupancy}/{restroom.maxCapacity}
                </span>
              </div>
              <div style={{
                width: '100%',
                height: 6,
                background: '#F1F3F5',
                borderRadius: 3,
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(restroom.occupancy / restroom.maxCapacity) * 100}%`,
                  height: '100%',
                  background: restroom.occupancy / restroom.maxCapacity > 0.75 ? '#F59E0B' : '#6366F1',
                  borderRadius: 3,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div style={{ 
                padding: '12px', 
                background: '#F8F9FA', 
                borderRadius: 8,
                border: '1px solid #F1F3F5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <CheckCircle2 size={14} color="#10B981" strokeWidth={1.5} />
                  <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>Cleanliness</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
                  {restroom.cleanliness}%
                </span>
              </div>
              
              <div style={{ 
                padding: '12px', 
                background: '#F8F9FA', 
                borderRadius: 8,
                border: '1px solid #F1F3F5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Wind size={14} color="#8B5CF6" strokeWidth={1.5} />
                  <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>Odor Level</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>
                  {restroom.odorLevel}%
                </span>
              </div>
            </div>

            {/* Last Cleaned */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6, 
              padding: '8px 12px',
              background: '#F8F9FA',
              borderRadius: 6,
              marginBottom: restroom.alerts.length > 0 ? 12 : 0
            }}>
              <Droplets size={12} color="#6B7280" strokeWidth={1.5} />
              <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>
                Last cleaned: {restroom.lastCleaned}
              </span>
            </div>

            {/* Alerts */}
            {restroom.alerts.length > 0 && (
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 6 
              }}>
                {restroom.alerts.map((alert, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 500,
                      color: '#EF4444',
                      background: '#FEF2F2',
                      border: '1px solid #FEE2E2'
                    }}
                  >
                    {alert}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 16 }}>
        {/* Usage Pattern Chart */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #F1F3F5',
          borderRadius: 12,
          padding: '20px'
        }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
              Daily Usage Pattern
            </h3>
            <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
              Current vs. Optimal capacity utilization
            </p>
          </div>
          {loading ? (
            <LoadingSpinner message="Loading usage data..." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={usagePatternData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOptimal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
                <XAxis dataKey="time" stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} />
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
                <Area 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#6366F1" 
                  fillOpacity={1} 
                  fill="url(#colorUsage)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="optimal" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#colorOptimal)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Cleanliness Trend Chart */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #F1F3F5',
          borderRadius: 12,
          padding: '20px'
        }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
              Cleanliness Score Trend
            </h3>
            <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
              Average cleanliness across floor {selectedFloor}
            </p>
          </div>
          {loading ? (
            <LoadingSpinner message="Loading cleanliness data..." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={cleanlinessData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
                <XAxis dataKey="hour" stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ 
                    background: '#FFF', 
                    border: '1px solid #E5E7EB', 
                    borderRadius: 8, 
                    fontSize: 12,
                    fontWeight: 400
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10B981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Floor Utilization Chart */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #F1F3F5',
          borderRadius: 12,
          padding: '20px'
        }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
              Floor-wise Utilization
            </h3>
            <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
              Current utilization rate by floor
            </p>
          </div>
          {loading ? (
            <LoadingSpinner message="Loading floor data..." />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={floorUtilizationData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
                <XAxis dataKey="floor" stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} />
                <YAxis stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} />
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
                <Bar dataKey="utilization" fill="#6366F1" radius={[8, 8, 0, 0]}>
                  {floorUtilizationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.alerts > 2 ? '#EF4444' : '#6366F1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartRestroomScreen;