import React, { useState, useEffect, memo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import {
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  Cloud
} from 'lucide-react';
import './IoTScreens.css';

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
            <CountUp end={value} decimals={suffix === '°C' || suffix === '%' ? 1 : 0} />
            {suffix && <span style={{ fontSize: 18, fontWeight: 500 }}>{suffix}</span>}
          </>
        )}
      </div>
    </div>
  );
});

interface IAQSensor {
  floor: number;
  location: string;
  temperature: number;
  humidity: number;
  co2: number;
  pm25: number;
  pm10: number;
  tvoc: number;
  quality: 'excellent' | 'good' | 'moderate' | 'poor' | 'unhealthy';
  aqi: number;
  lastUpdated: string;
}

const IAQScreen: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState(3);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'temperature' | 'humidity' | 'co2' | 'pm25'>('temperature');

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const allSensors: IAQSensor[] = [
    // Floor 3
    { floor: 3, location: 'Zone A', temperature: 22.5, humidity: 45, co2: 678, pm25: 8, pm10: 12, tvoc: 120, quality: 'excellent', aqi: 32, lastUpdated: '2 min ago' },
    { floor: 3, location: 'Zone B', temperature: 23.1, humidity: 48, co2: 892, pm25: 12, pm10: 18, tvoc: 156, quality: 'good', aqi: 48, lastUpdated: '1 min ago' },
    // Floor 4
    { floor: 4, location: 'Zone A', temperature: 24.2, humidity: 52, co2: 1432, pm25: 28, pm10: 42, tvoc: 245, quality: 'moderate', aqi: 72, lastUpdated: '3 min ago' },
    { floor: 4, location: 'Zone B', temperature: 23.8, humidity: 50, co2: 1156, pm25: 18, pm10: 28, tvoc: 198, quality: 'moderate', aqi: 65, lastUpdated: '2 min ago' },
    // Floor 5
    { floor: 5, location: 'Zone A', temperature: 22.8, humidity: 46, co2: 745, pm25: 10, pm10: 15, tvoc: 132, quality: 'good', aqi: 42, lastUpdated: '1 min ago' },
    { floor: 5, location: 'Zone B', temperature: 22.3, humidity: 44, co2: 698, pm25: 9, pm10: 13, tvoc: 125, quality: 'excellent', aqi: 38, lastUpdated: '2 min ago' },
  ];

  const sensors = allSensors.filter(s => s.floor === selectedFloor);

  // Calculate building-wide KPIs
  const avgTemp = allSensors.reduce((sum, s) => sum + s.temperature, 0) / allSensors.length;
  const avgHumidity = allSensors.reduce((sum, s) => sum + s.humidity, 0) / allSensors.length;
  const avgCO2 = allSensors.reduce((sum, s) => sum + s.co2, 0) / allSensors.length;
  const avgAQI = allSensors.reduce((sum, s) => sum + s.aqi, 0) / allSensors.length;

  // Historical data for trends
  const historicalData = [
    { time: '00:00', temp: 21.5, humidity: 42, co2: 650, pm25: 7 },
    { time: '04:00', temp: 21.2, humidity: 44, co2: 680, pm25: 8 },
    { time: '08:00', temp: 22.8, humidity: 48, co2: 980, pm25: 12 },
    { time: '12:00', temp: 24.2, humidity: 52, co2: 1430, pm25: 28 },
    { time: '16:00', temp: 23.8, humidity: 50, co2: 1280, pm25: 22 },
    { time: '20:00', temp: 22.5, humidity: 46, co2: 950, pm25: 15 },
    { time: '23:59', temp: 21.8, humidity: 44, co2: 780, pm25: 10 }
  ];

  // Floor comparison data
  const floorComparison = [
    { floor: 'Floor 3', temp: 22.8, humidity: 46.5, co2: 785, aqi: 40 },
    { floor: 'Floor 4', temp: 24.0, humidity: 51, co2: 1294, aqi: 68.5 },
    { floor: 'Floor 5', temp: 22.55, humidity: 45, co2: 721.5, aqi: 40 }
  ];

  // Radar chart data for air quality profile
  const airQualityProfile = sensors.map(sensor => ({
    subject: sensor.location,
    temperature: (sensor.temperature / 30) * 100, // Normalize to 0-100
    humidity: sensor.humidity,
    co2: (sensor.co2 / 2000) * 100, // Normalize to 0-100
    pm25: (sensor.pm25 / 50) * 100, // Normalize to 0-100
    aqi: sensor.aqi
  }));

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return '#10B981';
      case 'good': return '#22C55E';
      case 'moderate': return '#F59E0B';
      case 'poor': return '#F97316';
      case 'unhealthy': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getQualityLabel = (quality: string) => {
    return quality.charAt(0).toUpperCase() + quality.slice(1);
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#10B981';
    if (aqi <= 100) return '#F59E0B';
    if (aqi <= 150) return '#F97316';
    return '#EF4444';
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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 4, letterSpacing: '-0.3px' }}>
              Indoor Air Quality Dashboard
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>
              Real-time environmental monitoring with predictive analytics
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              padding: '6px 12px',
              background: '#10B98115',
              borderRadius: 6
            }}>
              <div style={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                background: '#10B981',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ fontSize: 11, color: '#059669', fontWeight: 500 }}>Live Monitoring</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floor Selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
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

      {/* Building-Wide KPI Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 16, 
        marginBottom: 24 
      }}>
        <KPICard
          title="Avg Temperature"
          value={avgTemp}
          suffix="°C"
          icon={Thermometer}
          trend={2.3}
          iconColor="#EF4444"
          loading={loading}
        />
        <KPICard
          title="Avg Humidity"
          value={avgHumidity}
          suffix="%"
          icon={Droplets}
          trend={-1.5}
          iconColor="#3B82F6"
          loading={loading}
        />
        <KPICard
          title="Avg CO₂ Level"
          value={avgCO2}
          suffix=" ppm"
          icon={Cloud}
          trend={-5.2}
          iconColor="#10B981"
          loading={loading}
        />
        <KPICard
          title="Building AQI"
          value={avgAQI}
          icon={Activity}
          trend={-8.7}
          iconColor="#8B5CF6"
          loading={loading}
        />
      </div>

      {/* Sensor Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', 
        gap: 16, 
        marginBottom: 24 
      }}>
        {sensors.map((sensor, index) => (
          <div
            key={index}
            style={{
              background: '#FFFFFF',
              border: '1px solid #F1F3F5',
              borderRadius: 12,
              padding: '20px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Gradient overlay based on quality */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '150px',
              height: '150px',
              background: `radial-gradient(circle, ${getQualityColor(sensor.quality)}15 0%, transparent 70%)`,
              opacity: 0.5,
              pointerEvents: 'none'
            }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, position: 'relative' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 2 }}>
                  Floor {sensor.floor} - {sensor.location}
                </h3>
                <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>
                  Updated {sensor.lastUpdated}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  color: getQualityColor(sensor.quality),
                  background: `${getQualityColor(sensor.quality)}15`,
                  border: `1px solid ${getQualityColor(sensor.quality)}30`
                }}>
                  {getQualityLabel(sensor.quality)}
                </span>
                <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 400 }}>
                  AQI: <span style={{ fontWeight: 500, color: getAQIColor(sensor.aqi) }}>{sensor.aqi}</span>
                </span>
              </div>
            </div>

            {/* Main Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 12 }}>
              {/* Temperature */}
              <div style={{ 
                padding: '14px', 
                background: '#FEF2F2', 
                borderRadius: 8,
                border: '1px solid #FEE2E2'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Thermometer size={14} color="#EF4444" strokeWidth={1.5} />
                  <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>Temperature</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 600, color: '#EF4444', letterSpacing: '-0.5px' }}>
                  {sensor.temperature}°C
                </span>
              </div>

              {/* Humidity */}
              <div style={{ 
                padding: '14px', 
                background: '#EFF6FF', 
                borderRadius: 8,
                border: '1px solid #DBEAFE'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Droplets size={14} color="#3B82F6" strokeWidth={1.5} />
                  <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>Humidity</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 600, color: '#3B82F6', letterSpacing: '-0.5px' }}>
                  {sensor.humidity}%
                </span>
              </div>

              {/* CO2 */}
              <div style={{ 
                padding: '14px', 
                background: '#F0FDF4', 
                borderRadius: 8,
                border: '1px solid #D1FAE5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Cloud size={14} color="#10B981" strokeWidth={1.5} />
                  <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>CO₂ Level</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 600, color: '#10B981', letterSpacing: '-0.5px' }}>
                  {sensor.co2} <span style={{ fontSize: 12, fontWeight: 400 }}>ppm</span>
                </span>
              </div>

              {/* PM2.5 */}
              <div style={{ 
                padding: '14px', 
                background: '#F5F3FF', 
                borderRadius: 8,
                border: '1px solid #EDE9FE'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Wind size={14} color="#8B5CF6" strokeWidth={1.5} />
                  <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>PM 2.5</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 600, color: '#8B5CF6', letterSpacing: '-0.5px' }}>
                  {sensor.pm25} <span style={{ fontSize: 12, fontWeight: 400 }}>µg/m³</span>
                </span>
              </div>
            </div>

            {/* Additional Metrics Row */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 10,
              padding: '12px',
              background: '#F8F9FA',
              borderRadius: 8,
              border: '1px solid #F1F3F5'
            }}>
              <div>
                <p style={{ fontSize: 10, color: '#6B7280', fontWeight: 400, marginBottom: 2 }}>PM 10</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{sensor.pm10} µg/m³</p>
              </div>
              <div>
                <p style={{ fontSize: 10, color: '#6B7280', fontWeight: 400, marginBottom: 2 }}>TVOC</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{sensor.tvoc} ppb</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 16, marginBottom: 16 }}>
        {/* Historical Trends */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #F1F3F5',
          borderRadius: 12,
          padding: '20px'
        }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
              24-Hour Environmental Trends
            </h3>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {(['temperature', 'humidity', 'co2', 'pm25'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: 11,
                    fontWeight: selectedMetric === metric ? 500 : 400,
                    color: selectedMetric === metric ? '#111827' : '#9CA3AF',
                    background: selectedMetric === metric ? '#F3F4F6' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {metric === 'temperature' ? 'Temp' : metric === 'humidity' ? 'Humidity' : metric === 'co2' ? 'CO₂' : 'PM2.5'}
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <LoadingSpinner message="Loading trend data..." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={historicalData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
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
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#6366F1" 
                  fill="url(#colorMetric)"
                  strokeWidth={2.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Floor Comparison */}
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #F1F3F5',
          borderRadius: 12,
          padding: '20px'
        }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
              Floor-wise Comparison
            </h3>
            <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
              Current environmental metrics across all floors
            </p>
          </div>
          {loading ? (
            <LoadingSpinner message="Loading floor data..." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={floorComparison} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
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
                <Bar dataKey="temp" fill="#EF4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="humidity" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="aqi" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Air Quality Profile Radar */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 12,
        padding: '20px'
      }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
            Air Quality Profile - Floor {selectedFloor}
          </h3>
          <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
            Comprehensive environmental parameters across zones (normalized to 0-100 scale)
          </p>
        </div>
        {loading ? (
          <LoadingSpinner message="Loading profile data..." />
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={airQualityProfile}>
              <PolarGrid stroke="#F1F3F5" />
              <PolarAngleAxis dataKey="subject" style={{ fontSize: 11, fontWeight: 400 }} />
              <PolarRadiusAxis style={{ fontSize: 11, fontWeight: 400 }} />
              <Radar name="Temperature" dataKey="temperature" stroke="#EF4444" fill="#EF4444" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Humidity" dataKey="humidity" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="CO₂" dataKey="co2" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="PM2.5" dataKey="pm25" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} strokeWidth={2} />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 400 }} />
              <Tooltip
                contentStyle={{ 
                  background: '#FFF', 
                  border: '1px solid #E5E7EB', 
                  borderRadius: 8, 
                  fontSize: 12,
                  fontWeight: 400
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Alerts Section */}
      {allSensors.filter(s => s.quality === 'moderate' || s.quality === 'poor' || s.quality === 'unhealthy').length > 0 && (
        <div style={{
          marginTop: 24,
          background: '#FFFFFF',
          border: '1px solid #FEE2E2',
          borderRadius: 12,
          padding: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <AlertTriangle size={18} color="#F59E0B" strokeWidth={1.5} />
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827' }}>
              Air Quality Alerts ({allSensors.filter(s => s.quality === 'moderate' || s.quality === 'poor' || s.quality === 'unhealthy').length})
            </h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {allSensors
              .filter(s => s.quality === 'moderate' || s.quality === 'poor' || s.quality === 'unhealthy')
              .map((sensor, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    background: sensor.quality === 'unhealthy' ? '#FEF2F2' : '#FEF9F5',
                    border: `1px solid ${sensor.quality === 'unhealthy' ? '#FEE2E2' : '#FED7AA'}`,
                    borderRadius: 8
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
                    Floor {sensor.floor} - {sensor.location}
                  </p>
                  <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
                    {sensor.co2 > 1200 ? `High CO₂: ${sensor.co2} ppm` : sensor.pm25 > 25 ? `High PM2.5: ${sensor.pm25} µg/m³` : 'Air quality concern'}
                  </p>
                  <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400, marginTop: 4 }}>
                    AQI: {sensor.aqi} • {getQualityLabel(sensor.quality)}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IAQScreen;