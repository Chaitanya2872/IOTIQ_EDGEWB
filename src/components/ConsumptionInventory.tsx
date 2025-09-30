import React, { useState, useEffect } from 'react';
import {
  Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart, PieChart, Pie, Cell
} from 'recharts';
import {
  RefreshCw, Calendar,
  ChevronLeft, ChevronRight, Layers,
  Package, Bell, Filter, ArrowUpDown,
  X, AlertCircle, Activity, TrendingUp, Shield
} from 'lucide-react';
import {
  useItems,
  useCategories
} from '../api/hooks';
import { 
  AnalyticsAPI,
  FootfallAPI,
  type ConsumptionTrendsResponse,
  type Item,
  type Category,
  type FootfallData
} from '../api/inventory';

// Enhanced Color palette
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',  
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#8b5cf6',
  dark: '#374151',
  light: '#f9fafb',
  muted: '#6b7280',
  accent1: '#06b6d4',
  accent2: '#84cc16',
  accent3: '#f97316'
};

const cardBackgrounds = {
  primary: '#eff6ff',
  success: '#f0fdf4',
  warning: '#fff7ed',
  danger: '#fef2f2',
  neutral: '#ffffff'
};

// Enhanced Tooltip
const ModernTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.98)', 
        backdropFilter: 'blur(10px)',
        color: COLORS.dark, 
        padding: '16px', 
        borderRadius: '12px',
        border: `1px solid ${COLORS.light}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        fontSize: '13px'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '8px', color: COLORS.dark }}>
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '6px'
          }}>
            <div style={{ 
              width: '10px', 
              height: '10px', 
              borderRadius: '50%', 
              backgroundColor: entry.color
            }} />
            <span style={{ flex: 1, color: COLORS.muted, fontSize: '12px' }}>
              {entry.name}:
            </span>
            <span style={{ fontWeight: '600', color: COLORS.dark }}>
              {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Card Component
const Card: React.FC<{ children: React.ReactNode; background?: string }> = ({ children, background }) => {
  return (
    <div style={{
      backgroundColor: background || 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
      border: `1px solid ${COLORS.light}`,
      marginBottom: '20px'
    }}>
      {children}
    </div>
  );
};

// Notification Panel Component
const NotificationPanel: React.FC<{ 
  notifications: any[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}> = ({ notifications, onClose, onMarkAsRead, onMarkAllAsRead }) => {
  const getSeverityColor = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return COLORS.danger;
      case 'high': return COLORS.warning;
      case 'medium': return COLORS.info;
      default: return COLORS.muted;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch(severity?.toLowerCase()) {
      case 'critical': return <AlertCircle style={{ width: '16px', height: '16px' }} />;
      case 'high': return <AlertCircle style={{ width: '16px', height: '16px' }} />;
      default: return <Bell style={{ width: '16px', height: '16px' }} />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '420px',
      height: '100vh',
      backgroundColor: 'white',
      boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '20px',
        borderBottom: `1px solid ${COLORS.light}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: COLORS.dark }}>
          Notifications ({notifications.length})
        </h3>
        <div style={{ display: 'flex', gap: '12px' }}>
          {notifications.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              style={{
                padding: '6px 12px',
                backgroundColor: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Mark All Read
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: COLORS.muted
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>
      </div>
      
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px'
      }}>
        {notifications.length === 0 ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: COLORS.muted
          }}>
            <Bell style={{ width: '48px', height: '48px', margin: '0 auto', opacity: 0.3 }} />
            <p style={{ marginTop: '16px', fontSize: '15px' }}>No new notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                padding: '16px',
                marginBottom: '12px',
                backgroundColor: notification.read ? 'white' : cardBackgrounds.primary,
                border: `1px solid ${COLORS.light}`,
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <span style={{ color: getSeverityColor(notification.severity) }}>
                  {getSeverityIcon(notification.severity)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: COLORS.dark,
                    marginBottom: '6px'
                  }}>
                    {notification.title || notification.type}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: COLORS.muted,
                    lineHeight: '1.4'
                  }}>
                    {notification.message}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: COLORS.muted,
                    marginTop: '8px'
                  }}>
                    {notification.timestamp || new Date().toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Enhanced Core Inventory Stock Table Component
const CoreInventoryTable: React.FC<{ 
  items: Item[]; 
  categories: Category[];
  onRefresh: () => void;
}> = ({ items, categories, onRefresh }) => {
  const [stockLevels, setStockLevels] = useState<any[]>([]);
  const [filteredLevels, setFilteredLevels] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const itemsPerPage = 15;

  // Get the latest consumption month from all items
  const getLatestConsumptionMonth = () => {
    let latestDate = '';
    items.forEach(item => {
      if (Array.isArray(item.consumptionRecords) && item.consumptionRecords.length > 0) {
        const dates = Array.isArray(item.consumptionRecords)
          ? item.consumptionRecords.map(record => record.date).filter(Boolean)
          : [];
        if (dates.length > 0) {
          const maxDate = dates.sort().reverse()[0];
          if (maxDate > latestDate) {
            latestDate = maxDate;
          }
        }
      }
      if (item.lastConsumptionDate && item.lastConsumptionDate > latestDate) {
        latestDate = item.lastConsumptionDate;
      }
    });
    
    if (latestDate) {
      const date = new Date(latestDate);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    
    // Default to current month if no consumption data
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  // Get month-wise consumption for an item
  const getMonthConsumption = (item: Item, month: string) => {
    if (!Array.isArray(item.consumptionRecords)) return 0;
    
    return item.consumptionRecords
      .filter(record => {
        if (!record.date) return false;
        const recordMonth = record.date.substring(0, 7); // Get YYYY-MM
        return recordMonth === month;
      })
      .reduce((sum, record) => sum + (record.consumedQuantity || 0), 0);
  };

  // Initialize selected month
  useEffect(() => {
    if (!selectedMonth && items.length > 0) {
      setSelectedMonth(getLatestConsumptionMonth());
    }
  }, [items, selectedMonth]);

  useEffect(() => {
    if (items && items.length > 0) {
      const levels = items.map(item => {
        const category = categories.find(c => c.id === item.categoryId);
        const openingStock = Number(item.openingStock ?? 0);
        const currentStock = Number(item.currentQuantity ?? 0);
        
        // Properly fetch received and consumed stock
        const totalReceivedStock = Number(item.totalReceivedStock ?? 0);
        const totalConsumedStock = Number(item.totalConsumedStock ?? 0);
        const monthReceivedStock = Number(item.monthReceivedStock ?? 0);
        const monthConsumedStock = selectedMonth ? getMonthConsumption(item, selectedMonth) : Number(item.monthConsumedStock ?? 0);
        
        let coverageDays = Number(item.coverageDays ?? 0);
        if (coverageDays === 0 && item.avgDailyConsumption) {
          const avgDaily = Number(item.avgDailyConsumption);
          if (avgDaily > 0) {
            coverageDays = Math.floor(currentStock / avgDaily);
          }
        }
        
        let status = item.stockAlertLevel || 'optimal';
        if (!item.stockAlertLevel) {
          if (coverageDays <= 3) status = 'critical';
          else if (coverageDays <= 7) status = 'low';
          else if (coverageDays <= 14) status = 'reorder';
          else if (coverageDays > 90) status = 'excess';
        }

        return {
          id: item.id,
          itemName: item.itemName,
          itemCode: item.itemCode || `ITM${String(item.id).padStart(4, '0')}`,
          category: category?.categoryName || 'Unknown',
          openingStock,
          totalReceivedStock,
          totalConsumedStock,
          monthReceivedStock,
          monthConsumedStock,
          closingStock: currentStock,
          minLevel: Number(item.minStockLevel) || 0,
          maxLevel: Number(item.maxStockLevel) || 0,
          reorderLevel: Number(item.reorderLevel) || 0,
          coverageDays,
          stockValue: Number(item.totalValue ?? 0),
          status,
          unitPrice: Number(item.unitPrice || 0),
          unitOfMeasurement: item.unitOfMeasurement || 'units',
          lastUpdated: item.updated_at || new Date().toISOString()
        };
      });

      setStockLevels(levels);
    }
  }, [items, categories, selectedMonth]);

  useEffect(() => {
    let filtered = [...stockLevels];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      const categoryName = categories.find(c => c.id === selectedCategory)?.categoryName;
      if (categoryName) {
        filtered = filtered.filter(item => item.category === categoryName);
      }
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aVal = a[sortField];
        let bVal = b[sortField];
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredLevels(filtered);
    setCurrentPage(1);
  }, [stockLevels, searchTerm, selectedCategory, selectedStatus, categories, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredLevels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredLevels.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'critical': return COLORS.danger;
      case 'low': return COLORS.warning;
      case 'reorder': return COLORS.info;
      case 'optimal': return COLORS.success;
      case 'excess': return COLORS.primary;
      default: return COLORS.muted;
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Get available months from consumption records
  const getAvailableMonths = () => {
    const months = new Set<string>();
    items.forEach(item => {
      if (Array.isArray(item.consumptionRecords)) {
        item.consumptionRecords.forEach(record => {
          if (record.date) {
            months.add(record.date.substring(0, 7));
          }
        });
      }
    });
    return Array.from(months).sort().reverse();
  };

  const SortableHeader: React.FC<{ field: string; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      onClick={() => handleSort(field)}
      style={{ 
        padding: '12px', 
        textAlign: 'left', 
        color: COLORS.dark, 
        cursor: 'pointer', 
        userSelect: 'none',
        position: 'relative',
        backgroundColor: sortField === field ? cardBackgrounds.primary : 'transparent'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {children}
        <ArrowUpDown style={{ 
          width: '14px', 
          height: '14px',
          color: sortField === field ? COLORS.primary : COLORS.muted,
          transform: sortField === field && sortOrder === 'desc' ? 'rotate(180deg)' : 'none'
        }} />
      </div>
    </th>
  );

  return (
    <Card>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.dark, margin: 0 }}>
            <Layers style={{ width: '20px', height: '20px', display: 'inline', marginRight: '8px', verticalAlign: 'middle', color: COLORS.primary }} />
            Core Inventory Stock Levels
          </h2>
          <button
            onClick={onRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            <RefreshCw style={{ width: '14px', height: '14px' }} />
            Refresh
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter style={{ width: '16px', height: '16px', color: COLORS.muted }} />
          
          <input
            type="text"
            placeholder="Search items, codes, categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '8px 12px',
              border: `1px solid ${COLORS.light}`,
              borderRadius: '8px',
              fontSize: '13px'
            }}
          />

          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            style={{
              padding: '8px 12px',
              border: `1px solid ${COLORS.light}`,
              borderRadius: '8px',
              fontSize: '13px',
              minWidth: '150px'
            }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              border: `1px solid ${COLORS.light}`,
              borderRadius: '8px',
              fontSize: '13px',
              minWidth: '120px'
            }}
          >
            <option value="all">All Status</option>
            <option value="critical">Critical</option>
            <option value="low">Low</option>
            <option value="reorder">Reorder</option>
            <option value="optimal">Optimal</option>
            <option value="excess">Excess</option>
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              padding: '8px 12px',
              border: `1px solid ${COLORS.light}`,
              borderRadius: '8px',
              fontSize: '13px',
              minWidth: '140px'
            }}
          >
            {getAvailableMonths().map(month => (
              <option key={month} value={month}>
                {new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: cardBackgrounds.neutral, borderBottom: `2px solid ${COLORS.light}` }}>
              <SortableHeader field="lastUpdated">Date</SortableHeader>
              <SortableHeader field="itemCode">Item Code</SortableHeader>
              <SortableHeader field="itemName">Item Name</SortableHeader>
              <SortableHeader field="category">Category</SortableHeader>
              <SortableHeader field="openingStock">Opening Stock</SortableHeader>
              <SortableHeader field="monthReceivedStock">Received ({selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short' }) : 'Month'})</SortableHeader>
              <SortableHeader field="monthConsumedStock">Consumed ({selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'short' }) : 'Month'})</SortableHeader>
              <SortableHeader field="closingStock">Closing Stock (SIH)</SortableHeader>
              <SortableHeader field="unitPrice">Price</SortableHeader>
              <SortableHeader field="stockValue">Inventory Value</SortableHeader>
              <SortableHeader field="coverageDays">Coverage Days</SortableHeader>
              <SortableHeader field="status">Stock Alert Risk</SortableHeader>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map(item => (
              <tr 
                key={item.id} 
                style={{ 
                  borderBottom: `1px solid ${COLORS.light}`,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = cardBackgrounds.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{item.lastUpdated?.slice(0,10) || '-'}</td>
                <td style={{ padding: '12px', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{item.itemCode}</td>
                <td style={{ padding: '12px', fontWeight: '500', color: COLORS.primary, minWidth: '180px' }}>
                  {item.itemName}
                </td>
                <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>{item.category}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{item.openingStock.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: COLORS.success, fontWeight: '500' }}>
                  {item.monthReceivedStock > 0 ? `+${item.monthReceivedStock.toLocaleString()}` : '0'}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: COLORS.danger, fontWeight: '500' }}>
                  {item.monthConsumedStock > 0 ? `-${item.monthConsumedStock.toLocaleString()}` : '0'}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                  {item.closingStock.toLocaleString()} <span style={{ color: COLORS.muted, fontSize: '11px' }}>{item.unitOfMeasurement}</span>
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>${item.stockValue.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{
                    fontWeight: '600',
                    color: item.coverageDays <= 10 ? COLORS.danger : item.coverageDays <= 20 ? COLORS.warning : COLORS.success
                  }}>
                    {item.coverageDays} days
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    backgroundColor: getStatusColor(item.status) + '20',
                    color: getStatusColor(item.status),
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    textTransform: 'uppercase'
                  }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Pagination */}
      {filteredLevels.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          padding: '16px',
          backgroundColor: cardBackgrounds.neutral,
          borderRadius: '8px'
        }}>
          <div style={{ fontSize: '13px', color: COLORS.muted }}>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredLevels.length)} of {filteredLevels.length} items
            {selectedMonth && (
              <span style={{ marginLeft: '8px', color: COLORS.primary }}>
                for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '8px 12px',
                backgroundColor: currentPage === 1 ? COLORS.light : 'white',
                border: `1px solid ${COLORS.light}`,
                borderRadius: '6px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft style={{ width: '14px', height: '14px' }} />
              Previous
            </button>
            
            <span style={{ padding: '8px 16px', fontSize: '12px', color: COLORS.dark, fontWeight: '500' }}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '8px 12px',
                backgroundColor: currentPage === totalPages ? COLORS.light : 'white',
                border: `1px solid ${COLORS.light}`,
                borderRadius: '6px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Next
              <ChevronRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

// Enhanced Monthly Consumption Component
const MonthlyConsumption: React.FC<{
  categories: Category[];
  items: Item[];
  dateRange: { start: string; end: string };
}> = ({ categories, items, dateRange }) => {
  const [consumptionData, setConsumptionData] = useState<ConsumptionTrendsResponse | null>(null);
  const [footfallData, setFootfallData] = useState<FootfallData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [binMode, setBinMode] = useState<'full' | 'first15' | 'last15'>('full');
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  // Fetch consumption data
  const fetchConsumptionData = async () => {
    setLoading(true);
    try {
      let data;
      
      if (selectedCategory) {
        console.log('Fetching data for categoryId:', selectedCategory);
        data = await AnalyticsAPI.consumptionTrends(
          'daily',
          'category',
          selectedCategory,
          dateRange.start,
          dateRange.end
        );
      } else {
        console.log('Fetching all categories data');
        data = await AnalyticsAPI.consumptionTrends(
          'daily',
          'category',
          undefined,
          dateRange.start,
          dateRange.end
        );
      }
      
      console.log('API Response:', {
        hasData: !!data,
        dataLength: data?.data?.length || 0,
        firstItem: data?.data?.[0]
      });
      
      setConsumptionData(data);
    } catch (error) {
      console.error('Error fetching consumption data:', error);
      setConsumptionData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch footfall data
  const fetchFootfallData = async () => {
    try {
      const response = await FootfallAPI.list(dateRange.start, dateRange.end, undefined, 0, 500);
      if (response.success && response.data) {
        setFootfallData(response.data);
        console.log('Fetched footfall data:', response.data.length, 'records');
      }
    } catch (error) {
      console.error('Error fetching footfall data:', error);
      setFootfallData([]);
    }
  };

  // Fetch data when dependencies change
  useEffect(() => {
    fetchConsumptionData();
    fetchFootfallData();
  }, [selectedCategory, selectedItem, dateRange.start, dateRange.end]);

  // Process chart data with proper filtering
  useEffect(() => {
    const processed: any[] = [];
    const dateMap = new Map<string, any>();

    // Get the selected category and item names
    const selectedCategoryName = selectedCategory 
      ? categories.find(c => c.id === selectedCategory)?.categoryName 
      : null;
    
    const selectedItemName = selectedItem 
      ? items.find(i => i.id === selectedItem)?.itemName
      : null;

    console.log('Processing data filters:', {
      categoryId: selectedCategory,
      categoryName: selectedCategoryName,
      itemId: selectedItem,
      itemName: selectedItemName,
      binMode,
      dateRange,
      consumptionDataPoints: consumptionData?.data?.length || 0
    });

    // Parse date range for filtering
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    // Process consumption data if available
    if (consumptionData?.data && consumptionData.data.length > 0) {
      
      consumptionData.data.forEach(dataItem => {
        // Skip if category doesn't match (when filtering by category)
        if (selectedCategory && 
            dataItem.category !== selectedCategoryName && 
            dataItem.categoryName !== selectedCategoryName) {
          return;
        }

        // Process each data point
        dataItem.dataPoints?.forEach((point: any) => {
          const dateStr = point.date || point.startDate || point.periodLabel || '';
          if (!dateStr) return;

          // Parse the date
          const date = new Date(dateStr);
          
          // Filter by date range - IMPORTANT: Skip if outside selected range
          if (date < startDate || date > endDate) return;
          
          const day = date.getDate();

          // Apply bin filtering for days 1-15 or 16-31
          if (binMode === 'first15' && day > 15) return;
          if (binMode === 'last15' && day <= 15) return;

          const dateKey = dateStr.slice(0, 10);
          
          // Initialize date entry if not exists
          if (!dateMap.has(dateKey)) {
            dateMap.set(dateKey, {
              date: dateKey,
              consumption: 0,
              employeeCount: 0,
              visitorCount: 0,
              totalFootfall: 0,
              itemDetails: []
            });
          }

          const dataPoint = dateMap.get(dateKey)!;
          
          // Check if this point has item-level data
          if (point.items && Array.isArray(point.items)) {
            // Process item-level data within the point
            point.items.forEach((item: any) => {
              // If filtering by item, only include matching items
              if (selectedItem) {
                if (item.itemId === selectedItem || item.itemName === selectedItemName) {
                  dataPoint.consumption += Number(item.consumption || item.quantity || 0);
                  dataPoint.itemDetails.push({
                    itemId: item.itemId,
                    itemName: item.itemName,
                    quantity: Number(item.consumption || item.quantity || 0)
                  });
                }
              } else {
                // Include all items if no specific item is selected
                dataPoint.consumption += Number(item.consumption || item.quantity || 0);
              }
            });
          } else {
            // If no item-level breakdown, use the point's total consumption
            // Only add if we're not filtering by a specific item, or if this matches our item
            if (!selectedItem) {
              dataPoint.consumption += Number(point.consumption || point.quantity || 0);
            } else if (point.itemId === selectedItem || point.itemName === selectedItemName) {
              dataPoint.consumption += Number(point.consumption || point.quantity || 0);
            }
          }
        });
      });
    }

    // Add footfall data with bin filtering and date range filtering
    if (footfallData && footfallData.length > 0) {
      footfallData.forEach(record => {
        const recordDate = new Date(record.date);
        
        // Filter by date range - IMPORTANT: Skip if outside selected range
        if (recordDate < startDate || recordDate > endDate) return;
        
        const dateKey = record.date.slice(0, 10);
        const day = recordDate.getDate();

        // Apply bin filtering
        if (binMode === 'first15' && day > 15) return;
        if (binMode === 'last15' && day <= 15) return;

        // Initialize if doesn't exist
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, {
            date: dateKey,
            consumption: 0,
            employeeCount: 0,
            visitorCount: 0,
            totalFootfall: 0,
            itemDetails: []
          });
        }

        const dataPoint = dateMap.get(dateKey)!;
        dataPoint.employeeCount = record.employeeCount || 0;
        dataPoint.visitorCount = record.visitorCount || 0;
        dataPoint.totalFootfall = record.totalFootfall || 0;
      });
    }

    // Convert to array and sort by date
    dateMap.forEach(value => {
      // Remove itemDetails from final data (was just for processing)
      const { itemDetails, ...cleanData } = value;
      processed.push(cleanData);
    });
    
    processed.sort((a, b) => a.date.localeCompare(b.date));

    console.log('Final processed data:', {
      totalPoints: processed.length,
      dateRange: { start: dateRange.start, end: dateRange.end },
      totalConsumption: processed.reduce((sum, p) => sum + p.consumption, 0),
      hasConsumption: processed.some(p => p.consumption > 0),
      hasFootfall: processed.some(p => p.employeeCount > 0 || p.visitorCount > 0),
      sampleData: processed.slice(0, 3)
    });
    
    setChartData(processed);
  }, [consumptionData, footfallData, binMode, selectedCategory, selectedItem, categories, items, dateRange]);

  // Get display name for chart
  const getDisplayName = () => {
    if (selectedItem) {
      const item = items.find(i => i.id === selectedItem);
      return item?.itemName || 'Selected Item';
    }
    if (selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory);
      return cat?.categoryName || 'Selected Category';
    }
    return 'All Categories';
  };

  return (
    <Card>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.dark, margin: '0 0 16px 0' }}>
          <Package style={{ width: '20px', height: '20px', display: 'inline', marginRight: '8px', verticalAlign: 'middle', color: COLORS.success }} />
          Consumption & - {getDisplayName()}
        </h2>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Category/Item Selector */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={selectedCategory || ''}
              onChange={(e) => {
                const newCategoryId = e.target.value ? Number(e.target.value) : null;
                console.log('Category selected:', newCategoryId);
                setSelectedCategory(newCategoryId);
                setSelectedItem(null); // Clear item when category changes
              }}
              style={{
                padding: '8px 12px',
                border: `1px solid ${COLORS.light}`,
                borderRadius: '8px',
                fontSize: '13px',
                minWidth: '160px'
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
              ))}
            </select>

            <select
              value={selectedItem || ''}
              onChange={(e) => {
                const newItemId = e.target.value ? Number(e.target.value) : null;
                console.log('Item selected:', newItemId);
                setSelectedItem(newItemId);
              }}
              disabled={!selectedCategory}
              style={{
                padding: '8px 12px',
                border: `1px solid ${COLORS.light}`,
                borderRadius: '8px',
                fontSize: '13px',
                minWidth: '160px',
                opacity: selectedCategory ? 1 : 0.5,
                cursor: selectedCategory ? 'pointer' : 'not-allowed'
              }}
            >
              <option value="">All Items in Category</option>
              {items
                .filter(item => selectedCategory && item.categoryId === selectedCategory)
                .map(item => (
                  <option key={item.id} value={item.id}>{item.itemName}</option>
                ))}
            </select>
          </div>

          {/* Bin Mode Selector */}
          <div style={{ display: 'flex', gap: '0', marginLeft: 'auto' }}>
            <button
              onClick={() => setBinMode('full')}
              style={{
                padding: '8px 16px',
                backgroundColor: binMode === 'full' ? COLORS.primary : 'white',
                color: binMode === 'full' ? 'white' : COLORS.dark,
                border: `1px solid ${binMode === 'full' ? COLORS.primary : COLORS.light}`,
                borderRadius: '8px 0 0 8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              Full Month
            </button>
            <button
              onClick={() => setBinMode('first15')}
              style={{
                padding: '8px 16px',
                backgroundColor: binMode === 'first15' ? COLORS.primary : 'white',
                color: binMode === 'first15' ? 'white' : COLORS.dark,
                border: `1px solid ${binMode === 'first15' ? COLORS.primary : COLORS.light}`,
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                marginLeft: '-1px'
              }}
            >
              Days 1-15
            </button>
            <button
              onClick={() => setBinMode('last15')}
              style={{
                padding: '8px 16px',
                backgroundColor: binMode === 'last15' ? COLORS.primary : 'white',
                color: binMode === 'last15' ? 'white' : COLORS.dark,
                border: `1px solid ${binMode === 'last15' ? COLORS.primary : COLORS.light}`,
                borderRadius: '0 8px 8px 0',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500',
                marginLeft: '-1px'
              }}
            >
              Days 16-31
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div style={{ 
          height: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: cardBackgrounds.neutral,
          borderRadius: '10px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <RefreshCw style={{ 
              width: '32px', 
              height: '32px', 
              animation: 'spin 2s linear infinite', 
              margin: '0 auto',
              color: COLORS.primary
            }} />
            <div style={{ marginTop: '12px', fontSize: '14px', color: COLORS.muted }}>
              Loading consumption data...
            </div>
          </div>
        </div>
      ) : chartData.length === 0 ? (
        <div style={{ 
          height: '400px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: cardBackgrounds.neutral,
          borderRadius: '10px'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Package style={{ 
              width: '48px', 
              height: '48px', 
              margin: '0 auto',
              color: COLORS.muted,
              opacity: 0.5
            }} />
            <div style={{ marginTop: '16px', fontSize: '15px', color: COLORS.muted, fontWeight: '500' }}>
              No data available for selected filters
            </div>
            <div style={{ marginTop: '8px', fontSize: '13px', color: COLORS.muted }}>
              {binMode === 'first15' ? 'Days 1-15' : binMode === 'last15' ? 'Days 16-31' : 'Full Month'}
              {selectedCategory && ` • ${getDisplayName()}`}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '12px',
            padding: '12px',
            backgroundColor: cardBackgrounds.primary,
            borderRadius: '8px'
          }}>
            <span style={{ fontSize: '13px', color: COLORS.muted, fontWeight: '500' }}>
              Showing {chartData.length} days of data
            </span>
            <span style={{ fontSize: '13px', color: COLORS.primary, fontWeight: '600' }}>
              {binMode === 'first15' ? 'Days 1-15' : binMode === 'last15' ? 'Days 16-31' : 'Full Month'}
            </span>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }} 
                angle={-45} 
                textAnchor="end" 
                height={70}
                tickFormatter={(value) => {
                  // Format date as MM/DD
                  const date = new Date(value);
                  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
                }}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} label={{ value: 'Quantity', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} label={{ value: 'Footfall', angle: 90, position: 'insideRight', style: { fontSize: 11 } }} />
              <Tooltip content={<ModernTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              
              <Bar
                yAxisId="left"
                dataKey="consumption"
                fill={COLORS.accent2}
                opacity={0.9}
                name={`${getDisplayName()} (Qty)`}
                radius={[2, 2, 0, 0]}
              />
              
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="employeeCount"
                stroke={COLORS.primary}
                strokeWidth={3}
                dot={{ r: 4, fill: COLORS.primary }}
                name="Employees"
              />
              
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="visitorCount"
                stroke={COLORS.accent3}
                strokeWidth={3}
                strokeDasharray="6 6"
                dot={{ r: 4, fill: COLORS.accent3 }}
                name="Visitors"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

// Main Component
const ConsumptionInventory: React.FC = () => {
  const { data: categories = [], refresh: refreshCategories } = useCategories();
  const { data: items = [], refresh: refreshItems } = useItems();
  const [dateRange, setDateRange] = useState({
    start: '2025-01-01',
    end: '2025-07-31'
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/statistics/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.read).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    await Promise.all([refreshCategories(), refreshItems()]);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/statistics/notifications/${id}/read`, { method: 'PUT' });
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/statistics/notifications/read-all', { method: 'PUT' });
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '20px' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
      
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        {/* Header */}
        <Card background={cardBackgrounds.neutral}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              margin: 0,
              color: COLORS.dark
            }}>
              Consumption & Footfall Trends
            </h1>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Calendar style={{ width: '16px', height: '16px', color: COLORS.primary }} />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${COLORS.light}`,
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              />
              <span style={{ color: COLORS.muted, fontSize: '13px', fontWeight: '500' }}>to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${COLORS.light}`,
                  borderRadius: '6px',
                  fontSize: '13px'
                }}
              />
              
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                style={{
                  position: 'relative',
                  padding: '10px',
                  backgroundColor: unreadCount > 0 ? COLORS.warning + '20' : 'white',
                  border: `1px solid ${COLORS.light}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <Bell style={{ 
                  width: '20px', 
                  height: '20px', 
                  color: unreadCount > 0 ? COLORS.warning : COLORS.dark,
                  animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
                }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    backgroundColor: COLORS.danger,
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 7px',
                    borderRadius: '12px',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </Card>

        {/* Monthly Consumption */}
        <MonthlyConsumption 
          categories={categories} 
          items={items}
          dateRange={dateRange}
        />

        {/* Core Inventory Stock Table */}
        <CoreInventoryTable 
          items={items} 
          categories={categories} 
          onRefresh={handleRefresh}
        />

        {/* Notification Panel */}
        {showNotifications && (
          <NotificationPanel
            notifications={notifications}
            onClose={() => setShowNotifications(false)}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
          />
        )}
      </div>
    </div>
  );
};

export default ConsumptionInventory;