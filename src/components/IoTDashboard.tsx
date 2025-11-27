// src/components/IoTDashboard.tsx
import React, { useState } from 'react';
import { Radar, LayoutGrid, UtensilsCrossed, Cloud, DoorOpen, Zap } from 'lucide-react';
import OverviewScreen from './OverviewScreen';
import CafeteriaScreen from './CafeteriaScreen';
import IAQScreen from './IAQScreen';
import SmartRestroomScreen from './SmartRestroomScreen';
import EnergyMonitoringScreen from './EnergyMonitoringScreen';
import './IoTDashboard.css';

type TabType = 'overview' | 'cafeteria' | 'iaq' | 'restroom' | 'energy';

const IoTDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs = [
    { 
      id: 'overview' as TabType, 
      label: 'Overview',
      icon: LayoutGrid
    },
    { 
      id: 'cafeteria' as TabType, 
      label: 'Cafeteria',
      icon: UtensilsCrossed
    },
    { 
      id: 'iaq' as TabType, 
      label: 'Air Quality',
      icon: Cloud
    },
    { 
      id: 'restroom' as TabType, 
      label: 'Restrooms',
      icon: DoorOpen
    },
    { 
      id: 'energy' as TabType, 
      label: 'Energy',
      icon: Zap
    },
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewScreen />;
      case 'cafeteria':
        return <CafeteriaScreen />;
      case 'iaq':
        return <IAQScreen />;
      case 'restroom':
        return <SmartRestroomScreen />;
      case 'energy':
        return <EnergyMonitoringScreen />;
      default:
        return <OverviewScreen />;
    }
  };

  return (
    <div className="iot-dashboard">
      {/* Page Header */}
      <div className="iot-header">
        <div className="iot-header-content">
          <div className="iot-header-left">
            <div className="iot-icon-wrapper" style={{ background: '#10b981' }}>
              <Radar style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <h1 className="iot-title">IOT Sensors Dashboard</h1>
              <p className="iot-subtitle">Keep a close eye on your sensors</p>
            </div>
          </div>
          <div className="iot-header-right">
            <div className="iot-last-updated">
              <p className="iot-last-updated-label">Last Updated</p>
              <p className="iot-last-updated-time">{new Date().toLocaleTimeString()}</p>
            </div>
            <div className="iot-status-badge">
              <span className="iot-status-dot" />
              <span className="iot-status-text">All Systems Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Modern Design */}
      <div className="iot-nav">
        <div className="iot-tabs-modern">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`iot-tab-modern ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={18} strokeWidth={2} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="iot-content">
        {renderScreen()}
      </div>
    </div>
  );
};

export default IoTDashboard;