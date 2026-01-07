import React, { useState } from 'react';
import {
  MapPin, TrendingUp, Clock, User, Package, ArrowRight,
  Calendar, Filter, Download, Search, Building, Truck
} from 'lucide-react';
import './AssetManagement.css';

// Vibrant color scheme matching Inventory Dashboard
const COLORS = {
  primary: '#8b5cf6',
  secondary: '#ec4899',
  dark: '#1e293b',
  gray: '#64748b',
  lightGray: '#94a3b8',
  bg: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#8b5cf6',
  low: '#10b981',
  pink: '#ec4899',
  purple: '#8b5cf6',
  green: '#10b981',
  orange: '#f59e0b',
  cyan: '#06b6d4',
  heatmapCritical: '#1e3a8a',
  heatmapHigh: '#1d4ed8',
  heatmapMedium: '#3b82f6',
  heatmapLow: '#60a5fa',
  success: '#10b981', // Added for compatibility
  warning: '#f59e0b', // Added for compatibility
  danger: '#ef4444',  // Added for compatibility
  info: '#3b82f6',    // Added for compatibility
  cardBg: '#ffffff'   // Added for compatibility
};

interface AssetMovement {
  id: string;
  assetCode: string;
  assetName: string;
  movementType: 'Transfer' | 'Relocation' | 'Assignment' | 'Return' | 'Disposal';
  fromLocation: string;
  toLocation: string;
  fromUser: string;
  toUser: string;
  date: string;
  time: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Cancelled';
  notes: string;
  approvedBy: string;
}

const AssetTracking: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample movement data
  const movements: AssetMovement[] = [
    {
      id: '1',
      assetCode: 'IT-LAP-001',
      assetName: 'Dell Laptop XPS 15',
      movementType: 'Transfer',
      fromLocation: 'Floor 3 - Desk 45',
      toLocation: 'Floor 2 - Desk 12',
      fromUser: 'Rajesh Kumar',
      toUser: 'Priya Sharma',
      date: '2024-12-10',
      time: '14:30',
      status: 'Completed',
      notes: 'Department transfer - Engineering to Marketing',
      approvedBy: 'IT Manager'
    },
    {
      id: '2',
      assetCode: 'VEH-TRK-008',
      assetName: 'Toyota Hilux',
      movementType: 'Assignment',
      fromLocation: 'Parking Bay 12',
      toLocation: 'Field Site - Project Alpha',
      fromUser: 'Vehicle Pool',
      toUser: 'Anil Sharma',
      date: '2024-12-10',
      time: '09:15',
      status: 'In Progress',
      notes: 'Project deployment for 3 months',
      approvedBy: 'Logistics Head'
    },
    {
      id: '3',
      assetCode: 'MACH-CNC-042',
      assetName: 'CNC Machine Model X',
      movementType: 'Relocation',
      fromLocation: 'Workshop A',
      toLocation: 'Workshop B',
      fromUser: 'Production Line 1',
      toUser: 'Production Line 2',
      date: '2024-12-09',
      time: '16:45',
      status: 'Completed',
      notes: 'Production line optimization',
      approvedBy: 'Production Manager'
    },
    {
      id: '4',
      assetCode: 'IT-MON-178',
      assetName: 'LG UltraWide Monitor 34"',
      movementType: 'Return',
      fromLocation: 'Floor 2 - Desk 89',
      toLocation: 'IT Store Room',
      fromUser: 'Design Team',
      toUser: 'IT Inventory',
      date: '2024-12-09',
      time: '11:20',
      status: 'Pending',
      notes: 'Employee resignation - asset return',
      approvedBy: 'Pending'
    },
    {
      id: '5',
      assetCode: 'FURN-CHR-156',
      assetName: 'Ergonomic Office Chair',
      movementType: 'Transfer',
      fromLocation: 'Floor 2 - Desk 23',
      toLocation: 'Floor 4 - Desk 56',
      fromUser: 'Priya Desai',
      toUser: 'Vikram Singh',
      date: '2024-12-08',
      time: '13:00',
      status: 'Completed',
      notes: 'Office relocation',
      approvedBy: 'Admin Manager'
    },
    {
      id: '6',
      assetCode: 'TOOL-WLD-067',
      assetName: 'Miller Welding Machine',
      movementType: 'Disposal',
      fromLocation: 'Workshop C',
      toLocation: 'Disposal Yard',
      fromUser: 'Production',
      toUser: 'Scrap Vendor',
      date: '2024-12-08',
      time: '10:30',
      status: 'Cancelled',
      notes: 'Cancellation: Equipment still functional after inspection',
      approvedBy: 'N/A'
    }
  ];

  // Movement statistics
  const stats = {
    totalMovements: movements.length,
    completed: movements.filter(m => m.status === 'Completed').length,
    inProgress: movements.filter(m => m.status === 'In Progress').length,
    pending: movements.filter(m => m.status === 'Pending').length
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'Transfer': return COLORS.info;
      case 'Relocation': return COLORS.purple;
      case 'Assignment': return COLORS.success;
      case 'Return': return COLORS.warning;
      case 'Disposal': return COLORS.danger;
      default: return COLORS.secondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return COLORS.success;
      case 'In Progress': return COLORS.info;
      case 'Pending': return COLORS.warning;
      case 'Cancelled': return COLORS.danger;
      default: return COLORS.secondary;
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'Transfer': return <ArrowRight style={{ width: '18px', height: '18px' }} />;
      case 'Relocation': return <MapPin style={{ width: '18px', height: '18px' }} />;
      case 'Assignment': return <User style={{ width: '18px', height: '18px' }} />;
      case 'Return': return <Package style={{ width: '18px', height: '18px' }} />;
      case 'Disposal': return <Truck style={{ width: '18px', height: '18px' }} />;
      default: return <Package style={{ width: '18px', height: '18px' }} />;
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = 
      movement.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.fromLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.toLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || movement.movementType === filterType;
    const matchesStatus = filterStatus === 'all' || movement.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="iot-screen">
      {/* Header */}
      <div className="iot-screen-header">
        <div>
          <h2 className="iot-screen-title">Asset Tracking</h2>
          <p className="iot-screen-subtitle">Real-time asset movement and location tracking</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="iot-download-btn">
            <Download style={{ width: '16px', height: '16px' }} />
            <span>Export</span>
          </button>
          <button 
            className="iot-download-btn"
            style={{ backgroundColor: COLORS.info, color: COLORS.white }}
          >
            <MapPin style={{ width: '16px', height: '16px' }} />
            <span>Track Asset</span>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="screen-grid-4">
        <div className="screen-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: '#dbeafe', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <TrendingUp style={{ width: '20px', height: '20px', color: COLORS.info }} />
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 500, color: COLORS.secondary, margin: 0 }}>
                Total Movements
              </h4>
              <p style={{ fontSize: '24px', fontWeight: 700, color: COLORS.primary, margin: '2px 0 0 0' }}>
                {stats.totalMovements}
              </p>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: COLORS.secondary }}>
            Last 7 days
          </div>
        </div>

        <div className="screen-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: '#dcfce7', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Package style={{ width: '20px', height: '20px', color: COLORS.success }} />
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 500, color: COLORS.secondary, margin: 0 }}>
                Completed
              </h4>
              <p style={{ fontSize: '24px', fontWeight: 700, color: COLORS.primary, margin: '2px 0 0 0' }}>
                {stats.completed}
              </p>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: COLORS.success, fontWeight: 600 }}>
            {((stats.completed / stats.totalMovements) * 100).toFixed(0)}% completion rate
          </div>
        </div>

        <div className="screen-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: '#e0f2fe', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Clock style={{ width: '20px', height: '20px', color: COLORS.info }} />
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 500, color: COLORS.secondary, margin: 0 }}>
                In Progress
              </h4>
              <p style={{ fontSize: '24px', fontWeight: 700, color: COLORS.primary, margin: '2px 0 0 0' }}>
                {stats.inProgress}
              </p>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: COLORS.info, fontWeight: 600 }}>
            Active transfers
          </div>
        </div>

        <div className="screen-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: '#fef3c7', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Calendar style={{ width: '20px', height: '20px', color: COLORS.warning }} />
            </div>
            <div>
              <h4 style={{ fontSize: '12px', fontWeight: 500, color: COLORS.secondary, margin: 0 }}>
                Pending
              </h4>
              <p style={{ fontSize: '24px', fontWeight: 700, color: COLORS.primary, margin: '2px 0 0 0' }}>
                {stats.pending}
              </p>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: COLORS.warning, fontWeight: 600 }}>
            Awaiting approval
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="screen-card" style={{ marginBottom: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 200px', gap: '12px' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '18px',
                height: '18px',
                color: COLORS.secondary
              }} 
            />
            <input
              type="text"
              placeholder="Search by asset, code, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                borderRadius: '8px',
                border: `1px solid ${COLORS.border}`,
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Types</option>
            <option value="Transfer">Transfer</option>
            <option value="Relocation">Relocation</option>
            <option value="Assignment">Assignment</option>
            <option value="Return">Return</option>
            <option value="Disposal">Disposal</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`,
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Status</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Movement Timeline */}
      <div className="screen-card">
        <div className="chart-header" style={{ marginBottom: '20px' }}>
          <h3 className="chart-title">Movement History</h3>
          <span className="alert-count-badge">
            {filteredMovements.length} Records
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredMovements.map((movement, index) => (
            <div 
              key={movement.id}
              style={{
                position: 'relative',
                paddingLeft: '40px'
              }}
            >
              {/* Timeline dot */}
              <div style={{
                position: 'absolute',
                left: '0',
                top: '0',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: `${getMovementTypeColor(movement.movementType)}20`,
                border: `3px solid ${getMovementTypeColor(movement.movementType)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: getMovementTypeColor(movement.movementType),
                zIndex: 1
              }}>
                {getMovementIcon(movement.movementType)}
              </div>

              {/* Timeline line */}
              {index !== filteredMovements.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: '15px',
                  top: '32px',
                  bottom: '-20px',
                  width: '2px',
                  backgroundColor: COLORS.border
                }} />
              )}

              {/* Movement card */}
              <div style={{
                backgroundColor: COLORS.bg,
                borderRadius: '10px',
                padding: '14px',
                border: `2px solid ${COLORS.border}`,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = getMovementTypeColor(movement.movementType);
                e.currentTarget.style.backgroundColor = COLORS.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = COLORS.border;
                e.currentTarget.style.backgroundColor = COLORS.bg;
              }}>
                {/* Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'start',
                  marginBottom: '12px'
                }}>
                  <div>
                    <div style={{ 
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: '5px',
                      fontSize: '10px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      backgroundColor: `${getMovementTypeColor(movement.movementType)}20`,
                      color: getMovementTypeColor(movement.movementType),
                      marginBottom: '6px'
                    }}>
                      {movement.movementType}
                    </div>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: '700', 
                      color: COLORS.primary,
                      margin: '0 0 3px 0'
                    }}>
                      {movement.assetName}
                    </h4>
                    <p style={{ 
                      fontSize: '12px', 
                      color: COLORS.info,
                      fontFamily: 'monospace',
                      fontWeight: '700',
                      margin: 0
                    }}>
                      {movement.assetCode}
                    </p>
                  </div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: `${getStatusColor(movement.status)}20`,
                    color: getStatusColor(movement.status)
                  }}>
                    {movement.status}
                  </div>
                </div>

                {/* Movement details */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr auto 1fr', 
                  gap: '16px',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  {/* From */}
                  <div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: COLORS.secondary, 
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      marginBottom: '5px'
                    }}>
                      From
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'start', 
                      gap: '6px',
                      padding: '10px',
                      backgroundColor: COLORS.white,
                      borderRadius: '8px',
                      border: `1px solid ${COLORS.border}`
                    }}>
                      <Building style={{ 
                        width: '16px', 
                        height: '16px', 
                        color: COLORS.secondary,
                        flexShrink: 0,
                        marginTop: '2px'
                      }} />
                      <div>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: COLORS.primary,
                          marginBottom: '2px'
                        }}>
                          {movement.fromLocation}
                        </div>
                        <div style={{ fontSize: '11px', color: COLORS.secondary }}>
                          {movement.fromUser}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px',
                    backgroundColor: `${getMovementTypeColor(movement.movementType)}15`,
                    borderRadius: '8px'
                  }}>
                    <ArrowRight style={{ 
                      width: '20px', 
                      height: '20px', 
                      color: getMovementTypeColor(movement.movementType)
                    }} />
                  </div>

                  {/* To */}
                  <div>
                    <div style={{ 
                      fontSize: '10px', 
                      color: COLORS.secondary, 
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      marginBottom: '5px'
                    }}>
                      To
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'start', 
                      gap: '6px',
                      padding: '10px',
                      backgroundColor: COLORS.white,
                      borderRadius: '8px',
                      border: `1px solid ${COLORS.border}`
                    }}>
                      <MapPin style={{ 
                        width: '16px', 
                        height: '16px', 
                        color: COLORS.secondary,
                        flexShrink: 0,
                        marginTop: '2px'
                      }} />
                      <div>
                        <div style={{ 
                          fontSize: '12px', 
                          fontWeight: '600', 
                          color: COLORS.primary,
                          marginBottom: '2px'
                        }}>
                          {movement.toLocation}
                        </div>
                        <div style={{ fontSize: '11px', color: COLORS.secondary }}>
                          {movement.toUser}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: `1px solid ${COLORS.border}`
                }}>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '11px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar style={{ width: '12px', height: '12px', color: COLORS.secondary }} />
                      <span style={{ color: COLORS.secondary }}>
                        {new Date(movement.date).toLocaleDateString()} at {movement.time}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <User style={{ width: '12px', height: '12px', color: COLORS.secondary }} />
                      <span style={{ color: COLORS.secondary }}>
                        Approved by: <strong>{movement.approvedBy}</strong>
                      </span>
                    </div>
                  </div>
                  {movement.notes && (
                    <div style={{ 
                      fontSize: '10px', 
                      color: COLORS.secondary,
                      fontStyle: 'italic',
                      maxWidth: '300px',
                      textAlign: 'right'
                    }}>
                      {movement.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMovements.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: COLORS.secondary
          }}>
            <Package style={{ 
              width: '48px', 
              height: '48px', 
              marginBottom: '16px',
              opacity: 0.5
            }} />
            <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              No movements found
            </p>
            <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetTracking;