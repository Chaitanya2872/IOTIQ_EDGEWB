import React, { useState } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EnergyMeter {
  id: string;
  location: string;
  floor: number;
  voltage: number;
  current: number;
  powerFactor: number;
  kwh: number;
  power: number;
  status: 'normal' | 'warning' | 'critical';
}

const EnergyMonitoringScreen: React.FC = () => {
  const [meters] = useState<EnergyMeter[]>([
    { id: 'EM301', location: 'Floor 3 - Main Panel', floor: 3, voltage: 230.2, current: 45.8, powerFactor: 0.92, kwh: 342, power: 10.5, status: 'normal' },
    { id: 'EM302', location: 'Floor 3 - HVAC', floor: 3, voltage: 229.8, current: 52.3, powerFactor: 0.88, kwh: 456, power: 12.0, status: 'normal' },
    { id: 'EM401', location: 'Floor 4 - Main Panel', floor: 4, voltage: 231.5, current: 68.3, powerFactor: 0.85, kwh: 568, power: 15.8, status: 'warning' },
    { id: 'EM402', location: 'Floor 4 - Data Center', floor: 4, voltage: 230.9, current: 89.2, powerFactor: 0.94, kwh: 732, power: 20.6, status: 'critical' },
    { id: 'EM501', location: 'Floor 5 - Main Panel', floor: 5, voltage: 229.5, current: 38.6, powerFactor: 0.91, kwh: 298, power: 8.9, status: 'normal' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'warning': return { bg: '#fef3c7', text: '#92400e', border: '#fde047' };
      case 'critical': return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
    }
  };

  const consumptionData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    datasets: [
      {
        label: 'Power Consumption (kW)',
        data: [42, 38, 58, 76, 68, 54, 45],
        borderColor: 'rgb(234, 88, 12)',
        backgroundColor: 'rgba(234, 88, 12, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      }
    ]
  };

  const floorConsumptionData = {
    labels: ['Floor 3', 'Floor 4', 'Floor 5'],
    datasets: [
      {
        label: 'Consumption (kWh)',
        data: [798, 1300, 298],
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(139, 92, 246, 0.8)', 'rgba(236, 72, 153, 0.8)'],
        borderRadius: 8
      }
    ]
  };

  const equipmentBreakdownData = {
    labels: ['HVAC', 'Lighting', 'Servers', 'Appliances'],
    datasets: [
      {
        data: [45, 20, 25, 10],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
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

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11 }
        }
      }
    }
  };

  const alerts = meters
    .filter(m => m.status === 'warning' || m.status === 'critical')
    .map(m => ({
      meter: m.id,
      location: m.location,
      issue: m.powerFactor < 0.9 ? `Low Power Factor: ${m.powerFactor}` : `High Current: ${m.current} A`,
      severity: m.status === 'critical' ? 'high' : 'medium'
    }));

  const totalConsumption = meters.reduce((sum, m) => sum + m.kwh, 0);
  const avgPowerFactor = meters.reduce((sum, m) => sum + m.powerFactor, 0) / meters.length;
  const activePower = meters.reduce((sum, m) => sum + m.power, 0);

  return (
    <div className="screen-with-sidebar">
      {/* Main Content */}
      <div className="screen-main-content">
        {/* Header with Download */}
        <div className="iot-screen-header">
          <div>
            <h2 className="iot-screen-title">Energy Monitoring System</h2>
            <p className="iot-screen-subtitle">Real-time power consumption and meter status</p>
          </div>
          <button className="iot-download-btn">
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Report</span>
          </button>
        </div>

        {/* Summary Stats */}
        <div className="screen-grid-4">
          <div className="stat-card">
            <p className="stat-card-label">Total Consumption</p>
            <p className="stat-card-value">{totalConsumption}</p>
            <p className="stat-card-footer">kWh today</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Active Power</p>
            <p className="stat-card-value">{activePower.toFixed(1)}</p>
            <p className="stat-card-footer">kW current</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Power Factor</p>
            <p className="stat-card-value">{avgPowerFactor.toFixed(2)}</p>
            <p className="stat-card-footer">Average</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Active Meters</p>
            <p className="stat-card-value">{meters.length}</p>
            <p className="stat-card-footer">All operational</p>
          </div>
        </div>

        {/* Meter Cards */}
        <div className="screen-grid-2">
          {meters.map((meter) => {
            const statusStyle = getStatusColor(meter.status);
            return (
              <div key={meter.id} className="screen-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', margin: '0 0 4px 0' }}>
                      {meter.id}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{meter.location}</p>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 500,
                    background: statusStyle.bg,
                    color: statusStyle.text,
                    border: `1px solid ${statusStyle.border}`
                  }}>
                    {meter.status.charAt(0).toUpperCase() + meter.status.slice(1)}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Voltage</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>{meter.voltage} V</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Current</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>{meter.current} A</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Power</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>{meter.power} kW</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Power Factor</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: meter.powerFactor < 0.9 ? '#d97706' : '#16a34a', margin: 0 }}>
                      {meter.powerFactor}
                    </p>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Consumption Today</p>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>{meter.kwh} kWh</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Consumption Trend */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Power Consumption Trend</h3>
            <div className="iot-live-indicator">
              <span className="iot-live-dot"></span>
              <span className="iot-live-text">Live Data</span>
            </div>
          </div>
          <div className="chart-wrapper" style={{ height: '240px' }}>
            <Line data={consumptionData} options={chartOptions} />
          </div>
        </div>

        {/* Floor Consumption and Equipment Breakdown */}
        <div className="screen-grid-2">
          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title">Consumption by Floor</h3>
            </div>
            <div className="chart-wrapper" style={{ height: '220px' }}>
              <Bar data={floorConsumptionData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3 className="chart-title">Equipment Breakdown</h3>
            </div>
            <div className="chart-wrapper" style={{ height: '220px' }}>
              <Doughnut data={equipmentBreakdownData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Alerts */}
      <div className="screen-sidebar">
        <div className="alert-panel">
          <div className="alert-panel-header">
            <h3 className="alert-panel-title">Energy Alerts</h3>
            <span className="alert-count-badge">{alerts.length}</span>
          </div>
          <div className="alert-list">
            {alerts.length === 0 ? (
              <div className="alert-empty">
                <svg className="alert-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="alert-empty-text">All meters operating normally</p>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className={`alert-item ${alert.severity === 'high' ? 'alert-high' : 'alert-medium'}`}>
                  <p className="alert-item-title">{alert.meter}</p>
                  <p className="alert-item-detail">{alert.location}</p>
                  <p className="alert-item-detail">{alert.issue}</p>
                </div>
              ))
            )}
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <h4 className="quick-stats-title">Quick Stats</h4>
            <div className="quick-stats-list">
              <div className="quick-stat-row">
                <span className="quick-stat-label">Peak Consumption</span>
                <span className="quick-stat-value">76 kW</span>
              </div>
              <div className="quick-stat-row">
                <span className="quick-stat-label">Off-Peak Usage</span>
                <span className="quick-stat-value">38 kW</span>
              </div>
              <div className="quick-stat-row">
                <span className="quick-stat-label">Cost Today</span>
                <span className="quick-stat-value">$245</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyMonitoringScreen;