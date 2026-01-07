// src/components/CafeteriaAnalyticsDashboard.tsx
import React, { useState } from 'react';
import { Calendar, TrendingUp, Clock, BarChart3, Filter } from 'lucide-react';
import {
  HourlyBreakdownChart,
  DailyComparisonChart,
  PeakHoursHeatmap,
  TrendChart
} from './DatewiseCharts';

// Tab component
interface Tab {
  id: string;
  label: string;
  icon: any;
}

const tabs: Tab[] = [
  { id: 'hourly', label: 'Hourly Analysis', icon: Clock },
  { id: 'daily', label: 'Daily Comparison', icon: BarChart3 },
  { id: 'trends', label: 'Trends', icon: TrendingUp },
  { id: 'peak', label: 'Peak Hours', icon: Calendar }
];

export const CafeteriaAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('hourly');
  const [dateRange, setDateRange] = useState(7); // days

  const renderTabContent = () => {
    switch (activeTab) {
      case 'hourly':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <HourlyBreakdownChart />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: 16 }}>
              <PeakHoursHeatmap />
            </div>
          </div>
        );
      
      case 'daily':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #F1F3F5',
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <Filter size={16} color="#6B7280" />
              <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>
                Date Range:
              </span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 400,
                  color: '#111827',
                  background: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value={3}>Last 3 Days</option>
                <option value={7}>Last 7 Days</option>
                <option value={14}>Last 14 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </div>
            <DailyComparisonChart days={dateRange} />
          </div>
        );
      
      case 'trends':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #F1F3F5',
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <Filter size={16} color="#6B7280" />
              <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>
                Date Range:
              </span>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(Number(e.target.value))}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 400,
                  color: '#111827',
                  background: '#FFFFFF',
                  cursor: 'pointer'
                }}
              >
                <option value={3}>Last 3 Days</option>
                <option value={7}>Last 7 Days</option>
                <option value={14}>Last 14 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </div>
            <TrendChart days={dateRange} />
          </div>
        );
      
      case 'peak':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <PeakHoursHeatmap />
            <HourlyBreakdownChart />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div style={{
      padding: '24px',
      background: '#F9FAFB',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontSize: 24,
          fontWeight: 600,
          color: '#111827',
          marginBottom: 8,
          letterSpacing: '-0.5px'
        }}>
          Cafeteria Analytics
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 400 }}>
          Historical queue analysis and performance insights
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 12,
        padding: '8px',
        marginBottom: 24,
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: isActive ? '#6366F1' : 'transparent',
                color: isActive ? '#FFFFFF' : '#6B7280'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#F3F4F6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {renderTabContent()}

      {/* Info Footer */}
      <div style={{
        marginTop: 24,
        padding: 16,
        background: '#FEF3C7',
        border: '1px solid #FDE68A',
        borderRadius: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: '#F59E0B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 2
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#FFFFFF' }}>i</span>
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 500, color: '#92400E', marginBottom: 4 }}>
              About the Analytics
            </h4>
            <p style={{ fontSize: 12, color: '#78350F', fontWeight: 400, lineHeight: 1.6 }}>
              Data is collected every 30 seconds from all cafeteria counters. Hourly averages show the mean queue count 
              and wait time for each hour. Use the date picker to explore historical data and identify patterns in 
              cafeteria traffic. Critical alerts are triggered when queue count exceeds 20 or wait time exceeds 20 minutes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeteriaAnalyticsDashboard;