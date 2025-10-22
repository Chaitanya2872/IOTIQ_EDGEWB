// import React, { useState, useEffect } from 'react';
// import {
//   Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
//   ResponsiveContainer, Cell, PieChart, Pie, ScatterChart, Scatter, LineChart, BarChart, Area, AreaChart
// } from 'recharts';
// import { 
//   DollarSign, TrendingUp, TrendingDown, Package, 
//   AlertCircle, Calendar, RefreshCw, BarChart3, Activity
// } from 'lucide-react';
// import { 
//   useEnhancedAnalytics,
//   useCategories,
//   useItems
// } from '../api/hooks';
// import { 
//   type Category,
//   type Item
// } from '../api/inventory';

// // Enhanced color palette inspired by the reference design
// const COLORS = {
//   primary: '#6366f1',      // Indigo
//   success: '#10b981',      // Emerald
//   warning: '#f59e0b',      // Amber
//   danger: '#ef4444',       // Red
//   info: '#3b82f6',         // Blue
//   purple: '#a855f7',       // Purple
//   pink: '#ec4899',         // Pink
//   teal: '#14b8a6',         // Teal
//   cyan: '#06b6d4',         // Cyan
//   orange: '#f97316',       // Orange
  
//   // Soft variants
//   primarySoft: '#818cf8',
//   successSoft: '#34d399',
//   warningSoft: '#fbbf24',
//   dangerSoft: '#f87171',
//   infoSoft: '#60a5fa',
//   purpleSoft: '#c084fc',
//   pinkSoft: '#f472b6',
//   tealSoft: '#2dd4bf',
  
//   // Text colors
//   textDark: '#1f2937',
//   textMuted: '#6b7280',
//   textLight: '#9ca3af',
  
//   // Background colors
//   bgPrimary: '#f9fafb',
//   bgWhite: '#ffffff',
//   bgGray: '#f3f4f6',
// };

// const CHART_COLORS = [
//   '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
//   '#a855f7', '#ec4899', '#14b8a6', '#f97316'
// ];

// // Soft gradient backgrounds for cards
// const cardGradients = {
//   primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//   success: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
//   warning: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
//   danger: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
//   info: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
//   purple: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
// };

// // Mock data generators
// const generateMockBudgetData = () => {
//   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//   const currentMonth = 6; // July
  
//   return {
//     budgetAllocations: {
//       monthly: 450000,
//       yearly: 5400000,
//     },
//     actualData: {
//       totalCost: 425000,
//       totalQuantity: 1250,
//       itemCount: 85,
//       averageUnitCost: 340,
//     },
//     summary: {
//       budgetUtilization: 85.5,
//       remainingBudget: 125000,
//       dailyBurnRate: 14500,
//       projectedOverrun: -25000,
//     },
//     timeSeriesData: months.slice(0, currentMonth + 1).map((month, idx) => ({
//       period: month,
//       budgetAmount: 450000,
//       actualAmount: 380000 + Math.random() * 100000,
//       variance: Math.random() * 50000 - 25000,
//       cumulativeBudget: 450000 * (idx + 1),
//       cumulativeActual: (380000 + Math.random() * 100000) * (idx + 1),
//       utilizationPercentage: 80 + Math.random() * 20,
//     })),
//     varianceAnalysis: {
//       variancePercentage: -5.5,
//       status: 'under-budget',
//       severity: 'low',
//     }
//   };
// };

// const generateMockCostDistribution = () => ({
//   totalCost: 2850000,
//   categoryDistribution: [
//     { category: 'Office Supplies', categoryId: 1, totalCost: 450000, totalQuantity: 1200, percentage: 15.8, avgUnitPrice: 375 },
//     { category: 'IT Equipment', categoryId: 2, totalCost: 850000, totalQuantity: 150, percentage: 29.8, avgUnitPrice: 5667 },
//     { category: 'Furniture', categoryId: 3, totalCost: 650000, totalQuantity: 85, percentage: 22.8, avgUnitPrice: 7647 },
//     { category: 'Pantry Items', categoryId: 4, totalCost: 280000, totalQuantity: 2500, percentage: 9.8, avgUnitPrice: 112 },
//     { category: 'Cleaning Supplies', categoryId: 5, totalCost: 180000, totalQuantity: 800, percentage: 6.3, avgUnitPrice: 225 },
//     { category: 'Stationery', categoryId: 6, totalCost: 220000, totalQuantity: 3000, percentage: 7.7, avgUnitPrice: 73 },
//     { category: 'Electronics', categoryId: 7, totalCost: 220000, totalQuantity: 120, percentage: 7.7, avgUnitPrice: 1833 },
//   ],
// });

// // Enhanced Tooltip with better styling
// const ModernTooltip: React.FC<any> = ({ active, payload, label }) => {
//   if (active && payload && payload.length) {
//     return (
//       <div style={{ 
//         backgroundColor: 'rgba(255, 255, 255, 0.98)', 
//         backdropFilter: 'blur(12px)',
//         color: COLORS.textDark, 
//         padding: '14px 16px', 
//         borderRadius: '12px',
//         border: `1px solid rgba(0, 0, 0, 0.05)`,
//         boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
//         fontSize: '13px',
//         minWidth: '200px'
//       }}>
//         <div style={{ fontWeight: '600', marginBottom: '10px', fontSize: '13px', color: COLORS.textDark }}>
//           {label}
//         </div>
//         {payload.map((entry: any, index: number) => (
//           <div key={index} style={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             gap: '8px', 
//             marginBottom: index === payload.length - 1 ? 0 : '6px'
//           }}>
//             <div style={{ 
//               width: '10px', 
//               height: '10px', 
//               borderRadius: '50%', 
//               backgroundColor: entry.color,
//               boxShadow: `0 0 0 2px ${entry.color}20`
//             }} />
//             <span style={{ flex: 1, color: COLORS.textMuted, fontSize: '12px' }}>
//               {entry.name}:
//             </span>
//             <span style={{ fontWeight: '600', color: COLORS.textDark, fontSize: '13px' }}>
//               {entry.name.includes('₹') || entry.name.includes('Cost') || entry.name.includes('Price') || 
//                entry.name.includes('Value') || entry.name.includes('Spend') || entry.name.includes('Budget') ? 
//                 `₹${Number(entry.value).toLocaleString()}` : 
//                 typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
//             </span>
//           </div>
//         ))}
//       </div>
//     );
//   }
//   return null;
// };

// // Enhanced Card Component with better styling
// const Card: React.FC<{ 
//   children: React.ReactNode; 
//   gradient?: string;
//   noPadding?: boolean;
// }> = ({ children, gradient, noPadding }) => {
//   return (
//     <div style={{
//       background: gradient || COLORS.bgWhite,
//       borderRadius: '16px',
//       padding: noPadding ? 0 : '24px',
//       boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
//       border: `1px solid rgba(0, 0, 0, 0.04)`,
//       marginBottom: '20px',
//       transition: 'all 0.2s ease',
//     }}>
//       {children}
//     </div>
//   );
// };

// // Enhanced Metric Card with gradient support
// const MetricCard: React.FC<{
//   title: string;
//   value: string | number;
//   subtitle?: string;
//   icon: React.ReactNode;
//   trend?: 'up' | 'down' | 'neutral';
//   trendValue?: string;
//   gradient?: string;
//   color?: string;
// }> = ({ title, value, subtitle, icon, trend, trendValue, gradient, color = COLORS.primary }) => {
//   return (
//     <div style={{
//       background: gradient || COLORS.bgWhite,
//       borderRadius: '16px',
//       padding: '20px',
//       boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
//       border: `1px solid rgba(0, 0, 0, 0.04)`,
//       height: '100%',
//       position: 'relative',
//       overflow: 'hidden',
//       transition: 'transform 0.2s ease, box-shadow 0.2s ease',
//     }}
//     onMouseEnter={(e) => {
//       e.currentTarget.style.transform = 'translateY(-2px)';
//       e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
//     }}
//     onMouseLeave={(e) => {
//       e.currentTarget.style.transform = 'translateY(0)';
//       e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
//     }}
//     >
//       {gradient && (
//         <div style={{
//           position: 'absolute',
//           top: 0,
//           right: 0,
//           width: '100px',
//           height: '100px',
//           background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
//           borderRadius: '50%',
//           transform: 'translate(30%, -30%)',
//         }} />
//       )}
      
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
//         <div style={{ 
//           backgroundColor: gradient ? 'rgba(255, 255, 255, 0.25)' : `${color}15`,
//           padding: '10px',
//           borderRadius: '12px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           color: gradient ? '#ffffff' : color,
//         }}>
//           <div style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             {icon}
//           </div>
//         </div>
//         {trend && trendValue && (
//           <div style={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             gap: '4px',
//             fontSize: '12px',
//             fontWeight: '600',
//             padding: '4px 10px',
//             borderRadius: '20px',
//             backgroundColor: gradient ? 'rgba(255, 255, 255, 0.25)' : 
//               trend === 'up' ? `${COLORS.success}15` : 
//               trend === 'down' ? `${COLORS.danger}15` : `${COLORS.textMuted}15`,
//             color: gradient ? '#ffffff' : 
//               trend === 'up' ? COLORS.success : 
//               trend === 'down' ? COLORS.danger : COLORS.textMuted
//           }}>
//             {trend === 'up' ? <TrendingUp style={{ width: '14px', height: '14px' }} /> : 
//              trend === 'down' ? <TrendingDown style={{ width: '14px', height: '14px' }} /> : null}
//             {trendValue}
//           </div>
//         )}
//       </div>
      
//       <div style={{ position: 'relative', zIndex: 1 }}>
//         <div style={{ fontSize: '12px', color: gradient ? 'rgba(255, 255, 255, 0.9)' : COLORS.textMuted, marginBottom: '8px', fontWeight: '500' }}>
//           {title}
//         </div>
//         <div style={{ fontSize: '28px', fontWeight: '700', color: gradient ? '#ffffff' : COLORS.textDark, marginBottom: '4px', letterSpacing: '-0.5px' }}>
//           {value}
//         </div>
//         {subtitle && (
//           <div style={{ fontSize: '11px', color: gradient ? 'rgba(255, 255, 255, 0.8)' : COLORS.textLight, fontWeight: '500' }}>
//             {subtitle}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// // Budget KPIs Section with beautiful gradients
// const BudgetKPIs: React.FC<{
//   budgetData: any;
//   costDistributionData: any;
//   items: Item[];
// }> = ({ budgetData, costDistributionData, items }) => {
//   // Use mock data if real data is not available
//   const mockBudget = generateMockBudgetData();
//   const mockCost = generateMockCostDistribution();
  
//   const budget = budgetData || mockBudget;
//   const costDist = costDistributionData || mockCost;

//   const actualSpend = budget?.actualData?.totalCost || 0;
//   const plannedBudget = budget?.budgetAllocations?.monthly || 0;
  
//   const totalCost = costDist?.totalCost || 0;
//   const totalQuantity = costDist?.categoryDistribution?.reduce(
//     (sum: number, cat: any) => sum + (cat.totalQuantity || 0), 0
//   ) || 1;
//   const avgCostPerUnit = totalCost / totalQuantity;

//   const utilization = budget?.summary?.budgetUtilization || 0;

//   // High-Value Items calculation
//   const itemsWithValue = items.filter(item => item.totalValue && item.totalValue > 0);
//   const avgItemValue = itemsWithValue.length > 0 
//     ? itemsWithValue.reduce((sum, item) => sum + (item.totalValue || 0), 0) / itemsWithValue.length 
//     : 50000;
//   const highValueCount = itemsWithValue.filter(item => (item.totalValue || 0) > avgItemValue).length || 24;

//   const variance = plannedBudget > 0 
//     ? ((actualSpend - plannedBudget) / plannedBudget) * 100 
//     : 0;

//   return (
//     <>
//       <div style={{ 
//         display: 'grid', 
//         gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
//         gap: '20px',
//         marginBottom: '20px'
//       }}>
//         <MetricCard
//           title="Monthly Spend vs Forecast"
//           value={`₹${actualSpend.toLocaleString()}`}
//           subtitle={`Budget: ₹${plannedBudget.toLocaleString()}`}
//           icon={<DollarSign />}
//           trend={variance > 0 ? 'up' : variance < 0 ? 'down' : 'neutral'}
//           trendValue={`${Math.abs(variance).toFixed(1)}%`}
//           gradient={variance > 5 ? cardGradients.danger : variance < -5 ? cardGradients.success : undefined}
//           color={variance > 5 ? COLORS.danger : variance < -5 ? COLORS.success : COLORS.warning}
//         />
        
//         <MetricCard
//           title="Cost per Unit"
//           value={`₹${avgCostPerUnit.toFixed(2)}`}
//           subtitle="Weighted average cost"
//           icon={<Activity />}
//           gradient={cardGradients.info}
//         />
        
//         <MetricCard
//           title="Budget Utilization"
//           value={`${utilization.toFixed(1)}%`}
//           subtitle={utilization > 90 ? 'High usage - Monitor closely' : 'Within safe limits'}
//           icon={<AlertCircle />}
//           trend={utilization > 90 ? 'up' : 'neutral'}
//           trendValue={utilization > 90 ? 'High' : 'Normal'}
//           gradient={utilization > 90 ? cardGradients.warning : cardGradients.success}
//         />
        
//         <MetricCard
//           title="High-Value Items"
//           value={highValueCount}
//           subtitle="Items above average value"
//           icon={<Package />}
//           gradient={cardGradients.purple}
//         />
//       </div>
//     </>
//   );
// };

// // Enhanced Bar Chart with better styling
// const SpendByCategoryChart: React.FC<{
//   costDistributionData: any;
// }> = ({ costDistributionData }) => {
//   const mockCost = generateMockCostDistribution();
//   const data = costDistributionData || mockCost;
  
//   const chartData = data?.categoryDistribution?.map((cat: any, idx: number) => ({
//     category: cat.category.length > 15 ? cat.category.substring(0, 15) + '...' : cat.category,
//     spend: cat.totalCost,
//     quantity: cat.totalQuantity,
//     fill: CHART_COLORS[idx % CHART_COLORS.length]
//   })) || [];

//   return (
//     <Card>
//       <h3 style={{ 
//         fontSize: '16px', 
//         fontWeight: '700', 
//         color: COLORS.textDark, 
//         marginBottom: '20px',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '10px',
//         letterSpacing: '-0.3px'
//       }}>
//         <div style={{ 
//           padding: '8px', 
//           borderRadius: '10px', 
//           backgroundColor: `${COLORS.primary}15`,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}>
//           <BarChart3 style={{ width: '18px', height: '18px', color: COLORS.primary }} />
//         </div>
//         Spend by Category
//       </h3>
      
//       {chartData.length === 0 ? (
//         <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
//           No data available
//         </div>
//       ) : (
//         <ResponsiveContainer width="100%" height={340}>
//           <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
//             <defs>
//               {CHART_COLORS.map((color, idx) => (
//                 <linearGradient key={idx} id={`colorGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
//                   <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
//                 </linearGradient>
//               ))}
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
//             <XAxis 
//               dataKey="category" 
//               tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: '500' }} 
//               angle={-35}
//               textAnchor="end"
//               height={80}
//               stroke="rgba(0,0,0,0.1)"
//             />
//             <YAxis 
//               tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: '500' }}
//               stroke="rgba(0,0,0,0.1)"
//               tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
//             />
//             <Tooltip content={<ModernTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
//             <Bar dataKey="spend" radius={[8, 8, 0, 0]} name="Total Spend (₹)">
//               {chartData.map((entry: any, index: number) => (
//                 <Cell key={`cell-${index}`} fill={`url(#colorGradient${index % CHART_COLORS.length})`} />
//               ))}
//             </Bar>
//           </BarChart>
//         </ResponsiveContainer>
//       )}
//     </Card>
//   );
// };

// // Enhanced Donut Chart
// const PlannedVsActualDonut: React.FC<{
//   budgetData: any;
// }> = ({ budgetData }) => {
//   const mockBudget = generateMockBudgetData();
//   const budget = budgetData || mockBudget;
  
//   const actualSpend = budget?.actualData?.totalCost || 0;
//   const plannedBudget = budget?.budgetAllocations?.monthly || 0;
//   const remaining = Math.max(0, plannedBudget - actualSpend);
//   const utilizationPercent = plannedBudget > 0 ? (actualSpend / plannedBudget * 100) : 0;

//   const chartData = [
//     { name: 'Actual Spend', value: actualSpend, fill: COLORS.primary },
//     { name: 'Remaining Budget', value: remaining, fill: COLORS.success }
//   ];

//   return (
//     <Card>
//       <h3 style={{ 
//         fontSize: '16px', 
//         fontWeight: '700', 
//         color: COLORS.textDark, 
//         marginBottom: '20px',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '10px',
//         letterSpacing: '-0.3px'
//       }}>
//         <div style={{ 
//           padding: '8px', 
//           borderRadius: '10px', 
//           backgroundColor: `${COLORS.success}15`,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}>
//           <DollarSign style={{ width: '18px', height: '18px', color: COLORS.success }} />
//         </div>
//         Budget Overview
//       </h3>
      
//       {plannedBudget === 0 ? (
//         <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
//           No budget data available
//         </div>
//       ) : (
//         <>
//           <div style={{ position: 'relative' }}>
//             <ResponsiveContainer width="100%" height={280}>
//               <PieChart>
//                 <defs>
//                   <linearGradient id="primaryGrad" x1="0" y1="0" x2="1" y2="1">
//                     <stop offset="0%" stopColor={COLORS.primary} stopOpacity={1}/>
//                     <stop offset="100%" stopColor={COLORS.primarySoft} stopOpacity={1}/>
//                   </linearGradient>
//                   <linearGradient id="successGrad" x1="0" y1="0" x2="1" y2="1">
//                     <stop offset="0%" stopColor={COLORS.success} stopOpacity={1}/>
//                     <stop offset="100%" stopColor={COLORS.successSoft} stopOpacity={1}/>
//                   </linearGradient>
//                 </defs>
//                 <Pie
//                   data={chartData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={70}
//                   outerRadius={100}
//                   paddingAngle={3}
//                   dataKey="value"
//                   stroke="none"
//                 >
//                   <Cell fill="url(#primaryGrad)" />
//                   <Cell fill="url(#successGrad)" />
//                 </Pie>
//                 <Tooltip content={<ModernTooltip />} />
//               </PieChart>
//             </ResponsiveContainer>
            
//             <div style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               textAlign: 'center',
//               pointerEvents: 'none',
//             }}>
//               <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.textDark, letterSpacing: '-1px' }}>
//                 {utilizationPercent.toFixed(0)}%
//               </div>
//               <div style={{ fontSize: '11px', color: COLORS.textMuted, fontWeight: '600', marginTop: '4px' }}>
//                 Utilized
//               </div>
//             </div>
//           </div>
          
//           <div style={{ 
//             display: 'grid', 
//             gridTemplateColumns: 'repeat(2, 1fr)', 
//             gap: '12px',
//             marginTop: '20px'
//           }}>
//             <div style={{ 
//               padding: '16px', 
//               background: `linear-gradient(135deg, ${COLORS.primary}15 0%, ${COLORS.primary}05 100%)`,
//               borderRadius: '12px', 
//               textAlign: 'center',
//               border: `1px solid ${COLORS.primary}20`
//             }}>
//               <div style={{ fontSize: '10px', color: COLORS.textMuted, fontWeight: '600', marginBottom: '6px' }}>ACTUAL SPEND</div>
//               <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.primary, letterSpacing: '-0.5px' }}>
//                 ₹{(actualSpend / 1000).toFixed(0)}k
//               </div>
//             </div>
//             <div style={{ 
//               padding: '16px', 
//               background: `linear-gradient(135deg, ${COLORS.success}15 0%, ${COLORS.success}05 100%)`,
//               borderRadius: '12px', 
//               textAlign: 'center',
//               border: `1px solid ${COLORS.success}20`
//             }}>
//               <div style={{ fontSize: '10px', color: COLORS.textMuted, fontWeight: '600', marginBottom: '6px' }}>REMAINING</div>
//               <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.success, letterSpacing: '-0.5px' }}>
//                 ₹{(remaining / 1000).toFixed(0)}k
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </Card>
//   );
// };

// // Enhanced Scatter Plot
// const CostConsumptionScatter: React.FC<{
//   items: Item[];
//   categories: Category[];
// }> = ({ items, categories }) => {
//   // Generate mock data if items are empty
//   const mockItems = items.length === 0 ? [
//     { itemName: 'Laptop', totalValue: 85000, avgDailyConsumption: 0.5, categoryId: 2 },
//     { itemName: 'Office Chair', totalValue: 12000, avgDailyConsumption: 0.2, categoryId: 3 },
//     { itemName: 'Printer Paper', totalValue: 3500, avgDailyConsumption: 15, categoryId: 1 },
//     { itemName: 'Coffee', totalValue: 8500, avgDailyConsumption: 45, categoryId: 4 },
//     { itemName: 'Pens', totalValue: 1200, avgDailyConsumption: 25, categoryId: 6 },
//     { itemName: 'Monitor', totalValue: 28000, avgDailyConsumption: 0.3, categoryId: 2 },
//     { itemName: 'Desk', totalValue: 18000, avgDailyConsumption: 0.1, categoryId: 3 },
//     { itemName: 'Sanitizer', totalValue: 2500, avgDailyConsumption: 12, categoryId: 5 },
//   ] : items;

//   const scatterData = mockItems
//     .filter((item: any) => item.totalValue && item.avgDailyConsumption)
//     .map((item: any) => {
//       const category = categories.find(c => c.id === item.categoryId);
//       return {
//         itemName: item.itemName,
//         cost: item.totalValue || 0,
//         consumption: Number(item.avgDailyConsumption || 0),
//         category: category?.categoryName || 'Unknown'
//       };
//     })
//     .filter(item => item.cost > 0 && item.consumption > 0);

//   return (
//     <Card>
//       <h3 style={{ 
//         fontSize: '16px', 
//         fontWeight: '700', 
//         color: COLORS.textDark, 
//         marginBottom: '20px',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '10px',
//         letterSpacing: '-0.3px'
//       }}>
//         <div style={{ 
//           padding: '8px', 
//           borderRadius: '10px', 
//           backgroundColor: `${COLORS.warning}15`,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}>
//           <TrendingUp style={{ width: '18px', height: '18px', color: COLORS.warning }} />
//         </div>
//         Cost vs Consumption
//       </h3>
      
//       {scatterData.length === 0 ? (
//         <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
//           No consumption data available
//         </div>
//       ) : (
//         <ResponsiveContainer width="100%" height={340}>
//           <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
//             <defs>
//               <linearGradient id="scatterGradient" x1="0" y1="0" x2="1" y2="1">
//                 <stop offset="0%" stopColor={COLORS.warning} stopOpacity={0.8}/>
//                 <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0.6}/>
//               </linearGradient>
//             </defs>
//             <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
//             <XAxis 
//               type="number" 
//               dataKey="consumption" 
//               name="Avg Daily Consumption" 
//               tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: '500' }}
//               label={{ 
//                 value: 'Avg Daily Consumption (units)', 
//                 position: 'insideBottom', 
//                 offset: -10, 
//                 style: { fontSize: 11, fill: COLORS.textMuted, fontWeight: '600' } 
//               }}
//               stroke="rgba(0,0,0,0.1)"
//             />
//             <YAxis 
//               type="number" 
//               dataKey="cost" 
//               name="Total Value" 
//               tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: '500' }}
//               label={{ 
//                 value: 'Total Value (₹)', 
//                 angle: -90, 
//                 position: 'insideLeft', 
//                 style: { fontSize: 11, fill: COLORS.textMuted, fontWeight: '600' } 
//               }}
//               stroke="rgba(0,0,0,0.1)"
//               tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
//             />
//             <Tooltip content={<ModernTooltip />} cursor={{ strokeDasharray: '3 3' }} />
//             <Scatter 
//               data={scatterData} 
//               fill="url(#scatterGradient)"
//               shape="circle"
//             >
//               {scatterData.map((entry, index) => (
//                 <Cell key={`cell-${index}`} r={8} />
//               ))}
//             </Scatter>
//           </ScatterChart>
//         </ResponsiveContainer>
//       )}
//     </Card>
//   );
// };

// // Enhanced Forecast Line Chart with Area
// const ForecastedSpendChart: React.FC<{
//   budgetData: any;
// }> = ({ budgetData }) => {
//   const mockBudget = generateMockBudgetData();
//   const budget = budgetData || mockBudget;
  
//   const timeSeriesData = budget?.timeSeriesData || [];
  
//   const chartData = timeSeriesData.map((item: any) => ({
//     period: item.period,
//     actual: item.actualAmount,
//     budget: item.budgetAmount,
//   }));

//   // Add forecast for next period
//   if (chartData.length > 0) {
//     const avgActual = chartData.reduce((sum: number, d: any) => sum + d.actual, 0) / chartData.length;
//     const lastBudget = chartData[chartData.length - 1].budget;
    
//     chartData.push({
//       period: 'Aug',
//       actual: null,
//       budget: lastBudget,
//     });
    
//     chartData.push({
//       period: 'Sep',
//       actual: null,
//       budget: lastBudget,
//     });
//   }

//   const avgActual = chartData.filter((d: any) => d.actual).reduce((sum: number, d: any) => sum + d.actual, 0) / chartData.filter((d: any) => d.actual).length;

//   return (
//     <Card>
//       <h3 style={{ 
//         fontSize: '16px', 
//         fontWeight: '700', 
//         color: COLORS.textDark, 
//         marginBottom: '20px',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '10px',
//         letterSpacing: '-0.3px'
//       }}>
//         <div style={{ 
//           padding: '8px', 
//           borderRadius: '10px', 
//           backgroundColor: `${COLORS.purple}15`,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center'
//         }}>
//           <Calendar style={{ width: '18px', height: '18px', color: COLORS.purple }} />
//         </div>
//         Spend Forecast
//       </h3>
      
//       {chartData.length === 0 ? (
//         <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
//           No time series data available
//         </div>
//       ) : (
//         <>
//           <ResponsiveContainer width="100%" height={300}>
//             <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
//               <defs>
//                 <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3}/>
//                   <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.05}/>
//                 </linearGradient>
//                 <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%" stopColor={COLORS.textMuted} stopOpacity={0.2}/>
//                   <stop offset="100%" stopColor={COLORS.textMuted} stopOpacity={0.02}/>
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
//               <XAxis 
//                 dataKey="period" 
//                 tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: '500' }}
//                 stroke="rgba(0,0,0,0.1)"
//               />
//               <YAxis 
//                 tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: '500' }}
//                 stroke="rgba(0,0,0,0.1)"
//                 tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
//               />
//               <Tooltip content={<ModernTooltip />} />
//               <Legend 
//                 wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} 
//                 iconType="circle"
//               />
//               <Area 
//                 type="monotone" 
//                 dataKey="budget" 
//                 stroke={COLORS.textMuted}
//                 strokeWidth={2}
//                 fill="url(#budgetGradient)"
//                 name="Budget (₹)"
//                 strokeDasharray="5 5"
//                 dot={false}
//               />
//               <Area 
//                 type="monotone" 
//                 dataKey="actual" 
//                 stroke={COLORS.primary}
//                 strokeWidth={3}
//                 fill="url(#actualGradient)"
//                 name="Actual Spend (₹)"
//                 dot={{ fill: COLORS.primary, r: 5, strokeWidth: 2, stroke: '#fff' }}
//                 activeDot={{ r: 7 }}
//               />
//             </AreaChart>
//           </ResponsiveContainer>

//           <div style={{ 
//             display: 'grid', 
//             gridTemplateColumns: 'repeat(3, 1fr)', 
//             gap: '12px',
//             marginTop: '20px'
//           }}>
//             <div style={{ 
//               padding: '14px', 
//               background: `linear-gradient(135deg, ${COLORS.textMuted}10 0%, ${COLORS.textMuted}05 100%)`,
//               borderRadius: '12px', 
//               textAlign: 'center',
//               border: `1px solid ${COLORS.textMuted}15`
//             }}>
//               <div style={{ fontSize: '10px', color: COLORS.textMuted, fontWeight: '600', marginBottom: '4px' }}>AVG BUDGET</div>
//               <div style={{ fontSize: '16px', fontWeight: '700', color: COLORS.textDark, letterSpacing: '-0.5px' }}>
//                 ₹{(chartData[0]?.budget / 1000).toFixed(0)}k
//               </div>
//             </div>
//             <div style={{ 
//               padding: '14px', 
//               background: `linear-gradient(135deg, ${COLORS.primary}15 0%, ${COLORS.primary}05 100%)`,
//               borderRadius: '12px', 
//               textAlign: 'center',
//               border: `1px solid ${COLORS.primary}20`
//             }}>
//               <div style={{ fontSize: '10px', color: COLORS.textMuted, fontWeight: '600', marginBottom: '4px' }}>AVG ACTUAL</div>
//               <div style={{ fontSize: '16px', fontWeight: '700', color: COLORS.primary, letterSpacing: '-0.5px' }}>
//                 ₹{(avgActual / 1000).toFixed(0)}k
//               </div>
//             </div>
//             <div style={{ 
//               padding: '14px', 
//               background: `linear-gradient(135deg, ${COLORS.purple}15 0%, ${COLORS.purple}05 100%)`,
//               borderRadius: '12px', 
//               textAlign: 'center',
//               border: `1px solid ${COLORS.purple}20`
//             }}>
//               <div style={{ fontSize: '10px', color: COLORS.textMuted, fontWeight: '600', marginBottom: '4px' }}>VARIANCE</div>
//               <div style={{ fontSize: '16px', fontWeight: '700', color: COLORS.purple, letterSpacing: '-0.5px' }}>
//                 {((avgActual / chartData[0]?.budget - 1) * 100).toFixed(1)}%
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </Card>
//   );
// };

// // Main Dashboard Component
// const EnhancedBudgetDashboard: React.FC = () => {
//   const { data: categories = [] } = useCategories();
//   const { data: items = [] } = useItems();
//   const enhancedAnalytics = useEnhancedAnalytics();
//   const [dateRange] = useState({
//     start: '2025-01-01',
//     end: '2025-07-31'
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         await enhancedAnalytics.refreshAll('monthly', dateRange.start, dateRange.end);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: COLORS.bgPrimary, padding: '24px' }}>
//       <style>{`
//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//       `}</style>
      
//       <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
//         {/* Header */}
//         <Card>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <div>
//               <h1 style={{ 
//                 fontSize: '28px', 
//                 fontWeight: '700', 
//                 margin: 0,
//                 marginBottom: '6px',
//                 color: COLORS.textDark,
//                 letterSpacing: '-0.7px'
//               }}>
//                 Budget Analysis Dashboard
//               </h1>
//               <p style={{ 
//                 fontSize: '13px', 
//                 color: COLORS.textMuted,
//                 margin: 0,
//                 fontWeight: '500'
//               }}>
//                 Track spending, forecast trends, and optimize budget allocation
//               </p>
//             </div>
            
//             <button
//               onClick={() => enhancedAnalytics.refreshAll('monthly', dateRange.start, dateRange.end)}
//               disabled={loading}
//               style={{
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px',
//                 padding: '12px 20px',
//                 background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primarySoft} 100%)`,
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '10px',
//                 cursor: loading ? 'not-allowed' : 'pointer',
//                 fontSize: '13px',
//                 fontWeight: '600',
//                 opacity: loading ? 0.7 : 1,
//                 boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
//                 transition: 'all 0.2s ease'
//               }}
//               onMouseEnter={(e) => {
//                 if (!loading) {
//                   e.currentTarget.style.transform = 'translateY(-2px)';
//                   e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
//                 }
//               }}
//               onMouseLeave={(e) => {
//                 e.currentTarget.style.transform = 'translateY(0)';
//                 e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
//               }}
//             >
//               <RefreshCw style={{ width: '16px', height: '16px' }} />
//               {loading ? 'Loading...' : 'Refresh Data'}
//             </button>
//           </div>
//         </Card>

//         {loading ? (
//           <Card>
//             <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
//               <RefreshCw style={{ width: '40px', height: '40px', animation: 'spin 2s linear infinite', color: COLORS.primary }} />
//               <p style={{ color: COLORS.textMuted, fontSize: '14px', fontWeight: '500' }}>Loading budget analytics...</p>
//             </div>
//           </Card>
//         ) : (
//           <div style={{ animation: 'fadeIn 0.5s ease' }}>
//             {/* KPIs */}
//             <BudgetKPIs 
//               budgetData={enhancedAnalytics.budgetData}
//               costDistributionData={enhancedAnalytics.costDistributionData}
//               items={items}
//             />

//             {/* Charts Row 1 */}
//             <div style={{ 
//               display: 'grid', 
//               gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))', 
//               gap: '20px',
//               marginBottom: '20px'
//             }}>
//               <SpendByCategoryChart 
//                 costDistributionData={enhancedAnalytics.costDistributionData}
//               />

//               <PlannedVsActualDonut 
//                 budgetData={enhancedAnalytics.budgetData}
//               />
//             </div>

//             {/* Charts Row 2 */}
//             <div style={{ 
//               display: 'grid', 
//               gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))', 
//               gap: '20px'
//             }}>
//               <CostConsumptionScatter 
//                 items={items}
//                 categories={categories}
//               />

//               <ForecastedSpendChart 
//                 budgetData={enhancedAnalytics.budgetData}
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default EnhancedBudgetDashboard;



import React, { useState, useEffect } from 'react';
import {
  Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart, Pie, ScatterChart, Scatter, LineChart, BarChart, Area, AreaChart
} from 'recharts';
import { 
  DollarSign, TrendingUp, TrendingDown, Package, 
  AlertCircle, Calendar, RefreshCw, BarChart3, Activity
} from 'lucide-react';
import { 
  useEnhancedAnalytics,
  useCategories,
  useItems
} from '../api/hooks';
import { 
  type Category,
  type Item
} from '../api/inventory';

// Muted professional color palette - Softer tones
const COLORS = {
  primary: '#6366f1',      // Soft Indigo
  success: '#10b981',      // Emerald
  warning: '#f59e0b',      // Amber
  danger: '#ef4444',       // Coral Red
  info: '#06b6d4',         // Cyan
  purple: '#8b5cf6',       // Soft Violet
  pink: '#ec4899',         // Soft Pink
  teal: '#14b8a6',         // Teal
  cyan: '#22d3ee',         // Light Cyan
  orange: '#fb923c',       // Soft Orange
  
  // Soft variants
  primarySoft: '#818cf8',
  successSoft: '#34d399',
  warningSoft: '#fbbf24',
  dangerSoft: '#f87171',
  infoSoft: '#67e8f9',
  purpleSoft: '#a78bfa',
  pinkSoft: '#f472b6',
  tealSoft: '#2dd4bf',
  
  // Text colors
  textDark: '#111827',
  textMuted: '#6b7280',
  textLight: '#9ca3af',
  
  // Background colors
  bgPrimary: '#fafafa',
  bgWhite: '#ffffff',
  bgGray: '#f5f5f5',
};

const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#fb923c'
];

// Soft gradient backgrounds for cards
const cardGradients = {
  primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  danger: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
  info: 'linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)',
  purple: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
};

// Mock data generators
const generateMockBudgetData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = 6; // July
  
  return {
    budgetAllocations: {
      monthly: 450000,
      yearly: 5400000,
    },
    actualData: {
      totalCost: 425000,
      totalQuantity: 1250,
      itemCount: 85,
      averageUnitCost: 340,
    },
    summary: {
      budgetUtilization: 85.5,
      remainingBudget: 125000,
      dailyBurnRate: 14500,
      projectedOverrun: -25000,
    },
    timeSeriesData: months.slice(0, currentMonth + 1).map((month, idx) => ({
      period: month,
      budgetAmount: 450000,
      actualAmount: 380000 + Math.random() * 100000,
      variance: Math.random() * 50000 - 25000,
      cumulativeBudget: 450000 * (idx + 1),
      cumulativeActual: (380000 + Math.random() * 100000) * (idx + 1),
      utilizationPercentage: 80 + Math.random() * 20,
    })),
    varianceAnalysis: {
      variancePercentage: -5.5,
      status: 'under-budget',
      severity: 'low',
    }
  };
};

const generateMockCostDistribution = () => ({
  totalCost: 2850000,
  categoryDistribution: [
    { category: 'Office Supplies', categoryId: 1, totalCost: 450000, totalQuantity: 1200, percentage: 15.8, avgUnitPrice: 375 },
    { category: 'IT Equipment', categoryId: 2, totalCost: 850000, totalQuantity: 150, percentage: 29.8, avgUnitPrice: 5667 },
    { category: 'Furniture', categoryId: 3, totalCost: 650000, totalQuantity: 85, percentage: 22.8, avgUnitPrice: 7647 },
    { category: 'Pantry Items', categoryId: 4, totalCost: 280000, totalQuantity: 2500, percentage: 9.8, avgUnitPrice: 112 },
    { category: 'Cleaning Supplies', categoryId: 5, totalCost: 180000, totalQuantity: 800, percentage: 6.3, avgUnitPrice: 225 },
    { category: 'Stationery', categoryId: 6, totalCost: 220000, totalQuantity: 3000, percentage: 7.7, avgUnitPrice: 73 },
    { category: 'Electronics', categoryId: 7, totalCost: 220000, totalQuantity: 120, percentage: 7.7, avgUnitPrice: 1833 },
  ],
});

// Enhanced Tooltip with minimal padding
const ModernTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.98)', 
        backdropFilter: 'blur(12px)',
        color: COLORS.textDark, 
        padding: '8px 10px', 
        borderRadius: '8px',
        border: `1px solid rgba(0, 0, 0, 0.05)`,
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
        fontSize: '11px',
        minWidth: '160px'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '11px', color: COLORS.textDark }}>
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px', 
            marginBottom: index === payload.length - 1 ? 0 : '4px'
          }}>
            <div style={{ 
              width: '7px', 
              height: '7px', 
              borderRadius: '50%', 
              backgroundColor: entry.color,
              boxShadow: `0 0 0 2px ${entry.color}20`
            }} />
            <span style={{ flex: 1, color: COLORS.textMuted, fontSize: '10px' }}>
              {entry.name}:
            </span>
            <span style={{ fontWeight: '600', color: COLORS.textDark, fontSize: '11px' }}>
              {entry.name.includes('₹') || entry.name.includes('Cost') || entry.name.includes('Price') || 
               entry.name.includes('Value') || entry.name.includes('Spend') || entry.name.includes('Budget') ? 
                `₹${Number(entry.value).toLocaleString()}` : 
                typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Enhanced Card Component with minimal padding
const Card: React.FC<{ 
  children: React.ReactNode; 
  gradient?: string;
  noPadding?: boolean;
}> = ({ children, gradient, noPadding }) => {
  return (
    <div style={{
      background: gradient || COLORS.bgWhite,
      borderRadius: '10px',
      padding: noPadding ? 0 : '10px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      border: `1px solid rgba(0, 0, 0, 0.04)`,
      marginBottom: '10px',
      transition: 'all 0.2s ease',
    }}>
      {children}
    </div>
  );
};

// Enhanced Metric Card with minimal padding
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  gradient?: string;
  color?: string;
}> = ({ title, value, subtitle, icon, trend, trendValue, gradient, color = COLORS.primary }) => {
  return (
    <div style={{
      background: gradient || COLORS.bgWhite,
      borderRadius: '10px',
      padding: '10px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      border: `1px solid rgba(0, 0, 0, 0.04)`,
      height: '100%',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
    }}
    >
      {gradient && (
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        }} />
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
        <div style={{ 
          backgroundColor: gradient ? 'rgba(255, 255, 255, 0.25)' : `${color}15`,
          padding: '6px',
          borderRadius: '7px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: gradient ? '#ffffff' : color,
        }}>
          <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </div>
        </div>
        {trend && trendValue && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '3px',
            fontSize: '9px',
            fontWeight: '600',
            padding: '3px 6px',
            borderRadius: '14px',
            backgroundColor: gradient ? 'rgba(255, 255, 255, 0.25)' : 
              trend === 'up' ? `${COLORS.success}15` : 
              trend === 'down' ? `${COLORS.danger}15` : `${COLORS.textMuted}15`,
            color: gradient ? '#ffffff' : 
              trend === 'up' ? COLORS.success : 
              trend === 'down' ? COLORS.danger : COLORS.textMuted
          }}>
            {trend === 'up' ? <TrendingUp style={{ width: '11px', height: '11px' }} /> : 
             trend === 'down' ? <TrendingDown style={{ width: '11px', height: '11px' }} /> : null}
            {trendValue}
          </div>
        )}
      </div>
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: '9px', color: gradient ? 'rgba(255, 255, 255, 0.9)' : COLORS.textMuted, marginBottom: '4px', fontWeight: '500' }}>
          {title}
        </div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: gradient ? '#ffffff' : COLORS.textDark, marginBottom: '2px', letterSpacing: '-0.5px' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '8px', color: gradient ? 'rgba(255, 255, 255, 0.8)' : COLORS.textLight, fontWeight: '500' }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

// Budget KPIs Section with beautiful gradients
const BudgetKPIs: React.FC<{
  budgetData: any;
  costDistributionData: any;
  items: Item[];
}> = ({ budgetData, costDistributionData, items }) => {
  // Use mock data if real data is not available
  const mockBudget = generateMockBudgetData();
  const mockCost = generateMockCostDistribution();
  
  const budget = budgetData || mockBudget;
  const costDist = costDistributionData || mockCost;

  const actualSpend = budget?.actualData?.totalCost || 0;
  const plannedBudget = budget?.budgetAllocations?.monthly || 0;
  
  const totalCost = costDist?.totalCost || 0;
  const totalQuantity = costDist?.categoryDistribution?.reduce(
    (sum: number, cat: any) => sum + (cat.totalQuantity || 0), 0
  ) || 1;
  const avgCostPerUnit = totalCost / totalQuantity;

  const utilization = budget?.summary?.budgetUtilization || 0;

  // High-Value Items calculation
  const itemsWithValue = items.filter(item => item.totalValue && item.totalValue > 0);
  const avgItemValue = itemsWithValue.length > 0 
    ? itemsWithValue.reduce((sum, item) => sum + (item.totalValue || 0), 0) / itemsWithValue.length 
    : 50000;
  const highValueCount = itemsWithValue.filter(item => (item.totalValue || 0) > avgItemValue).length || 24;

  const variance = plannedBudget > 0 
    ? ((actualSpend - plannedBudget) / plannedBudget) * 100 
    : 0;

  return (
    <>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '10px',
        marginBottom: '10px'
      }}>
        <MetricCard
          title="Monthly Spend vs Forecast"
          value={`₹${actualSpend.toLocaleString()}`}
          subtitle={`Budget: ₹${plannedBudget.toLocaleString()}`}
          icon={<DollarSign />}
          trend={variance > 0 ? 'up' : variance < 0 ? 'down' : 'neutral'}
          trendValue={`${Math.abs(variance).toFixed(1)}%`}
          gradient={variance > 5 ? cardGradients.danger : variance < -5 ? cardGradients.success : cardGradients.warning}
        />
        
        <MetricCard
          title="Cost per Unit"
          value={`₹${avgCostPerUnit.toFixed(2)}`}
          subtitle="Weighted average cost"
          icon={<Activity />}
          gradient={cardGradients.info}
        />
        
        <MetricCard
          title="Budget Utilization"
          value={`${utilization.toFixed(1)}%`}
          subtitle={utilization > 90 ? 'High usage - Monitor closely' : 'Within safe limits'}
          icon={<AlertCircle />}
          trend={utilization > 90 ? 'up' : 'neutral'}
          trendValue={utilization > 90 ? 'High' : 'Normal'}
          gradient={utilization > 90 ? cardGradients.warning : cardGradients.success}
        />
        
        <MetricCard
          title="High-Value Items"
          value={highValueCount}
          subtitle="Items above average value"
          icon={<Package />}
          gradient={cardGradients.purple}
        />
      </div>
    </>
  );
};

// Enhanced Bar Chart with better styling
const SpendByCategoryChart: React.FC<{
  costDistributionData: any;
}> = ({ costDistributionData }) => {
  const mockCost = generateMockCostDistribution();
  const data = costDistributionData || mockCost;
  
  const chartData = data?.categoryDistribution?.map((cat: any, idx: number) => ({
    category: cat.category.length > 15 ? cat.category.substring(0, 15) + '...' : cat.category,
    spend: cat.totalCost,
    quantity: cat.totalQuantity,
    fill: CHART_COLORS[idx % CHART_COLORS.length]
  })) || [];

  return (
    <Card>
      <div style={{ 
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        borderRadius: '8px', 
        backgroundColor: `${COLORS.primary}10`,
        marginBottom: '10px'
      }}>
        <BarChart3 style={{ width: '14px', height: '14px', color: COLORS.primary }} />
        <span style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: COLORS.textDark,
          letterSpacing: '-0.2px'
        }}>
          Spend by Category
        </span>
      </div>
      
      {chartData.length === 0 ? (
        <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
            <defs>
              {CHART_COLORS.map((color, idx) => (
                <linearGradient key={idx} id={`colorGradient${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.9}/>
                  <stop offset="100%" stopColor={color} stopOpacity={0.6}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: '500' }} 
              angle={-35}
              textAnchor="end"
              height={80}
              stroke="rgba(0,0,0,0.1)"
            />
            <YAxis 
              tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: '500' }}
              stroke="rgba(0,0,0,0.1)"
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<ModernTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
            <Bar dataKey="spend" radius={[8, 8, 0, 0]} name="Total Spend (₹)">
              {chartData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={`url(#colorGradient${index % CHART_COLORS.length})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

// Enhanced Donut Chart
const PlannedVsActualDonut: React.FC<{
  budgetData: any;
}> = ({ budgetData }) => {
  const mockBudget = generateMockBudgetData();
  const budget = budgetData || mockBudget;
  
  const actualSpend = budget?.actualData?.totalCost || 0;
  const plannedBudget = budget?.budgetAllocations?.monthly || 0;
  const remaining = Math.max(0, plannedBudget - actualSpend);
  const utilizationPercent = plannedBudget > 0 ? (actualSpend / plannedBudget * 100) : 0;

  const chartData = [
    { name: 'Actual Spend', value: actualSpend, fill: COLORS.primary },
    { name: 'Remaining Budget', value: remaining, fill: COLORS.success }
  ];

  return (
    <Card>
      <div style={{ 
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        borderRadius: '8px', 
        backgroundColor: `${COLORS.success}10`,
        marginBottom: '10px'
      }}>
        <DollarSign style={{ width: '14px', height: '14px', color: COLORS.success }} />
        <span style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: COLORS.textDark,
          letterSpacing: '-0.2px'
        }}>
          Budget Overview
        </span>
      </div>
      
      {plannedBudget === 0 ? (
        <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
          No budget data available
        </div>
      ) : (
        <>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <defs>
                  <linearGradient id="primaryGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={1}/>
                    <stop offset="100%" stopColor={COLORS.primarySoft} stopOpacity={1}/>
                  </linearGradient>
                  <linearGradient id="successGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={COLORS.success} stopOpacity={1}/>
                    <stop offset="100%" stopColor={COLORS.successSoft} stopOpacity={1}/>
                  </linearGradient>
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill="url(#primaryGrad)" />
                  <Cell fill="url(#successGrad)" />
                </Pie>
                <Tooltip content={<ModernTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.textDark, letterSpacing: '-1px' }}>
                {utilizationPercent.toFixed(0)}%
              </div>
              <div style={{ fontSize: '11px', color: COLORS.textMuted, fontWeight: '600', marginTop: '4px' }}>
                Utilized
              </div>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '6px',
            marginTop: '12px'
          }}>
            <div style={{ 
              padding: '8px', 
              background: `linear-gradient(135deg, ${COLORS.primary}15 0%, ${COLORS.primary}05 100%)`,
              borderRadius: '8px', 
              textAlign: 'center',
              border: `1px solid ${COLORS.primary}20`
            }}>
              <div style={{ fontSize: '7px', color: COLORS.textMuted, fontWeight: '600', marginBottom: '3px' }}>ACTUAL SPEND</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.primary, letterSpacing: '-0.5px' }}>
                ₹{(actualSpend / 1000).toFixed(0)}k
              </div>
            </div>
            <div style={{ 
              padding: '8px', 
              background: `linear-gradient(135deg, ${COLORS.success}15 0%, ${COLORS.success}05 100%)`,
              borderRadius: '8px', 
              textAlign: 'center',
              border: `1px solid ${COLORS.success}20`
            }}>
              <div style={{ fontSize: '7px', color: COLORS.textMuted, fontWeight: '600', marginBottom: '3px' }}>REMAINING</div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: COLORS.success, letterSpacing: '-0.5px' }}>
                ₹{(remaining / 1000).toFixed(0)}k
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

// Enhanced Scatter Plot
const CostConsumptionScatter: React.FC<{
  items: Item[];
  categories: Category[];
}> = ({ items, categories }) => {
  // Generate mock data if items are empty
  const mockItems = items.length === 0 ? [
    { itemName: 'Laptop', totalValue: 85000, avgDailyConsumption: 0.5, categoryId: 2 },
    { itemName: 'Office Chair', totalValue: 12000, avgDailyConsumption: 0.2, categoryId: 3 },
    { itemName: 'Printer Paper', totalValue: 3500, avgDailyConsumption: 15, categoryId: 1 },
    { itemName: 'Coffee', totalValue: 8500, avgDailyConsumption: 45, categoryId: 4 },
    { itemName: 'Pens', totalValue: 1200, avgDailyConsumption: 25, categoryId: 6 },
    { itemName: 'Monitor', totalValue: 28000, avgDailyConsumption: 0.3, categoryId: 2 },
    { itemName: 'Desk', totalValue: 18000, avgDailyConsumption: 0.1, categoryId: 3 },
    { itemName: 'Sanitizer', totalValue: 2500, avgDailyConsumption: 12, categoryId: 5 },
  ] : items;

  const scatterData = mockItems
    .filter((item: any) => item.totalValue && item.avgDailyConsumption)
    .map((item: any) => {
      const category = categories.find(c => c.id === item.categoryId);
      return {
        itemName: item.itemName,
        cost: item.totalValue || 0,
        consumption: Number(item.avgDailyConsumption || 0),
        category: category?.categoryName || 'Unknown'
      };
    })
    .filter(item => item.cost > 0 && item.consumption > 0);

  return (
    <Card>
      <div style={{ 
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        borderRadius: '8px', 
        backgroundColor: `${COLORS.warning}10`,
        marginBottom: '10px'
      }}>
        <TrendingUp style={{ width: '14px', height: '14px', color: COLORS.warning }} />
        <span style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: COLORS.textDark,
          letterSpacing: '-0.2px'
        }}>
          Cost vs Consumption
        </span>
      </div>
      
      {scatterData.length === 0 ? (
        <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
          No consumption data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            <defs>
              <linearGradient id="scatterGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={COLORS.warning} stopOpacity={0.8}/>
                <stop offset="100%" stopColor={COLORS.orange} stopOpacity={0.6}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis 
              type="number" 
              dataKey="consumption" 
              name="Avg Daily Consumption" 
              tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: '500' }}
              label={{ 
                value: 'Avg Daily Consumption (units)', 
                position: 'insideBottom', 
                offset: -10, 
                style: { fontSize: 11, fill: COLORS.textMuted, fontWeight: '600' } 
              }}
              stroke="rgba(0,0,0,0.1)"
            />
            <YAxis 
              type="number" 
              dataKey="cost" 
              name="Total Value" 
              tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: '500' }}
              label={{ 
                value: 'Total Value (₹)', 
                angle: -90, 
                position: 'insideLeft', 
                style: { fontSize: 11, fill: COLORS.textMuted, fontWeight: '600' } 
              }}
              stroke="rgba(0,0,0,0.1)"
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<ModernTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter 
              data={scatterData} 
              fill="url(#scatterGradient)"
              shape="circle"
            >
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} r={8} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

// Enhanced Forecast Line Chart with Area
const ForecastedSpendChart: React.FC<{
  budgetData: any;
}> = ({ budgetData }) => {
  const mockBudget = generateMockBudgetData();
  const budget = budgetData || mockBudget;
  
  const timeSeriesData = budget?.timeSeriesData || [];
  
  const chartData = timeSeriesData.map((item: any) => ({
    period: item.period,
    actual: item.actualAmount,
    budget: item.budgetAmount,
  }));

  // Add forecast for next period
  if (chartData.length > 0) {
    const avgActual = chartData.reduce((sum: number, d: any) => sum + d.actual, 0) / chartData.length;
    const lastBudget = chartData[chartData.length - 1].budget;
    
    chartData.push({
      period: 'Aug',
      actual: null,
      budget: lastBudget,
    });
    
    chartData.push({
      period: 'Sep',
      actual: null,
      budget: lastBudget,
    });
  }

  const avgActual = chartData.filter((d: any) => d.actual).reduce((sum: number, d: any) => sum + d.actual, 0) / chartData.filter((d: any) => d.actual).length;

  return (
    <Card>
      <div style={{ 
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        borderRadius: '8px', 
        backgroundColor: `${COLORS.purple}10`,
        marginBottom: '10px'
      }}>
        <Calendar style={{ width: '14px', height: '14px', color: COLORS.purple }} />
        <span style={{ 
          fontSize: '12px', 
          fontWeight: '600', 
          color: COLORS.textDark,
          letterSpacing: '-0.2px'
        }}>
          Spend Forecast
        </span>
      </div>
      
      {chartData.length === 0 ? (
        <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.textMuted }}>
          No time series data available
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                  <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.textMuted} stopOpacity={0.2}/>
                  <stop offset="100%" stopColor={COLORS.textMuted} stopOpacity={0.02}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: '500' }}
                stroke="rgba(0,0,0,0.1)"
              />
              <YAxis 
                tick={{ fontSize: 11, fill: COLORS.textMuted, fontWeight: '500' }}
                stroke="rgba(0,0,0,0.1)"
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<ModernTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px', fontWeight: '600' }} 
                iconType="circle"
              />
              <Area 
                type="monotone" 
                dataKey="budget" 
                stroke={COLORS.textMuted}
                strokeWidth={2}
                fill="url(#budgetGradient)"
                name="Budget (₹)"
                strokeDasharray="5 5"
                dot={false}
              />
              <Area 
                type="monotone" 
                dataKey="actual" 
                stroke={COLORS.primary}
                strokeWidth={3}
                fill="url(#actualGradient)"
                name="Actual Spend (₹)"
                dot={{ fill: COLORS.primary, r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7 }}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '6px',
            marginTop: '12px'
          }}>
            <div style={{ 
              padding: '7px', 
              background: `linear-gradient(135deg, ${COLORS.textMuted}10 0%, ${COLORS.textMuted}05 100%)`,
              borderRadius: '8px', 
              textAlign: 'center',
              border: `1px solid ${COLORS.textMuted}15`
            }}>
              <div style={{ fontSize: '7px', color: COLORS.textMuted, fontWeight: '600', marginBottom: '2px' }}>AVG BUDGET</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: COLORS.textDark, letterSpacing: '-0.5px' }}>
                ₹{(chartData[0]?.budget / 1000).toFixed(0)}k
              </div>
            </div>
            <div style={{ 
              padding: '7px', 
              background: `linear-gradient(135deg, ${COLORS.primary}15 0%, ${COLORS.primary}05 100%)`,
              borderRadius: '8px', 
              textAlign: 'center',
              border: `1px solid ${COLORS.primary}20`
            }}>
              <div style={{ fontSize: '7px', color: COLORS.textMuted, fontWeight: '600', marginBottom: '2px' }}>AVG ACTUAL</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: COLORS.primary, letterSpacing: '-0.5px' }}>
                ₹{(avgActual / 1000).toFixed(0)}k
              </div>
            </div>
            <div style={{ 
              padding: '7px', 
              background: `linear-gradient(135deg, ${COLORS.purple}15 0%, ${COLORS.purple}05 100%)`,
              borderRadius: '8px', 
              textAlign: 'center',
              border: `1px solid ${COLORS.purple}20`
            }}>
              <div style={{ fontSize: '7px', color: COLORS.textMuted, fontWeight: '600', marginBottom: '2px' }}>VARIANCE</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: COLORS.purple, letterSpacing: '-0.5px' }}>
                {((avgActual / chartData[0]?.budget - 1) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

// Main Dashboard Component
const EnhancedBudgetDashboard: React.FC = () => {
  const { data: categories = [] } = useCategories();
  const { data: items = [] } = useItems();
  const enhancedAnalytics = useEnhancedAnalytics();
  const [dateRange] = useState({
    start: '2025-01-01',
    end: '2025-07-31'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await enhancedAnalytics.refreshAll('monthly', dateRange.start, dateRange.end);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bgPrimary, padding: '10px' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ 
                fontSize: '22px', 
                fontWeight: '700', 
                margin: 0,
                marginBottom: '2px',
                color: COLORS.textDark,
                letterSpacing: '-0.7px'
              }}>
                Budget Analysis Dashboard
              </h1>
              <p style={{ 
                fontSize: '10px', 
                color: COLORS.textMuted,
                margin: 0,
                fontWeight: '500'
              }}>
                Track spending, forecast trends, and optimize budget allocation
              </p>
            </div>
            
            <button
              onClick={() => enhancedAnalytics.refreshAll('monthly', dateRange.start, dateRange.end)}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '8px 14px',
                background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primarySoft} 100%)`,
                color: 'white',
                border: 'none',
                borderRadius: '7px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '10px',
                fontWeight: '600',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
              }}
            >
              <RefreshCw style={{ width: '13px', height: '13px' }} />
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
        </Card>

        {loading ? (
          <Card>
            <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
              <RefreshCw style={{ width: '40px', height: '40px', animation: 'spin 2s linear infinite', color: COLORS.primary }} />
              <p style={{ color: COLORS.textMuted, fontSize: '14px', fontWeight: '500' }}>Loading budget analytics...</p>
            </div>
          </Card>
        ) : (
          <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* KPIs */}
            <BudgetKPIs 
              budgetData={enhancedAnalytics.budgetData}
              costDistributionData={enhancedAnalytics.costDistributionData}
              items={items}
            />

            {/* Charts Row 1 */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))', 
              gap: '10px',
              marginBottom: '10px'
            }}>
              <SpendByCategoryChart 
                costDistributionData={enhancedAnalytics.costDistributionData}
              />

              <PlannedVsActualDonut 
                budgetData={enhancedAnalytics.budgetData}
              />
            </div>

            {/* Charts Row 2 */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))', 
              gap: '10px'
            }}>
              <CostConsumptionScatter 
                items={items}
                categories={categories}
              />

              <ForecastedSpendChart 
                budgetData={enhancedAnalytics.budgetData}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedBudgetDashboard;