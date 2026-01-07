import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import {
  MapPin,
  Layers,
  Radio,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Activity,
  Wifi,
  WifiOff,
  Building2,
  Thermometer,
  Wind,
  Droplets,
  Users,
  X,
  ChevronDown,
  ChevronRight,
  Eye,
  Link as LinkIcon
} from 'lucide-react';

// ✅ Import types from API (single source of truth)
import type { Location, DeviceMapping, SensorStatus } from '../api/sensorshub';

// Font styles matching Cafeteria module
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  * {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

// ============================================================================
// LOADING COMPONENTS
// ============================================================================

const LoadingSpinner: React.FC<{ message?: string }> = memo(({ message = 'Loading...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '280px',
    gap: 12
  }}>
    <div style={{
      width: 40,
      height: 40,
      border: '3px solid #F3F4F6',
      borderTop: '3px solid #6366F1',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>{message}</span>
  </div>
));

const SkeletonBlock: React.FC<{ 
  width?: string | number; 
  height?: string | number; 
  borderRadius?: number | string; 
}> = ({ width = '100%', height = 12, borderRadius = 6 }) => (
  <div style={{
    width,
    height,
    background: 'linear-gradient(90deg, rgba(226,232,240,0.7) 25%, rgba(243,244,246,0.9) 50%, rgba(226,232,240,0.7) 75%)',
    backgroundSize: '200px 100%',
    borderRadius,
    animation: 'skeletonShimmer 1.2s ease-in-out infinite'
  }} />
);

// ============================================================================
// ANIMATED COUNTER
// ============================================================================

const CountUp: React.FC<{ end: number; duration?: number; decimals?: number }> = memo(({ 
  end, 
  duration = 800,
  decimals = 0 
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(easeOutQuart * end);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}</>;
});

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

const StatCard: React.FC<{
  icon: any;
  iconColor: string;
  iconBg: string;
  title: string;
  value: number;
  subtitle?: string;
  loading?: boolean;
}> = memo(({ icon: Icon, iconColor, iconBg, title, value, subtitle, loading = false }) => (
  <div style={{
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    transition: 'all 0.2s',
    flex: 1,
    minWidth: 200,
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
    e.currentTarget.style.borderColor = iconColor + '40';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.04)';
    e.currentTarget.style.borderColor = '#E5E7EB';
    e.currentTarget.style.transform = 'translateY(0)';
  }}>
    <div style={{
      width: 48,
      height: 48,
      borderRadius: 10,
      background: iconBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }}>
      {loading ? <SkeletonBlock width={24} height={24} /> : <Icon size={24} color={iconColor} strokeWidth={2} />}
    </div>
    
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>
        {loading ? <SkeletonBlock width={80} height={12} /> : title}
      </p>
      <p style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.5px', lineHeight: 1 }}>
        {loading ? <SkeletonBlock width={60} height={28} /> : <CountUp end={value} />}
      </p>
      {subtitle && !loading && (
        <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400, marginTop: 4 }}>{subtitle}</p>
      )}
    </div>
  </div>
));

// ============================================================================
// LOCATION CARD COMPONENT
// ============================================================================

const LocationCard: React.FC<{
  location: Location;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  mappedDevices: number;
}> = memo(({ location, onEdit, onDelete, onClick, mappedDevices }) => {
  const typeConfig = {
    IAQ: { color: '#10B981', bg: '#10B98110', icon: Wind, label: 'IAQ' },
    CAFETERIA: { color: '#F59E0B', bg: '#F59E0B10', icon: Users, label: 'Cafeteria' },
    RESTROOM: { color: '#3B82F6', bg: '#3B82F610', icon: Droplets, label: 'Restroom' },
    ENERGY: { color: '#8B5CF6', bg: '#8B5CF610', icon: Activity, label: 'Energy' }
  };

  const config = typeConfig[location.type];
  const TypeIcon = config.icon;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F1F3F5',
      borderRadius: 12,
      padding: '20px',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)';
      e.currentTarget.style.borderColor = '#E5E7EB';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = '#F1F3F5';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: config.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <TypeIcon size={20} color={config.color} strokeWidth={1.5} />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
              {location.name}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: 11,
                fontWeight: 500,
                color: config.color,
                background: config.bg,
                padding: '2px 8px',
                borderRadius: 4
              }}>
                {config.label}
              </span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>•</span>
              <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>
                Floor {location.floor} • Zone {location.zone}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            <Edit2 size={14} color="#000000" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              border: '1px solid #DC2626',
              background: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FEF2F2';
              e.currentTarget.style.borderColor = '#B91C1C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#DC2626';
            }}
          >
            <Trash2 size={14} color="#DC2626" />
          </button>
        </div>
      </div>

      {location.description && (
        <p style={{ fontSize: 12, color: '#6B7280', fontWeight: 400, marginBottom: 12 }}>
          {location.description}
        </p>
      )}

      <div style={{ display: 'flex', gap: 12, paddingTop: 12, borderTop: '1px solid #F3F4F6' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400, marginBottom: 2 }}>Mapped Devices</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>
            {mappedDevices}
          </p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400, marginBottom: 2 }}>Status</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {location.active ? (
              <>
                <CheckCircle2 size={14} color="#10B981" />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#10B981' }}>Active</span>
              </>
            ) : (
              <>
                <XCircle size={14} color="#EF4444" />
                <span style={{ fontSize: 12, fontWeight: 500, color: '#EF4444' }}>Inactive</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// DEVICE MAPPING CARD
// ============================================================================

const DeviceMappingCard: React.FC<{
  mapping: DeviceMapping;
  onEdit: () => void;
  onDelete: () => void;
  sensorStatus?: SensorStatus;
}> = memo(({ mapping, onEdit, onDelete, sensorStatus }) => {
  const deviceTypeConfig = {
    IAQ_SENSOR: { color: '#10B981', bg: '#10B98110', icon: Wind, label: 'IAQ Sensor' },
    ODOR_SENSOR: { color: '#3B82F6', bg: '#3B82F610', icon: Droplets, label: 'Odor Sensor' },
    PEOPLE_COUNTING: { color: '#F59E0B', bg: '#F59E0B10', icon: Users, label: 'People Counter' },
    ENERGY_METER: { color: '#8B5CF6', bg: '#8B5CF610', icon: Activity, label: 'Energy Meter' }
  };

  const config = deviceTypeConfig[mapping.deviceType];
  const DeviceIcon = config.icon;

  const isOnline = sensorStatus?.isOnline ?? false;
  const status = sensorStatus?.status ?? 'OFFLINE';

  const statusConfig = {
    ONLINE: { color: '#10B981', bg: '#10B98110', label: 'Online' },
    OFFLINE: { color: '#6B7280', bg: '#6B728010', label: 'Offline' },
    WARNING: { color: '#F59E0B', bg: '#F59E0B10', label: 'Warning' },
    CRITICAL: { color: '#EF4444', bg: '#EF444410', label: 'Critical' }
  };

  const statusStyle = statusConfig[status];

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F1F3F5',
      borderRadius: 12,
      padding: '18px',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      e.currentTarget.style.borderColor = '#E5E7EB';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = '#F1F3F5';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: config.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DeviceIcon size={18} color={config.color} strokeWidth={1.5} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
                {mapping.deviceId}
              </h4>
              {isOnline ? <Wifi size={14} color="#10B981" /> : <WifiOff size={14} color="#6B7280" />}
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              color: config.color,
              background: config.bg,
              padding: '2px 8px',
              borderRadius: 4
            }}>
              {config.label}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={onEdit}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            <Edit2 size={12} color="#000000" />
          </button>
          <button
            onClick={onDelete}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: '1px solid #DC2626',
              background: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#FEF2F2';
              e.currentTarget.style.borderColor = '#B91C1C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#DC2626';
            }}
          >
            <Trash2 size={12} color="#DC2626" />
          </button>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: 10, 
        paddingTop: 10, 
        borderTop: '1px solid #F3F4F6' 
      }}>
        <div>
          <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 400, marginBottom: 2 }}>Location</p>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>
            {mapping.locationName || 'Unknown'}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 400, marginBottom: 2 }}>Floor</p>
          <p style={{ fontSize: 12, fontWeight: 500, color: '#111827' }}>
            Floor {mapping.floor || 'N/A'}
          </p>
        </div>
      </div>

      <div style={{ 
        marginTop: 10, 
        paddingTop: 10, 
        borderTop: '1px solid #F3F4F6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: statusStyle.color,
            animation: isOnline ? 'pulse 2s infinite' : 'none'
          }} />
          <span style={{ fontSize: 11, fontWeight: 500, color: statusStyle.color }}>
            {statusStyle.label}
          </span>
        </div>
        {sensorStatus?.lastUpdate && (
          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 400 }}>
            {new Date(sensorStatus.lastUpdate).toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// MODAL COMPONENT
// ============================================================================

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(2px)'
    }} onClick={onClose}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '28px',
        maxWidth: 540,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
        animation: 'modalFadeIn 0.2s ease-out'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', margin: 0 }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              background: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#FFFFFF';
              e.currentTarget.style.borderColor = '#E5E7EB';
            }}
          >
            <X size={16} color="#000000" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// LOCATION FORM
// ============================================================================

const LocationForm: React.FC<{
  location?: Location;
  onSubmit: (data: Partial<Location>) => void;
  onCancel: () => void;
}> = ({ location, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Location>>(location || {
    name: '',
    type: 'IAQ',
    floor: 1,
    zone: 'A',
    building: '',
    description: '',
    active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            Location Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Floor 3 - Zone A"
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1.5px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 400,
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#6366F1'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #E5E7EB',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 400,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="IAQ">IAQ</option>
              <option value="CAFETERIA">Cafeteria</option>
              <option value="RESTROOM">Restroom</option>
              <option value="ENERGY">Energy</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Floor *
            </label>
            <input
              type="number"
              value={formData.floor || ''}
              onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
              required
              min={0}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #E5E7EB',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 400,
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Zone *
            </label>
            <input
              type="text"
              value={formData.zone}
              onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
              placeholder="A, B, C, etc."
              required
              maxLength={5}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #E5E7EB',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 400,
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Building
            </label>
            <input
              type="text"
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
              placeholder="Optional"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1.5px solid #E5E7EB',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 400,
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description"
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1.5px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 400,
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <label htmlFor="active" style={{ fontSize: 13, fontWeight: 400, color: '#374151', cursor: 'pointer' }}>
            Active
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '11px 16px',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: '#374151',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '12px 18px',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.25)';
            }}
          >
            {location ? 'Update Location' : 'Create Location'}
          </button>
        </div>
      </div>
    </form>
  );
};

// ============================================================================
// DEVICE MAPPING FORM
// ============================================================================

const DeviceMappingForm: React.FC<{
  mapping?: DeviceMapping;
  locations: Location[];
  onSubmit: (data: Partial<DeviceMapping>) => void;
  onCancel: () => void;
}> = ({ mapping, locations, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<DeviceMapping>>(mapping || {
    deviceId: '',
    locationId: 0,
    deviceType: 'IAQ_SENSOR',
    description: '',
    active: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            Device ID *
          </label>
          <input
            type="text"
            value={formData.deviceId}
            onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
            placeholder="e.g., IAQ_SENSOR_001"
            required
            disabled={!!mapping}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1.5px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 400,
              outline: 'none',
              opacity: mapping ? 0.6 : 1,
              cursor: mapping ? 'not-allowed' : 'text'
            }}
          />
          {mapping && (
            <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 400, marginTop: 4 }}>
              Device ID cannot be changed
            </p>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            Location *
          </label>
          <select
            value={formData.locationId}
            onChange={(e) => setFormData({ ...formData, locationId: parseInt(e.target.value) })}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1.5px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 400,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value={0}>Select Location</option>
            {locations.filter(l => l.active).map(location => (
              <option key={location.id} value={location.id}>
                {location.name} (Floor {location.floor}, Zone {location.zone})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            Device Type *
          </label>
          <select
            value={formData.deviceType}
            onChange={(e) => setFormData({ ...formData, deviceType: e.target.value as any })}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1.5px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 400,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="IAQ_SENSOR">IAQ Sensor</option>
            <option value="ODOR_SENSOR">Odor Sensor</option>
            <option value="PEOPLE_COUNTING">People Counting</option>
            <option value="ENERGY_METER">Energy Meter</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Optional description"
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1.5px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 400,
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="checkbox"
            id="device-active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            style={{ width: 16, height: 16, cursor: 'pointer' }}
          />
          <label htmlFor="device-active" style={{ fontSize: 13, fontWeight: 400, color: '#374151', cursor: 'pointer' }}>
            Active
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '11px 16px',
              border: '1px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              color: '#374151',
              background: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              flex: 1,
              padding: '12px 18px',
              border: 'none',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.35)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.25)';
            }}
          >
            {mapping ? 'Update Mapping' : 'Create Mapping'}
          </button>
        </div>
      </div>
    </form>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SensorsHub: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'locations' | 'mappings' | 'sensors'>('locations');
  const [locations, setLocations] = useState<Location[]>([]);
  const [mappings, setMappings] = useState<DeviceMapping[]>([]);
  const [sensorStatuses, setSensorStatuses] = useState<SensorStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMappingModalOpen, setIsMappingModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | undefined>(undefined);
  const [editingMapping, setEditingMapping] = useState<DeviceMapping | undefined>(undefined);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load real data from APIs
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📡 Loading data from backend APIs...');
      
      // ✅ Import API functions from sensorsHub (correct path)
      const { LocationsAPI, DeviceMappingsAPI, SensorStatusAPI } = await import('../api/sensorshub');
      
      // Fetch all data in parallel
      const [locationsData, mappingsData, statusesData] = await Promise.all([
        LocationsAPI.getAll(),
        DeviceMappingsAPI.getAll(),
        SensorStatusAPI.getAll()
      ]);

      console.log('✅ Data loaded successfully:', {
        locations: locationsData.length,
        mappings: mappingsData.length,
        statuses: statusesData.length
      });

      setLocations(locationsData);
      setMappings(mappingsData);
      setSensorStatuses(statusesData);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
      console.error('❌ Error loading data:', err);
      console.error('💡 Check: Backend running? Correct port? CORS enabled?');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Location handlers
  const handleCreateLocation = () => {
    setEditingLocation(undefined);
    setIsLocationModalOpen(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsLocationModalOpen(true);
  };

  const handleSubmitLocation = async (data: Partial<Location>) => {
    try {
      const { LocationsAPI } = await import('../api/sensorshub');
      
      if (editingLocation?.id) {
        await LocationsAPI.update(editingLocation.id, data);
      } else {
        await LocationsAPI.create(data as Omit<Location, 'id'>);
      }
      
      setIsLocationModalOpen(false);
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save location';
      setError(errorMessage);
      console.error('Error saving location:', err);
    }
  };

  const handleDeleteLocation = async (location: Location) => {
    if (window.confirm(`Are you sure you want to delete "${location.name}"?`)) {
      try {
        const { LocationsAPI } = await import('../api/sensorshub');
        
        if (location.id) {
          await LocationsAPI.delete(location.id);
          await loadData();
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete location';
        setError(errorMessage);
        console.error('Error deleting location:', err);
      }
    }
  };

  // Device mapping handlers
  const handleCreateMapping = () => {
    setEditingMapping(undefined);
    setIsMappingModalOpen(true);
  };

  const handleEditMapping = (mapping: DeviceMapping) => {
    setEditingMapping(mapping);
    setIsMappingModalOpen(true);
  };

  const handleSubmitMapping = async (data: Partial<DeviceMapping>) => {
    try {
      const { DeviceMappingsAPI } = await import('../api/sensorshub');
      
      if (editingMapping?.id) {
        await DeviceMappingsAPI.update(editingMapping.id, data);
      } else {
        await DeviceMappingsAPI.create(data as Omit<DeviceMapping, 'id'>);
      }
      
      setIsMappingModalOpen(false);
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save device mapping';
      setError(errorMessage);
      console.error('Error saving mapping:', err);
    }
  };

  const handleDeleteMapping = async (mapping: DeviceMapping) => {
    if (window.confirm(`Are you sure you want to delete mapping for "${mapping.deviceId}"?`)) {
      try {
        const { DeviceMappingsAPI } = await import('../api/sensorshub');
        
        if (mapping.id) {
          await DeviceMappingsAPI.delete(mapping.id);
          await loadData();
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete mapping';
        setError(errorMessage);
        console.error('Error deleting mapping:', err);
      }
    }
  };

  // Filtered data
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           location.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || location.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [locations, searchTerm, filterType]);

  const filteredMappings = useMemo(() => {
    return mappings.filter(mapping => {
      const matchesSearch = mapping.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mapping.locationName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || mapping.deviceType === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [mappings, searchTerm, filterType]);

  const filteredSensors = useMemo(() => {
    return sensorStatuses.filter(sensor => {
      const matchesSearch = sensor.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sensor.locationName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === 'all' || sensor.status === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [sensorStatuses, searchTerm, filterType]);

  // Statistics
  const stats = useMemo(() => ({
    totalLocations: locations.length,
    activeLocations: locations.filter(l => l.active).length,
    totalDevices: mappings.length,
    activeDevices: mappings.filter(m => m.active).length,
    onlineSensors: sensorStatuses.filter(s => s.isOnline).length,
    totalSensors: sensorStatuses.length,
    criticalAlerts: sensorStatuses.filter(s => s.status === 'CRITICAL').length,
    warningAlerts: sensorStatuses.filter(s => s.status === 'WARNING').length
  }), [locations, mappings, sensorStatuses]);

  // Get device count for location
  const getDeviceCountForLocation = useCallback((locationId?: number) => {
    if (!locationId) return 0;
    return mappings.filter(m => m.locationId === locationId && m.active).length;
  }, [mappings]);

  // Get sensor status for device
  const getSensorStatusForDevice = useCallback((deviceId: string) => {
    return sensorStatuses.find(s => s.deviceId === deviceId);
  }, [sensorStatuses]);

  if (loading) {
    return (
      <div style={{ padding: '24px', background: '#FFFFFF', minHeight: '100vh' }}>
        <style>{`${fontStyle} @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <LoadingSpinner message="Loading sensors hub..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#FFFFFF', minHeight: '100vh' }}>
      <style>{`
        ${fontStyle}
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes skeletonShimmer {
          0% { background-position: -200px 0; }
          100% { background-position: calc(200px + 100%) 0; }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 4, letterSpacing: '-0.3px' }}>
              Sensors Hub
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>
              Comprehensive sensor management and monitoring
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                padding: '8px 16px',
                background: isRefreshing ? '#F1F5F9' : 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)',
                border: '1px solid #BFDBFE',
                borderRadius: 10,
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: isRefreshing ? '#94A3B8' : '#1E40AF',
                opacity: isRefreshing ? 0.6 : 1,
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(59, 130, 246, 0.1)'
              }}
              onMouseEnter={(e) => !isRefreshing && (e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 1px 3px rgba(59, 130, 246, 0.1)')}
            >
              <RefreshCw 
                size={16} 
                style={{ 
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none' 
                }} 
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div style={{ 
          display: 'flex', 
          gap: 14, 
          marginBottom: 24,
          flexWrap: 'wrap'
        }}>
          <StatCard
            icon={MapPin}
            iconColor="#6366F1"
            iconBg="#6366F110"
            title="Total Locations"
            value={stats.totalLocations}
            subtitle={`${stats.activeLocations} active`}
            loading={loading}
          />
          <StatCard
            icon={Radio}
            iconColor="#10B981"
            iconBg="#10B98110"
            title="Mapped Devices"
            value={stats.totalDevices}
            subtitle={`${stats.activeDevices} active`}
            loading={loading}
          />
          <StatCard
            icon={Activity}
            iconColor="#3B82F6"
            iconBg="#3B82F610"
            title="Online Sensors"
            value={stats.onlineSensors}
            subtitle={`${stats.totalSensors} total`}
            loading={loading}
          />
          <StatCard
            icon={AlertCircle}
            iconColor="#EF4444"
            iconBg="#EF444410"
            title="Alerts"
            value={stats.criticalAlerts + stats.warningAlerts}
            subtitle={`${stats.criticalAlerts} critical`}
            loading={loading}
          />
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: 4,
          borderBottom: '1px solid #E5E7EB',
          marginBottom: 20
        }}>
          {[
            { id: 'locations', label: 'Locations', icon: MapPin },
            { id: 'mappings', label: 'Device Mappings', icon: LinkIcon },
            { id: 'sensors', label: 'Sensor Status', icon: Activity }
          ].map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  fontWeight: 500,
                  color: isActive ? '#6366F1' : '#6B7280',
                  borderBottom: isActive ? '2px solid #6366F1' : '2px solid transparent',
                  transition: 'all 0.2s',
                  position: 'relative',
                  top: 1
                }}
                onMouseEnter={(e) => !isActive && (e.currentTarget.style.color = '#374151')}
                onMouseLeave={(e) => !isActive && (e.currentTarget.style.color = '#6B7280')}
              >
                <TabIcon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search and Filter Bar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 300px', minWidth: 200 }}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                border: '1.5px solid #E5E7EB',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 400,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#6366F1'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: '9px 32px 9px 12px',
              border: '1.5px solid #E5E7EB',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 400,
              outline: 'none',
              cursor: 'pointer',
              background: '#FFFFFF',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236B7280\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center'
            }}
          >
            <option value="all">All Types</option>
            {activeTab === 'locations' && (
              <>
                <option value="IAQ">IAQ</option>
                <option value="CAFETERIA">Cafeteria</option>
                <option value="RESTROOM">Restroom</option>
                <option value="ENERGY">Energy</option>
              </>
            )}
            {activeTab === 'mappings' && (
              <>
                <option value="IAQ_SENSOR">IAQ Sensor</option>
                <option value="ODOR_SENSOR">Odor Sensor</option>
                <option value="PEOPLE_COUNTING">People Counting</option>
                <option value="ENERGY_METER">Energy Meter</option>
              </>
            )}
            {activeTab === 'sensors' && (
              <>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">Offline</option>
                <option value="WARNING">Warning</option>
                <option value="CRITICAL">Critical</option>
              </>
            )}
          </select>

          {(activeTab === 'locations' || activeTab === 'mappings') && (
            <button
              onClick={activeTab === 'locations' ? handleCreateLocation : handleCreateMapping}
              style={{
                padding: '10px 18px',
                border: 'none',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.35)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.25)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Plus size={16} />
              {activeTab === 'locations' ? 'New Location' : 'New Mapping'}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'locations' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', 
          gap: 16 
        }}>
          {filteredLocations.length > 0 ? (
            filteredLocations.map(location => (
              <LocationCard
                key={location.id}
                location={location}
                onEdit={() => handleEditLocation(location)}
                onDelete={() => handleDeleteLocation(location)}
                onClick={() => setSelectedLocation(location)}
                mappedDevices={getDeviceCountForLocation(location.id)}
              />
            ))
          ) : (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #F1F3F5'
            }}>
              <MapPin size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: 15, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>
                No locations found
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 400 }}>
                Create your first location to get started
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'mappings' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: 16 
        }}>
          {filteredMappings.length > 0 ? (
            filteredMappings.map(mapping => (
              <DeviceMappingCard
                key={mapping.id}
                mapping={mapping}
                onEdit={() => handleEditMapping(mapping)}
                onDelete={() => handleDeleteMapping(mapping)}
                sensorStatus={getSensorStatusForDevice(mapping.deviceId)}
              />
            ))
          ) : (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #F1F3F5'
            }}>
              <LinkIcon size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: 15, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>
                No device mappings found
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 400 }}>
                Map devices to locations to start monitoring
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sensors' && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: 16 
        }}>
          {filteredSensors.length > 0 ? (
            filteredSensors.map(sensor => {
              const mapping = mappings.find(m => m.deviceId === sensor.deviceId);
              if (!mapping) return null;
              return (
                <DeviceMappingCard
                  key={sensor.deviceId}
                  mapping={mapping}
                  onEdit={() => handleEditMapping(mapping)}
                  onDelete={() => handleDeleteMapping(mapping)}
                  sensorStatus={sensor}
                />
              );
            })
          ) : (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center', 
              padding: '60px 20px',
              background: '#FFFFFF',
              borderRadius: 12,
              border: '1px solid #F1F3F5'
            }}>
              <Activity size={48} color="#D1D5DB" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: 15, fontWeight: 500, color: '#6B7280', marginBottom: 4 }}>
                No sensors found
              </p>
              <p style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 400 }}>
                Sensors will appear here once they start sending data
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        title={editingLocation ? 'Edit Location' : 'Create Location'}
      >
        <LocationForm
          location={editingLocation}
          onSubmit={handleSubmitLocation}
          onCancel={() => setIsLocationModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isMappingModalOpen}
        onClose={() => setIsMappingModalOpen(false)}
        title={editingMapping ? 'Edit Device Mapping' : 'Create Device Mapping'}
      >
        <DeviceMappingForm
          mapping={editingMapping}
          locations={locations}
          onSubmit={handleSubmitMapping}
          onCancel={() => setIsMappingModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default SensorsHub;