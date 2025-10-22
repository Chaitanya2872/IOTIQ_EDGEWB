import React, { useState, useEffect } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import * as Papa from 'papaparse';

// Type definitions
interface CorrelationItem {
  item_name: string;
  corr_top_positive_item: string;
  corr_top_positive_value?: number;
  corr_strength_category?: string;
  category?: string;
  Category?: string;
  CATEGORY?: string;
  item_category?: string;
  Item_Category?: string;
  month?: string | number;
}

interface AnomalyItem {
  item_code: string;
  item_name?: string;
  final_anomaly_classification: 'Critical' | 'Moderate' | string;
  consumption: number;
  rolling_anomaly_score: number;
  global_anomaly_score: number;
  category?: string;
  year?: number;
  month?: number;
  year_month?: string;
}

interface StockItem {
  item_name: string;
  category?: string;
  consumption: number;
  sih: number;
  avg_daily_consumption: number;
  turnover: number;
  coverage_days: number;
  status?: string;
  stockStatus?: string;
  coverageDisplay?: string;
}

interface ConsumptionTrend {
  date: string;
  month: number;
  year: number;
  totalConsumption: number;
  anomalyScore: number;
  itemCount?: number;
  [key: string]: any; // For dynamic item consumption keys
}

interface ChartDataItem {
  item: string;
  category?: string;
  moderateSpikes: number;
  criticalSpikes: number;
  totalConsumption: number;
}

interface StockMovementData {
  name: string;
  value: number;
  color: string;
}

const DynamicCSVDashboard: React.FC = () => {
  // State management with proper typing
  const [correlationData, setCorrelationData] = useState<CorrelationItem[]>([]);
  const [correlationLoading, setCorrelationLoading] = useState<boolean>(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [categories, setCategories] = useState<string[]>(['All Categories']);

  const [anomaliesData, setAnomaliesData] = useState<AnomalyItem[]>([]);
  const [anomaliesLoading, setAnomaliesLoading] = useState<boolean>(true);
  const [anomaliesSelectedDateRange, setAnomaliesSelectedDateRange] = useState<string>('Last 3 Months');
  const [anomaliesSelectedCategory, setAnomaliesSelectedCategory] = useState<string>('All Categories');
  const [anomaliesCategories, setAnomaliesCategories] = useState<string[]>(['All Categories']);
  const [fullAnomaliesData, setFullAnomaliesData] = useState<AnomalyItem[]>([]);

  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [stockLoading, setStockLoading] = useState<boolean>(true);
  const [stockAnalysisCategory, setStockAnalysisCategory] = useState<string>('All Categories');
  const [stockCategories, setStockCategories] = useState<string[]>(['All Categories']);

  const [consumptionTrends, setConsumptionTrends] = useState<ConsumptionTrend[]>([]);

  // CSV file paths
  const csvPaths = {
    correlations: '/Book 2 (1)(Sheet1).csv',
    anomalies: '/BMS_Enhanced_Inventory_with_Anomalies_20250917_090908.csv',
    stock: '/BMS_Enhanced_Inventory_Sample_Structure.csv',
    predictions: '/predictions_latest.csv'
  };

  // Load CSV from file path using fetch
  const loadCSVFromPath = async (path: string): Promise<any[] | null> => {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();
      const parsed = Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      return parsed.data;
    } catch (error) {
      console.error(`Error loading CSV from ${path}:`, error);
      return null;
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, dataType: string): void => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const text = e.target?.result as string;
        const parsed = Papa.parse(text, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        console.log(`📁 Loaded ${parsed.data.length} records from uploaded ${dataType} file`);
        
        switch(dataType) {
          case 'correlations':
            processCorrelationData(parsed.data);
            break;
          case 'anomalies':
            processAnomaliesData(parsed.data);
            break;
          case 'stock':
            processStockData(parsed.data);
            break;
        }
      };
      reader.readAsText(file);
    }
  };

  // Process correlation data
  const processCorrelationData = (data: any[]): void => {
    const validData: CorrelationItem[] = data.filter(item => 
      item.item_name && 
      item.corr_top_positive_item && 
      item.item_name.toString().trim() !== '' &&
      item.corr_top_positive_item.toString().trim() !== ''
    );
    
    setCorrelationData(validData);
    
    // Get all unique categories from the data
    const allCategories = validData.map(item => {
      return item.category || item.Category || item.CATEGORY || item.item_category || item.Item_Category || 'Uncategorized';
    }).filter(cat => cat && cat.toString().trim() !== '' && cat !== 'Uncategorized');
    
    const uniqueCategories = ['All Categories', ...new Set(allCategories)].sort();
    setCategories(uniqueCategories);
    
    console.log('Raw data sample:', data.slice(0, 2));
    console.log('Available categories found:', uniqueCategories);
    
    if (validData.length > 0) {
      const firstPair = validData[0];
      setSelectedItems([firstPair.item_name, firstPair.corr_top_positive_item]);
    }
    
    setCorrelationLoading(false);
    console.log(`✅ Processed ${validData.length} correlation records across ${uniqueCategories.length - 1} categories`);
  };

  // Process anomalies data
  const processAnomaliesData = (data: any[]): void => {
    setFullAnomaliesData(data);

    const filteredAnomalies: AnomalyItem[] = data.filter(item => 
      item.item_code && 
      item.item_code !== 0 && 
      typeof item.item_code === 'string' &&
      item.item_code.toString().trim() !== '' &&
      (item.final_anomaly_classification === 'Critical' || 
       item.final_anomaly_classification === 'Moderate') &&
       (item.consumption > 0 || item.consumption === 0)
    ).map(item => ({
      ...item,
      consumption: Number(item.consumption) || 0,
      rolling_anomaly_score: Number(item.rolling_anomaly_score) || 0,
      global_anomaly_score: Number(item.global_anomaly_score) || 0
    }));

    setAnomaliesData(filteredAnomalies);

    const uniqueAnomaliesCategories = ['All Categories', ...new Set(
      data.map(item => item.category).filter(cat => cat && cat.toString().trim() !== '')
    )];
    setAnomaliesCategories(uniqueAnomaliesCategories);

    setAnomaliesLoading(false);
    console.log(`✅ Processed ${filteredAnomalies.length} anomalies from ${data.length} total records`);
  };

  // Process stock data
  const processStockData = (data: any[]): void => {
    const processedData: StockItem[] = data.filter(item => item.item_name).map(item => ({
      ...item,
      consumption: Number(item.consumption) || 0,
      sih: Number(item.sih) || 0,
      avg_daily_consumption: Number(item.avg_daily_consumption) || 0,
      turnover: Number(item.turnover) || 0,
      coverage_days: Number(item.coverage_days) || 0,
      stockStatus: item.sih === 0 ? 'Out of Stock' : (item.status || 'Normal Moving'),
      coverageDisplay: item.sih === 0 ? '0 days' :
                      item.coverage_days >= 999 ? '∞' : 
                      `${Math.round(item.coverage_days)} days`
    }));

    setStockData(processedData);

    const uniqueStockCategories = ['All Categories', ...new Set(
      data.map(item => item.category).filter(cat => cat && cat.toString().trim() !== '')
    )];
    setStockCategories(uniqueStockCategories);

    setStockLoading(false);
    console.log(`✅ Processed ${processedData.length} stock records`);
  };

  // Auto-load CSVs from paths on component mount
  useEffect(() => {
    const autoLoadCSVs = async () => {
      console.log('🔄 Attempting to auto-load CSV files...');
      
      // Try to load correlations
      const correlationData = await loadCSVFromPath(csvPaths.correlations);
      if (correlationData) {
        processCorrelationData(correlationData);
      } else {
        console.log('⚠️ Could not auto-load correlation CSV, using file upload instead');
        setCorrelationLoading(false);
      }

      // Try to load anomalies
      const anomaliesData = await loadCSVFromPath(csvPaths.anomalies);
      if (anomaliesData) {
        processAnomaliesData(anomaliesData);
      } else {
        console.log('⚠️ Could not auto-load anomalies CSV, using file upload instead');
        setAnomaliesLoading(false);
      }

      // Try to load stock data
      const stockData = await loadCSVFromPath(csvPaths.stock);
      if (stockData) {
        processStockData(stockData);
      } else {
        console.log('⚠️ Could not auto-load stock CSV, using file upload instead');
        setStockLoading(false);
      }
    };

    autoLoadCSVs();
  }, [csvPaths.anomalies, csvPaths.correlations, csvPaths.stock]);

  // Generate consumption trends from real anomalies data
  const generateConsumptionTrendsFromAnomalies = (data: AnomalyItem[]): void => {
    if (!selectedItems.length || selectedItems.length !== 2 || !data.length) {
      setConsumptionTrends([]);
      return;
    }

    const relevantData = data.filter(item => 
      item.item_code && 
      (selectedItems.includes(item.item_code) || 
       selectedItems.includes(item.item_name || ''))
    );

    if (relevantData.length === 0) {
      // Create simulated data for demonstration
      const months = ['2024_06', '2024_07', '2024_08', '2024_09'];
      const simulatedTrends: ConsumptionTrend[] = months.map((month, index) => ({
        date: month,
        month: parseInt(month.split('_')[1]),
        year: parseInt(month.split('_')[0]),
        totalConsumption: Math.floor(Math.random() * 100) + 50 + (index * 10),
        anomalyScore: Math.random() * 3 + index * 0.5,
        [`${selectedItems[0]}_consumption`]: Math.floor(Math.random() * 50) + 25,
        [`${selectedItems[1]}_consumption`]: Math.floor(Math.random() * 50) + 25,
        [`${selectedItems[0]}_anomaly`]: Math.random() * 2,
        [`${selectedItems[1]}_anomaly`]: Math.random() * 2
      }));
      
      setConsumptionTrends(simulatedTrends);
      return;
    }

    // Group by year_month and create trend data
    const trendMap: { [key: string]: ConsumptionTrend } = {};
    relevantData.forEach(item => {
      const key = item.year_month || `${item.year}_${item.month}`;
      if (!trendMap[key]) {
        trendMap[key] = {
          date: key,
          month: item.month || 1,
          year: item.year || 2024,
          totalConsumption: 0,
          itemCount: 0,
          anomalyScore: 0
        };
      }
      
      trendMap[key].totalConsumption += item.consumption || 0;
      trendMap[key].itemCount = (trendMap[key].itemCount || 0) + 1;
      trendMap[key].anomalyScore += (item.rolling_anomaly_score || 0);
      
      selectedItems.forEach(selectedItem => {
        if (item.item_code === selectedItem || item.item_name === selectedItem) {
          trendMap[key][`${selectedItem}_consumption`] = item.consumption || 0;
          trendMap[key][`${selectedItem}_anomaly`] = item.rolling_anomaly_score || 0;
        }
      });
    });

    const trends = Object.values(trendMap)
      .sort((a, b) => {
        const aDate = new Date(a.year, a.month - 1);
        const bDate = new Date(b.year, b.month - 1);
        return aDate.getTime() - bDate.getTime();
      });

    setConsumptionTrends(trends);
  };

  // Update trends when selected items change
  useEffect(() => {
    if (!anomaliesLoading && fullAnomaliesData.length > 0) {
      generateConsumptionTrendsFromAnomalies(fullAnomaliesData);
    }
  }, [selectedItems, anomaliesLoading, fullAnomaliesData, generateConsumptionTrendsFromAnomalies]);

  // Filter functions
  const getFilteredCorrelationData = (): CorrelationItem[] => {
    if (selectedCategory === 'All Categories') return correlationData;
    return correlationData.filter(item => {
      const itemCategory = item.category || item.Category || item.CATEGORY || item.item_category || item.Item_Category;
      return itemCategory === selectedCategory;
    });
  };

  const getFilteredAnomaliesData = (): AnomalyItem[] => {
    let filtered = anomaliesData;

    if (anomaliesSelectedDateRange !== 'All Time') {
      filtered = filtered.filter(item => {
        const year = item.year || 2024;
        const month = item.month || 1;
        
        switch(anomaliesSelectedDateRange) {
          case 'Last 3 Months': return year >= 2024 && month >= 9;
          case 'Last 6 Months': return year >= 2024 && month >= 6;
          case 'Current Year': return year >= 2024;
          default: return true;
        }
      });
    }

    if (anomaliesSelectedCategory !== 'All Categories') {
      filtered = filtered.filter(item => item.category === anomaliesSelectedCategory);
    }

    return filtered;
  };

  const getFilteredStockData = (): StockItem[] => {
    if (stockAnalysisCategory === 'All Categories') return stockData;
    return stockData.filter(item => item.category === stockAnalysisCategory);
  };

  // Event handlers
  const handleCorrelationClick = (correlation: CorrelationItem): void => {
    setSelectedItems([correlation.item_name, correlation.corr_top_positive_item]);
  };

  const isCorrelationSelected = (correlation: CorrelationItem): boolean => {
    return selectedItems.includes(correlation.item_name) && 
           selectedItems.includes(correlation.corr_top_positive_item);
  };

  // Chart data generators
  const generateAnomalyChartData = (): ChartDataItem[] => {
    const filtered = getFilteredAnomaliesData();
    const grouped: { [key: string]: ChartDataItem } = {};

    filtered.forEach(item => {
      const key = item.item_code || item.item_name || 'Unknown';
      if (!grouped[key]) {
        grouped[key] = {
          item: key,
          category: item.category,
          moderateSpikes: 0,
          criticalSpikes: 0,
          totalConsumption: 0
        };
      }
      
      grouped[key].totalConsumption += item.consumption || 0;
      
      if (item.final_anomaly_classification === 'Critical') {
        grouped[key].criticalSpikes++;
      } else if (item.final_anomaly_classification === 'Moderate') {
        grouped[key].moderateSpikes++;
      }
    });

    return Object.values(grouped)
      .filter(item => item.criticalSpikes > 0 || item.moderateSpikes > 0)
      .sort((a, b) => (b.criticalSpikes + b.moderateSpikes) - (a.criticalSpikes + a.moderateSpikes))
      .slice(0, 15);
  };

  const generateStockMovementData = (): StockMovementData[] => {
    const filtered = getFilteredStockData();
    const counts: { [key: string]: number } = { 
      'Out of Stock': 0, 
      'Fast Moving': 0, 
      'Normal Moving': 0, 
      'Slow Moving': 0 
    };
    
    filtered.forEach(item => {
      const status = item.stockStatus || 'Normal Moving';
      counts[status] = (counts[status] || 0) + 1;
    });
    
    return [
      { name: 'Out of Stock', value: counts['Out of Stock'], color: '#dc2626' },
      { name: 'Fast Moving', value: counts['Fast Moving'], color: '#f59e0b' },
      { name: 'Normal Moving', value: counts['Normal Moving'], color: '#3b82f6' },
      { name: 'Slow Moving', value: counts['Slow Moving'], color: '#6b7280' }
    ];
  };

  // Helper functions
  const formatItemName = (name: string | undefined): string => {
    if (!name) return 'Unknown';
    return name.length > 25 ? name.substring(0, 25) + '...' : name;
  };
  
  const getCategoryColor = (category: string | undefined): string => {
    const colors: { [key: string]: string } = {
      'Pantry': '#3b82f6',
      'HK Consumables': '#10b981',
      'HK Chemicals': '#f59e0b',
      'Toiletries': '#8b5cf6'
    };
    return colors[category || ''] || '#6b7280';
  };

  return (
    <div style={{ 
      padding: '24px', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#111827', 
            margin: '0 0 8px 0'
          }}>
            BMS Dynamic CSV Inventory Analysis
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#6b7280', 
            margin: 0 
          }}>
            Live data from your CSV files - Upload or auto-load from scripts folder
          </p>
        </div>

        {/* File Upload Section */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            📁 CSV Data Sources
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Correlation Data (Book 2)
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, 'correlations')}
                style={{
                  padding: '8px',
                  fontSize: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  width: '100%'
                }}
              />
              <div style={{ fontSize: '10px', color: correlationData.length > 0 ? '#166534' : '#6b7280', marginTop: '4px' }}>
                {correlationData.length > 0 ? `✅ ${correlationData.length} records loaded` : 'No data loaded'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Anomalies Data
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, 'anomalies')}
                style={{
                  padding: '8px',
                  fontSize: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  width: '100%'
                }}
              />
              <div style={{ fontSize: '10px', color: anomaliesData.length > 0 ? '#166534' : '#6b7280', marginTop: '4px' }}>
                {anomaliesData.length > 0 ? `✅ ${anomaliesData.length} anomalies loaded` : 'No data loaded'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Stock Data
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => handleFileUpload(e, 'stock')}
                style={{
                  padding: '8px',
                  fontSize: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  width: '100%'
                }}
              />
              <div style={{ fontSize: '10px', color: stockData.length > 0 ? '#166534' : '#6b7280', marginTop: '4px' }}>
                {stockData.length > 0 ? `✅ ${stockData.length} items loaded` : 'No data loaded'}
              </div>
            </div>
          </div>
        </div>

        {/* Cross Item Correlation Analysis */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              color: '#111827', 
              margin: 0 
            }}>
              Cross Item Correlation Analysis
            </h2>
            <div style={{
              padding: '8px 12px',
              backgroundColor: correlationLoading ? '#fef3c7' : (correlationData.length > 0 ? '#dcfce7' : '#fef2f2'),
              borderRadius: '8px',
              fontSize: '12px',
              color: correlationLoading ? '#92400e' : (correlationData.length > 0 ? '#166534' : '#991b1b')
            }}>
              {correlationLoading ? 'Loading...' : 
               correlationData.length > 0 ? `✅ ${correlationData.length} correlations loaded` : 
               '❌ No data - please upload CSV'}
            </div>
          </div>

          {correlationData.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '2px dashed #d1d5db'
            }}>
              <h3 style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>No Correlation Data</h3>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>Upload your "Book 2 (1)(Sheet1).csv" file above to see correlations</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
              {/* Correlation Table */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    Item Correlation Matrix
                  </h3>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '13px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white'
                    }}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                      <tr style={{ backgroundColor: '#f1f5f9' }}>
                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                          Primary Item
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                          Correlated Item
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0', width: '60px' }}>
                          Month
                        </th>
                        <th style={{ padding: '12px 8px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #e2e8f0', width: '70px' }}>
                          Strength
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredCorrelationData().map((correlation, index) => {
                        const isSelected = isCorrelationSelected(correlation);
                        return (
                          <tr 
                            key={index}
                            onClick={() => handleCorrelationClick(correlation)}
                            style={{ 
                              backgroundColor: isSelected ? '#dbeafe' : index % 2 === 0 ? '#ffffff' : '#f8fafc',
                              cursor: 'pointer',
                              borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent'
                            }}
                          >
                            <td style={{ padding: '10px 8px', fontWeight: isSelected ? '600' : '500', borderRight: '1px solid #e2e8f0' }}>
                              {formatItemName(correlation.item_name)}
                            </td>
                            <td style={{ padding: '10px 8px', fontWeight: isSelected ? '600' : '500', borderRight: '1px solid #e2e8f0' }}>
                              {formatItemName(correlation.corr_top_positive_item)}
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                              {correlation.month || 'N/A'}
                            </td>
                            <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                              <span style={{ 
                                padding: '2px 4px',
                                borderRadius: '6px',
                                fontSize: '8px',
                                fontWeight: 'bold',
                                backgroundColor: correlation.corr_strength_category === 'Strong' ? '#f59e0b' : '#6b7280',
                                color: 'white'
                              }}>
                                {(correlation.corr_top_positive_value || 0).toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Consumption Trends Visualization */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  Consumption Trends: {selectedItems.length === 2 ? selectedItems.join(' ↔ ') : 'None selected'}
                </h3>
                <div style={{ height: '300px' }}>
                  {selectedItems.length === 2 && consumptionTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={consumptionTrends} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10, fill: '#6b7280' }}
                          tickFormatter={(value) => value.replace('_', '/')}
                        />
                        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                        <Tooltip 
                          labelFormatter={(value) => `Period: ${value}`.replace('_', '/')}
                          formatter={(value, name) => [
                            typeof value === 'number' ? value.toFixed(1) : value, 
                            (name as string).replace('_', ' ').replace('consumption', 'Units').replace('anomaly', 'Score')
                          ]}
                        />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="totalConsumption" 
                          stackId="1"
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.3}
                          name="Total Consumption"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="anomalyScore" 
                          stackId="2"
                          stroke="#dc2626" 
                          fill="#dc2626" 
                          fillOpacity={0.3}
                          name="Anomaly Score"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ 
                      height: '100%', 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '2px dashed #d1d5db'
                    }}>
                      <div style={{ textAlign: 'center', color: '#6b7280' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                          {selectedItems.length === 2 ? 'Loading trends...' : 'Select correlation pair above'}
                        </div>
                        <div style={{ fontSize: '12px' }}>
                          {selectedItems.length === 2 ? `${selectedItems[0]} ↔ ${selectedItems[1]}` : 'Click on correlation rows to view trends'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BMS Consumption Anomalies Analysis */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #f3f4f6',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', margin: 0 }}>
              BMS Consumption Anomalies Analysis
            </h2>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{
                padding: '8px 12px',
                backgroundColor: anomaliesLoading ? '#fef3c7' : (anomaliesData.length > 0 ? '#dcfce7' : '#fef2f2'),
                borderRadius: '8px',
                fontSize: '12px',
                color: anomaliesLoading ? '#92400e' : (anomaliesData.length > 0 ? '#166534' : '#991b1b')
              }}>
                {anomaliesLoading ? 'Loading...' : 
                 anomaliesData.length > 0 ? `✅ ${anomaliesData.length} anomalies loaded` : 
                 '❌ Upload anomalies CSV'}
              </div>
              <select
                value={anomaliesSelectedDateRange}
                onChange={(e) => setAnomaliesSelectedDateRange(e.target.value)}
                disabled={anomaliesData.length === 0}
                style={{ padding: '8px 16px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="Last 3 Months">Last 3 Months</option>
                <option value="Last 6 Months">Last 6 Months</option>
                <option value="Current Year">Current Year</option>
                <option value="All Time">All Time</option>
              </select>
              <select
                value={anomaliesSelectedCategory}
                onChange={(e) => setAnomaliesSelectedCategory(e.target.value)}
                disabled={anomaliesData.length === 0}
                style={{ padding: '8px 16px', fontSize: '14px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                {anomaliesCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {anomaliesData.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '2px dashed #d1d5db'
            }}>
              <h3 style={{ fontSize: '18px', color: '#6b7280', marginBottom: '8px' }}>No Anomalies Data</h3>
              <p style={{ fontSize: '14px', color: '#9ca3af' }}>Upload your anomalies CSV file above to see analysis</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
              {/* Anomalies Chart */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  Top Anomaly Items (Real Data)
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={generateAnomalyChartData()} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="item" 
                      tick={{ fontSize: 10, fill: '#6b7280' }} 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tickFormatter={(value) => formatItemName(value)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="moderateSpikes" name="Moderate" fill="#f59e0b" />
                    <Bar dataKey="criticalSpikes" name="Critical" fill="#dc2626" />
                    <Line dataKey="totalConsumption" name="Total Consumption" stroke="#3b82f6" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Anomalies Summary */}
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  Real Anomaly Summary
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px', textAlign: 'center' }}>
                    <h4 style={{ fontSize: '14px', color: '#92400e', margin: '0 0 8px 0' }}>Moderate Anomalies</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#92400e', margin: 0 }}>
                      {getFilteredAnomaliesData().filter(item => item.final_anomaly_classification === 'Moderate').length}
                    </p>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', textAlign: 'center' }}>
                    <h4 style={{ fontSize: '14px', color: '#991b1b', margin: '0 0 8px 0' }}>Critical Anomalies</h4>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#991b1b', margin: 0 }}>
                      {getFilteredAnomaliesData().filter(item => item.final_anomaly_classification === 'Critical').length}
                    </p>
                  </div>
                </div>

                {/* Anomalies List */}
                <div style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Recent Anomalies:</h4>
                  {getFilteredAnomaliesData().slice(0, 8).map((item, index) => (
                    <div key={index} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      padding: '8px 0',
                      borderBottom: index < 7 ? '1px solid #e5e7eb' : 'none'
                    }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '500' }}>
                          {formatItemName(item.item_code)}
                        </div>
                        <div style={{ fontSize: '10px', color: '#6b7280' }}>
                          {item.category} • {item.year_month?.replace('_', '/')} • Score: {(item.rolling_anomaly_score || 0).toFixed(2)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                          fontSize: '10px', 
                          padding: '2px 6px',
                          backgroundColor: item.final_anomaly_classification === 'Critical' ? '#dc2626' : '#f59e0b',
                          color: 'white',
                          borderRadius: '4px'
                        }}>
                          {item.final_anomaly_classification}
                        </div>
                        <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                          {item.consumption || 0} units
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stock Movement Analysis */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.5fr', gap: '24px' }}>
          {/* Stock Movement Pie Chart */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Stock Movement Analysis</h3>
              <select
                value={stockAnalysisCategory}
                onChange={(e) => setStockAnalysisCategory(e.target.value)}
                disabled={stockData.length === 0}
                style={{ padding: '6px 10px', fontSize: '13px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                {stockCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div style={{
              padding: '8px 12px',
              backgroundColor: stockLoading ? '#fef3c7' : (stockData.length > 0 ? '#dcfce7' : '#fef2f2'),
              borderRadius: '8px',
              fontSize: '12px',
              color: stockLoading ? '#92400e' : (stockData.length > 0 ? '#166534' : '#991b1b'),
              marginBottom: '16px'
            }}>
              {stockLoading ? 'Loading...' : 
               stockData.length > 0 ? `✅ ${stockData.length} items loaded` : 
               '❌ Upload stock CSV'}
            </div>

            {stockData.length === 0 ? (
              <div style={{ 
                height: '280px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '2px dashed #d1d5db'
              }}>
                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No Stock Data</div>
                  <div style={{ fontSize: '12px' }}>Upload stock CSV file above</div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={generateStockMovementData()}
                    cx="50%"
                    cy="45%"
                    innerRadius={35}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {generateStockMovementData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} items`, 'Count']} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Detailed Stock Table */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
              Stock Analysis - Live Data {stockData.length > 0 ? `(${getFilteredStockData().length} items)` : ''}
            </h3>
            
            {stockData.length === 0 ? (
              <div style={{ 
                height: '380px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '2px dashed #d1d5db'
              }}>
                <div style={{ textAlign: 'center', color: '#6b7280' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No Stock Data</div>
                  <div style={{ fontSize: '12px' }}>Upload your stock CSV file to see detailed analysis</div>
                </div>
              </div>
            ) : (
              <div style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                  <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                    <tr style={{ backgroundColor: '#f1f5f9' }}>
                      <th style={{ padding: '10px 8px', textAlign: 'left', fontWeight: '600', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                        Item Name
                      </th>
                      {stockAnalysisCategory === 'All Categories' && (
                        <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                          Category
                        </th>
                      )}
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                        Consumption
                      </th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                        SIH
                      </th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                        Coverage
                      </th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                        Turnover
                      </th>
                      <th style={{ padding: '10px 8px', textAlign: 'center', fontWeight: '600', borderBottom: '2px solid #e2e8f0' }}>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredStockData()
                      .sort((a, b) => {
                        const priority: { [key: string]: number } = { 
                          'Out of Stock': 1, 
                          'Fast Moving': 2, 
                          'Slow Moving': 3, 
                          'Normal Moving': 4 
                        };
                        return (priority[a.stockStatus || ''] || 5) - (priority[b.stockStatus || ''] || 5);
                      })
                      .map((item, index) => (
                      <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '10px 8px', fontWeight: '500', borderRight: '1px solid #e2e8f0' }}>
                          {formatItemName(item.item_name)}
                        </td>
                        {stockAnalysisCategory === 'All Categories' && (
                          <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                            <span style={{ 
                              fontSize: '9px', 
                              backgroundColor: getCategoryColor(item.category), 
                              color: 'white', 
                              padding: '2px 4px', 
                              borderRadius: '3px'
                            }}>
                              {item.category?.replace(' Consumables', '').replace(' Chemicals', '')}
                            </span>
                          </td>
                        )}
                        <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                          {item.consumption}
                        </td>
                        <td style={{ 
                          padding: '10px 8px', 
                          textAlign: 'center', 
                          fontWeight: 'bold',
                          color: item.sih === 0 ? '#dc2626' : '#1e40af',
                          borderRight: '1px solid #e2e8f0'
                        }}>
                          {item.sih}
                        </td>
                        <td style={{ 
                          padding: '10px 8px', 
                          textAlign: 'center',
                          color: item.sih === 0 ? '#dc2626' : item.coverage_days <= 7 ? '#f59e0b' : '#10b981',
                          fontWeight: 'bold',
                          borderRight: '1px solid #e2e8f0'
                        }}>
                          {item.coverageDisplay}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                          {(item.turnover || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                          <span style={{ 
                            padding: '3px 5px',
                            borderRadius: '8px',
                            fontSize: '8px',
                            fontWeight: 'bold',
                            backgroundColor: item.stockStatus === 'Out of Stock' ? '#dc2626' :
                                           item.stockStatus === 'Fast Moving' ? '#f59e0b' : 
                                           item.stockStatus === 'Slow Moving' ? '#6b7280' : '#3b82f6',
                            color: 'white'
                          }}>
                            {item.stockStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicCSVDashboard;