import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

interface Sensor {
  id: string;
  name: string;
  type: string;
  status: 'Active' | 'Inactive' | 'Warning';
  location: string;
  lastReading: string;
  value: number;
  unit: string;
}

const IoTSensorsDashboard: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  // Sample sensor data
  const sensors: Sensor[] = [
    { id: 'MOT-001', name: 'Motion Sensor', type: 'Motion', status: 'Active', location: 'Meeting Room', lastReading: '2 min ago', value: 1, unit: 'detected' },
    { id: 'TSF-432', name: 'Temperature Sensor', type: 'Temperature', status: 'Active', location: 'Server Room', lastReading: '1 min ago', value: 22.5, unit: '°C' },
    { id: 'COS-051', name: 'CO2 Sensor', type: 'CO2', status: 'Inactive', location: 'Work Desk', lastReading: '15 min ago', value: 400, unit: 'ppm' },
    { id: 'LSN-913', name: 'Light Sensor', type: 'Light', status: 'Active', location: 'Meeting Room', lastReading: '30 sec ago', value: 850, unit: 'lux' },
    { id: 'HUM-205', name: 'Humidity Sensor', type: 'Humidity', status: 'Active', location: 'Server Room', lastReading: '3 min ago', value: 45, unit: '%' },
    { id: 'VIB-108', name: 'Vibration Sensor', type: 'Vibration', status: 'Warning', location: 'LOT Desk', lastReading: '5 min ago', value: 0.8, unit: 'mm/s' },
    { id: 'MOT-002', name: 'Motion Sensor', type: 'Motion', status: 'Active', location: 'Work Desk', lastReading: '1 min ago', value: 0, unit: 'detected' },
    { id: 'TSF-401', name: 'Temperature Sensor', type: 'Temperature', status: 'Active', location: 'Meeting Room', lastReading: '45 sec ago', value: 21.8, unit: '°C' }
  ];

  // Energy consumption data
  const energyData = [
    { time: 'Mon', predicted: 245, actual: 230 },
    { time: 'Tue', predicted: 280, actual: 295 },
    { time: 'Wed', predicted: 320, actual: 310 },
    { time: 'Thu', predicted: 290, actual: 285 },
    { time: 'Fri', predicted: 350, actual: 365 },
    { time: 'Sat', predicted: 180, actual: 175 },
    { time: 'Sun', predicted: 160, actual: 155 }
  ];

  // Sensor activity trends
  const activityData = [
    { time: 'Jan', motion: 45, temperature: 78, light: 92, co2: 65 },
    { time: 'Feb', motion: 52, temperature: 81, light: 88, co2: 71 },
    { time: 'Mar', precision: 48, temperature: 85, light: 94, co2: 68 },
    { time: 'Apr', motion: 61, temperature: 79, light: 91, co2: 73 },
    { time: 'May', motion: 55, temperature: 83, light: 89, co2: 69 },
    { time: 'Jun', motion: 67, temperature: 87, light: 96, co2: 75 }
  ];

  // Pie chart data for sensor status
  const statusData = [
    { name: 'Active', value: sensors.filter(s => s.status === 'Active').length, color: '#22c55e' },
    { name: 'Inactive', value: sensors.filter(s => s.status === 'Inactive').length, color: '#ef4444' },
    { name: 'Warning', value: sensors.filter(s => s.status === 'Warning').length, color: '#f59e0b' }
  ];

  // Location distribution
  const locationData = [
    { name: 'Meeting Room', value: sensors.filter(s => s.location === 'Meeting Room').length, color: '#3b82f6' },
    { name: 'Server Room', value: sensors.filter(s => s.location === 'Server Room').length, color: '#8b5cf6' },
    { name: 'Work Desk', value: sensors.filter(s => s.location === 'Work Desk').length, color: '#06b6d4' },
    { name: 'LOT Desk', value: sensors.filter(s => s.location === 'LOT Desk').length, color: '#84cc16' }
  ];

  // Filter sensors
  const filteredSensors = sensors.filter(sensor => {
    const statusMatch = selectedFilter === 'All' || sensor.status === selectedFilter;
    const locationMatch = locationFilter === 'All' || sensor.location === locationFilter;
    return statusMatch && locationMatch;
  });

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #34d399' };
      case 'Inactive':
        return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #f87171' };
      case 'Warning':
        return { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fbbf24' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#6b7280', border: '1px solid #d1d5db' };
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '700', 
          color: '#1f2937',
          marginBottom: '8px' 
        }}>
          IoT Sensors Dashboard
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          Real-time monitoring and analytics for connected devices
        </p>
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#3b82f6' }}>81%</div>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Occupancy Rate</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#22c55e' }}>
            {sensors.filter(s => s.status === 'Active').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Active Sensors</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#8b5cf6' }}>932</div>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Connected Devices</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '36px', fontWeight: '700', color: '#ef4444' }}>
            {sensors.filter(s => s.status === 'Warning').length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Anomalies Detected</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Energy Consumption Chart */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            Predicted vs Actual Energy Usage
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={energyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Predicted"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#22c55e" 
                strokeWidth={3}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sensor Activity Trends */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            Sensor Activity Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Line type="monotone" dataKey="motion" stroke="#ef4444" strokeWidth={2} name="Motion" />
              <Line type="monotone" dataKey="temperature" stroke="#f59e0b" strokeWidth={2} name="Temperature" />
              <Line type="monotone" dataKey="light" stroke="#22c55e" strokeWidth={2} name="Light" />
              <Line type="monotone" dataKey="co2" stroke="#8b5cf6" strokeWidth={2} name="CO2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Charts Row */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Sensor Status Distribution */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Sensor Status
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label={({name, value}) => `${name}: ${value}`}
                labelStyle={{ fontSize: '12px', fill: '#374151' }}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Location Distribution */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Location Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={locationData}
                cx="50%"
                cy="50%"
                outerRadius={70}
                dataKey="value"
                label={({name, value}) => `${name}: ${value}`}
                labelStyle={{ fontSize: '11px', fill: '#374151' }}
              >
                {locationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insights */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#1f2937',
            marginBottom: '20px'
          }}>
            AI-Powered Insights
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Energy anomaly detected',
              'HVAC optimization opportunity',
              'Occupancy pattern change',
              'Sensor calibration recommended'
            ].map((insight, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#374151'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  marginRight: '12px'
                }} />
                {insight}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sensors Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        {/* Table Header with Filters */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#1f2937',
            margin: '0'
          }}>
            Sensors Overview
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Warning">Warning</option>
            </select>
            
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="All">All Locations</option>
              <option value="Meeting Room">Meeting Room</option>
              <option value="Server Room">Server Room</option>
              <option value="Work Desk">Work Desk</option>
              <option value="LOT Desk">LOT Desk</option>
            </select>

            <div style={{
              fontSize: '14px',
              color: '#6b7280',
              backgroundColor: '#f3f4f6',
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: '500'
            }}>
              {filteredSensors.length} sensors
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f8fafc' }}>
              <tr>
                {['Sensor ID', 'Name', 'Type', 'Status', 'Location', 'Last Reading', 'Current Value'].map((header) => (
                  <th key={header} style={{ 
                    padding: '16px 20px', 
                    textAlign: 'left', 
                    fontSize: '12px', 
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSensors.map((sensor) => (
                <tr key={sensor.id} style={{ 
                  borderBottom: '1px solid #f1f5f9',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#3b82f6' }}>
                    {sensor.id}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#374151' }}>
                    {sensor.name}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#6b7280' }}>
                    {sensor.type}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      ...getStatusBadgeStyle(sensor.status)
                    }}>
                      {sensor.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#6b7280' }}>
                    {sensor.location}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#6b7280' }}>
                    {sensor.lastReading}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    {sensor.value} {sensor.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IoTSensorsDashboard;