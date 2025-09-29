import React, { useState } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from 'recharts';

const EnergySustainabilityDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('6M');

  // Energy usage data over time
  const energyUsageData = [
    { month: 'Jan', usage: 1.2, target: 1.1, cost: 15400, emissions: 0.65 },
    { month: 'Feb', usage: 1.35, target: 1.2, cost: 17200, emissions: 0.72 },
    { month: 'Mar', usage: 1.18, target: 1.15, cost: 14900, emissions: 0.63 },
    { month: 'Apr', usage: 1.28, target: 1.25, cost: 16800, emissions: 0.69 },
    { month: 'May', usage: 1.52, target: 1.35, cost: 19500, emissions: 0.85 },
    { month: 'Jun', usage: 1.45, target: 1.4, cost: 18200, emissions: 0.81 }
  ];

  // Energy consumption breakdown
  const consumptionBreakdown = [
    { name: 'HVAC', value: 40, color: '#1e40af', amount: 0.58 },
    { name: 'Lighting', value: 25, color: '#3b82f6', amount: 0.36 },
    { name: 'Equipment', value: 20, color: '#60a5fa', amount: 0.29 },
    { name: 'Other', value: 15, color: '#93c5fd', amount: 0.22 }
  ];

  // Monthly comparison data
  const monthlyComparison = [
    { category: 'HVAC', current: 0.58, previous: 0.62, target: 0.55 },
    { category: 'Lighting', current: 0.36, previous: 0.34, target: 0.32 },
    { category: 'Equipment', current: 0.29, previous: 0.31, target: 0.28 },
    { category: 'Other', current: 0.22, previous: 0.25, target: 0.20 }
  ];

  // Sustainability metrics
  const sustainabilityMetrics = [
    { name: 'Energy Efficiency', value: 87, target: 90, unit: '%', trend: '+2.3%' },
    { name: 'Renewable Energy', value: 34, target: 50, unit: '%', trend: '+5.1%' },
    { name: 'Waste Reduction', value: 68, target: 75, unit: '%', trend: '+1.8%' },
    { name: 'Water Conservation', value: 72, target: 80, unit: '%', trend: '+3.2%' }
  ];

  const currentMonth = energyUsageData[energyUsageData.length - 1];

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
            Energy & Sustainability
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px', margin: '4px 0 0 0' }}>
            Monitor energy consumption, carbon footprint, and sustainability goals
          </p>
        </div>
        
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '8px',
            fontSize: '14px',
            backgroundColor: 'white',
            fontWeight: '500'
          }}
        >
          <option value="1M">Last Month</option>
          <option value="3M">Last 3 Months</option>
          <option value="6M">Last 6 Months</option>
          <option value="1Y">Last Year</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Current Usage */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px'
            }}>
              <span style={{ fontSize: '24px' }}>⚡</span>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', margin: '0' }}>
                Current Usage
              </h3>
            </div>
          </div>
          <div style={{ fontSize: '48px', fontWeight: '800', color: '#1f2937', marginBottom: '8px' }}>
            {currentMonth.usage} MWh
          </div>
          <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '500' }}>
            Target: {currentMonth.target} MWh
          </div>
        </div>

        {/* Carbon Emissions */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#d1fae5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px'
            }}>
              <span style={{ fontSize: '24px' }}>🌱</span>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', margin: '0' }}>
                Carbon Emissions
              </h3>
            </div>
          </div>
          <div style={{ fontSize: '48px', fontWeight: '800', color: '#1f2937', marginBottom: '8px' }}>
            {currentMonth.emissions} tons
          </div>
          <div style={{ fontSize: '14px', color: '#059669', fontWeight: '500' }}>
            -12% from last month
          </div>
        </div>

        {/* Cost */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #0d9488 0%, #14b8a6 100%)'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#ccfbf1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '16px'
            }}>
              <span style={{ fontSize: '24px' }}>💰</span>
            </div>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', margin: '0' }}>
                Cost
              </h3>
            </div>
          </div>
          <div style={{ fontSize: '48px', fontWeight: '800', color: '#1f2937', marginBottom: '8px' }}>
            ${currentMonth.cost.toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', color: '#0d9488', fontWeight: '500' }}>
            Budget: $20,000
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Energy Usage Chart */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#1f2937',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              Energy Usage Trends
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
              Monthly energy consumption vs targets
            </p>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={energyUsageData}>
              <defs>
                <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} MWh`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  fontSize: '14px'
                }}
                formatter={(value: any, name: string) => [
                  `${value} MWh`, 
                  name === 'usage' ? 'Actual Usage' : 'Target'
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="usage" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#usageGradient)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: '#3b82f6', strokeWidth: 2, fill: 'white' }}
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="8 8"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Energy Consumption Breakdown */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#1f2937',
              marginBottom: '8px',
              margin: '0 0 8px 0'
            }}>
              Energy Consumption Breakdown
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: '0' }}>
              Distribution by category
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={consumptionBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {consumptionBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any, name: string) => [`${value}%`, name]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {consumptionBreakdown.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    backgroundColor: item.color
                  }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                      {item.value}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {item.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sustainability Metrics & Monthly Comparison */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Sustainability Metrics */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            Sustainability Goals
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {sustainabilityMetrics.map((metric, index) => (
              <div key={index} style={{ 
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                    {metric.name}
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#10b981',
                    backgroundColor: '#d1fae5',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: '500'
                  }}>
                    {metric.trend}
                  </span>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${metric.value}%`,
                      height: '100%',
                      backgroundColor: metric.value >= metric.target ? '#10b981' : '#f59e0b',
                      borderRadius: '4px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                  <span>{metric.value}{metric.unit}</span>
                  <span>Target: {metric.target}{metric.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Comparison */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '700', 
            color: '#1f2937',
            marginBottom: '24px',
            margin: '0 0 24px 0'
          }}>
            Monthly Comparison
          </h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="category" 
                stroke="#6b7280" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} MWh`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
                formatter={(value: any, name: string) => [`${value} MWh`, name]}
              />
              <Bar dataKey="previous" fill="#e5e7eb" name="Previous Month" radius={[4, 4, 0, 0]} />
              <Bar dataKey="current" fill="#3b82f6" name="Current Month" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#10b981" name="Target" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EnergySustainabilityDashboard;