// src/components/SmartInsightsPanel.tsx
import React, { useMemo } from 'react';
import { TrendingUp, Users, Clock, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface SmartInsightsPanelProps {
  insights: any;
  loading?: boolean;
}

const SmartInsightsPanel: React.FC<SmartInsightsPanelProps> = ({ insights, loading }) => {
  // Parse insights data
  const peakHour = insights?.peakHour || {};
  const footfallStatus = insights?.footfallStatus || 'UNKNOWN';
  const throughput = insights?.throughput || {};
  const occupancy = insights?.occupancy || {};
  const counters = insights?.counters || {};

  // Status colors
  const footfallColors = {
    HIGH: { bg: '#FEF2F2', text: '#991B1B', icon: '#DC2626' },
    NORMAL: { bg: '#F0FDF4', text: '#166534', icon: '#16A34A' },
    LOW: { bg: '#FEF9C3', text: '#854D0E', icon: '#CA8A04' },
    UNKNOWN: { bg: '#F3F4F6', text: '#6B7280', icon: '#9CA3AF' }
  };

  const statusColor = footfallColors[footfallStatus as keyof typeof footfallColors] || footfallColors.UNKNOWN;

  // Trend icons
  const trendIcons = {
    INCREASING: { icon: TrendingUp, color: '#DC2626', rotation: 0 },
    DECREASING: { icon: TrendingUp, color: '#16A34A', rotation: 180 },
    STABLE: { icon: Activity, color: '#6366F1', rotation: 0 },
    INSUFFICIENT_DATA: { icon: Activity, color: '#9CA3AF', rotation: 0 }
  };

  const trendInfo = trendIcons[throughput.trend as keyof typeof trendIcons] || trendIcons.INSUFFICIENT_DATA;
  const TrendIcon = trendInfo.icon;

  if (loading) {
    return (
      <div style={{
        background: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', color: '#6B7280', padding: '40px 0' }}>
          Loading insights...
        </div>
      </div>
    );
  }

  if (!insights || !insights.peakHour) {
    return (
      <div style={{
        background: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ textAlign: 'center', color: '#6B7280', padding: '40px 0' }}>
          No insights available
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
          marginBottom: 4 
        }}>
          Smart Insights
        </h3>
        <p style={{ 
          fontSize: 13, 
          color: '#6B7280', 
          fontWeight: 400 
        }}>
          AI-powered analysis of cafeteria operations
        </p>
      </div>

      {/* Main Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 20
      }}>
        {/* Peak Hour */}
        <div style={{
          padding: 16,
          background: '#F9FAFB',
          borderRadius: 8,
          border: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Clock size={16} color="#6366F1" />
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Peak Hour</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            {peakHour.hourFormatted || 'N/A'}
          </div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            Avg Queue: {peakHour.avgQueue ? Math.round(peakHour.avgQueue) : 0} people
          </div>
        </div>

        {/* Footfall Status */}
        <div style={{
          padding: 16,
          background: statusColor.bg,
          borderRadius: 8,
          border: `1px solid ${statusColor.icon}30`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Users size={16} color={statusColor.icon} />
            <span style={{ fontSize: 12, color: statusColor.text, fontWeight: 500 }}>Footfall Status</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: statusColor.text, marginBottom: 4 }}>
            {footfallStatus}
          </div>
          <div style={{ fontSize: 11, color: statusColor.text }}>
            Current traffic level
          </div>
        </div>

        {/* Throughput */}
        <div style={{
          padding: 16,
          background: '#F9FAFB',
          borderRadius: 8,
          border: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <TrendIcon 
              size={16} 
              color={trendInfo.color}
              style={{ transform: `rotate(${trendInfo.rotation || 0}deg)` }}
            />
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Throughput</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            {throughput.avgRate?.toFixed(1) || '0.0'} <span style={{ fontSize: 14, fontWeight: 400 }}>ppl/min</span>
          </div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            Trend: {throughput.trend || 'Unknown'}
          </div>
        </div>

        {/* Occupancy */}
        <div style={{
          padding: 16,
          background: '#F9FAFB',
          borderRadius: 8,
          border: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Activity size={16} color="#6366F1" />
            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Occupancy</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
            {occupancy.occupancyRate?.toFixed(1) || '0.0'}%
          </div>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            {occupancy.totalPeople || 0} people in cafeteria
          </div>
        </div>
      </div>

      {/* Counter Performance */}
      <div>
        <h4 style={{ 
          fontSize: 14, 
          fontWeight: 600, 
          color: '#111827', 
          marginBottom: 12 
        }}>
          Counter Performance
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12
        }}>
          {Object.entries(counters).map(([name, stats]: [string, any]) => {
            const statusColors = {
              BUSY: '#DC2626',
              MODERATE: '#F59E0B',
              NORMAL: '#16A34A'
            };
            
            const color = statusColors[stats.status as keyof typeof statusColors] || '#6B7280';

            return (
              <div 
                key={name}
                style={{
                  padding: 12,
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: 8
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 8
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                    {name}
                  </span>
                  <div 
                    style={{
                      padding: '2px 8px',
                      background: `${color}15`,
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600,
                      color: color
                    }}
                  >
                    {stats.status}
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>
                    <span style={{ fontWeight: 500 }}>Queue:</span> {Math.round(stats.avgQueue || 0)} people
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>
                    <span style={{ fontWeight: 500 }}>Wait:</span> {Math.round(stats.avgWaitTime || 0)} min
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>
                    <span style={{ fontWeight: 500 }}>Throughput:</span> {stats.throughput?.toFixed(1) || '0.0'} ppl/min
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations Section (Optional) */}
      {footfallStatus === 'HIGH' && (
        <div style={{
          marginTop: 20,
          padding: 12,
          background: '#FEF2F2',
          border: '1px solid #FCA5A5',
          borderRadius: 8,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#991B1B', marginBottom: 4 }}>
              High Traffic Alert
            </div>
            <div style={{ fontSize: 12, color: '#991B1B' }}>
              Consider opening additional service counters or deploying extra staff during peak hours.
            </div>
          </div>
        </div>
      )}

      {footfallStatus === 'LOW' && (
        <div style={{
          marginTop: 20,
          padding: 12,
          background: '#F0FDF4',
          border: '1px solid #86EFAC',
          borderRadius: 8,
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start'
        }}>
          <CheckCircle size={18} color="#16A34A" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 4 }}>
              Low Traffic Period
            </div>
            <div style={{ fontSize: 12, color: '#166534' }}>
              Good time for maintenance, inventory check, or staff training.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartInsightsPanel;