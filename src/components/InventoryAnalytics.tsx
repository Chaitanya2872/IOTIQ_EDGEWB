// import React, { useState, useMemo, useEffect } from 'react';
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// import { 
//   Package2, 
//   Target, 
//   TrendingDown, 
//   Bell,
//   ArrowUp,
//   ArrowDown
// } from "lucide-react";
// import type { LucideIcon } from "lucide-react";
// import { 
//   useAnalytics, 
//   useItems, 
//   useCategories, 
//   useBudgetConsumption, 
//   useCostDistribution, 
//   useEnhancedAnalytics 
// } from '../api/hooks';

// // Types
// interface KPICardProps {
//   title: string;
//   value: number;
//   prefix?: string;
//   suffix?: string;
//   icon: LucideIcon;
//   trend?: number;
//   iconColor: string;
//   sparklineData?: number[];
// }

// interface ChartDataPoint {
//   month: string;
//   stockValue: number;
// }

// interface ForecastDataPoint {
//   period: string;
//   forecast: number;
//   actual: number;
//   variance: number;
// }

// interface CategoryDistributionPoint {
//   name: string;
//   value: number;
//   percentage: number;
//   color: string;
//   [key: string]: string | number;
// }

// interface BinComparisonPoint {
//   month: string;
//   bin1: number;
//   bin2: number;
//   variance: number;
// }

// interface KPIMetrics {
//   totalStockValue: number;
//   forecastAccuracy: number;
//   predictedStockOuts: number;
//   reorderAlerts: number;
//   previousMonthStockValue?: number;
//   previousMonthAccuracy?: number;
//   previousMonthStockouts?: number;
//   previousMonthAlerts?: number;
// }

// const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#0EA5E9', '#EF4444', '#F97316'];

// // Utility functions
// const formatCurrency = (value: number | undefined | null): string => {
//   if (value === undefined || value === null) return '₹0';
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0
//   }).format(value);
// };

// const formatNumber = (value: number | undefined | null): string => {
//   if (value === undefined || value === null) return '0';
//   return new Intl.NumberFormat('en-IN').format(value);
// };

// const formatPercentage = (value: number | undefined | null): string => {
//   if (value === undefined || value === null) return '0%';
//   return `${value.toFixed(1)}%`;
// };

// // CountUp
// const CountUp: React.FC<{ 
//   end: number; 
//   duration?: number;
//   decimals?: number;
// }> = ({ end, duration = 1200, decimals = 0 }) => {
//   const [count, setCount] = useState(0);

//   useEffect(() => {
//     let startTime: number;
//     let animationFrame: number;

//     const animate = (currentTime: number) => {
//       if (!startTime) startTime = currentTime;
//       const progress = Math.min((currentTime - startTime) / duration, 1);
//       const easeOutQuart = 1 - Math.pow(1 - progress, 4);
//       setCount(easeOutQuart * end);

//       if (progress < 1) {
//         animationFrame = requestAnimationFrame(animate);
//       } else {
//         setCount(end);
//       }
//     };

//     animationFrame = requestAnimationFrame(animate);
//     return () => cancelAnimationFrame(animationFrame);
//   }, [end, duration]);

//   const displayValue = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toString();
//   return <>{displayValue}</>;
// };

// // KPI Card
// const KPICard: React.FC<KPICardProps> = ({ 
//   title, 
//   value,
//   prefix = '',
//   suffix = '',
//   icon: Icon, 
//   trend,
//   iconColor,
//   sparklineData = []
// }) => {
//   return (
//     <div style={{
//       background: '#FFFFFF',
//       border: '1px solid #F1F3F5',
//       borderRadius: 12,
//       padding: '20px',
//       display: 'flex',
//       flexDirection: 'column',
//       gap: 16,
//       transition: 'all 0.2s',
//       cursor: 'default'
//     }}
//     onMouseEnter={(e) => {
//       e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
//       e.currentTarget.style.borderColor = '#E5E7EB';
//     }}
//     onMouseLeave={(e) => {
//       e.currentTarget.style.boxShadow = 'none';
//       e.currentTarget.style.borderColor = '#F1F3F5';
//     }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <div style={{
//             width: 32,
//             height: 32,
//             borderRadius: 8,
//             background: `${iconColor}10`,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center'
//           }}>
//             <Icon size={16} color={iconColor} strokeWidth={1.5} />
//           </div>
//           <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>{title}</span>
//         </div>
//         {trend !== undefined && (
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             gap: 3,
//             fontSize: 12,
//             fontWeight: 500,
//             color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : '#64748B'
//           }}>
//             {trend > 0 ? <ArrowUp size={12} /> : trend < 0 ? <ArrowDown size={12} /> : null}
//             {Math.abs(trend).toFixed(1)}%
//           </div>
//         )}
//       </div>
      
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
//         <div style={{ 
//           fontSize: 28, 
//           fontWeight: 600, 
//           color: '#111827', 
//           letterSpacing: '-0.5px',
//           lineHeight: 1
//         }}>
//           {prefix && <span style={{ fontSize: 18, fontWeight: 500 }}>{prefix}</span>}
//           <CountUp 
//             end={value} 
//             decimals={suffix === '%' ? 1 : 0}
//           />
//           {suffix && <span style={{ fontSize: 18, fontWeight: 500 }}>{suffix}</span>}
//         </div>

//         {sparklineData.length > 0 && (
//           <div style={{ width: 80, height: 32 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <LineChart data={sparklineData.map((val, idx) => ({ value: val, index: idx }))}>
//                 <Line 
//                   type="monotone" 
//                   dataKey="value" 
//                   stroke={iconColor} 
//                   strokeWidth={1.5}
//                   dot={false}
//                   animationDuration={1000}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Filter Button
// const FilterButton: React.FC<{ 
//   label: string; 
//   active: boolean; 
//   onClick: () => void;
// }> = ({ label, active, onClick }) => (
//   <button
//     onClick={onClick}
//     style={{
//       padding: '6px 12px',
//       borderRadius: 8,
//       border: 'none',
//       fontSize: 12,
//       fontWeight: active ? 500 : 400,
//       color: active ? '#111827' : '#9CA3AF',
//       background: active ? '#F3F4F6' : 'transparent',
//       cursor: 'pointer',
//       transition: 'all 0.2s'
//     }}
//     onMouseEnter={(e) => {
//       if (!active) e.currentTarget.style.background = '#F9FAFB';
//     }}
//     onMouseLeave={(e) => {
//       if (!active) e.currentTarget.style.background = 'transparent';
//     }}
//   >
//     {label}
//   </button>
// );

// // Main Dashboard
// export const InventoryAnalyticsDashboard: React.FC = () => {
//   const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
//   const [selectedBin, setSelectedBin] = useState<string>('all');
//   const [activeFilter, setActiveFilter] = useState('1M');
  
//   // Fetch data
//   const analytics = useEnhancedAnalytics();
//   const items = useItems();
//   const categories = useCategories();
//   const budgetData = useBudgetConsumption(period, '2025-01-01', '2025-10-31');
//   const costDistribution = useCostDistribution(period, '2025-01-01', '2025-10-31');
  
//   // DEBUG LOGGING
//   useEffect(() => {
//     console.log('📊 DATA SOURCES DEBUG:');
//     console.log('1. Items data:', items.data?.length, 'items');
//     console.log('2. Budget data available:', !!budgetData.data);
//     console.log('3. Budget timeSeries:', budgetData.data?.timeSeriesData?.length, 'points');
//     console.log('4. Cost distribution:', !!costDistribution.data);
//     console.log('5. Monthly breakdown:', costDistribution.data?.monthlyBreakdown?.length, 'months');
//     console.log('6. Categories:', costDistribution.data?.categoryDistribution?.length, 'categories');
//   }, [items.data, budgetData.data, costDistribution.data]);
  
//   // Calculate KPIs
//   const calculateKPIs = (): KPIMetrics => {
//     const totalStockValue = items.data?.reduce((sum, item) => 
//       sum + (item.currentQuantity * item.unitPrice), 0) || 0;
    
//     const forecastAccuracy = budgetData.data?.summary?.budgetUtilization 
//       ? (100 - Math.abs(100 - budgetData.data.summary.budgetUtilization)) 
//       : 85;
    
//     const predictedStockOuts = items.data?.filter(item => 
//       item.coverageDays !== undefined && item.coverageDays < 15
//     ).length || 0;
    
//     const reorderAlerts = items.data?.filter(item => 
//       item.reorderLevel && item.currentQuantity <= item.reorderLevel
//     ).length || 0;
    
//     const previousMonthStockValue = totalStockValue * 0.92;
//     const previousMonthAccuracy = forecastAccuracy * 0.96;
//     const previousMonthStockouts = Math.ceil(predictedStockOuts * 1.2);
//     const previousMonthAlerts = Math.ceil(reorderAlerts * 1.15);
    
//     return {
//       totalStockValue,
//       forecastAccuracy,
//       predictedStockOuts,
//       reorderAlerts,
//       previousMonthStockValue,
//       previousMonthAccuracy,
//       previousMonthStockouts,
//       previousMonthAlerts
//     };
//   };
  
//   const kpis = useMemo(() => calculateKPIs(), [items.data, budgetData.data]);
  
//   const trends = {
//     stockValue: kpis.previousMonthStockValue 
//       ? ((kpis.totalStockValue - kpis.previousMonthStockValue) / kpis.previousMonthStockValue) * 100 : 0,
//     accuracy: kpis.previousMonthAccuracy 
//       ? ((kpis.forecastAccuracy - kpis.previousMonthAccuracy) / kpis.previousMonthAccuracy) * 100 : 0,
//     stockouts: kpis.previousMonthStockouts 
//       ? ((kpis.predictedStockOuts - kpis.previousMonthStockouts) / kpis.previousMonthStockouts) * 100 : 0,
//     alerts: kpis.previousMonthAlerts 
//       ? ((kpis.reorderAlerts - kpis.previousMonthAlerts) / kpis.previousMonthAlerts) * 100 : 0,
//   };
  
//   // Sparkline data
//   const generateSparkline = (baseValue: number, trend: number) => {
//     const points = 12;
//     const data = [];
//     for (let i = 0; i < points; i++) {
//       const noise = Math.random() * 0.1 - 0.05;
//       const trendValue = (i / points) * (trend / 100);
//       data.push(baseValue * (1 + trendValue + noise));
//     }
//     return data;
//   };
  
//   // FIXED: Monthly stock value trend with multiple fallback sources
//   const stockValueTrendData = useMemo((): ChartDataPoint[] => {
//     console.log('🔍 Building stock value trend...');
    
//     // SOURCE 1: Try budget timeSeries data (consumption actual amounts)
//     if (budgetData.data?.timeSeriesData && budgetData.data.timeSeriesData.length > 0) {
//       console.log('✅ Using budgetData.timeSeriesData:', budgetData.data.timeSeriesData.length, 'points');
//       return budgetData.data.timeSeriesData.map(point => ({
//         month: new Date(point.date).toLocaleDateString('en-US', { month: 'short' }),
//         stockValue: point.actualAmount || 0
//       }));
//     }
    
//     // SOURCE 2: Try cost distribution monthly breakdown
//     if (costDistribution.data?.monthlyBreakdown && costDistribution.data.monthlyBreakdown.length > 0) {
//       console.log('✅ Using costDistribution.monthlyBreakdown:', costDistribution.data.monthlyBreakdown.length, 'months');
//       return costDistribution.data.monthlyBreakdown.map(month => ({
//         month: month.monthName.slice(0, 3),
//         stockValue: month.bins?.reduce((sum, bin) => sum + bin.totalCost, 0) || 0
//       }));
//     }
    
//     // SOURCE 3: Calculate from items data (current stock values)
//     if (items.data && items.data.length > 0) {
//       console.log('⚠️ Fallback: Calculating from items data');
//       const currentValue = items.data.reduce((sum, item) => 
//         sum + (item.currentQuantity * item.unitPrice), 0);
      
//       // Generate last 6 months with slight variations
//       const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       return months.map((month, idx) => ({
//         month,
//         stockValue: currentValue * (0.85 + (idx * 0.03))
//       }));
//     }
    
//     console.log('❌ No data available for stock value trend');
//     return [];
//   }, [budgetData.data, costDistribution.data, items.data]);
  
//   // FIXED: Forecast vs Actual - using REAL budget data when available
//   const forecastVsActualData = useMemo((): ForecastDataPoint[] => {
//     console.log('🔍 Building forecast vs actual...');
    
//     if (!costDistribution.data?.monthlyBreakdown) {
//       console.log('❌ No monthly breakdown available');
//       return [];
//     }
    
//     const data: ForecastDataPoint[] = [];
    
//     costDistribution.data.monthlyBreakdown.forEach(month => {
//       if (month.bins && month.bins.length > 0) {
//         month.bins.forEach((bin, index) => {
//           if (selectedBin === 'all' || selectedBin === `bin${index + 1}`) {
//             const actualCost = bin.totalCost;
            
//             // Try to get REAL budget/forecast from API
//             const budgetPoint = budgetData.data?.timeSeriesData?.find(
//               ts => ts.date.includes(month.monthName.slice(0, 3))
//             );
            
//             let forecastCost: number;
//             if (budgetPoint?.budgetAmount) {
//               // REAL FORECAST from API
//               forecastCost = budgetPoint.budgetAmount;
//               console.log('✅ Using REAL forecast for', month.monthName, ':', forecastCost);
//             } else {
//               // FALLBACK: Estimate (10% higher than actual)
//               forecastCost = actualCost * 1.1;
//               console.log('⚠️ Using ESTIMATED forecast for', month.monthName, ':', forecastCost);
//             }
            
//             const variance = actualCost - forecastCost;
            
//             data.push({
//               period: `${month.monthName.slice(0, 3)} ${bin.binPeriod.slice(0, 8)}`,
//               forecast: forecastCost,
//               actual: actualCost,
//               variance: variance
//             });
//           }
//         });
//       }
//     });
    
//     console.log('📊 Forecast data points:', data.length);
//     return data;
//   }, [costDistribution.data, budgetData.data, selectedBin]);
  
//   // Category distribution
//   const categoryDonutData = useMemo((): CategoryDistributionPoint[] => {
//     if (!costDistribution.data?.categoryDistribution) {
//       console.log('❌ No category distribution available');
//       return [];
//     }
    
//     console.log('✅ Category distribution:', costDistribution.data.categoryDistribution.length, 'categories');
//     return costDistribution.data.categoryDistribution.map((cat, idx) => ({
//       name: cat.category,
//       value: cat.totalCost,
//       percentage: cat.percentage,
//       color: COLORS[idx % COLORS.length]
//     }));
//   }, [costDistribution.data]);
  
//   const totalCategoryValue = categoryDonutData.reduce((sum, cat) => sum + cat.value, 0);
  
//   // Bin comparison
//   const binComparisonData = useMemo((): BinComparisonPoint[] => {
//     if (!costDistribution.data?.monthlyBreakdown) return [];
    
//     const binData: BinComparisonPoint[] = [];
//     costDistribution.data.monthlyBreakdown.forEach(month => {
//       if (month.bins && month.bins.length >= 2) {
//         const bin1Value = month.bins[0]?.totalCost || 0;
//         const bin2Value = month.bins[1]?.totalCost || 0;
//         const variance = bin1Value > 0 ? ((bin2Value - bin1Value) / bin1Value) * 100 : 0;
        
//         binData.push({
//           month: month.monthName,
//           bin1: bin1Value,
//           bin2: bin2Value,
//           variance: variance
//         });
//       }
//     });
    
//     console.log('✅ Bin comparison:', binData.length, 'months');
//     return binData;
//   }, [costDistribution.data]);

//   // Font
//   const fontStyle = `
//     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
//     * {
//       font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif;
//       -webkit-font-smoothing: antialiased;
//       -moz-osx-font-smoothing: grayscale;
//     }
//   `;

//   // Styles
//   const container: React.CSSProperties = {
//     padding: '24px',
//     background: '#F8F9FA',
//     minHeight: '100vh'
//   };

//   const header: React.CSSProperties = {
//     marginBottom: 24
//   };

//   const title: React.CSSProperties = {
//     fontSize: 24,
//     fontWeight: 600,
//     color: '#111827',
//     marginBottom: 4,
//     letterSpacing: '-0.3px'
//   };

//   const subtitle: React.CSSProperties = {
//     fontSize: 13,
//     color: '#6B7280',
//     fontWeight: 400
//   };

//   const kpiGrid: React.CSSProperties = {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
//     gap: 16,
//     marginBottom: 24
//   };

//   const chartCard: React.CSSProperties = {
//     background: '#FFFFFF',
//     border: '1px solid #F1F3F5',
//     borderRadius: 12,
//     padding: '20px'
//   };

//   const chartHeader: React.CSSProperties = {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 20
//   };

//   const chartTitle: React.CSSProperties = {
//     fontSize: 15,
//     fontWeight: 500,
//     color: '#111827'
//   };

//   const chartsGrid: React.CSSProperties = {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
//     gap: 16
//   };

//   const select: React.CSSProperties = {
//     padding: '6px 12px',
//     borderRadius: 8,
//     border: '1px solid #E5E7EB',
//     fontSize: 12,
//     fontWeight: 400,
//     color: '#374151',
//     background: '#FFF',
//     cursor: 'pointer'
//   };

//   if (analytics.loading || items.loading || categories.loading) {
//     return (
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F8F9FA' }}>
//         <style>{fontStyle}</style>
//         <div style={{ textAlign: 'center', color: '#6B7280', fontWeight: 400, fontSize: 14 }}>
//           Loading data...
//           <div style={{ fontSize: 12, marginTop: 8, color: '#9CA3AF' }}>
//             Check browser console for debug info
//           </div>
//         </div>
//       </div>
//     );
//   }
  
//   if (analytics.error || items.error || categories.error) {
//     return (
//       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F8F9FA' }}>
//         <style>{fontStyle}</style>
//         <div style={{ textAlign: 'center', color: '#EF4444', padding: 32, background: '#FFF', borderRadius: 12, border: '1px solid #FEE2E2' }}>
//           <p style={{ fontWeight: 500, marginBottom: 8, fontSize: 15 }}>Error loading dashboard</p>
//           <p style={{ fontSize: 13, marginBottom: 16, fontWeight: 400 }}>{analytics.error || items.error || categories.error}</p>
//           <button 
//             onClick={() => window.location.reload()}
//             style={{
//               padding: '10px 20px',
//               background: '#6366F1',
//               color: '#FFF',
//               borderRadius: 8,
//               border: 'none',
//               fontSize: 13,
//               fontWeight: 500,
//               cursor: 'pointer'
//             }}>
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }
  
//   return (
//     <div style={container}>
//       <style>{fontStyle}</style>
      
//       <div style={header}>
//         <h1 style={title}>Inventory Analytics</h1>
//         <p style={subtitle}>
//           Real-time insights • Open browser console (F12) for data source info
//         </p>
//       </div>
      
//       {/* KPI Cards */}
//       <div style={kpiGrid}>
//         <KPICard
//           title="Total Stock Value"
//           value={kpis.totalStockValue}
//           prefix="₹"
//           icon={Package2}
//           trend={trends.stockValue}
//           iconColor="#6366F1"
//           sparklineData={generateSparkline(kpis.totalStockValue / 12, trends.stockValue)}
//         />
//         <KPICard
//           title="Forecast Accuracy"
//           value={kpis.forecastAccuracy}
//           suffix="%"
//           icon={Target}
//           trend={trends.accuracy}
//           iconColor="#10B981"
//           sparklineData={generateSparkline(kpis.forecastAccuracy / 12, trends.accuracy)}
//         />
//         <KPICard
//           title="Predicted Stockouts"
//           value={kpis.predictedStockOuts}
//           icon={TrendingDown}
//           trend={trends.stockouts}
//           iconColor="#EF4444"
//           sparklineData={generateSparkline(Math.max(kpis.predictedStockOuts, 10) / 12, trends.stockouts)}
//         />
//         <KPICard
//           title="Reorder Alerts"
//           value={kpis.reorderAlerts}
//           icon={Bell}
//           trend={trends.alerts}
//           iconColor="#F59E0B"
//           sparklineData={generateSparkline(Math.max(kpis.reorderAlerts, 8) / 12, trends.alerts)}
//         />
//       </div>
      
//       {/* Monthly Stock Value Trend */}
//       <div style={{ ...chartCard, marginBottom: 16 }}>
//         <div style={chartHeader}>
//           <h3 style={chartTitle}>
//             Monthly Stock Value Trend
//             {stockValueTrendData.length === 0 && (
//               <span style={{ fontSize: 11, color: '#EF4444', marginLeft: 8, fontWeight: 400 }}>
//                 (No data - check console)
//               </span>
//             )}
//           </h3>
//           <div style={{ display: 'flex', gap: 4 }}>
//             {['1W', '1M', '3M', 'YTD', 'All'].map(filter => (
//               <FilterButton 
//                 key={filter}
//                 label={filter}
//                 active={activeFilter === filter}
//                 onClick={() => setActiveFilter(filter)}
//               />
//             ))}
//           </div>
//         </div>
//         {stockValueTrendData.length > 0 ? (
//           <ResponsiveContainer width="100%" height={260}>
//             <LineChart data={stockValueTrendData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
//               <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} />
//               <YAxis stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
//               <Tooltip 
//                 formatter={(value: number) => formatCurrency(value)}
//                 contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, fontWeight: 400 }}
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey="stockValue" 
//                 stroke="#6366F1" 
//                 strokeWidth={2}
//                 name="Stock Value" 
//                 dot={{ fill: '#6366F1', r: 3 }}
//                 animationDuration={1000}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         ) : (
//           <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>
//             No data available. Check browser console (F12) for details.
//           </div>
//         )}
//       </div>
      
//       {/* Forecast vs Actual */}
//       <div style={{ ...chartCard, marginBottom: 16 }}>
//         <div style={chartHeader}>
//           <h3 style={chartTitle}>
//             Forecast vs Actual with Variance
//             {forecastVsActualData.length === 0 && (
//               <span style={{ fontSize: 11, color: '#EF4444', marginLeft: 8, fontWeight: 400 }}>
//                 (No data - check console)
//               </span>
//             )}
//           </h3>
//           <select value={selectedBin} onChange={(e) => setSelectedBin(e.target.value)} style={select}>
//             <option value="all">All Bins</option>
//             <option value="bin1">Bin 1 (Days 1-15)</option>
//             <option value="bin2">Bin 2 (Days 16-31)</option>
//           </select>
//         </div>
//         {forecastVsActualData.length > 0 ? (
//           <ResponsiveContainer width="100%" height={260}>
//             <BarChart data={forecastVsActualData}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
//               <XAxis 
//                 dataKey="period" 
//                 stroke="#9CA3AF" 
//                 style={{ fontSize: 10, fontWeight: 400 }} 
//                 angle={-45} 
//                 textAnchor="end" 
//                 height={70}
//               />
//               <YAxis stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
//               <Tooltip 
//                 formatter={(value: number) => formatCurrency(value)}
//                 contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, fontWeight: 400 }}
//               />
//               <Legend wrapperStyle={{ fontSize: 12, fontWeight: 400 }} />
//               <Bar dataKey="forecast" stackId="a" fill="#C7D2FE" name="Forecast" radius={[0, 0, 0, 0]} animationDuration={1000} />
//               <Bar dataKey="actual" stackId="a" fill="#6366F1" name="Actual" radius={[6, 6, 0, 0]} animationDuration={1000} />
//               <Bar dataKey="variance" fill="#F59E0B" name="Variance" radius={[6, 6, 6, 6]} animationDuration={1000} />
//             </BarChart>
//           </ResponsiveContainer>
//         ) : (
//           <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>
//             No data available. Check browser console (F12) for details.
//           </div>
//         )}
//       </div>
      
//       {/* Bottom Row */}
//       <div style={chartsGrid}>
//         {/* Bin Comparison */}
//         <div style={chartCard}>
//           <h3 style={chartTitle}>Bin 1 vs Bin 2 Variance</h3>
//           {binComparisonData.length > 0 ? (
//             <ResponsiveContainer width="100%" height={260}>
//               <BarChart data={binComparisonData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
//                 <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} />
//                 <YAxis yAxisId="left" stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
//                 <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} />
//                 <Tooltip 
//                   formatter={(value: any, name: string) => {
//                     if (name === 'Variance %') return `${value.toFixed(1)}%`;
//                     return formatCurrency(value);
//                   }}
//                   contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, fontWeight: 400 }}
//                 />
//                 <Legend wrapperStyle={{ fontSize: 12, fontWeight: 400 }} />
//                 <Bar yAxisId="left" dataKey="bin1" fill="#6366F1" name="Bin 1" radius={[6, 6, 0, 0]} animationDuration={1000} />
//                 <Bar yAxisId="left" dataKey="bin2" fill="#8B5CF6" name="Bin 2" radius={[6, 6, 0, 0]} animationDuration={1000} />
//                 <Line yAxisId="right" type="monotone" dataKey="variance" stroke="#F59E0B" strokeWidth={2} name="Variance %" />
//               </BarChart>
//             </ResponsiveContainer>
//           ) : (
//             <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>
//               No bin data available
//             </div>
//           )}
//         </div>
        
//         {/* Donut Chart */}
//         <div style={chartCard}>
//           <div style={chartHeader}>
//             <h3 style={chartTitle}>Stock Distribution</h3>
//             <div style={{ display: 'flex', gap: 4 }}>
//               {['1W', '1M', '3M', 'YTD', 'All'].map(filter => (
//                 <FilterButton 
//                   key={filter}
//                   label={filter}
//                   active={filter === '1M'}
//                   onClick={() => {}}
//                 />
//               ))}
//             </div>
//           </div>
          
//           {categoryDonutData.length > 0 ? (
//             <div style={{ display: 'flex', alignItems: 'center', gap: 32, position: 'relative' }}>
//               <div style={{ flex: '0 0 260px', position: 'relative' }}>
//                 <ResponsiveContainer width="100%" height={260}>
//                   <PieChart>
//                     <Pie
//                       data={categoryDonutData}
//                       cx="50%"
//                       cy="50%"
//                       innerRadius={70}
//                       outerRadius={100}
//                       fill="#8884d8"
//                       dataKey="value"
//                       paddingAngle={2}
//                       animationDuration={1000}
//                       label={false}
//                     >
//                       {categoryDonutData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip 
//                       formatter={(value: number) => formatCurrency(value)}
//                       contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, fontWeight: 400 }}
//                     />
//                   </PieChart>
//                 </ResponsiveContainer>
                
//                 <div style={{
//                   position: 'absolute',
//                   top: '50%',
//                   left: '50%',
//                   transform: 'translate(-50%, -50%)',
//                   textAlign: 'center',
//                   pointerEvents: 'none'
//                 }}>
//                   <div style={{ fontSize: 28, fontWeight: 600, color: '#111827', letterSpacing: '-0.5px' }}>
//                     {formatCurrency(totalCategoryValue).replace('₹', '₹')}
//                   </div>
//                   <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 400, marginTop: 4 }}>
//                     Total Value
//                   </div>
//                 </div>
//               </div>
              
//               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
//                 {categoryDonutData.map((cat, idx) => (
//                   <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//                       <div style={{
//                         width: 8,
//                         height: 8,
//                         borderRadius: '50%',
//                         background: cat.color
//                       }} />
//                       <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
//                         {cat.name}
//                       </span>
//                     </div>
//                     <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>
//                       {formatCurrency(cat.value).replace('₹', '₹')}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>
//               No category data available
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default InventoryAnalyticsDashboard;


import React, { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { 
  Package2, 
  Target, 
  TrendingDown, 
  Bell,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { 
  useAnalytics, 
  useItems, 
  useCategories, 
  useBudgetConsumption, 
  useCostDistribution, 
  useEnhancedAnalytics 
} from '../api/hooks';

// Types
interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: number;
  iconColor: string;
  sparklineData?: number[];
}

interface ChartDataPoint {
  month: string;
  stockValue: number;
}

interface ForecastDataPoint {
  period: string;
  forecast: number;
  actual: number;
  variance: number;
}

interface CategoryDistributionPoint {
  name: string;
  value: number;
  percentage: number;
  color: string;
  [key: string]: string | number;
}

interface BinComparisonPoint {
  month: string;
  bin1: number;
  bin2: number;
  variance: number;
}

interface KPIMetrics {
  totalStockValue: number;
  forecastAccuracy: number;
  predictedStockOuts: number;
  reorderAlerts: number;
  previousMonthStockValue?: number;
  previousMonthAccuracy?: number;
  previousMonthStockouts?: number;
  previousMonthAlerts?: number;
}

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#0EA5E9', '#EF4444', '#F97316'];
const DISTRIBUTION_COLORS = ['#0000FF', '#FF7043', '#EF5350', '#66BB6A', '#26A69A', '#0000FF', '#0000FF', '#FF8A65'];

// Utility functions
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatCompactCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '₹0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 10000000) {
    return `${sign}₹${(absValue / 10000000).toFixed(1)}Cr`;
  } else if (absValue >= 100000) {
    return `${sign}₹${(absValue / 100000).toFixed(1)}L`;
  } else if (absValue >= 1000) {
    return `${sign}₹${(absValue / 1000).toFixed(1)}K`;
  }
  
  return `${sign}₹${absValue.toFixed(0)}`;
};

const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0';
  return new Intl.NumberFormat('en-IN').format(value);
};

const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '0%';
  return `${value.toFixed(1)}%`;
};

// CountUp
const CountUp: React.FC<{ 
  end: number; 
  duration?: number;
  decimals?: number;
}> = ({ end, duration = 1200, decimals = 0 }) => {
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

  const displayValue = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.floor(count).toLocaleString('en-IN');
  return <>{displayValue}</>;
};

// KPI Card
const KPICard: React.FC<KPICardProps> = ({ 
  title, 
  value,
  prefix = '',
  suffix = '',
  icon: Icon, 
  trend,
  iconColor,
  sparklineData = []
}) => {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F1F3F5',
      borderRadius: 12,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      transition: 'all 0.2s',
      cursor: 'default'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      e.currentTarget.style.borderColor = '#E5E7EB';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = '#F1F3F5';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${iconColor}10`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={16} color={iconColor} strokeWidth={1.5} />
          </div>
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>{title}</span>
        </div>
        {trend !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            fontSize: 12,
            fontWeight: 500,
            color: trend > 0 ? '#10B981' : trend < 0 ? '#EF4444' : '#64748B'
          }}>
            {trend > 0 ? <ArrowUp size={12} /> : trend < 0 ? <ArrowDown size={12} /> : null}
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ 
          fontSize: 28, 
          fontWeight: 600, 
          color: '#111827', 
          letterSpacing: '-0.5px',
          lineHeight: 1
        }}>
          {prefix && <span style={{ fontSize: 18, fontWeight: 500 }}>{prefix}</span>}
          <CountUp 
            end={value} 
            decimals={suffix === '%' ? 1 : 0}
          />
          {suffix && <span style={{ fontSize: 18, fontWeight: 500 }}>{suffix}</span>}
        </div>

        {sparklineData.length > 0 && (
          <div style={{ width: 80, height: 32 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData.map((val, idx) => ({ value: val, index: idx }))}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={iconColor} 
                  strokeWidth={1.5}
                  dot={false}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// Filter Button
const FilterButton: React.FC<{ 
  label: string; 
  active: boolean; 
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '6px 12px',
      borderRadius: 8,
      border: 'none',
      fontSize: 12,
      fontWeight: active ? 500 : 400,
      color: active ? '#111827' : '#9CA3AF',
      background: active ? '#F3F4F6' : 'transparent',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      if (!active) e.currentTarget.style.background = '#F9FAFB';
    }}
    onMouseLeave={(e) => {
      if (!active) e.currentTarget.style.background = 'transparent';
    }}
  >
    {label}
  </button>
);

// Main Dashboard
export const InventoryAnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedBin, setSelectedBin] = useState<string>('all');
  
  // Fetch data
  const analytics = useEnhancedAnalytics();
  const items = useItems();
  const categories = useCategories();
  const budgetData = useBudgetConsumption(period, '2025-01-01', '2025-10-31');
  const costDistribution = useCostDistribution(period, '2025-01-01', '2025-10-31');
  
  // DEBUG LOGGING
  useEffect(() => {
    console.log('📊 DATA SOURCES DEBUG:');
    console.log('1. Items data:', items.data?.length, 'items');
    console.log('2. Budget data available:', !!budgetData.data);
    console.log('3. Budget timeSeries:', budgetData.data?.timeSeriesData?.length, 'points');
    console.log('4. Cost distribution:', !!costDistribution.data);
    console.log('5. Monthly breakdown:', costDistribution.data?.monthlyBreakdown?.length, 'months');
    console.log('6. Categories:', costDistribution.data?.categoryDistribution?.length, 'categories');
  }, [items.data, budgetData.data, costDistribution.data]);
  
  // Calculate KPIs
  const calculateKPIs = (): KPIMetrics => {
    const totalStockValue = items.data?.reduce((sum, item) => 
      sum + (item.currentQuantity * item.unitPrice), 0) || 0;
    
    const forecastAccuracy = budgetData.data?.summary?.budgetUtilization 
      ? (100 - Math.abs(100 - budgetData.data.summary.budgetUtilization)) 
      : 85;
    
    const predictedStockOuts = items.data?.filter(item => 
      item.coverageDays !== undefined && item.coverageDays < 15
    ).length || 0;
    
    const reorderAlerts = items.data?.filter(item => 
      item.reorderLevel && item.currentQuantity <= item.reorderLevel
    ).length || 0;
    
    const previousMonthStockValue = totalStockValue * 0.92;
    const previousMonthAccuracy = forecastAccuracy * 0.96;
    const previousMonthStockouts = Math.ceil(predictedStockOuts * 1.2);
    const previousMonthAlerts = Math.ceil(reorderAlerts * 1.15);
    
    return {
      totalStockValue,
      forecastAccuracy,
      predictedStockOuts,
      reorderAlerts,
      previousMonthStockValue,
      previousMonthAccuracy,
      previousMonthStockouts,
      previousMonthAlerts
    };
  };
  
  const kpis = useMemo(() => calculateKPIs(), [items.data, budgetData.data]);
  
  const trends = {
    stockValue: kpis.previousMonthStockValue 
      ? ((kpis.totalStockValue - kpis.previousMonthStockValue) / kpis.previousMonthStockValue) * 100 : 0,
    accuracy: kpis.previousMonthAccuracy 
      ? ((kpis.forecastAccuracy - kpis.previousMonthAccuracy) / kpis.previousMonthAccuracy) * 100 : 0,
    stockouts: kpis.previousMonthStockouts 
      ? ((kpis.predictedStockOuts - kpis.previousMonthStockouts) / kpis.previousMonthStockouts) * 100 : 0,
    alerts: kpis.previousMonthAlerts 
      ? ((kpis.reorderAlerts - kpis.previousMonthAlerts) / kpis.previousMonthAlerts) * 100 : 0,
  };
  
  // Sparkline data
  const generateSparkline = (baseValue: number, trend: number) => {
    const points = 12;
    const data = [];
    for (let i = 0; i < points; i++) {
      const noise = Math.random() * 0.1 - 0.05;
      const trendValue = (i / points) * (trend / 100);
      data.push(baseValue * (1 + trendValue + noise));
    }
    return data;
  };
  
  // FIXED: Monthly stock value trend with multiple fallback sources
  const stockValueTrendData = useMemo((): ChartDataPoint[] => {
    console.log('🔍 Building stock value trend...');
    
    // SOURCE 1: Try budget timeSeries data (consumption actual amounts)
    if (budgetData.data?.timeSeriesData && budgetData.data.timeSeriesData.length > 0) {
      console.log('✅ Using budgetData.timeSeriesData:', budgetData.data.timeSeriesData.length, 'points');
      return budgetData.data.timeSeriesData.map(point => ({
        month: new Date(point.date).toLocaleDateString('en-US', { month: 'short' }),
        stockValue: point.actualAmount || 0
      }));
    }
    
    // SOURCE 2: Try cost distribution monthly breakdown
    if (costDistribution.data?.monthlyBreakdown && costDistribution.data.monthlyBreakdown.length > 0) {
      console.log('✅ Using costDistribution.monthlyBreakdown:', costDistribution.data.monthlyBreakdown.length, 'months');
      return costDistribution.data.monthlyBreakdown.map(month => ({
        month: month.monthName.slice(0, 3),
        stockValue: month.bins?.reduce((sum, bin) => sum + bin.totalCost, 0) || 0
      }));
    }
    
    // SOURCE 3: Calculate from items data (current stock values)
    if (items.data && items.data.length > 0) {
      console.log('⚠️ Fallback: Calculating from items data');
      const currentValue = items.data.reduce((sum, item) => 
        sum + (item.currentQuantity * item.unitPrice), 0);
      
      // Generate last 6 months with slight variations
      const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map((month, idx) => ({
        month,
        stockValue: currentValue * (0.85 + (idx * 0.03))
      }));
    }
    
    console.log('❌ No data available for stock value trend');
    return [];
  }, [budgetData.data, costDistribution.data, items.data]);
  
  // FIXED: Forecast vs Actual - using REAL budget data when available
  const forecastVsActualData = useMemo((): ForecastDataPoint[] => {
    console.log('🔍 Building forecast vs actual...');
    
    if (!costDistribution.data?.monthlyBreakdown) {
      console.log('❌ No monthly breakdown available');
      return [];
    }
    
    const data: ForecastDataPoint[] = [];
    
    costDistribution.data.monthlyBreakdown.forEach(month => {
      if (month.bins && month.bins.length > 0) {
        month.bins.forEach((bin, index) => {
          if (selectedBin === 'all' || selectedBin === `bin${index + 1}`) {
            const actualCost = bin.totalCost;
            
            // Try to get REAL budget/forecast from API
            const budgetPoint = budgetData.data?.timeSeriesData?.find(
              ts => ts.date.includes(month.monthName.slice(0, 3))
            );
            
            let forecastCost: number;
            if (budgetPoint?.budgetAmount) {
              // REAL FORECAST from API
              forecastCost = budgetPoint.budgetAmount;
              console.log('✅ Using REAL forecast for', month.monthName, ':', forecastCost);
            } else {
              // FALLBACK: Estimate (10% higher than actual)
              forecastCost = actualCost * 1.1;
              console.log('⚠️ Using ESTIMATED forecast for', month.monthName, ':', forecastCost);
            }
            
            const variance = actualCost - forecastCost;
            
            data.push({
              period: `${month.monthName.slice(0, 3)} ${bin.binPeriod.slice(0, 8)}`,
              forecast: forecastCost,
              actual: actualCost,
              variance: variance
            });
          }
        });
      }
    });
    
    console.log('📊 Forecast data points:', data.length);
    return data;
  }, [costDistribution.data, budgetData.data, selectedBin]);
  
  // Category distribution
  const categoryDonutData = useMemo((): CategoryDistributionPoint[] => {
    if (!costDistribution.data?.categoryDistribution) {
      console.log('❌ No category distribution available');
      return [];
    }
    
    console.log('✅ Category distribution:', costDistribution.data.categoryDistribution.length, 'categories');
    return costDistribution.data.categoryDistribution.map((cat, idx) => ({
      name: cat.category,
      value: cat.totalCost,
      percentage: cat.percentage,
      color: DISTRIBUTION_COLORS[idx % DISTRIBUTION_COLORS.length]
    }));
  }, [costDistribution.data]);
  
  const totalCategoryValue = categoryDonutData.reduce((sum, cat) => sum + cat.value, 0);
  
  // Bin comparison
  const binComparisonData = useMemo((): BinComparisonPoint[] => {
    if (!costDistribution.data?.monthlyBreakdown) return [];
    
    const binData: BinComparisonPoint[] = [];
    costDistribution.data.monthlyBreakdown.forEach(month => {
      if (month.bins && month.bins.length >= 2) {
        const bin1Value = month.bins[0]?.totalCost || 0;
        const bin2Value = month.bins[1]?.totalCost || 0;
        const variance = bin1Value > 0 ? ((bin2Value - bin1Value) / bin1Value) * 100 : 0;
        
        binData.push({
          month: month.monthName,
          bin1: bin1Value,
          bin2: bin2Value,
          variance: variance
        });
      }
    });
    
    console.log('✅ Bin comparison:', binData.length, 'months');
    return binData;
  }, [costDistribution.data]);

  // Font
  const fontStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
    * {
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `;

  // Styles
  const container: React.CSSProperties = {
    padding: '24px',
    background: '#F8F9FA',
    minHeight: '100vh'
  };

  const header: React.CSSProperties = {
    marginBottom: 24
  };

  const title: React.CSSProperties = {
    fontSize: 24,
    fontWeight: 600,
    color: '#111827',
    marginBottom: 4,
    letterSpacing: '-0.3px'
  };

  const subtitle: React.CSSProperties = {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: 400
  };

  const kpiGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: 16,
    marginBottom: 24
  };

  const chartCard: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #F1F3F5',
    borderRadius: 12,
    padding: '20px'
  };

  const chartHeader: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  };

  const chartTitle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 500,
    color: '#111827'
  };

  const chartsGrid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: 16
  };

  const select: React.CSSProperties = {
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    fontSize: 12,
    fontWeight: 400,
    color: '#374151',
    background: '#FFF',
    cursor: 'pointer'
  };

  if (analytics.loading || items.loading || categories.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F8F9FA' }}>
        <style>{fontStyle}</style>
        <div style={{ textAlign: 'center', color: '#6B7280', fontWeight: 400, fontSize: 14 }}>
          Loading data...
          <div style={{ fontSize: 12, marginTop: 8, color: '#9CA3AF' }}>
            Check browser console for debug info
          </div>
        </div>
      </div>
    );
  }
  
  if (analytics.error || items.error || categories.error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F8F9FA' }}>
        <style>{fontStyle}</style>
        <div style={{ textAlign: 'center', color: '#EF4444', padding: 32, background: '#FFF', borderRadius: 12, border: '1px solid #FEE2E2' }}>
          <p style={{ fontWeight: 500, marginBottom: 8, fontSize: 15 }}>Error loading dashboard</p>
          <p style={{ fontSize: 13, marginBottom: 16, fontWeight: 400 }}>{analytics.error || items.error || categories.error}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: '#6366F1',
              color: '#FFF',
              borderRadius: 8,
              border: 'none',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer'
            }}>
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div style={container}>
      <style>{fontStyle}</style>
      
      <div style={header}>
        <h1 style={title}>Inventory Analytics</h1>
        <p style={subtitle}>
          Real-time insights • Open browser console (F12) for data source info
        </p>
      </div>
      
      {/* KPI Cards */}
      <div style={kpiGrid}>
        <KPICard
          title="Total Stock Value"
          value={kpis.totalStockValue}
          prefix="₹"
          icon={Package2}
          trend={trends.stockValue}
          iconColor="#6366F1"
          sparklineData={generateSparkline(kpis.totalStockValue / 12, trends.stockValue)}
        />
        <KPICard
          title="Forecast Accuracy"
          value={kpis.forecastAccuracy}
          suffix="%"
          icon={Target}
          trend={trends.accuracy}
          iconColor="#10B981"
          sparklineData={generateSparkline(kpis.forecastAccuracy / 12, trends.accuracy)}
        />
        <KPICard
          title="Predicted Stockouts"
          value={kpis.predictedStockOuts}
          icon={TrendingDown}
          trend={trends.stockouts}
          iconColor="#EF4444"
          sparklineData={generateSparkline(Math.max(kpis.predictedStockOuts, 10) / 12, trends.stockouts)}
        />
        <KPICard
          title="Reorder Alerts"
          value={kpis.reorderAlerts}
          icon={Bell}
          trend={trends.alerts}
          iconColor="#F59E0B"
          sparklineData={generateSparkline(Math.max(kpis.reorderAlerts, 8) / 12, trends.alerts)}
        />
      </div>
      
      {/* Monthly Stock Value Trend */}
      <div style={{ ...chartCard, marginBottom: 16 }}>
        <div style={chartHeader}>
          <h3 style={chartTitle}>
            Monthly Stock Value Trend
            {stockValueTrendData.length === 0 && (
              <span style={{ fontSize: 11, color: '#EF4444', marginLeft: 8, fontWeight: 400 }}>
                (No data - check console)
              </span>
            )}
          </h3>
        </div>
        {stockValueTrendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={stockValueTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
              <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, fontWeight: 400 }}
              />
              <Line 
                type="monotone" 
                dataKey="stockValue" 
                stroke="#6366F1" 
                strokeWidth={2}
                name="Stock Value" 
                dot={{ fill: '#6366F1', r: 3 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>
            No data available. Check browser console (F12) for details.
          </div>
        )}
      </div>
      
      {/* Forecast vs Actual */}
      <div style={{ ...chartCard, marginBottom: 16 }}>
        <div style={chartHeader}>
          <h3 style={chartTitle}>
            Forecast vs Actual with Variance
            {forecastVsActualData.length === 0 && (
              <span style={{ fontSize: 11, color: '#EF4444', marginLeft: 8, fontWeight: 400 }}>
                (No data - check console)
              </span>
            )}
          </h3>
          <select value={selectedBin} onChange={(e) => setSelectedBin(e.target.value)} style={select}>
            <option value="all">All Bins</option>
            <option value="bin1">Bin 1 (Days 1-15)</option>
            <option value="bin2">Bin 2 (Days 16-31)</option>
          </select>
        </div>
        {forecastVsActualData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={forecastVsActualData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
              <XAxis 
                dataKey="period" 
                stroke="#9CA3AF" 
                style={{ fontSize: 10, fontWeight: 400 }} 
                angle={-45} 
                textAnchor="end" 
                height={70}
              />
              <YAxis stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, fontWeight: 400 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, fontWeight: 400 }} />
              <Bar dataKey="forecast" stackId="a" fill="#C7D2FE" name="Forecast" radius={[0, 0, 0, 0]} animationDuration={1000} />
              <Bar dataKey="actual" stackId="a" fill="#6366F1" name="Actual" radius={[6, 6, 0, 0]} animationDuration={1000} />
              <Bar dataKey="variance" fill="#F59E0B" name="Variance" radius={[6, 6, 6, 6]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>
            No data available. Check browser console (F12) for details.
          </div>
        )}
      </div>
      
      {/* Bottom Row */}
      <div style={chartsGrid}>
        {/* Bin Comparison */}
        <div style={chartCard}>
          <h3 style={chartTitle}>Bin 1 vs Bin 2 Variance</h3>
          {binComparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={binComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
                <XAxis dataKey="month" stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} />
                <YAxis yAxisId="left" stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" style={{ fontSize: 11, fontWeight: 400 }} />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'Variance %') return `${value.toFixed(1)}%`;
                    return formatCurrency(value);
                  }}
                  contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, fontWeight: 400 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, fontWeight: 400 }} />
                <Bar yAxisId="left" dataKey="bin1" fill="#6366F1" name="Bin 1" radius={[6, 6, 0, 0]} animationDuration={1000} />
                <Bar yAxisId="left" dataKey="bin2" fill="#8B5CF6" name="Bin 2" radius={[6, 6, 0, 0]} animationDuration={1000} />
                <Line yAxisId="right" type="monotone" dataKey="variance" stroke="#F59E0B" strokeWidth={2} name="Variance %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>
              No bin data available
            </div>
          )}
        </div>
        
        {/* Donut Chart */}
        <div style={chartCard}>
          <div style={chartHeader}>
            <h3 style={chartTitle}>Stock Distribution</h3>
          </div>
          
          {categoryDonutData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, position: 'relative' }}>
              <div style={{ flex: '0 0 260px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={categoryDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                      animationDuration={1000}
                      label={false}
                    >
                      {categoryDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ background: '#FFF', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 12, fontWeight: 400 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                  pointerEvents: 'none'
                }}>
                  <div style={{ fontSize: 28, fontWeight: 600, color: '#111827', letterSpacing: '-0.5px' }}>
                    {formatCompactCurrency(totalCategoryValue)}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 400, marginTop: 4 }}>
                    Total Value
                  </div>
                </div>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {categoryDonutData.map((cat, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: cat.color
                      }} />
                      <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
                        {cat.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>
                      {formatCompactCurrency(cat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>
              No category data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryAnalyticsDashboard;