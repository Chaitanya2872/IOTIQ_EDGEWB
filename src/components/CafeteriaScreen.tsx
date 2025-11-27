import React, { useState, useEffect } from 'react';
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

interface CounterData {
  name: string;
  queueLength: number;
  avgWaitTime: number;
  status: 'ready' | 'busy' | 'crowded';
  icon: JSX.Element;
  color: string;
  image: string;
}

const CafeteriaScreen: React.FC = () => {
  const [counters, setCounters] = useState<CounterData[]>([
    { 
      name: 'Two Good', 
      queueLength: 0, 
      avgWaitTime: 0, 
      status: 'ready',
      color: 'from-orange-400 to-red-400',
      image: 'https://i.postimg.cc/QdWXyT0L/TWO-GOOD.png',
      icon: <svg></svg>
    },
    { 
      name: 'Uttar Dakshin', 
      queueLength: 4, 
      avgWaitTime: 8, 
      status: 'busy',
      color: 'from-amber-400 to-yellow-400',
      image: 'https://i.postimg.cc/DyRhLznZ/UTTAR-DAKSHIN.png',
      icon: <svg></svg>
    },
    { 
      name: 'Tandoor Corner', 
      queueLength: 0, 
      avgWaitTime: 0, 
      status: 'ready',
      color: 'from-rose-400 to-pink-400',
      image: 'https://i.postimg.cc/QCy3687Q/TANDOOR.png',
      icon: <svg></svg>
    }
  ]);

  const [peakHours] = useState({
    today: '12:30 PM - 1:30 PM',
    peakDay: 'Friday',
    totalToday: 847,
    avgWaitTime: 4.5
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCounters(prev => prev.map(counter => {
        const change = Math.floor(Math.random() * 3) - 1;
        const newQueue = Math.max(0, Math.min(10, counter.queueLength + change));
        let status: 'ready' | 'busy' | 'crowded' = 'ready';
        if (newQueue >= 6) status = 'crowded';
        else if (newQueue >= 3) status = 'busy';
        
        return {
          ...counter,
          queueLength: newQueue,
          avgWaitTime: newQueue * 2,
          status
        };
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ready': return 'status-ready';
      case 'busy': return 'status-busy';
      case 'crowded': return 'status-crowded';
      default: return '';
    }
  };

  const chartData = {
    labels: ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'],
    datasets: [
      {
        label: 'Customer Flow',
        data: [12, 25, 45, 89, 156, 189, 145, 98, 67, 78, 45],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
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

  const alerts = counters
    .filter(c => c.status === 'crowded' || c.status === 'busy')
    .map(c => ({
      counter: c.name,
      queue: c.queueLength,
      wait: c.avgWaitTime,
      severity: c.status === 'crowded' ? 'high' : 'medium'
    }));

  return (
    <div className="screen-with-sidebar">
      {/* Main Content - Left Side */}
      <div className="screen-main-content">
        {/* Header with Download */}
        <div className="iot-screen-header">
          <div>
            <h2 className="iot-screen-title">Cafeteria Queue Status</h2>
            <p className="iot-screen-subtitle">Real-time monitoring of food counter queues</p>
          </div>
          <button className="iot-download-btn">
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Report</span>
          </button>
        </div>

        {/* Compact Counter Cards - Image Right, Count Left */}
        <div className="screen-grid-3">
          {counters.map((counter, index) => (
            <div key={index} className="counter-card">
              <div className="counter-card-body">
                {/* Left Side - Name and Count */}
                <div className="counter-card-left">
                  <h3 className="counter-card-name">{counter.name}</h3>
                  <div className="counter-card-count">
                    {counter.queueLength}
                  </div>
                  <p className="counter-card-label">people in queue</p>
                  <p className="counter-card-wait">Wait: {counter.avgWaitTime} min</p>
                </div>
                {/* Right Side - Food Image */}
                <div className="counter-card-image">
                  <img 
                    src={counter.image} 
                    alt={counter.name}
                  />
                </div>
              </div>
              {/* Status Badge */}
              <div className={`counter-status-badge ${getStatusClass(counter.status)}`}>
                {counter.status === 'ready' ? 'Ready' : counter.status === 'busy' ? 'Busy' : 'Crowded'}
              </div>
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="screen-grid-4">
          <div className="stat-card">
            <p className="stat-card-label">Peak Hours</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '8px 0 0 0' }}>{peakHours.today}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Peak Day</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '8px 0 0 0' }}>{peakHours.peakDay}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Served Today</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '8px 0 0 0' }}>{peakHours.totalToday}</p>
          </div>
          <div className="stat-card">
            <p className="stat-card-label">Avg Wait</p>
            <p style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: '8px 0 0 0' }}>{peakHours.avgWaitTime} min</p>
          </div>
        </div>

        {/* Traffic Chart with Live Indicator */}
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Customer Flow Pattern</h3>
            <div className="iot-live-indicator">
              <span className="iot-live-dot"></span>
              <span className="iot-live-text">Live Data</span>
            </div>
          </div>
          <div className="chart-wrapper">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Right Side - Alerts Panel */}
      <div className="screen-sidebar">
        <div className="alert-panel">
          <div className="alert-panel-header">
            <h3 className="alert-panel-title">Active Alerts</h3>
            <span className="alert-count-badge">{alerts.length}</span>
          </div>
          <div className="alert-list">
            {alerts.length === 0 ? (
              <div className="alert-empty">
                <svg className="alert-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="alert-empty-text">All counters operating normally</p>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className={`alert-item ${alert.severity === 'high' ? 'alert-high' : 'alert-medium'}`}>
                  <p className="alert-item-title">{alert.counter}</p>
                  <p className="alert-item-detail">Queue: {alert.queue} people</p>
                  <p className="alert-item-detail">Wait: {alert.wait} min</p>
                </div>
              ))
            )}
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            <h4 className="quick-stats-title">Quick Stats</h4>
            <div className="quick-stats-list">
              <div className="quick-stat-row">
                <span className="quick-stat-label">Total Queue</span>
                <span className="quick-stat-value">{counters.reduce((sum, c) => sum + c.queueLength, 0)}</span>
              </div>
              <div className="quick-stat-row">
                <span className="quick-stat-label">Ready Counters</span>
                <span className="quick-stat-value" style={{ color: '#16a34a' }}>
                  {counters.filter(c => c.status === 'ready').length}/{counters.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeteriaScreen;