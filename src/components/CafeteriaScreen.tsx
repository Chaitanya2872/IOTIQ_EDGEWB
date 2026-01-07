import React, { useState, useEffect, memo, useMemo, useCallback, useRef } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  Clock,
  TrendingUp,
  AlertCircle,
  Activity,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles // New icon for Smart Insights button
} from 'lucide-react';

import { useCafeteriaData, useAllRecords } from '../api/hooks/useCafeteriaData';
import { useSmartInsights } from '../api/hooks/useCafeteriaAnalytics'; // NEW IMPORT
import type { CafeteriaCounter } from '../api/types';

// Font styles - UNCHANGED
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
  * {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
`;

// Loading Spinner - UNCHANGED
const LoadingSpinner: React.FC<{ message?: string }> = memo(({ message = 'Loading...' }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '70vh',
    gap: 16
  }}>
    <div style={{
      width: 48,
      height: 48,
      border: '4px solid #F3F4F6',
      borderTop: '4px solid #6366F1',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <span style={{ fontSize: 14, color: '#6B7280', fontWeight: 500 }}>{message}</span>
  </div>
));

// Animated counter - UNCHANGED
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

// Custom DateTime Picker Component - UNCHANGED
const DateTimePicker: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}> = memo(({ label, value, onChange, placeholder = 'Select date & time' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (value) {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  });
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    if (value) {
      const parsed = new Date(value);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    return new Date();
  });
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    if (value) {
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return `${parsed.getHours().toString().padStart(2, '0')}:${parsed.getMinutes().toString().padStart(2, '0')}`;
      }
    }
    return '09:00';
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setCurrentMonth(date);
        setSelectedTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`);
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatDisplayDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let startingDayOfWeek = firstDay.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const days: (number | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const handleApply = () => {
    const [hours, minutes] = selectedTime.split(':');
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      selectedDate.getDate(),
      parseInt(hours),
      parseInt(minutes),
      0,
      0
    );
    
    const year = newDate.getFullYear();
    const month = String(newDate.getMonth() + 1).padStart(2, '0');
    const day = String(newDate.getDate()).padStart(2, '0');
    const hour = String(newDate.getHours()).padStart(2, '0');
    const minute = String(newDate.getMinutes()).padStart(2, '0');
    
    onChange(`${year}-${month}-${day}T${hour}:${minute}`);
    setIsOpen(false);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           currentMonth.getMonth() === today.getMonth() && 
           currentMonth.getFullYear() === today.getFullYear();
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate() && 
           currentMonth.getMonth() === selectedDate.getMonth() && 
           currentMonth.getFullYear() === selectedDate.getFullYear();
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div ref={pickerRef} style={{ position: 'relative', minWidth: 160, maxWidth: 180 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 10px',
          border: '1.5px solid #E5E7EB',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 400,
          color: value ? '#111827' : '#9CA3AF',
          background: '#FFFFFF',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#C7D2FE'}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = '#E5E7EB';
        }}
      >
        <Calendar size={14} color={value ? '#6366F1' : '#9CA3AF'} />
        <span style={{ flex: 1, fontSize: 11 }}>
          {value ? `${formatDisplayDate(selectedDate)} ${selectedTime}` : placeholder}
        </span>
        <ChevronDown size={14} color="#9CA3AF" style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          zIndex: 1000,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          padding: 12,
          minWidth: 280,
          animation: 'slideDown 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={14} color="#6366F1" />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                style={{
                  padding: 4,
                  border: '1px solid #E5E7EB',
                  borderRadius: 4,
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronLeft size={14} color="#6B7280" />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                style={{
                  padding: 4,
                  border: '1px solid #E5E7EB',
                  borderRadius: 4,
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronRight size={14} color="#6B7280" />
              </button>
            </div>
          </div>

          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 6 }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} style={{ 
                  fontSize: 10, 
                  fontWeight: 500, 
                  color: '#6B7280', 
                  textAlign: 'center',
                  padding: '2px 0'
                }}>
                  {day}
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {getDaysInMonth(currentMonth).map((day, index) => (
                <div
                  key={index}
                  onClick={() => {
                    if (day) {
                      const newDate = new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        day
                      );
                      setSelectedDate(newDate);
                    }
                  }}
                  style={{
                    padding: '6px',
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: isSelected(day!) ? 600 : 400,
                    color: day ? (isSelected(day) ? '#FFFFFF' : isToday(day) ? '#6366F1' : '#111827') : 'transparent',
                    background: isSelected(day!) ? '#6366F1' : 'transparent',
                    borderRadius: 6,
                    cursor: day ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    border: isToday(day!) && !isSelected(day!) ? '1px solid #6366F1' : '1px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (day && !isSelected(day)) {
                      e.currentTarget.style.background = '#F3F4F6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (day && !isSelected(day)) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {day || ''}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #E5E7EB' }}>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>
              Time
            </label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                fontSize: 12,
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                flex: 1,
                padding: '6px',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                background: '#FFFFFF',
                color: '#6B7280',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              style={{
                flex: 1,
                padding: '6px',
                border: 'none',
                borderRadius: 6,
                background: '#6366F1',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
});

// Custom Dropdown Component - UNCHANGED
const CustomDropdown: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; icon?: string }[];
  placeholder?: string;
}> = memo(({ label, value, onChange, options, placeholder = 'Select option' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', minWidth: 160 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 6 }}>
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 12px',
          border: '1.5px solid #E5E7EB',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 400,
          color: value ? '#111827' : '#9CA3AF',
          background: '#FFFFFF',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          transition: 'all 0.2s',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#C7D2FE'}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = '#E5E7EB';
        }}
      >
        <Users size={16} color={value ? '#6366F1' : '#9CA3AF'} />
        <span style={{ flex: 1 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} color="#9CA3AF" style={{ 
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s'
        }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          zIndex: 1000,
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: 12,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          padding: 8,
          maxHeight: 280,
          overflowY: 'auto',
          animation: 'slideDown 0.2s ease-out'
        }}>
          <div style={{ padding: '0 8px 8px 8px' }}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                fontSize: 13,
                outline: 'none'
              }}
              autoFocus
            />
          </div>

          {filteredOptions.map(option => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                setSearchTerm('');
              }}
              style={{
                padding: '10px 12px',
                fontSize: 13,
                fontWeight: value === option.value ? 600 : 400,
                color: value === option.value ? '#6366F1' : '#111827',
                background: value === option.value ? '#EEF2FF' : 'transparent',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s',
                border: value === option.value ? '1.5px solid #6366F1' : '1.5px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = '#F3F4F6';
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {option.icon && <span>{option.icon}</span>}
              <span style={{ flex: 1 }}>{option.label}</span>
              {value === option.value && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M13.3337 4L6.00033 11.3333L2.66699 8" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ))}

          {filteredOptions.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
              No options found
            </div>
          )}
        </div>
      )}
    </div>
  );
});

interface CounterDisplay {
  name: string;
  queueLength: number;
  avgWaitTime: number;
  waitTimeText: string;
  status: 'ready' | 'busy' | 'crowded';
  serviceStatus: string;
  color: string;
  image: string;
  throughput: number;
  peakTime: string;
  location?: string;
  floor?: number;
}

// Enhanced Counter Card Component - ADDED THROUGHPUT DISPLAY
const CounterCard: React.FC<{ counter: CounterDisplay; index: number }> = memo(({ counter, index }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return '#10B981';
      case 'busy': return '#F59E0B';
      case 'crowded': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'READY_TO_SERVE': return 'Ready';
      case 'SHORT_WAIT': return 'Short Wait';
      case 'MEDIUM_WAIT': return 'Medium Wait';
      case 'LONG_WAIT': return 'Long Wait';
      default: return 'Unknown';
    }
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #F1F3F5',
        borderRadius: 12,
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s',
        opacity: 0,
        animation: `fadeIn 0.4s ease-out ${index * 0.1}s forwards`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '150px',
        height: '150px',
        background: `radial-gradient(circle, ${counter.color}15 0%, transparent 70%)`,
        opacity: 0.5,
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            overflow: 'hidden',
            border: '2px solid #F1F3F5',
            background: '#FFFFFF'
          }}>
            <img 
              src={counter.image} 
              alt={counter.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 2 }}>
              {counter.name}
            </h3>
            <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 400 }}>
              {counter.location && counter.floor ? `${counter.location} • Floor ${counter.floor}` : `Throughput: ${counter.throughput}/hr`}
            </p>
          </div>
        </div>
        {/* SIMPLIFIED: Just Wait Time */}
        <div style={{
          padding: '8px 12px',
          borderRadius: 8,
          background: '#F9FAFB',
          border: '1px solid #E5E7EB',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 2
        }}>
          <span style={{ fontSize: 10, fontWeight: 500, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Wait Time
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
            {counter.waitTimeText}
          </span>
        </div>
      </div>

      <div style={{ 
        padding: '16px', 
        background: `${counter.color}08`, 
        borderRadius: 10,
        marginBottom: 0,
        border: `1px solid ${counter.color}20`
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, color: '#6B7280', fontWeight: 400, marginBottom: 4 }}>Queue Length</p>
            <p style={{ fontSize: 32, fontWeight: 600, color: counter.color, letterSpacing: '-1px', lineHeight: 1 }}>
              {counter.queueLength}
            </p>
          </div>
          <Users size={32} color={counter.color} strokeWidth={1.5} opacity={0.3} />
        </div>
      </div>
    </div>
  );
});

// KEEP ALL YOUR EXISTING CHART COMPONENTS EXACTLY AS THEY ARE
// Enhanced Hourly Chart - UNCHANGED
const EnhancedHourlyChart: React.FC<{ globalFromDate: string; globalToDate: string }> = memo(({ globalFromDate, globalToDate }) => {
  const [selectedCounter, setSelectedCounter] = useState<string>('all');
  const [selectedMeal, setSelectedMeal] = useState<string>('all'); // Changed default to 'all'
  const [interval, setInterval] = useState<number>(15);
  
  const { from, to } = useMemo(() => {
    const fromValue = globalFromDate ? `${globalFromDate}:00` : undefined;
    const toValue = globalToDate ? `${globalToDate}:00` : undefined;
    
    return {
      from: fromValue,
      to: toValue
    };
  }, [globalFromDate, globalToDate]);

  const { data, loading, error } = useAllRecords(
    from, 
    to,
    selectedCounter === 'all' ? undefined : selectedCounter
  );

  // Define meal time ranges
  const mealTimeRanges = {
    all: { start: 0, end: 23 },         // All day
    breakfast: { start: 8, end: 10 },   // 8:00 AM – 10:00 AM
    lunch: { start: 12, end: 14 },      // 12:00 PM – 2:30 PM
    snacks: { start: 16, end: 18 },     // 4:00 PM – 6:30 PM
    dinner: { start: 19, end: 23 }      // 7:00 PM – 11:30 PM
  };

  const chartData = useMemo(() => {
    if (!data || !data.counters) {
      console.log('❌ No data or counters available');
      return [];
    }

    console.log('=== PROCESSING CHART DATA ===');
    console.log('Selected counter:', selectedCounter);
    console.log('Selected meal:', selectedMeal);
    console.log('Interval:', interval);
    console.log('Date range:', globalFromDate, 'to', globalToDate);
    
    const mealRange = mealTimeRanges[selectedMeal as keyof typeof mealTimeRanges] || mealTimeRanges.all;
    console.log('Meal time range:', `${mealRange.start}:00 - ${mealRange.end}:00`);

    const timeMap = new Map<string, any>();
    const globalFrom = new Date(globalFromDate);
    const globalTo = new Date(globalToDate);
    
    console.log('Global date range (parsed):', globalFrom.toISOString(), 'to', globalTo.toISOString());

    let totalRecordsProcessed = 0;
    let recordsInDateRange = 0;
    let recordsInMealRange = 0;

    Object.entries(data.counters).forEach(([counterName, records]: [string, any]) => {
      if (!Array.isArray(records)) {
        console.log(`⚠️ Records for ${counterName} is not an array`);
        return;
      }
      
      console.log(`Processing ${counterName}: ${records.length} total records`);
      totalRecordsProcessed += records.length;
      
      records.forEach((record: any) => {
        const timestamp = new Date(record.timestamp);
        
        // PRIMARY FILTER: Global date range
        if (timestamp >= globalFrom && timestamp <= globalTo) {
          recordsInDateRange++;
          
          const hour = timestamp.getHours();
          
          // SECONDARY FILTER: Meal time range (only if not 'all')
          if (hour >= mealRange.start && hour <= mealRange.end) {
            recordsInMealRange++;
            
            const minutes = timestamp.getMinutes();
            
            const intervalMinutes = Math.floor(minutes / interval) * interval;
            const timeKey = `${hour.toString().padStart(2, '0')}:${intervalMinutes.toString().padStart(2, '0')}`;
            
            if (!timeMap.has(timeKey)) {
              timeMap.set(timeKey, {
                time: timeKey,
                timestamp: timeKey,
                TwoGood: 0,
                UttarDakshin: 0,
                Tandoor: 0,
                totalQueue: 0,
                count: 0
              });
            }
            
            const entry = timeMap.get(timeKey);
            if (entry) {
              const queueCount = record.queueCount || 0;
              entry[counterName] = (entry[counterName] || 0) + queueCount;
              entry.count++;
            }
          }
        }
      });
    });

    console.log('📊 Processing summary:');
    console.log('  - Total records:', totalRecordsProcessed);
    console.log('  - In date range:', recordsInDateRange);
    console.log('  - In meal time range:', recordsInMealRange);

    const result = Array.from(timeMap.entries())
      .map(([timeKey, entry]) => {
        const count = entry.count || 1;
        return {
          time: timeKey,
          timestamp: timeKey,
          TwoGood: Math.round(entry.TwoGood / count),
          UttarDakshin: Math.round(entry.UttarDakshin / count),
          Tandoor: Math.round(entry.Tandoor / count),
          totalQueue: Math.round((entry.TwoGood + entry.UttarDakshin + entry.Tandoor) / count)
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time));
    
    console.log(`✅ Final chart data: ${result.length} points`);
    if (result.length > 0) {
      console.log('  - Time range:', result[0].time, 'to', result[result.length - 1].time);
      console.log('  - Sample:', result.slice(0, 2));
    } else {
      console.log('⚠️ NO DATA POINTS GENERATED');
      if (recordsInDateRange === 0) {
        console.log('  → No records in selected date range. Try selecting dates that have data.');
      } else if (recordsInMealRange === 0) {
        console.log(`  → No records in ${selectedMeal} time range (${mealRange.start}:00-${mealRange.end}:00). Try selecting "All Day" or different meal time.`);
      }
    }
    
    return result;
  }, [data, selectedCounter, selectedMeal, interval, globalFromDate, globalToDate]);

  const counterOptions = [
    { value: 'all', label: 'All Counters' },
    { value: 'TwoGood', label: 'Two Good' },
    { value: 'UttarDakshin', label: 'Uttar Dakshin' },
    { value: 'Tandoor', label: 'Tandoor' }
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F1F3F5',
      borderRadius: 12,
      padding: '24px',
      gridColumn: '1 / -1'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 20,
        gap: 24,
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '0 0 auto' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
            Hourly Queue Analysis
          </h3>
          <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>
            {selectedCounter === 'all' 
              ? 'All counters' 
              : counterOptions.find(c => c.value === selectedCounter)?.label
            } • {selectedMeal === 'all' ? 'All Day' : selectedMeal.charAt(0).toUpperCase() + selectedMeal.slice(1)} • {interval}min intervals
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: 12, 
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          flex: '1 1 auto',
          justifyContent: 'flex-end'
        }}>
          <CustomDropdown
            label="Meal Time"
            value={selectedMeal}
            onChange={(value) => {
              console.log('Meal time changed to:', value);
              setSelectedMeal(value);
              
              // Automatically set date range based on meal selection
              const now = new Date();
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              
              if (value === 'breakfast') {
                // 8:00 AM - 10:00 AM
                const start = new Date(today);
                start.setHours(8, 0, 0, 0);
                const end = new Date(today);
                end.setHours(10, 0, 0, 0);
                setGlobalFromDate(start.toISOString().slice(0, 16));
                setGlobalToDate(end.toISOString().slice(0, 16));
              } else if (value === 'lunch') {
                // 12:00 PM - 2:30 PM
                const start = new Date(today);
                start.setHours(12, 0, 0, 0);
                const end = new Date(today);
                end.setHours(14, 30, 0, 0);
                setGlobalFromDate(start.toISOString().slice(0, 16));
                setGlobalToDate(end.toISOString().slice(0, 16));
              } else if (value === 'snacks') {
                // 4:00 PM - 6:30 PM
                const start = new Date(today);
                start.setHours(16, 0, 0, 0);
                const end = new Date(today);
                end.setHours(18, 30, 0, 0);
                setGlobalFromDate(start.toISOString().slice(0, 16));
                setGlobalToDate(end.toISOString().slice(0, 16));
              } else if (value === 'dinner') {
                // 7:00 PM - 11:30 PM
                const start = new Date(today);
                start.setHours(19, 0, 0, 0);
                const end = new Date(today);
                end.setHours(23, 30, 0, 0);
                setGlobalFromDate(start.toISOString().slice(0, 16));
                setGlobalToDate(end.toISOString().slice(0, 16));
              }
              // If 'all', keep current date range
            }}
            options={[
              { value: 'all', label: 'All Day (Show All Data)' },
              { value: 'breakfast', label: 'Breakfast (8:00 AM – 10:00 AM)' },
              { value: 'lunch', label: 'Lunch (12:00 PM – 2:30 PM)' },
              { value: 'snacks', label: 'Snacks (4:00 PM – 6:30 PM)' },
              { value: 'dinner', label: 'Dinner (7:00 PM – 11:30 PM)' }
            ]}
            placeholder="Select meal time"
          />

          <CustomDropdown
            label="Counter"
            value={selectedCounter}
            onChange={setSelectedCounter}
            options={counterOptions}
            placeholder="Select counter"
          />
        </div>
      </div>

      {loading ? (
        <div style={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner message="Loading chart data..." />
        </div>
      ) : error ? (
        <div style={{ 
          height: 450, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#EF4444',
          gap: 12
        }}>
          <AlertCircle size={48} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>Error loading data</p>
          <p style={{ fontSize: 14, color: '#6B7280' }}>{error}</p>
        </div>
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={450}>
          <LineChart 
            data={chartData} 
            margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
          >
            <CartesianGrid 
              strokeDasharray="0" 
              stroke="#F1F5F9" 
              vertical={false}
              strokeWidth={1}
            />
            
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: '#94A3B8', 
                fontSize: 11,
                fontWeight: 500
              }}
              dy={10}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: '#94A3B8', 
                fontSize: 13,
                fontWeight: 500
              }}
              dx={-10}
              label={{ 
                value: 'Queue Count', 
                angle: -90, 
                position: 'insideLeft',
                style: { 
                  fontSize: 13, 
                  fill: '#6B7280', 
                  fontWeight: 500 
                } 
              }}
              tickFormatter={(value) => {
                if (value >= 1000) {
                  return `${(value / 1000).toFixed(1)}k`;
                }
                return value;
              }}
            />
            
            <Tooltip 
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                
                const data = payload[0].payload;
                
                return (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.98)',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                    padding: '10px 12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    minWidth: '140px',
                    maxWidth: '200px'
                  }}>
                    <div style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#64748B',
                      marginBottom: 8,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}>
                      <Clock size={12} />
                      {label}
                    </div>
                    
                    {selectedCounter === 'all' ? (
                      <>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#0F172A',
                          marginBottom: 8,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>Total</span>
                          <span style={{ color: '#6366F1', fontSize: 16 }}>{data.totalQueue}</span>
                        </div>
                        
                        {data.TwoGood > 0 && (
                          <div style={{ 
                            fontSize: 11, 
                            color: '#475569', 
                            marginBottom: 4, 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ 
                                width: 6, 
                                height: 6, 
                                borderRadius: '50%', 
                                background: '#5B8FF9'
                              }}></span>
                              Two Good
                            </span>
                            <span style={{ fontWeight: 600, color: '#0F172A' }}>{data.TwoGood}</span>
                          </div>
                        )}
                        {data.UttarDakshin > 0 && (
                          <div style={{ 
                            fontSize: 11, 
                            color: '#475569', 
                            marginBottom: 4, 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ 
                                width: 6, 
                                height: 6, 
                                borderRadius: '50%', 
                                background: '#9E77ED'
                              }}></span>
                              Uttar Dakshin
                            </span>
                            <span style={{ fontWeight: 600, color: '#0F172A' }}>{data.UttarDakshin}</span>
                          </div>
                        )}
                        {data.Tandoor > 0 && (
                          <div style={{ 
                            fontSize: 11, 
                            color: '#475569', 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ 
                                width: 6, 
                                height: 6, 
                                borderRadius: '50%', 
                                background: '#F97316'
                              }}></span>
                              Tandoor
                            </span>
                            <span style={{ fontWeight: 600, color: '#0F172A' }}>{data.Tandoor}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#0F172A',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span>{counterOptions.find(c => c.value === selectedCounter)?.label}</span>
                        <span style={{ color: '#6366F1', fontSize: 16 }}>{payload[0].value}</span>
                      </div>
                    )}
                  </div>
                );
              }}
              cursor={{ 
                stroke: '#CBD5E1', 
                strokeWidth: 1,
                strokeDasharray: '4 4'
              }}
            />
            
            {selectedCounter === 'all' && (
              <Legend 
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '13px',
                  fontWeight: 500
                }}
                iconType="line"
                iconSize={16}
                formatter={(value) => {
                  const counterColors: Record<string, string> = {
                    'Two Good': '#5B8FF9',
                    'Uttar Dakshin': '#9E77ED',
                    'Tandoor': '#F97316'
                  };
                  return <span style={{ color: counterColors[value] || '#6B7280' }}>{value}</span>;
                }}
              />
            )}
            
            {selectedCounter === 'all' ? (
              <>
                <Line
                  type="monotone"
                  dataKey="TwoGood"
                  stroke="#5B8FF9"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="Two Good"
                  animationDuration={1000}
                  isAnimationActive={true}
                />
                
                <Line
                  type="monotone"
                  dataKey="UttarDakshin"
                  stroke="#9E77ED"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="Uttar Dakshin"
                  animationDuration={1000}
                  isAnimationActive={true}
                />
                
                <Line
                  type="monotone"
                  dataKey="Tandoor"
                  stroke="#F97316"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  name="Tandoor"
                  animationDuration={1000}
                  isAnimationActive={true}
                />
              </>
            ) : (
              <Line
                type="monotone"
                dataKey={selectedCounter}
                stroke="#6366F1"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                name={counterOptions.find(c => c.value === selectedCounter)?.label || selectedCounter}
                animationDuration={1000}
                isAnimationActive={true}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ 
          height: 450, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#94A3B8',
          gap: 12
        }}>
          <Activity size={48} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>No data available</p>
          <p style={{ fontSize: 14 }}>Try selecting a different time range or counter</p>
        </div>
      )}

      <div style={{ 
        marginTop: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12
      }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#6B7280' }}>
          Interval (minutes):
        </label>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          border: '1.5px solid #E5E7EB',
          borderRadius: 10,
          background: '#FFFFFF',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}>
          <button
            onClick={() => setInterval(Math.max(5, interval - 5))}
            style={{
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ChevronLeft size={16} />
          </button>
          <div style={{
            padding: '8px 16px',
            fontSize: 14,
            fontWeight: 600,
            color: '#111827',
            textAlign: 'center',
            minWidth: 50,
            borderLeft: '1px solid #E5E7EB',
            borderRight: '1px solid #E5E7EB'
          }}>
            {interval}
          </div>
          <button
            onClick={() => setInterval(Math.min(60, interval + 5))}
            style={{
              padding: '8px 12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6B7280',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
});

// Wait Time Chart - UNCHANGED (KEEP YOUR EXISTING ONE)
const WaitTimeChart: React.FC = memo(() => {
  const { todayStart, todayEnd } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    
    return {
      todayStart: start.toISOString().slice(0, 19),
      todayEnd: end.toISOString().slice(0, 19)
    };
  }, []);

  const { data, loading, error } = useAllRecords(todayStart, todayEnd);
  const [, forceUpdate] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const mealTimes = {
    breakfast: { start: 7, end: 10, label: 'Breakfast' },
    lunch: { start: 11, end: 14, label: 'Lunch' },
    snacks: { start: 15, end: 17, label: 'Snacks' },
    dinner: { start: 18, end: 23, label: 'Dinner' }
  };

  const chartData = useMemo(() => {
    if (!data || !data.counters) return [];

    const mealStats: any[] = [];
    const now = new Date();
    const currentHour = now.getHours();
    const today = now.getDate();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    Object.entries(mealTimes).forEach(([mealKey, mealConfig]) => {
      const mealData: number[] = [];

      Object.entries(data.counters).forEach(([counterName, records]: [string, any]) => {
        if (!Array.isArray(records)) return;

        records.forEach((record: any) => {
          const recordDate = new Date(record.timestamp);
          const hour = recordDate.getHours();
          
          const isToday = recordDate.getDate() === today &&
                         recordDate.getMonth() === thisMonth &&
                         recordDate.getFullYear() === thisYear;
          
          if (isToday && hour >= mealConfig.start && hour <= mealConfig.end) {
            const waitTime = record.waitTimeMinutes ?? record.avgWaitMinutes ?? record.waitTime ?? 0;
            if (waitTime > 0) {
              mealData.push(waitTime);
            }
          }
        });
      });

      if (mealData.length > 0) {
        const avgWait = mealData.reduce((a, b) => a + b, 0) / mealData.length;
        const maxWait = Math.max(...mealData);
        const minWait = Math.min(...mealData);

        mealStats.push({
          name: mealConfig.label,
          avgWait: parseFloat(avgWait.toFixed(1)),
          maxWait: parseFloat(maxWait.toFixed(1)),
          minWait: parseFloat(minWait.toFixed(1)),
          count: mealData.length,
          isActive: currentHour >= mealConfig.start && currentHour <= mealConfig.end,
          isPast: currentHour > mealConfig.end,
          isFuture: currentHour < mealConfig.start
        });
      } else {
        mealStats.push({
          name: mealConfig.label,
          avgWait: 0,
          maxWait: 0,
          minWait: 0,
          count: 0,
          isActive: currentHour >= mealConfig.start && currentHour <= mealConfig.end,
          isPast: currentHour > mealConfig.end,
          isFuture: currentHour < mealConfig.start
        });
      }
    });

    return mealStats;
  }, [data, mealTimes]);

  const todayDisplay = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }, []);

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F1F3F5',
      borderRadius: 12,
      padding: '24px'
    }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
              Current Day Wait Time Analysis
            </h3>
            <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>
              {todayDisplay}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: '#10B98115',
              borderRadius: 6
            }}>
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10B981',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ fontSize: 11, color: '#059669', fontWeight: 500 }}>
                Live
              </span>
            </div>
            
            {chartData.length > 0 && (
              <div style={{
                padding: '6px 12px',
                background: '#EEF2FF',
                border: '1px solid #C7D2FE',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#6366F1'
              }}>
                {chartData.reduce((sum, item) => sum + item.count, 0)} records
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner message="Loading today's wait time data..." />
        </div>
      ) : error ? (
        <div style={{ height: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <AlertCircle size={40} color="#EF4444" />
          <p style={{ color: '#EF4444', fontSize: 14, fontWeight: 500 }}>Error loading data</p>
        </div>
      ) : chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="0" 
                stroke="#F1F5F9" 
                vertical={false}
                strokeWidth={1}
              />
              
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={({ x, y, payload }) => {
                  const item = chartData.find(d => d.name === payload.value);
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text 
                        x={0} 
                        y={0} 
                        dy={16} 
                        textAnchor="middle" 
                        fill={item?.isActive ? '#6366F1' : item?.isPast ? '#94A3B8' : '#64748B'}
                        fontSize={13}
                        fontWeight={item?.isActive ? 600 : 500}
                      >
                        {payload.value}
                      </text>
                      {item?.isActive && (
                        <text 
                          x={0} 
                          y={0} 
                          dy={32} 
                          textAnchor="middle" 
                          fill="#6366F1"
                          fontSize={10}
                          fontWeight={500}
                        >
                          (Active)
                        </text>
                      )}
                    </g>
                  );
                }}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ 
                  fill: '#94A3B8', 
                  fontSize: 12,
                  fontWeight: 500
                }}
                dx={-10}
                label={{ 
                  value: 'Wait Time (minutes)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { 
                    fontSize: 12, 
                    fill: '#64748B', 
                    fontWeight: 500 
                  } 
                }}
              />
              
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  
                  const data = payload[0].payload;
                  
                  return (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.98)',
                      border: '1px solid #E2E8F0',
                      borderRadius: 8,
                      padding: '10px 12px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      minWidth: '140px'
                    }}>
                      <div style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#64748B',
                        marginBottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}>
                        {label}
                        {data.isActive && (
                          <span style={{
                            fontSize: 9,
                            padding: '2px 6px',
                            background: '#10B981',
                            color: '#FFF',
                            borderRadius: 4,
                            fontWeight: 600
                          }}>
                            NOW
                          </span>
                        )}
                      </div>
                      
                      {data.count > 0 ? (
                        <>
                          <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>
                            <strong style={{ color: '#3B82F6' }}>Avg:</strong> {data.avgWait} min
                          </div>
                          <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>
                            <strong style={{ color: '#1D4ED8' }}>Max:</strong> {data.maxWait} min
                          </div>
                          <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>
                            <strong style={{ color: '#60A5FA' }}>Min:</strong> {data.minWait} min
                          </div>
                          <div style={{ 
                            fontSize: 10, 
                            color: '#94A3B8', 
                            marginTop: 6,
                            paddingTop: 6,
                            borderTop: '1px solid #F1F5F9'
                          }}>
                            {data.count} records today
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>
                          {data.isFuture ? 'Upcoming meal time' : 'No data yet'}
                        </div>
                      )}
                    </div>
                  );
                }}
                cursor={{ fill: '#F8FAFC' }}
              />
              
              <Legend 
                wrapperStyle={{ 
                  fontSize: 12, 
                  fontWeight: 500,
                  paddingTop: 20
                }}
                iconType="rect"
                iconSize={12}
              />
              
              <Bar 
                dataKey="avgWait" 
                fill="#3B82F6" 
                name="Avg Wait"
                radius={[8, 8, 0, 0]}
                barSize={30}
              />
              <Bar 
                dataKey="maxWait" 
                fill="#1D4ED8" 
                name="Max Wait"
                radius={[8, 8, 0, 0]}
                barSize={30}
              />
              <Bar 
                dataKey="minWait" 
                fill="#60A5FA" 
                name="Min Wait"
                radius={[8, 8, 0, 0]}
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>

          {chartData.some(d => d.avgWait > 0) && (
            <div style={{ 
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid #F1F5F9',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 16
            }}>
              <div style={{
                padding: '12px 16px',
                background: '#DBEAFE',
                border: '1px solid #93C5FD',
                borderRadius: 8
              }}>
                <div style={{ fontSize: 11, color: '#1E3A8A', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Peak Today
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1D4ED8' }}>
                  {chartData.filter(d => d.avgWait > 0).reduce((max, item) => item.avgWait > max.avgWait ? item : max, chartData[0]).name}
                </div>
                <div style={{ fontSize: 12, color: '#1E3A8A', marginTop: 2 }}>
                  {chartData.filter(d => d.avgWait > 0).reduce((max, item) => item.avgWait > max.avgWait ? item : max, chartData[0]).avgWait} min avg
                </div>
              </div>
              
              <div style={{
                padding: '12px 16px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 8
              }}>
                <div style={{ fontSize: 11, color: '#1E40AF', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Today's Avg
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#3B82F6' }}>
                  {chartData.filter(d => d.avgWait > 0).length > 0 
                    ? (chartData.reduce((sum, item) => sum + item.avgWait, 0) / chartData.filter(d => d.avgWait > 0).length).toFixed(1)
                    : '0.0'
                  } min
                </div>
                <div style={{ fontSize: 12, color: '#1E40AF', marginTop: 2 }}>
                  Across all periods
                </div>
              </div>
              
              <div style={{
                padding: '12px 16px',
                background: chartData.find(d => d.isActive) ? '#F0FDF4' : '#F8FAFC',
                border: `1px solid ${chartData.find(d => d.isActive) ? '#BBF7D0' : '#E2E8F0'}`,
                borderRadius: 8
              }}>
                <div style={{ fontSize: 11, color: chartData.find(d => d.isActive) ? '#14532D' : '#64748B', marginBottom: 4, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Current Period
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: chartData.find(d => d.isActive) ? '#16A34A' : '#94A3B8' }}>
                  {chartData.find(d => d.isActive)?.name || 'None'}
                </div>
                <div style={{ fontSize: 12, color: chartData.find(d => d.isActive) ? '#14532D' : '#94A3B8', marginTop: 2 }}>
                  {chartData.find(d => d.isActive)?.count || 0} records
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ 
          height: 400, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 12,
          color: '#94A3B8'
        }}>
          <Clock size={48} />
          <p style={{ fontSize: 16, fontWeight: 500 }}>No wait time data for today</p>
          <p style={{ fontSize: 13 }}>Data will appear as the day progresses</p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
});

// NEW: Smart Insights Side Panel Component
const SmartInsightsPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const today = useMemo(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }, []);

  const { data: insights, loading } = useSmartInsights(today);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: isOpen ? 0 : '-500px',
        width: '500px',
        maxWidth: '90vw',
        height: '100vh',
        background: '#FFFFFF',
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        transition: 'right 0.3s ease-out',
        overflowY: 'auto'
      }}>
        {/* Panel Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #E5E7EB',
          position: 'sticky',
          top: 0,
          background: '#FFFFFF',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                Smart Insights
              </h2>
              <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>
                AI-powered cafeteria analysis
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: 8,
                background: '#F3F4F6',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} color="#6B7280" />
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div style={{ padding: '24px' }}>
          {loading ? (
            <LoadingSpinner message="Loading insights..." />
          ) : insights ? (
            <>
              {/* Peak Hour */}
              {insights.peakHour && (
                <div style={{
                  padding: 16,
                  background: '#F9FAFB',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  marginBottom: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Clock size={18} color="#6366F1" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Peak Hour</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                    {insights.peakHour.hourFormatted || 'N/A'}
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>
                    Average Queue: {insights.peakHour.avgQueue ? Math.round(insights.peakHour.avgQueue) : 0} people
                  </div>
                </div>
              )}

              {/* Footfall Status */}
              <div style={{
                padding: 16,
                background: insights.footfallStatus === 'HIGH' ? '#FEF2F2' : insights.footfallStatus === 'LOW' ? '#FEF9C3' : '#F0FDF4',
                border: `1px solid ${insights.footfallStatus === 'HIGH' ? '#FCA5A5' : insights.footfallStatus === 'LOW' ? '#FDE047' : '#86EFAC'}`,
                borderRadius: 8,
                marginBottom: 16
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Users size={18} color={insights.footfallStatus === 'HIGH' ? '#DC2626' : insights.footfallStatus === 'LOW' ? '#CA8A04' : '#16A34A'} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Footfall Status</span>
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, color: insights.footfallStatus === 'HIGH' ? '#DC2626' : insights.footfallStatus === 'LOW' ? '#CA8A04' : '#16A34A', marginBottom: 8 }}>
                  {insights.footfallStatus}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  Current traffic level
                </div>
              </div>

              {/* Throughput */}
              {insights.throughput && (
                <div style={{
                  padding: 16,
                  background: '#F9FAFB',
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  marginBottom: 16
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <TrendingUp size={18} color="#6366F1" />
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>Throughput</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                    {insights.throughput.avgRate?.toFixed(1) || '0.0'} <span style={{ fontSize: 16, fontWeight: 400 }}>ppl/min</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280' }}>
                    Trend: {insights.throughput.trend || 'Unknown'}
                  </div>
                </div>
              )}

              {/* Counter Performance */}
              {insights.counters && Object.keys(insights.counters).length > 0 && (
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 12 }}>
                    Counter Performance
                  </h3>
                  {Object.entries(insights.counters).map(([name, stats]: [string, any]) => (
                    <div 
                      key={name}
                      style={{
                        padding: 12,
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: 8,
                        marginBottom: 12
                      }}
                    >
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                        {name}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>
                          <span style={{ fontWeight: 500 }}>Avg Queue:</span> {Math.round(stats.avgQueue || 0)} people
                        </div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>
                          <span style={{ fontWeight: 500 }}>Avg Wait:</span> {Math.round(stats.avgWaitTime || 0)} min
                        </div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>
                          <span style={{ fontWeight: 500 }}>Throughput:</span> {stats.throughput?.toFixed(1) || '0.0'} ppl/min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#6B7280', padding: '40px 20px' }}>
              No insights available
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Main Component
const CafeteriaScreen: React.FC = () => {
  const { 
    latestData, 
    loading, 
    error, 
    lastUpdate, 
    refetch,
    getCountersArray 
  } = useCafeteriaData(true, 30000);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInsightsPanelOpen, setIsInsightsPanelOpen] = useState(false);

  // Determine current meal period and set default date range
  const [globalFromDate, setGlobalFromDate] = useState(() => {
    const now = new Date();
    const hour = now.getHours();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Determine current meal period
    if (hour >= 8 && hour < 10) {
      // Breakfast
      const start = new Date(today);
      start.setHours(8, 0, 0, 0);
      return start.toISOString().slice(0, 16);
    } else if (hour >= 12 && hour < 14.5) {
      // Lunch
      const start = new Date(today);
      start.setHours(12, 0, 0, 0);
      return start.toISOString().slice(0, 16);
    } else if (hour >= 16 && hour < 18.5) {
      // Snacks
      const start = new Date(today);
      start.setHours(16, 0, 0, 0);
      return start.toISOString().slice(0, 16);
    } else if (hour >= 19 && hour < 23.5) {
      // Dinner
      const start = new Date(today);
      start.setHours(19, 0, 0, 0);
      return start.toISOString().slice(0, 16);
    } else {
      // Default to current hour
      return now.toISOString().slice(0, 16);
    }
  });

  const [globalToDate, setGlobalToDate] = useState(() => {
    const now = new Date();
    const hour = now.getHours();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Determine current meal period
    if (hour >= 8 && hour < 10) {
      // Breakfast
      const end = new Date(today);
      end.setHours(10, 0, 0, 0);
      return end.toISOString().slice(0, 16);
    } else if (hour >= 12 && hour < 14.5) {
      // Lunch
      const end = new Date(today);
      end.setHours(14, 30, 0, 0);
      return end.toISOString().slice(0, 16);
    } else if (hour >= 16 && hour < 18.5) {
      // Snacks
      const end = new Date(today);
      end.setHours(18, 30, 0, 0);
      return end.toISOString().slice(0, 16);
    } else if (hour >= 19 && hour < 23.5) {
      // Dinner
      const end = new Date(today);
      end.setHours(23, 30, 0, 0);
      return end.toISOString().slice(0, 16);
    } else {
      // Default to next hour
      const nextHour = new Date(now);
      nextHour.setHours(now.getHours() + 1, 0, 0, 0);
      return nextHour.toISOString().slice(0, 16);
    }
  });

  const counterConfig = useMemo(() => ({
    'TwoGood': {
      color: '#FF6B6B',
      image: 'https://i.postimg.cc/ncwZ51YH/TWO-GOOD.png',
      throughput: 28,
      peakTime: '12:30 PM'
    },
    'UttarDakshin': {
      color: '#F59E0B',
      image: 'https://i.postimg.cc/DyRhLznZ/UTTAR-DAKSHIN.png',
      throughput: 22,
      peakTime: '1:00 PM'
    },
    'Tandoor': {
      color: '#EC4899',
      image: 'https://i.postimg.cc/QCy3687Q/TANDOOR.png',
      throughput: 15,
      peakTime: '12:45 PM'
    }
  }), []);

  const counters: CounterDisplay[] = useMemo(() => {
    const apiCounters = getCountersArray();
    
    return apiCounters.map(counter => {
      const config = counterConfig[counter.counterName as keyof typeof counterConfig] || counterConfig['TwoGood'];
      
      return {
        name: counter.counterName,
        queueLength: counter.queueCount,
        avgWaitTime: counter.waitTimeMinutes,
        waitTimeText: counter.waitTimeText,
        status: counter.status,
        serviceStatus: counter.serviceStatus,
        color: config.color,
        image: config.image,
        throughput: config.throughput,
        peakTime: config.peakTime,
        location: counter.locationName,
        floor: counter.floor
      };
    });
  }, [getCountersArray, counterConfig]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>
        <style>{`${fontStyle} @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <LoadingSpinner message="Loading cafeteria data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh', 
        background: '#F8F9FA' 
      }}>
        <div style={{ 
          textAlign: 'center', 
          color: '#EF4444', 
          padding: 32, 
          background: '#FFF', 
          borderRadius: 12, 
          border: '1px solid #FEE2E2',
          maxWidth: 500
        }}>
          <AlertCircle size={48} color="#EF4444" style={{ margin: '0 auto 16px' }} />
          <p style={{ fontWeight: 500, marginBottom: 8, fontSize: 16 }}>Unable to load cafeteria data</p>
          <p style={{ fontSize: 13, marginBottom: 16, fontWeight: 400, color: '#6B7280' }}>{error}</p>
          <button 
            onClick={handleRefresh} 
            style={{ 
              padding: '10px 20px', 
              background: '#6366F1', 
              color: '#FFF', 
              borderRadius: 8, 
              border: 'none', 
              fontSize: 13, 
              fontWeight: 500, 
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#F8F9FA', minHeight: '100vh' }}>
      <style>{`
        ${fontStyle}
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Smart Insights Side Panel */}
      <SmartInsightsPanel isOpen={isInsightsPanelOpen} onClose={() => setIsInsightsPanelOpen(false)} />

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 4, letterSpacing: '-0.3px' }}>
              Cafeteria Insights Dashboard
            </h1>
            <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>
              Real-time queue monitoring and analytics
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 6,
              padding: '6px 12px',
              background: '#10B98115',
              borderRadius: 6
            }}>
              <div style={{ 
                width: 6, 
                height: 6, 
                borderRadius: '50%', 
                background: '#10B981',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ fontSize: 11, color: '#059669', fontWeight: 500 }}>
                Live • {formatLastUpdate(lastUpdate)}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              style={{
                padding: '6px 12px',
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: 6,
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                fontWeight: 500,
                color: '#6B7280',
                opacity: isRefreshing ? 0.6 : 1
              }}
            >
              <RefreshCw 
                size={14} 
                style={{ 
                  animation: isRefreshing ? 'spin 1s linear infinite' : 'none' 
                }} 
              />
              Refresh
            </button>
            {/* Smart Insights Button - Moved to Header */}
            <button
              onClick={() => setIsInsightsPanelOpen(true)}
              style={{
                padding: '8px 16px',
                background: '#0A7EA4',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(10, 126, 164, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(10, 126, 164, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(10, 126, 164, 0.3)';
              }}
            >
              <Sparkles size={16} />
              Smart Insights
            </button>
          </div>
        </div>
      </div>

      {/* KPI CARDS REMOVED AS PER REQUIREMENTS */}

      {/* Counter Cards */}
      {counters.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: 16, 
          marginBottom: 32 
        }}>
          {counters.map((counter, index) => (
            <CounterCard key={counter.name} counter={counter} index={index} />
          ))}
        </div>
      )}

      {/* Enhanced Analytics Charts */}
      {counters.length > 0 && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: 27,
            gap: 20,
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '0 0 auto' }}>
              <h2 style={{ 
                fontSize: 31, 
                fontWeight: 800, 
                color: '#111827', 
                marginBottom: 0, 
                transform: 'translateY(16px)' 
              }}>
                Insights Overview
              </h2>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: 10, 
              flexWrap: 'wrap',
              alignItems: 'flex-end',
              flex: '1 1 auto',
              justifyContent: 'flex-end',
              marginRight: 0
            }}>
              <DateTimePicker
                label="From Date & Time"
                value={globalFromDate}
                onChange={setGlobalFromDate}
                placeholder="Select start date"
              />
              
              <DateTimePicker
                label="To Date & Time"
                value={globalToDate}
                onChange={setGlobalToDate}
                placeholder="Select end date"
              />
            </div>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <EnhancedHourlyChart globalFromDate={globalFromDate} globalToDate={globalToDate} />
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', 
            gap: 20,
            marginBottom: 20
          }}>
            <WaitTimeChart />
            {/* COUNTER CORRELATION CHART REMOVED AS PER REQUIREMENTS */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CafeteriaScreen;