import React, { useState, useMemo, useEffect, memo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line
} from 'recharts';
import {
  Package, AlertTriangle, CheckCircle, Clock, TrendingUp,
  DollarSign, Shield, Activity, Target, RefreshCw, Filter,
  Download, Search, Calendar, Building, Users, Wrench, ArrowUp, ArrowDown
} from 'lucide-react';
import { useAssets } from '../api/useAssets';
import type { Asset } from '../api/assets';

// ==================== FONT STYLING ====================
const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
`;

const globalStyles = `
  ${fontImport}
  
  * {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes skeletonShimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
`;

// Color scheme matching inventory analytics
const COLORS = {
  primary: '#6366F1',
  secondary: '#8B5CF6',
  dark: '#0F172A',
  gray: '#64748B',
  lightGray: '#94A3B8',
  bg: '#FAFAFA',
  white: '#FFFFFF',
  border: '#F1F3F5',
  critical: '#EF4444',
  high: '#F59E0B',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  pink: '#EC4899',
  purple: '#8B5CF6',
  green: '#10B981',
  orange: '#F59E0B',
  cyan: '#06B6D4',
};

const CHART_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#EF4444', '#F97316'];

// ==================== UTILITY FUNCTIONS ====================
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatCompactCurrency = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 10000000) {
    return `${sign}₹${(absValue / 10000000).toFixed(1)}Cr`;
  } else if (absValue >= 100000) {
    return `${sign}₹${(absValue / 100000).toFixed(1)}L`;
  } else if (absValue >= 1000) {
    return `${sign}₹${(absValue / 1000).toFixed(1)}K`;
  }
  
  return `${sign}₹${absValue.toFixed(0)}`;
};

// ==================== COUNTUP ANIMATION ====================
const CountUp: React.FC<{
  end: number;
  duration?: number;
  decimals?: number;
}> = ({ end, duration = 1200, decimals = 0 }) => {
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

  const displayValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString('en-IN');
  return <>{displayValue}</>;
};

// ==================== STYLES ====================
const styles = {
  container: {
    fontFamily: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif`,
    padding: '24px',
    backgroundColor: COLORS.bg,
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    animation: 'fadeIn 0.6s ease-out',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: COLORS.dark,
    margin: '0 0 6px 0',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '13px',
    color: COLORS.gray,
    margin: 0,
    fontWeight: 400,
    letterSpacing: '-0.01em',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  button: {
    padding: '9px 16px',
    fontSize: '13px',
    fontWeight: 500,
    border: `1px solid ${COLORS.border}`,
    borderRadius: '8px',
    backgroundColor: COLORS.white,
    color: COLORS.dark,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '16px',
    animation: 'fadeIn 0.8s ease-out',
  },
  kpiCard: {
    background: COLORS.white,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
    transition: 'all 0.2s',
    animation: 'slideIn 0.5s ease-out',
  },
  kpiHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kpiTitle: {
    fontSize: '13px',
    fontWeight: 400,
    color: COLORS.gray,
    letterSpacing: '-0.01em',
  },
  kpiValue: {
    fontSize: '28px',
    fontWeight: 600,
    color: COLORS.dark,
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  kpiTrend: (isPositive: boolean) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    fontWeight: 500,
    color: isPositive ? COLORS.success : COLORS.danger,
    marginTop: '8px',
  }),
  iconBadge: (color: string) => ({
    width: 40,
    height: 40,
    background: `${color}15`,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  chartCard: {
    background: COLORS.white,
    borderRadius: 12,
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    border: `1px solid ${COLORS.border}`,
    animation: 'slideIn 0.7s ease-out',
    transition: 'all 0.3s ease',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: '16px',
    fontWeight: 500,
    color: COLORS.dark,
    margin: 0,
    letterSpacing: '-0.015em',
  },
  badge: (color: string) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    background: color,
    color: COLORS.white,
    borderRadius: 16,
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.01em',
    boxShadow: `0 2px 8px ${color}40`,
  }),
  tableContainer: {
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '11px',
    fontWeight: 500,
    color: COLORS.gray,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: `1px solid ${COLORS.border}`,
    backgroundColor: COLORS.bg,
  },
  td: {
    padding: '16px',
    fontSize: '13px',
    fontWeight: 400,
    color: COLORS.dark,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  alertCard: (severity: string) => {
    const colors = {
      high: { bg: '#FEE2E2', border: COLORS.critical },
      medium: { bg: '#FEF3C7', border: COLORS.warning },
      low: { bg: '#DBEAFE', border: COLORS.info },
    };
    const color = colors[severity] || colors.low;
    return {
      padding: '12px 16px',
      borderRadius: 10,
      backgroundColor: color.bg,
      border: `1px solid ${color.border}`,
      marginBottom: '10px',
      transition: 'all 0.2s',
      cursor: 'pointer',
    };
  },
  statusBadge: (status: string) => {
    const colors = {
      active: { bg: '#DCFCE7', text: '#15803D' },
      maintenance: { bg: '#FEF3C7', text: '#D97706' },
      retired: { bg: '#FEE2E2', text: '#DC2626' },
      inactive: { bg: '#F1F5F9', text: '#475569' },
    };
    const color = colors[status.toLowerCase()] || colors.active;
    return {
      display: 'inline-block',
      padding: '4px 10px',
      fontSize: '11px',
      fontWeight: 500,
      borderRadius: 12,
      backgroundColor: color.bg,
      color: color.text,
      letterSpacing: '0.01em',
    };
  },
};

// ==================== KPI CARD COMPONENT ====================
interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: React.ComponentType<any>;
  trend?: number;
  iconColor: string;
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = memo(({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  trend,
  iconColor,
  loading = false
}) => {
  return (
    <div 
      style={styles.kpiCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={styles.kpiHeader}>
        <div style={{ flex: 1 }}>
          <div style={styles.kpiTitle}>{title}</div>
          <div style={styles.kpiValue}>
            {loading ? (
              <div style={{ width: 100, height: 28, background: '#F1F5F9', borderRadius: 6, animation: 'skeletonShimmer 1.2s ease-in-out infinite' }} />
            ) : (
              <>
                {prefix}
                <CountUp end={value} decimals={suffix === '%' ? 1 : 0} />
                {suffix}
              </>
            )}
          </div>
          {trend !== undefined && !loading && (
            <div style={styles.kpiTrend(trend >= 0)}>
              {trend >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
              <span>{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div style={styles.iconBadge(iconColor)}>
          <Icon size={20} color={iconColor} />
        </div>
      </div>
    </div>
  );
});

// ==================== CUSTOM DONUT CHART ====================
const CustomDonutChart: React.FC<{
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
  loading?: boolean;
}> = ({ data, total, loading = false }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const renderCustomLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(1);
    return `${percent}%`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid #F3F4F6',
          borderTop: '3px solid #6366F1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <ResponsiveContainer width="60%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={renderCustomLabel}
            labelLine={false}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke={COLORS.white}
                strokeWidth={2}
                style={{
                  filter: activeIndex === index ? 'brightness(1.1)' : 'brightness(1)',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ payload }) => {
              if (!payload || !payload[0]) return null;
              const data = payload[0].payload;
              return (
                <div style={{
                  background: COLORS.white,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.dark }}>
                    {data.name}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: data.color, marginTop: 4 }}>
                    {data.value.toLocaleString('en-IN')} ({((data.value / total) * 100).toFixed(1)}%)
                  </div>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 12px',
              borderRadius: 8,
              backgroundColor: activeIndex === index ? COLORS.bg : 'transparent',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div style={{
              width: 12,
              height: 12,
              borderRadius: 3,
              backgroundColor: item.color,
              flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: COLORS.dark }}>
                {item.name}
              </div>
              <div style={{ fontSize: 11, color: COLORS.gray, marginTop: 2 }}>
                {item.value.toLocaleString('en-IN')} assets
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: item.color }}>
              {((item.value / total) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const AssetManagementDashboard: React.FC = () => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { assets, loading, error, refresh } = useAssets();

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      refresh(true);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  // Calculate statistics from real data
  const stats = useMemo(() => {
    const total = assets.length;
    const active = assets.filter(a => a.status?.toLowerCase() === 'active').length;
    const maintenance = assets.filter(a => a.status?.toLowerCase() === 'maintenance').length;
    const retired = assets.filter(a => a.status?.toLowerCase() === 'retired' || a.status?.toLowerCase() === 'inactive').length;

    // Group by category
    const categoryGroups = assets.reduce((acc, asset) => {
      const cat = asset.assetCategory || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = { count: 0, assets: [] };
      }
      acc[cat].count++;
      acc[cat].assets.push(asset);
      return acc;
    }, {} as Record<string, { count: number; assets: Asset[] }>);

    // Get top 5 categories
    const topCategories = Object.entries(categoryGroups)
      .map(([category, data]) => ({
        category,
        count: data.count,
        utilization: 75 + Math.random() * 20, // Mock utilization
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Recent assets (last 5 created/updated)
    const recentAssets = [...assets]
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);

    // Calculate utilization rate
    const utilizationRate = total > 0 ? (active / total) * 100 : 0;

    return {
      total,
      active,
      maintenance,
      retired,
      utilizationRate,
      topCategories,
      recentAssets,
    };
  }, [assets]);

  // Asset status distribution for donut chart
  const assetStatusData = useMemo(() => [
    { name: 'Active', value: stats.active, color: COLORS.success },
    { name: 'Maintenance', value: stats.maintenance, color: COLORS.warning },
    { name: 'Retired/Inactive', value: stats.retired, color: COLORS.danger }
  ], [stats]);

  // Generate mock value trend data (would come from API in production)
  const valueTrendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, i) => ({
      month,
      value: 8000 + Math.random() * 1000 + i * 100
    }));
  }, []);

  // Mock alerts (would come from API)
  const criticalAlerts = [
    {
      id: 1,
      type: 'maintenance',
      severity: 'high',
      message: `${stats.maintenance} Assets in Maintenance`,
      detail: 'Assets currently under maintenance',
      count: stats.maintenance
    },
    {
      id: 2,
      type: 'warranty',
      severity: 'medium',
      message: 'Asset Health Check Required',
      detail: 'Regular maintenance recommended',
      count: Math.floor(stats.total * 0.1)
    },
    {
      id: 3,
      type: 'depreciation',
      severity: 'low',
      message: 'Asset Utilization Tracking',
      detail: 'Monitor asset performance',
      count: Math.floor(stats.total * 0.15)
    }
  ];

  const handleExport = () => {
    const csv = [
      ['Asset ID', 'Name', 'Category', 'Status', 'Location', 'Installation Date'].join(','),
      ...assets.map(a => 
        [a.assetId, a.assetName, a.assetCategory, a.status, a.location, a.dateOfInstallation].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `assets_dashboard_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (error) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={styles.container}>
          <div style={{
            ...styles.chartCard,
            padding: '40px',
            textAlign: 'center',
            color: COLORS.danger
          }}>
            <AlertTriangle size={48} style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Error Loading Dashboard</h3>
            <p style={{ fontSize: 14, color: COLORS.gray, marginBottom: 20 }}>{error}</p>
            <button
              style={styles.button}
              onClick={() => refresh(true)}
            >
              <RefreshCw size={16} />
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={styles.title}>Asset Management Dashboard</h2>
            <p style={styles.subtitle}>
              Real-time asset tracking and lifecycle management • {stats.total} Total Assets
            </p>
          </div>
          <div style={styles.buttonGroup}>
            <button
              style={{
                ...styles.button,
                backgroundColor: autoRefresh ? COLORS.success : COLORS.white,
                color: autoRefresh ? COLORS.white : COLORS.dark,
                borderColor: autoRefresh ? COLORS.success : COLORS.border,
              }}
              onClick={() => setAutoRefresh(!autoRefresh)}
              onMouseEnter={(e) => {
                if (!autoRefresh) {
                  e.currentTarget.style.backgroundColor = COLORS.bg;
                  e.currentTarget.style.borderColor = COLORS.lightGray;
                }
              }}
              onMouseLeave={(e) => {
                if (!autoRefresh) {
                  e.currentTarget.style.backgroundColor = COLORS.white;
                  e.currentTarget.style.borderColor = COLORS.border;
                }
              }}
            >
              <RefreshCw size={16} />
              {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </button>
            <button
              style={styles.button}
              onClick={handleExport}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.bg;
                e.currentTarget.style.borderColor = COLORS.lightGray;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.white;
                e.currentTarget.style.borderColor = COLORS.border;
              }}
            >
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div style={styles.kpiGrid}>
          <KPICard
            title="Total Assets"
            value={stats.total}
            icon={Package}
            trend={5.2}
            iconColor={COLORS.primary}
            loading={loading}
          />
          <KPICard
            title="Active Assets"
            value={stats.active}
            icon={CheckCircle}
            trend={3.8}
            iconColor={COLORS.success}
            loading={loading}
          />
          <KPICard
            title="In Maintenance"
            value={stats.maintenance}
            icon={Wrench}
            trend={-12.5}
            iconColor={COLORS.warning}
            loading={loading}
          />
          <KPICard
            title="Utilization Rate"
            value={stats.utilizationRate}
            suffix="%"
            icon={Activity}
            trend={2.1}
            iconColor={COLORS.info}
            loading={loading}
          />
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Asset Status Distribution - Donut Chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Asset Status Distribution</h3>
              <span style={styles.badge(COLORS.primary)}>
                {stats.total} Total
              </span>
            </div>
            <CustomDonutChart
              data={assetStatusData}
              total={stats.total}
              loading={loading}
            />
          </div>

          {/* Monthly Asset Value Trend */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Monthly Asset Value Trend</h3>
              <div style={{ fontSize: '13px', color: COLORS.gray, fontWeight: 400 }}>
                Last 6 months
              </div>
            </div>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                <div style={{
                  width: 40,
                  height: 40,
                  border: '3px solid #F3F4F6',
                  borderTop: '3px solid #6366F1',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={valueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: COLORS.gray }}
                    stroke={COLORS.border}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: COLORS.gray }}
                    stroke={COLORS.border}
                    tickFormatter={(value) => `₹${value}K`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: COLORS.white,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(value: number) => [formatCompactCurrency(value * 1000), 'Value']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: COLORS.primary, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Asset Category Performance Table */}
        <div style={{ ...styles.chartCard, marginBottom: '16px' }}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Asset Category Performance</h3>
            <div style={{ fontSize: '13px', color: COLORS.gray, fontWeight: 400 }}>
              Top {stats.topCategories.length} categories
            </div>
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Category</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Count</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Utilization</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        border: '3px solid #F3F4F6',
                        borderTop: '3px solid #6366F1',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                      }} />
                    </td>
                  </tr>
                ) : stats.topCategories.length > 0 ? (
                  stats.topCategories.map((item, index) => (
                    <tr
                      key={index}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = COLORS.bg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={styles.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                          }} />
                          <span style={{ fontWeight: 500 }}>{item.category}</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 500 }}>
                        {item.count.toLocaleString('en-IN')}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'center' }}>
                        <div style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 12,
                          fontSize: '11px',
                          fontWeight: 500,
                          backgroundColor: item.utilization >= 90 ? '#DCFCE7' : item.utilization >= 80 ? '#FEF3C7' : '#FEE2E2',
                          color: item.utilization >= 90 ? COLORS.success : item.utilization >= 80 ? COLORS.warning : COLORS.danger,
                        }}>
                          {item.utilization.toFixed(0)}%
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ ...styles.td, textAlign: 'center', padding: '40px', color: COLORS.gray }}>
                      No category data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts and Recent Activity Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Critical Alerts */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Critical Alerts</h3>
              <span style={styles.badge(COLORS.danger)}>
                {criticalAlerts.reduce((sum, alert) => sum + alert.count, 0)} Items
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  style={styles.alertCard(alert.severity)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', gap: 12 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      background: alert.severity === 'high' ? '#FCA5A5' : alert.severity === 'medium' ? '#FDE047' : '#93C5FD',
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {alert.type === 'maintenance' ? (
                        <Wrench size={16} color={alert.severity === 'high' ? '#991B1B' : '#A16207'} />
                      ) : alert.type === 'warranty' ? (
                        <Shield size={16} color={alert.severity === 'high' ? '#991B1B' : '#A16207'} />
                      ) : (
                        <Clock size={16} color={COLORS.info} />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: COLORS.dark, marginBottom: 4 }}>
                        {alert.message}
                      </div>
                      <div style={{ fontSize: '11px', color: COLORS.gray }}>
                        {alert.detail}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 12px',
                      borderRadius: 12,
                      backgroundColor: COLORS.primary,
                      color: COLORS.white,
                      fontSize: '11px',
                      fontWeight: 500
                    }}>
                      {alert.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Asset Activity */}
          <div style={styles.chartCard}>
            <div style={styles.chartHeader}>
              <h3 style={styles.chartTitle}>Recent Asset Activity</h3>
              <span style={styles.badge(COLORS.info)}>
                Latest {stats.recentAssets.length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    border: '3px solid #F3F4F6',
                    borderTop: '3px solid #6366F1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                </div>
              ) : stats.recentAssets.length > 0 ? (
                stats.recentAssets.map((asset) => (
                  <div
                    key={asset.assetId}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      backgroundColor: COLORS.bg,
                      border: `1px solid ${COLORS.border}`,
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.white;
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.bg;
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 6 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: COLORS.dark, marginBottom: 4 }}>
                          {asset.assetName}
                        </div>
                        <div style={{ fontSize: '11px', color: COLORS.gray }}>
                          {asset.assetId} • {asset.assetCategory}
                        </div>
                      </div>
                      <span style={styles.statusBadge(asset.status || 'active')}>
                        {asset.status || 'Active'}
                      </span>
                    </div>
                    {asset.location && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: '11px',
                        fontWeight: 400,
                        color: COLORS.gray,
                        marginTop: 6
                      }}>
                        <Building size={12} />
                        {asset.location}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: COLORS.gray }}>
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssetManagementDashboard;