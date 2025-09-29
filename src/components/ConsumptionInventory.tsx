import React, { useState, useEffect } from 'react';
import {
  Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ComposedChart
} from 'recharts';
import {
  RefreshCw, Calendar,
  ChevronLeft, ChevronRight, Layers,
  Package, Bell,
  X, AlertCircle
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

// Color palette
const COLORS = {
  primary: '#60a5fa',
  success: '#86efac',  
  warning: '#fdba74',
  danger: '#fca5a5',
  info: '#93c5fd',
  dark: '#64748b',
  light: '#f8fafc',
  muted: '#94a3b8'
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
        padding: '12px', 
        borderRadius: '8px',
        border: `1px solid ${COLORS.light}`,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '6px', color: COLORS.dark }}>
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            marginBottom: '4px'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: entry.color
            }} />
            <span style={{ flex: 1, color: COLORS.muted, fontSize: '11px' }}>
              {entry.name}:
            </span>
            <span style={{ fontWeight: '500', color: COLORS.dark }}>
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
      borderRadius: '10px',
      padding: '18px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
      border: `1px solid ${COLORS.light}`,
      marginBottom: '16px'
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
      case 'critical': return <AlertCircle style={{ width: '14px', height: '14px' }} />;
      case 'high': return <AlertCircle style={{ width: '14px', height: '14px' }} />;
      default: return <Bell style={{ width: '14px', height: '14px' }} />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '400px',
      height: '100vh',
      backgroundColor: 'white',
      boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${COLORS.light}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: COLORS.dark }}>
          Notifications ({notifications.length})
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {notifications.length > 0 && (
            <button
              onClick={onMarkAllAsRead}
              style={{
                padding: '4px 8px',
                backgroundColor: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              Mark All Read
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              padding: '4px',
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
        padding: '8px'
      }}>
        {notifications.length === 0 ? (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: COLORS.muted
          }}>
            <Bell style={{ width: '48px', height: '48px', margin: '0 auto', opacity: 0.3 }} />
            <p style={{ marginTop: '16px', fontSize: '14px' }}>No new notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: notification.read ? 'white' : cardBackgrounds.primary,
                border: `1px solid ${COLORS.light}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => onMarkAsRead(notification.id)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <span style={{ color: getSeverityColor(notification.severity) }}>
                  {getSeverityIcon(notification.severity)}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: COLORS.dark,
                    marginBottom: '4px'
                  }}>
                    {notification.title || notification.type}
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: COLORS.muted,
                    lineHeight: '1.4'
                  }}>
                    {notification.message}
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    color: COLORS.muted,
                    marginTop: '6px'
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

// Core Inventory Stock Table Component
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
  const itemsPerPage = 15;

  const totalPages = Math.ceil(filteredLevels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredLevels.slice(startIndex, endIndex);

  useEffect(() => {
    if (items && items.length > 0) {
      const levels = items.map(item => {
        const category = categories.find(c => c.id === item.categoryId);
        const openingStock = Number(item.openingStock ?? 0);
        const currentStock = Number(item.currentQuantity ?? 0);
        
        let receivedStock = Number(item.receivedStock ?? 0);
        let consumedStock = Number(item.consumedQuantity ?? 0);
        
        if (consumedStock === 0 && currentStock < openingStock) {
          consumedStock = openingStock - currentStock;
        }
        
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
          receivedStock,
          consumedStock,
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
  }, [items, categories]);

  useEffect(() => {
    let filtered = [...stockLevels];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
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

    setFilteredLevels(filtered);
    setCurrentPage(1);
  }, [stockLevels, searchTerm, selectedCategory, selectedStatus, categories]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return COLORS.danger;
      case 'low': return COLORS.warning;
      case 'reorder': return COLORS.info;
      case 'optimal': return COLORS.success;
      case 'excess': return COLORS.primary;
      default: return COLORS.muted;
    }
  };

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.dark, margin: 0 }}>
            <Layers style={{ width: '18px', height: '18px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: COLORS.primary }} />
            Core Inventory Stock Levels
          </h2>
          <button
            onClick={onRefresh}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              backgroundColor: COLORS.primary,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <RefreshCw style={{ width: '12px', height: '12px' }} />
            Refresh
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1',
              minWidth: '150px',
              padding: '6px 10px',
              border: `1px solid ${COLORS.light}`,
              borderRadius: '6px',
              fontSize: '12px'
            }}
          />

          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
            style={{
              padding: '6px 10px',
              border: `1px solid ${COLORS.light}`,
              borderRadius: '6px',
              fontSize: '12px'
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
              padding: '6px 10px',
              border: `1px solid ${COLORS.light}`,
              borderRadius: '6px',
              fontSize: '12px'
            }}
          >
            <option value="all">All Status</option>
            <option value="critical">Critical</option>
            <option value="low">Low</option>
            <option value="reorder">Reorder</option>
            <option value="optimal">Optimal</option>
            <option value="excess">Excess</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ backgroundColor: cardBackgrounds.neutral, borderBottom: `2px solid ${COLORS.light}` }}>
              <th style={{ padding: '8px', textAlign: 'left', color: COLORS.dark, whiteSpace: 'nowrap' }}>Date</th>
              <th style={{ padding: '8px', textAlign: 'left', color: COLORS.dark, whiteSpace: 'nowrap' }}>Item Code</th>
              <th style={{ padding: '8px', textAlign: 'left', color: COLORS.dark, minWidth: '150px' }}>Item Name</th>
              <th style={{ padding: '8px', textAlign: 'left', color: COLORS.dark, whiteSpace: 'nowrap' }}>Category</th>
              <th style={{ padding: '8px', textAlign: 'right', color: COLORS.dark, whiteSpace: 'nowrap' }}>Opening Stock</th>
              <th style={{ padding: '8px', textAlign: 'right', color: COLORS.dark, whiteSpace: 'nowrap' }}>Received Stock</th>
              <th style={{ padding: '8px', textAlign: 'right', color: COLORS.dark, whiteSpace: 'nowrap' }}>Consumed Stock</th>
              <th style={{ padding: '8px', textAlign: 'right', color: COLORS.dark, whiteSpace: 'nowrap' }}>Closing Stock (SIH)</th>
              <th style={{ padding: '8px', textAlign: 'right', color: COLORS.dark, whiteSpace: 'nowrap' }}>Unit Price</th>
              <th style={{ padding: '8px', textAlign: 'right', color: COLORS.dark, whiteSpace: 'nowrap' }}>Inventory Value</th>
              <th style={{ padding: '8px', textAlign: 'center', color: COLORS.dark, whiteSpace: 'nowrap' }}>Coverage Days</th>
              <th style={{ padding: '8px', textAlign: 'center', color: COLORS.dark, whiteSpace: 'nowrap' }}>Stock Alert Risk</th>
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
                <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>{item.lastUpdated?.slice(0,10) || '-'}</td>
                <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>{item.itemCode}</td>
                <td style={{ padding: '6px', fontWeight: '500', color: COLORS.primary }}>
                  {item.itemName}
                </td>
                <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>{item.category}</td>
                <td style={{ padding: '6px', textAlign: 'right' }}>{item.openingStock}</td>
                <td style={{ padding: '6px', textAlign: 'right', color: COLORS.success, fontWeight: '500' }}>
                  {item.receivedStock > 0 ? `+${item.receivedStock}` : '0'}
                </td>
                <td style={{ padding: '6px', textAlign: 'right', color: COLORS.danger }}>
                  {item.consumedStock > 0 ? `-${item.consumedStock}` : '0'}
                </td>
                <td style={{ padding: '6px', textAlign: 'right', fontWeight: '600' }}>
                  {item.closingStock} {item.unitOfMeasurement}
                </td>
                <td style={{ padding: '6px', textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                <td style={{ padding: '6px', textAlign: 'right' }}>${item.stockValue.toLocaleString()}</td>
                <td style={{ padding: '6px', textAlign: 'center' }}>
                  <span style={{
                    fontWeight: '500',
                    color: item.coverageDays <= 10 ? COLORS.danger : item.coverageDays <= 20 ? COLORS.warning : COLORS.success
                  }}>
                    {item.coverageDays} days
                  </span>
                </td>
                <td style={{ padding: '6px', textAlign: 'center' }}>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    backgroundColor: getStatusColor(item.status) + '20',
                    color: getStatusColor(item.status),
                    fontWeight: '500',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredLevels.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          padding: '12px',
          backgroundColor: cardBackgrounds.neutral,
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: '12px', color: COLORS.muted }}>
            Showing {startIndex + 1}-{Math.min(endIndex, filteredLevels.length)} of {filteredLevels.length} items
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 10px',
                backgroundColor: currentPage === 1 ? COLORS.light : 'white',
                border: `1px solid ${COLORS.light}`,
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <ChevronLeft style={{ width: '12px', height: '12px' }} />
              Previous
            </button>
            
            <span style={{ padding: '6px 12px', fontSize: '11px', color: COLORS.dark }}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 10px',
                backgroundColor: currentPage === totalPages ? COLORS.light : 'white',
                border: `1px solid ${COLORS.light}`,
                borderRadius: '4px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              Next
              <ChevronRight style={{ width: '12px', height: '12px' }} />
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

// Monthly Consumption Component
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
      consumptionDataPoints: consumptionData?.data?.length || 0
    });

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

    // Add footfall data with bin filtering
    if (footfallData && footfallData.length > 0) {
      footfallData.forEach(record => {
        const dateKey = record.date.slice(0, 10);
        const day = new Date(record.date).getDate();

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
      totalConsumption: processed.reduce((sum, p) => sum + p.consumption, 0),
      hasConsumption: processed.some(p => p.consumption > 0),
      hasFootfall: processed.some(p => p.employeeCount > 0 || p.visitorCount > 0),
      sampleData: processed.slice(0, 3)
    });
    
    setChartData(processed);
  }, [consumptionData, footfallData, binMode, selectedCategory, selectedItem, categories, items]);

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
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '600', color: COLORS.dark, margin: '0 0 12px 0' }}>
          <Package style={{ width: '18px', height: '18px', display: 'inline', marginRight: '6px', verticalAlign: 'middle', color: COLORS.success }} />
          Monthly Consumption Analysis - {getDisplayName()}
        </h2>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Category/Item Selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedCategory || ''}
              onChange={(e) => {
                const newCategoryId = e.target.value ? Number(e.target.value) : null;
                console.log('Category selected:', newCategoryId);
                setSelectedCategory(newCategoryId);
                setSelectedItem(null); // Clear item when category changes
              }}
              style={{
                padding: '6px 10px',
                border: `1px solid ${COLORS.light}`,
                borderRadius: '6px',
                fontSize: '12px',
                minWidth: '150px'
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
                padding: '6px 10px',
                border: `1px solid ${COLORS.light}`,
                borderRadius: '6px',
                fontSize: '12px',
                minWidth: '150px',
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
          <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
            <button
              onClick={() => setBinMode('full')}
              style={{
                padding: '6px 12px',
                backgroundColor: binMode === 'full' ? COLORS.primary : 'white',
                color: binMode === 'full' ? 'white' : COLORS.dark,
                border: `1px solid ${binMode === 'full' ? COLORS.primary : COLORS.light}`,
                borderRadius: '6px 0 0 6px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Full Month
            </button>
            <button
              onClick={() => setBinMode('first15')}
              style={{
                padding: '6px 12px',
                backgroundColor: binMode === 'first15' ? COLORS.primary : 'white',
                color: binMode === 'first15' ? 'white' : COLORS.dark,
                border: `1px solid ${binMode === 'first15' ? COLORS.primary : COLORS.light}`,
                cursor: 'pointer',
                fontSize: '11px',
                marginLeft: '-1px'
              }}
            >
              Days 1-15
            </button>
            <button
              onClick={() => setBinMode('last15')}
              style={{
                padding: '6px 12px',
                backgroundColor: binMode === 'last15' ? COLORS.primary : 'white',
                color: binMode === 'last15' ? 'white' : COLORS.dark,
                border: `1px solid ${binMode === 'last15' ? COLORS.primary : COLORS.light}`,
                borderRadius: '0 6px 6px 0',
                cursor: 'pointer',
                fontSize: '11px',
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
          height: '350px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: cardBackgrounds.neutral,
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <RefreshCw style={{ 
              width: '24px', 
              height: '24px', 
              animation: 'spin 2s linear infinite', 
              margin: '0 auto',
              color: COLORS.primary
            }} />
            <div style={{ marginTop: '8px', fontSize: '12px', color: COLORS.muted }}>
              Loading consumption data...
            </div>
          </div>
        </div>
      ) : chartData.length === 0 ? (
        <div style={{ 
          height: '350px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: cardBackgrounds.neutral,
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <Package style={{ 
              width: '32px', 
              height: '32px', 
              margin: '0 auto',
              color: COLORS.muted,
              opacity: 0.5
            }} />
            <div style={{ marginTop: '12px', fontSize: '13px', color: COLORS.muted }}>
              No data available for selected filters
            </div>
            <div style={{ marginTop: '6px', fontSize: '11px', color: COLORS.muted }}>
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
            marginBottom: '8px',
            padding: '8px',
            backgroundColor: cardBackgrounds.primary,
            borderRadius: '6px'
          }}>
            <span style={{ fontSize: '11px', color: COLORS.muted }}>
              Showing {chartData.length} days of data
            </span>
            <span style={{ fontSize: '11px', color: COLORS.muted }}>
              {binMode === 'first15' ? 'Days 1-15' : binMode === 'last15' ? 'Days 16-31' : 'Full Month'}
            </span>
          </div>
          
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 9 }} 
                angle={-45} 
                textAnchor="end" 
                height={60}
                tickFormatter={(value) => {
                  // Format date as MM/DD
                  const date = new Date(value);
                  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
                }}
              />
              <YAxis yAxisId="left" tick={{ fontSize: 9 }} label={{ value: 'Quantity', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9 }} label={{ value: 'Footfall', angle: 90, position: 'insideRight', style: { fontSize: 10 } }} />
              <Tooltip content={<ModernTooltip />} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              
              <Bar
                yAxisId="left"
                dataKey="consumption"
                fill={COLORS.success}
                opacity={0.8}
                name={`${getDisplayName()} (Qty)`}
              />
              
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="employeeCount"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Employees"
              />
              
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="visitorCount"
                stroke={COLORS.warning}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
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
    <div style={{ minHeight: '100vh', backgroundColor: '#fafafa', padding: '16px' }}>
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
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Card background={cardBackgrounds.neutral}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              margin: 0,
              color: COLORS.dark
            }}>
              Consumption & Inventory Analysis
            </h1>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Calendar style={{ width: '14px', height: '14px', color: COLORS.primary }} />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{
                  padding: '5px 8px',
                  border: `1px solid ${COLORS.light}`,
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              />
              <span style={{ color: COLORS.muted, fontSize: '11px' }}>to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                style={{
                  padding: '5px 8px',
                  border: `1px solid ${COLORS.light}`,
                  borderRadius: '4px',
                  fontSize: '11px'
                }}
              />
              
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(true)}
                style={{
                  position: 'relative',
                  padding: '8px',
                  backgroundColor: unreadCount > 0 ? COLORS.warning + '20' : 'white',
                  border: `1px solid ${COLORS.light}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Bell style={{ 
                  width: '18px', 
                  height: '18px', 
                  color: unreadCount > 0 ? COLORS.warning : COLORS.dark,
                  animation: unreadCount > 0 ? 'pulse 2s infinite' : 'none'
                }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: COLORS.danger,
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '600',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    minWidth: '18px',
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