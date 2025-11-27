import React, { useState } from 'react';
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
}

const IAQScreen: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState(3);

  const allSensors: IAQSensor[] = [
    // Floor 3
    { floor: 3, location: 'Zone A', temperature: 22.5, humidity: 45, co2: 678, pm25: 8, pm10: 12, tvoc: 120, quality: 'excellent' },
    { floor: 3, location: 'Zone B', temperature: 23.1, humidity: 48, co2: 892, pm25: 12, pm10: 18, tvoc: 156, quality: 'good' },
    // Floor 4
    { floor: 4, location: 'Zone A', temperature: 24.2, humidity: 52, co2: 1432, pm25: 28, pm10: 42, tvoc: 245, quality: 'moderate' },
    { floor: 4, location: 'Zone B', temperature: 23.8, humidity: 50, co2: 1156, pm25: 18, pm10: 28, tvoc: 198, quality: 'moderate' },
    // Floor 5
    { floor: 5, location: 'Zone A', temperature: 22.8, humidity: 46, co2: 745, pm25: 10, pm10: 15, tvoc: 132, quality: 'good' },
    { floor: 5, location: 'Zone B', temperature: 22.3, humidity: 44, co2: 698, pm25: 9, pm10: 13, tvoc: 125, quality: 'excellent' },
  ];

  const sensors = allSensors.filter(s => s.floor === selectedFloor);

  const getQualityClass = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'quality-excellent';
      case 'good': return 'quality-good';
      case 'moderate': return 'quality-moderate';
      case 'poor': return 'quality-poor';
      case 'unhealthy': return 'quality-unhealthy';
      default: return '';
    }
  };

  const getQualityLabel = (quality: string) => {
    return quality.charAt(0).toUpperCase() + quality.slice(1);
  };

  const chartData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [21.5, 21.2, 22.8, 24.2, 23.8, 22.5, 21.8],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      },
      {
        label: 'Humidity (%)',
        data: [42, 44, 48, 52, 50, 46, 44],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      },
      {
        label: 'CO₂ (ppm/10)',
        data: [65, 68, 98, 143, 128, 95, 78],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
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
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 11 }
        }
      }
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

  const alerts = allSensors
    .filter(s => s.quality === 'moderate' || s.quality === 'poor' || s.quality === 'unhealthy')
    .map(s => ({
      location: `Floor ${s.floor} - ${s.location}`,
      issue: s.co2 > 1200 ? `High CO₂: ${s.co2} ppm` : s.pm25 > 25 ? `High PM2.5: ${s.pm25} µg/m³` : 'Air quality concern',
      severity: s.quality === 'unhealthy' ? 'high' : s.quality === 'poor' ? 'medium' : 'low'
    }));

  return (
    <div className="screen-with-sidebar">
      {/* Main Content */}
      <div className="screen-main-content">
        {/* Header with Download */}
        <div className="iot-screen-header">
          <div>
            <h2 className="iot-screen-title">Indoor Air Quality Monitoring</h2>
            <p className="iot-screen-subtitle">Real-time environmental monitoring across all floors</p>
          </div>
          <button className="iot-download-btn">
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Report</span>
          </button>
        </div>

        {/* Floor Selector */}
        <div className="floor-selector">
          {[3, 4, 5].map(floor => (
            <button
              key={floor}
              className={`floor-button ${selectedFloor === floor ? 'active' : ''}`}
              onClick={() => setSelectedFloor(floor)}
            >
              Floor {floor}
            </button>
          ))}
        </div>

        {/* Sensor Cards Grid */}
        <div className="screen-grid-2">
          {sensors.map((sensor, index) => (
            <div key={index} className="sensor-card">
              <div className="sensor-card-header">
                <div>
                  <h3 className="sensor-card-title">Floor {sensor.floor} - {sensor.location}</h3>
                  <p className="sensor-card-location">Air Quality Sensor</p>
                </div>
                <span className={`sensor-quality-badge ${getQualityClass(sensor.quality)}`}>
                  {getQualityLabel(sensor.quality)}
                </span>
              </div>
              
              <div className="sensor-metrics">
                <div className="sensor-metric">
                  <span className="sensor-metric-label">Temperature</span>
                  <span className="sensor-metric-value">{sensor.temperature}°C</span>
                </div>
                <div className="sensor-metric">
                  <span className="sensor-metric-label">Humidity</span>
                  <span className="sensor-metric-value">{sensor.humidity}%</span>
                </div>
                <div className="sensor-metric">
                  <span className="sensor-metric-label">CO₂ Level</span>
                  <span className="sensor-metric-value">{sensor.co2} ppm</span>
                </div>
                <div className="sensor-metric">
                  <span className="sensor-metric-label">PM 2.5</span>
                  <span className="sensor-metric-value">{sensor.pm25} µg/m³</span>
                </div>
                <div className="sensor-metric">
                  <span className="sensor-metric-label">PM 10</span>
                  <span className="sensor-metric-value">{sensor.pm10} µg/m³</span>
                </div>
                <div className="sensor-metric">
                  <span className="sensor-metric-label">TVOC</span>
                  <span className="sensor-metric-value">{sensor.tvoc} ppb</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Historical Trend Chart */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Historical Trends - Floor {selectedFloor}</h3>
            <div className="iot-live-indicator">
              <span className="iot-live-dot"></span>
              <span className="iot-live-text">Live Data</span>
            </div>
          </div>
          <div className="chart-wrapper">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Floor Stats Summary */}
        <div className="screen-grid-4">
          <div className="stat-card">
            <p className="stat-card-label">Avg Temperature</p>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '8px 0 0 0' }}>
              {(sensors.reduce((sum, s) => sum + s.temperature, 0) / sensors.length).toFixed(1)}°C
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Avg Humidity</p>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '8px 0 0 0' }}>
              {Math.round(sensors.reduce((sum, s) => sum + s.humidity, 0) / sensors.length)}%
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Avg CO₂</p>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: '8px 0 0 0' }}>
              {Math.round(sensors.reduce((sum, s) => sum + s.co2, 0) / sensors.length)} ppm
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Sensors Active</p>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#16a34a', margin: '8px 0 0 0' }}>
              {sensors.length}/{sensors.length}
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Alerts */}
      <div className="screen-sidebar">
        <div className="alert-panel">
          <div className="alert-panel-header">
            <h3 className="alert-panel-title">Air Quality Alerts</h3>
            <span className="alert-count-badge">{alerts.length}</span>
          </div>
          <div className="alert-list">
            {alerts.length === 0 ? (
              <div className="alert-empty">
                <svg className="alert-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="alert-empty-text">All zones have good air quality</p>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className={`alert-item ${
                  alert.severity === 'high' ? 'alert-high' : 
                  alert.severity === 'medium' ? 'alert-medium' : 'alert-low'
                }`}>
                  <p className="alert-item-title">{alert.location}</p>
                  <p className="alert-item-detail">{alert.issue}</p>
                </div>
              ))
            )}
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <h4 className="quick-stats-title">All Floors Summary</h4>
            <div className="quick-stats-list">
              <div className="quick-stat-row">
                <span className="quick-stat-label">Total Sensors</span>
                <span className="quick-stat-value">{allSensors.length}</span>
              </div>
              <div className="quick-stat-row">
                <span className="quick-stat-label">Active Alerts</span>
                <span className="quick-stat-value" style={{ color: alerts.length > 0 ? '#d97706' : '#16a34a' }}>
                  {alerts.length}
                </span>
              </div>
              <div className="quick-stat-row">
                <span className="quick-stat-label">Avg Building Temp</span>
                <span className="quick-stat-value">
                  {(allSensors.reduce((sum, s) => sum + s.temperature, 0) / allSensors.length).toFixed(1)}°C
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IAQScreen;