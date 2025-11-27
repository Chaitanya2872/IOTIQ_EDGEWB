import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './IoTScreens.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const OverviewScreen: React.FC = () => {
  // Summary data from all modules
  const summaryStats = {
    cafeteria: {
      totalQueue: 4,
      avgWait: 5.3,
      countersReady: 2,
      countersTotal: 3,
      servedToday: 847
    },
    iaq: {
      avgTemp: 22.1,
      avgCO2: 856,
      alertZones: 2,
      totalSensors: 10
    },
    restrooms: {
      total: 6,
      available: 4,
      occupied: 2,
      needsCleaning: 2
    },
    energy: {
      totalConsumption: 2098,
      activePower: 59.25,
      avgPowerFactor: 0.90,
      alerts: 1
    }
  };

  const buildingHealthData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    datasets: [
      {
        label: 'Sensors Health Score',
        data: [92, 90, 88, 85, 87, 89, 91],
        borderColor: 'rgb(17, 24, 39)',
        backgroundColor: 'rgba(17, 24, 39, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
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
        beginAtZero: false,
        min: 80,
        max: 100,
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#6b7280', font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 11 } }
      }
    }
  };

  return (
    <div className="iot-screen">
      {/* Header with Download Button */}
      <div className="iot-screen-header">
        <div>
          <h2 className="iot-screen-title">Overview</h2>
          <p className="iot-screen-subtitle">Real-time building management system status</p>
        </div>
        <button className="iot-download-btn">
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Download Report</span>
        </button>
      </div>

      {/* Top Stats Cards */}
      <div className="screen-grid-3">
        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-label">Total Sensors</p>
              <p className="stat-card-value">29</p>
            </div>
            <div className="stat-card-icon">
              <svg style={{ width: '24px', height: '24px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="stat-card-footer">All systems operational</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-label">Uptime</p>
              <p className="stat-card-value">99.8%</p>
            </div>
            <div className="stat-card-icon">
              <svg style={{ width: '24px', height: '24px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="stat-card-footer">Last 30 days average</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <div>
              <p className="stat-card-label">Data Points</p>
              <p className="stat-card-value">2.4M</p>
            </div>
            <div className="stat-card-icon">
              <svg style={{ width: '24px', height: '24px', color: '#6b7280' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="stat-card-footer">Collected today</p>
        </div>
      </div>

      {/* Building Health Score */}
      <div className="chart-container" style={{ background: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)', borderColor: '#86efac' }}>
        <div className="chart-header">
          <div>
            <h3 className="chart-title">Building Health Score</h3>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Overall system performance</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#16a34a' }}>89%</div>
            <p style={{ fontSize: '12px', color: '#16a34a', margin: '4px 0 0 0' }}>↑ 2% from yesterday</p>
          </div>
        </div>
        <div className="chart-wrapper" style={{ height: '120px' }}>
          <Line data={buildingHealthData} options={chartOptions} />
        </div>
      </div>

      {/* Quick Stats Grid - Module Cards */}
      <div className="screen-grid-4">
        {/* Cafeteria */}
        <div className="screen-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#fed7aa', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px', color: '#ea580c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', margin: 0 }}>Cafeteria</h4>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '2px 0 0 0' }}>
                {summaryStats.cafeteria.countersReady}/{summaryStats.cafeteria.countersTotal} Ready
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: '#6b7280' }}>Queue</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{summaryStats.cafeteria.totalQueue} people</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#6b7280' }}>Served</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{summaryStats.cafeteria.servedToday} today</span>
          </div>
        </div>

        {/* Air Quality */}
        <div className="screen-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#bfdbfe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', margin: 0 }}>Air Quality</h4>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '2px 0 0 0' }}>
                {summaryStats.iaq.avgTemp}°C Avg
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: '#6b7280' }}>CO₂ Level</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{summaryStats.iaq.avgCO2} ppm</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#6b7280' }}>Alerts</span>
            <span style={{ fontWeight: 500, color: '#d97706' }}>{summaryStats.iaq.alertZones} zones</span>
          </div>
        </div>

        {/* Restrooms */}
        <div className="screen-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#ddd6fe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px', color: '#7c3aed' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', margin: 0 }}>Restrooms</h4>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '2px 0 0 0' }}>
                {summaryStats.restrooms.available}/{summaryStats.restrooms.total} Available
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: '#6b7280' }}>Occupied</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{summaryStats.restrooms.occupied}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#6b7280' }}>Need Cleaning</span>
            <span style={{ fontWeight: 500, color: '#dc2626' }}>{summaryStats.restrooms.needsCleaning}</span>
          </div>
        </div>

        {/* Energy */}
        <div className="screen-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', background: '#fef3c7', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: '20px', height: '20px', color: '#d97706' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280', margin: 0 }}>Energy</h4>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '2px 0 0 0' }}>
                {summaryStats.energy.totalConsumption} kWh
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ color: '#6b7280' }}>Active Power</span>
            <span style={{ fontWeight: 500, color: '#111827' }}>{summaryStats.energy.activePower} kW</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
            <span style={{ color: '#6b7280' }}>Power Factor</span>
            <span style={{ fontWeight: 500, color: '#16a34a' }}>{summaryStats.energy.avgPowerFactor}</span>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="screen-card">
        <div className="chart-header">
          <h3 className="chart-title">Active Alerts</h3>
          <span className="alert-count-badge">3 Active</span>
        </div>
        <div className="alert-list">
          <div className="alert-item alert-medium">
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', background: '#fde047', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg style={{ width: '16px', height: '16px', color: '#a16207' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p className="alert-item-title">High CO₂ in Floor 4 - Zone A</p>
                <p className="alert-item-detail">CO₂ level: 1432 ppm (Threshold: 1200 ppm)</p>
              </div>
            </div>
          </div>

          <div className="alert-item alert-high">
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', background: '#fca5a5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg style={{ width: '16px', height: '16px', color: '#991b1b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p className="alert-item-title">Restroom CL32 Requires Cleaning</p>
                <p className="alert-item-detail">Usage: 52 times, Last cleaned: 11:20</p>
              </div>
            </div>
          </div>

          <div className="alert-item alert-medium">
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', background: '#fdba74', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg style={{ width: '16px', height: '16px', color: '#c2410c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p className="alert-item-title">High Energy Consumption - Floor 4</p>
                <p className="alert-item-detail">Current: 68.3 A, Power Factor: 0.85</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewScreen;