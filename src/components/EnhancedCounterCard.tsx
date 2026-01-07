// src/components/EnhancedCounterCard.tsx
import React from 'react';
import { Users, Clock, TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface CounterData {
  name: string;
  queueLength: number;
  avgWaitTime: number;
  waitTimeText: string;
  status: 'ready' | 'busy' | 'crowded';
  serviceStatus: string;
  color: string;
  image?: string;
  throughput: number; // people per minute
  peakTime?: string;
  location?: string;
  floor?: number;
}

interface EnhancedCounterCardProps {
  counter: CounterData;
  index: number;
  throughputData?: number; // Real-time throughput from analytics
}

const EnhancedCounterCard: React.FC<EnhancedCounterCardProps> = ({ 
  counter, 
  index,
  throughputData 
}) => {
  const { 
    name, 
    queueLength, 
    avgWaitTime, 
    waitTimeText, 
    status, 
    color, 
    image,
    throughput: defaultThroughput 
  } = counter;

  // Use real-time throughput if available, otherwise use default
  const throughput = throughputData !== undefined ? throughputData : defaultThroughput;

  // Status configurations
  const statusConfig = {
    ready: {
      bg: '#F0FDF4',
      text: '#166534',
      badge: '#16A34A',
      icon: '✓'
    },
    busy: {
      bg: '#FEF9C3',
      text: '#854D0E',
      badge: '#F59E0B',
      icon: '⚡'
    },
    crowded: {
      bg: '#FEF2F2',
      text: '#991B1B',
      badge: '#DC2626',
      icon: '!'
    }
  };

  const config = statusConfig[status];

  // Determine throughput status
  const getThroughputStatus = (rate: number) => {
    if (rate >= 2.5) return { text: 'High', color: '#16A34A', icon: TrendingUp };
    if (rate >= 1.5) return { text: 'Normal', color: '#6366F1', icon: Activity };
    return { text: 'Low', color: '#F59E0B', icon: TrendingDown };
  };

  const throughputStatus = getThroughputStatus(throughput);
  const ThroughputIcon = throughputStatus.icon;

  return (
    <div
      style={{
        background: '#FFFFFF',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        animation: `fadeIn 0.4s ease ${index * 0.1}s both`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Image Header */}
      {image && (
        <div style={{
          width: '100%',
          height: 140,
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative'
        }}>
          <div 
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              padding: '4px 12px',
              background: 'rgba(0, 0, 0, 0.75)',
              borderRadius: 6,
              backdropFilter: 'blur(8px)',
              fontSize: 11,
              fontWeight: 600,
              color: '#FFFFFF'
            }}
          >
            {name}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: 16 }}>
        {/* Counter Name (if no image) */}
        {!image && (
          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#111827',
            marginBottom: 12
          }}>
            {name}
          </h3>
        )}

        {/* Status Badge */}
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            background: config.bg,
            borderRadius: 6,
            marginBottom: 12
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600 }}>{config.icon}</span>
          <span style={{ 
            fontSize: 12, 
            fontWeight: 600, 
            color: config.text 
          }}>
            {status.toUpperCase()}
          </span>
        </div>

        {/* Key Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 12
        }}>
          {/* Queue Length */}
          <div style={{
            padding: 12,
            background: '#F9FAFB',
            borderRadius: 8,
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Users size={14} color={color} />
              <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Queue Length</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              {queueLength}
            </div>
            <div style={{ fontSize: 10, color: '#6B7280' }}>
              people waiting
            </div>
          </div>

          {/* Wait Time */}
          <div style={{
            padding: 12,
            background: '#F9FAFB',
            borderRadius: 8,
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Clock size={14} color={color} />
              <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Wait Time</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              {Math.round(avgWaitTime)}
            </div>
            <div style={{ fontSize: 10, color: '#6B7280' }}>
              {waitTimeText}
            </div>
          </div>
        </div>

        {/* Throughput Display - NEW REQUIREMENT */}
        <div 
          style={{
            padding: 12,
            background: `${throughputStatus.color}08`,
            border: `1px solid ${throughputStatus.color}30`,
            borderRadius: 8,
            marginBottom: 8
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ThroughputIcon size={16} color={throughputStatus.color} />
              <div>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>
                  Throughput
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: throughputStatus.color }}>
                  {throughput.toFixed(1)} <span style={{ fontSize: 11, fontWeight: 400 }}>ppl/min</span>
                </div>
              </div>
            </div>
            <div 
              style={{
                padding: '4px 8px',
                background: `${throughputStatus.color}15`,
                borderRadius: 4,
                fontSize: 10,
                fontWeight: 600,
                color: throughputStatus.color
              }}
            >
              {throughputStatus.text}
            </div>
          </div>
        </div>

        {/* Service Efficiency Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 8,
          borderTop: '1px solid #E5E7EB',
          fontSize: 11,
          color: '#6B7280'
        }}>
          <span>Service Efficiency</span>
          <div style={{
            width: '60%',
            height: 4,
            background: '#E5E7EB',
            borderRadius: 2,
            overflow: 'hidden'
          }}>
            <div 
              style={{
                width: `${Math.min((throughput / 3) * 100, 100)}%`,
                height: '100%',
                background: throughputStatus.color,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <span style={{ fontWeight: 600, color: throughputStatus.color }}>
            {Math.round((throughput / 3) * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCounterCard;