import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const SpaceOccupancyDashboard: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState('All Floors');
  const [selectedTimeRange, setSelectedTimeRange] = useState('Today');

  // Real-time occupancy data
  const realTimeData = {
    currentOccupancy: 97,
    totalCapacity: 400,
    occupied: 388,
    vacant: 12,
    utilizationRate: 97
  };

  // Predicted occupancy data
  const predictedOccupancyData = [
    { time: '9:00', occupancy: 45 },
    { time: '10:00', occupancy: 78 },
    { time: '11:00', occupancy: 85 },
    { time: '12:00', occupancy: 72 },
    { time: '13:00', occupancy: 89 },
    { time: '14:00', occupancy: 94 },
    { time: '15:00', occupancy: 87 },
    { time: '16:00', occupancy: 95 },
    { time: '17:00', occupancy: 82 }
  ];

  // Occupancy trends data
  const occupancyTrendsData = [
    { time: 'Mon', occupancy: 82 },
    { time: 'Tue', occupancy: 88 },
    { time: 'Wed', occupancy: 85 },
    { time: 'Thu', occupancy: 92 },
    { time: 'Fri', occupancy: 97 },
    { time: 'Sat', occupancy: 45 },
    { time: 'Sun', occupancy: 23 }
  ];

  // Workspace utilization data
  const workspaceUtilization = [
    { name: 'Open Seating', utilization: 72, color: '#3b82f6' },
    { name: 'Meeting Rooms', utilization: 89, color: '#10b981' },
    { name: 'Cafeteria', utilization: 64, color: '#f59e0b' },
    { name: 'Breakout Area', utilization: 55, color: '#ef4444' }
  ];

  // Floor-wise utilization
  const floorUtilization = [
    { floor: 'Floor 7', utilization: 77, color: '#3b82f6' },
    { floor: 'Floor 6', utilization: 85, color: '#10b981' },
    { floor: 'Floor 5', utilization: 68, color: '#f59e0b' },
    { floor: 'Floor 4', utilization: 49, color: '#ef4444' }
  ];

  // Area heatmap data (simulated)
  const areaHeatmap = [
    { id: 1, x: 50, y: 80, intensity: 0.8, area: 'Meeting Room A' },
    { id: 2, x: 150, y: 120, intensity: 0.6, area: 'Open Desk Area' },
    { id: 3, x: 80, y: 200, intensity: 0.9, area: 'Collaboration Zone' },
    { id: 4, x: 200, y: 150, intensity: 0.3, area: 'Quiet Zone' }
  ];

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 80) return '#10b981';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity >= 0.7) return '#10b981';
    if (intensity >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f8fafc', 
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '8px',
            margin: '0'
          }}>
            Space Occupancy Dashboard
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: '4px 0 0 0' }}>
            Real-time workspace utilization and occupancy analytics
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
              fontWeight: '500'
            }}
          >
            <option value="All Floors">All Floors</option>
            <option value="Floor 7">Floor 7</option>
            <option value="Floor 6">Floor 6</option>
            <option value="Floor 5">Floor 5</option>
            <option value="Floor 4">Floor 4</option>
          </select>
          
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white',
              fontWeight: '500'
            }}
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
          </select>
        </div>
      </div>

      {/* Top Row - Key Metrics */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Real-Time Utilization */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#6b7280',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Real-Time Utilization
          </h3>
          <div style={{ fontSize: '48px', fontWeight: '800', color: '#3b82f6', marginBottom: '16px' }}>
            {realTimeData.currentOccupancy}%
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Occupied</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {realTimeData.occupied}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>Vacant</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                {realTimeData.vacant}
              </div>
            </div>
          </div>
        </div>

        {/* Predicted Occupancy */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#6b7280',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Predicted Occupancy
          </h3>
          <div style={{ fontSize: '48px', fontWeight: '800', color: '#10b981', marginBottom: '16px' }}>
            85%
          </div>
          <ResponsiveContainer width="100%" height={60}>
            <LineChart data={predictedOccupancyData}>
              <Line 
                type="monotone" 
                dataKey="occupancy" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Occupancy Trends */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#6b7280',
            marginBottom: '16px',
            margin: '0 0 16px 0'
          }}>
            Occupancy Trends
          </h3>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={occupancyTrendsData}>
              <Line 
                type="monotone" 
                dataKey="occupancy" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Middle Row */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 300px 1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Area Utilization Heatmap */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            Area Utilization Heatmap
          </h3>
          
          <div style={{
            position: 'relative',
            width: '100%',
            height: '250px',
            border: '2px solid #e5e7eb',
            borderRadius: '12px',
            backgroundColor: '#f8fafc'
          }}>
            {/* Simulated floor plan */}
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
              {/* Floor plan outline */}
              <rect x="20" y="20" width="80" height="60" fill="none" stroke="#d1d5db" strokeWidth="2" rx="4" />
              <rect x="120" y="20" width="100" height="40" fill="none" stroke="#d1d5db" strokeWidth="2" rx="4" />
              <rect x="40" y="100" width="120" height="80" fill="none" stroke="#d1d5db" strokeWidth="2" rx="4" />
              <rect x="180" y="80" width="80" height="100" fill="none" stroke="#d1d5db" strokeWidth="2" rx="4" />
              
              {/* High utilization areas */}
              <rect x="40" y="100" width="60" height="40" fill="#10b981" fillOpacity="0.6" rx="4" />
              <rect x="100" y="140" width="60" height="40" fill="#10b981" fillOpacity="0.6" rx="4" />
              <rect x="180" y="80" width="50" height="50" fill="#f59e0b" fillOpacity="0.6" rx="4" />
            </svg>
            
            {/* Legend */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px' }} />
                <span>High</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px' }} />
                <span>Medium</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>

        {/* No-Show Rate */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            No-Show Rate
          </h3>
          
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="10"
              />
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="10"
                strokeDasharray={`${18 * 2.83} ${(100 - 18) * 2.83}`}
                strokeLinecap="round"
              />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '32px',
              fontWeight: '800',
              color: '#f59e0b'
            }}>
              18%
            </div>
          </div>
          
          <p style={{ fontSize: '14px', color: '#6b7280', margin: '16px 0 0 0' }}>
            Reserved but unused spaces
          </p>
        </div>

        {/* Workspace Utilization */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            Workspace Utilization
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {workspaceUtilization.map((item, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  minWidth: '100px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151' 
                }}>
                  {item.name}
                </div>
                <div style={{ flex: 1, position: 'relative', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${item.utilization}%`,
                    backgroundColor: getUtilizationColor(item.utilization),
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ 
                  minWidth: '40px', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#1f2937',
                  textAlign: 'right'
                }}>
                  {item.utilization}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
      }}>
        {/* Floor-Wise Utilization */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            Floor-Wise Utilization
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {floorUtilization.map((floor, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  minWidth: '80px', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: '#374151' 
                }}>
                  {floor.floor}
                </div>
                <div style={{ flex: 1, position: 'relative', height: '12px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${floor.utilization}%`,
                    backgroundColor: getUtilizationColor(floor.utilization),
                    borderRadius: '6px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ 
                  minWidth: '40px', 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: '#1f2937',
                  textAlign: 'right'
                }}>
                  {floor.utilization}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: '#1f2937',
              margin: '0'
            }}>
              Recommendations
            </h3>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'spin 2s linear infinite'
            }}>
              ↻
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#fef3c7',
              borderRadius: '12px',
              border: '1px solid #fbbf24'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '4px' }}>
                Underutilized Space
              </div>
              <div style={{ fontSize: '13px', color: '#451a03' }}>
                Floor 4 is underutilized (49% average). Consider relocating teams or converting to flexible workspace.
              </div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#dbeafe',
              borderRadius: '12px',
              border: '1px solid #3b82f6'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '4px' }}>
                High Demand Area
              </div>
              <div style={{ fontSize: '13px', color: '#1e3a8a' }}>
                Meeting rooms showing 89% utilization. Consider adding more booking slots or expanding capacity.
              </div>
            </div>
            
            <div style={{
              padding: '16px',
              backgroundColor: '#d1fae5',
              borderRadius: '12px',
              border: '1px solid #10b981'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', marginBottom: '4px' }}>
                Peak Hour Optimization
              </div>
              <div style={{ fontSize: '13px', color: '#064e3b' }}>
                Implement staggered lunch times to reduce cafeteria congestion during 12-2 PM.
              </div>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
      }} />
    </div>
  );
};

export default SpaceOccupancyDashboard;