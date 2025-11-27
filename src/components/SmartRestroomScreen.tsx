// src/components/SmartRestroomScreen.tsx
import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RestroomData {
  id: string;
  location: string;
  floor: number;
  occupied: boolean;
  usageCount: number;
  lastCleaned: string;
  status: 'excellent' | 'good' | 'needs-attention' | 'cleaning-required';
}

const SmartRestroomScreen: React.FC = () => {
  const [restrooms] = useState<RestroomData[]>([
    {
      id: 'CL31',
      location: 'Floor 3 - West Wing',
      floor: 3,
      occupied: false,
      usageCount: 28,
      lastCleaned: '09:00',
      status: 'excellent'
    },
    {
      id: 'CL32',
      location: 'Floor 3 - East Wing',
      floor: 3,
      occupied: true,
      usageCount: 52,
      lastCleaned: '11:20',
      status: 'cleaning-required'
    },
    {
      id: 'CL41',
      location: 'Floor 4 - West Wing',
      floor: 4,
      occupied: false,
      usageCount: 35,
      lastCleaned: '10:15',
      status: 'good'
    },
    {
      id: 'CL42',
      location: 'Floor 4 - East Wing',
      floor: 4,
      occupied: true,
      usageCount: 41,
      lastCleaned: '09:45',
      status: 'needs-attention'
    },
    {
      id: 'CL51',
      location: 'Floor 5 - West Wing',
      floor: 5,
      occupied: false,
      usageCount: 22,
      lastCleaned: '08:30',
      status: 'excellent'
    },
    {
      id: 'CL52',
      location: 'Floor 5 - East Wing',
      floor: 5,
      occupied: false,
      usageCount: 18,
      lastCleaned: '10:00',
      status: 'excellent'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-50 border-green-200 text-green-700';
      case 'good': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'needs-attention': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'cleaning-required': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const usageTrendData = {
    labels: ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM'],
    datasets: [
      {
        label: 'Total Usage',
        data: [15, 28, 42, 58, 72, 85, 68, 54, 38, 25],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      }
    ]
  };

  const usageStatsData = {
    labels: ['Floor 3', 'Floor 4', 'Floor 5'],
    datasets: [
      {
        label: 'Usage Count',
        data: [80, 76, 40],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(99, 102, 241, 0.8)', 'rgba(139, 92, 246, 0.8)'],
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#6b7280', font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 11 } }
      }
    }
  };

  const alerts = restrooms.filter(r => r.status === 'cleaning-required' || r.status === 'needs-attention');

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '24px' }}>
      {/* Main Content - 3 columns */}
      <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header with Download */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>Smart Restroom Status</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>Real-time monitoring of restroom facilities</p>
          </div>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Total Restrooms</p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: '#111827', margin: 0 }}>6</p>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Available</p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: '#10b981', margin: 0 }}>4</p>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Occupied</p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: '#f59e0b', margin: 0 }}>2</p>
          </div>
          <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0' }}>Need Cleaning</p>
            <p style={{ fontSize: '24px', fontWeight: 600, color: '#ef4444', margin: 0 }}>2</p>
          </div>
        </div>

        {/* Restroom Status Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {restrooms.map((restroom) => (
            <div key={restroom.id} style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>
                    {restroom.id}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{restroom.location}</p>
                </div>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 500,
                  background: restroom.occupied ? '#fee2e2' : '#dcfce7',
                  color: restroom.occupied ? '#dc2626' : '#16a34a'
                }}>
                  {restroom.occupied ? 'Occupied' : 'Available'}
                </span>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  Usage: <span style={{ fontWeight: 500, color: '#111827' }}>{restroom.usageCount} times</span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Last Cleaned: <span style={{ fontWeight: 500, color: '#111827' }}>{restroom.lastCleaned}</span>
                </div>
              </div>
              <div style={{
                padding: '8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 500,
                textAlign: 'center'
              }} className={getStatusColor(restroom.status)}>
                {restroom.status === 'excellent' ? 'Excellent' : 
                 restroom.status === 'good' ? 'Good' :
                 restroom.status === 'needs-attention' ? 'Needs Attention' : 'Cleaning Required'}
              </div>
            </div>
          ))}
        </div>

        {/* Usage Trend Chart */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>Usage Trend</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#059669' }}>Live Data</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Line data={usageTrendData} options={chartOptions} />
          </div>
        </div>

        {/* Usage Statistics */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>Usage by Floor</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#dbeafe', border: '1px solid #93c5fd', borderRadius: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#1d4ed8' }}>Live Data</span>
            </div>
          </div>
          <div style={{ height: '200px' }}>
            <Bar data={usageStatsData} options={chartOptions} />
          </div>
        </div>

        {/* Recent Activities */}
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>Recent Activities</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { time: '13:25', action: 'CL32 - Cleaning requested', type: 'alert' },
              { time: '13:10', action: 'CL41 - Cleaning completed', type: 'success' },
              { time: '12:55', action: 'CL51 - High usage detected', type: 'warning' },
              { time: '12:30', action: 'CL42 - Maintenance completed', type: 'info' },
              { time: '12:05', action: 'CL31 - Cleaning completed', type: 'success' },
              { time: '11:45', action: 'CL52 - System check passed', type: 'info' },
              { time: '11:20', action: 'CL32 - Usage threshold reached', type: 'warning' },
              { time: '10:55', action: 'CL41 - Cleaning started', type: 'info' }
            ].map((activity, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  background: 
                    activity.type === 'alert' ? '#fee2e2' :
                    activity.type === 'success' ? '#dcfce7' :
                    activity.type === 'warning' ? '#fef3c7' : '#dbeafe',
                  color:
                    activity.type === 'alert' ? '#dc2626' :
                    activity.type === 'success' ? '#16a34a' :
                    activity.type === 'warning' ? '#d97706' : '#2563eb'
                }}>
                  <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: 0 }}>{activity.action}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Alerts Panel */}
      <div style={{ gridColumn: 'span 1' }}>
        <div style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '16px',
          position: 'sticky',
          top: '24px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>Active Alerts</h3>
            <span style={{
              padding: '4px 8px',
              background: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 500
            }}>
              {alerts.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <svg style={{ width: '48px', height: '48px', color: '#10b981', margin: '0 auto 8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>All restrooms in good condition</p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: alert.status === 'cleaning-required' ? '#fecaca' : '#fed7aa',
                  background: alert.status === 'cleaning-required' ? '#fee2e2' : '#ffedd5'
                }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#111827', margin: '0 0 4px 0' }}>{alert.id}</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 8px 0' }}>{alert.location}</p>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                    Usage: <span style={{ fontWeight: 500 }}>{alert.usageCount} times</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    Last Cleaned: <span style={{ fontWeight: 500 }}>{alert.lastCleaned}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Stats */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>Quick Stats</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#6b7280' }}>Total Usage</span>
                <span style={{ fontWeight: 500, color: '#111827' }}>{restrooms.reduce((sum, r) => sum + r.usageCount, 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#6b7280' }}>Avg Usage</span>
                <span style={{ fontWeight: 500, color: '#111827' }}>
                  {Math.round(restrooms.reduce((sum, r) => sum + r.usageCount, 0) / restrooms.length)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                <span style={{ color: '#6b7280' }}>Occupancy Rate</span>
                <span style={{ fontWeight: 500, color: '#f59e0b' }}>
                  {Math.round((restrooms.filter(r => r.occupied).length / restrooms.length) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartRestroomScreen;