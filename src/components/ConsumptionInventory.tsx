/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Area, AreaChart
} from 'recharts';
import {
  TrendingUp, TrendingDown, Package,
  Calendar, Filter, X, ChevronDown, Activity,
  Zap, ArrowUp, ArrowDown,
  RefreshCw, Layers, Search,
  Sparkles, AlertTriangle,
  DollarSign, Target, BarChart3, Clock
} from 'lucide-react';
import {
  useItems,
  useCategories,
  useSmartInsights,
  useSmartHealth,
  useDataRange
} from '../api/hooks';
import { 
  type Item as BaseItem,
  type Category
} from '../api/inventory';

// Extended Item type with all properties used in the component
interface Item extends BaseItem {
  unit?: string;
  avgDailyConsumption?: number;
}

const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  dark: '#0f172a',
  gray: '#64748b',
  bg: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0'
};

const currencyFormatter = new Intl.NumberFormat('en-IN', { 
  style: 'currency', 
  currency: 'INR',
  maximumFractionDigits: 0
});

const Card: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void;
}> = ({ children, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: '12px',
        padding: '16px',
        border: `1px solid ${COLORS.border}`,
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </div>
  );
};

const CleanTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        padding: '10px 14px',
        borderRadius: '10px',
        border: `1px solid ${COLORS.border}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
      }}>
        <div style={{ fontSize: '11px', color: COLORS.gray, marginBottom: '6px', fontWeight: '500' }}>
          {label}
        </div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            fontSize: '13px',
            fontWeight: '600',
            color: COLORS.dark
          }}>
            <div style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              backgroundColor: entry.color 
            }} />
            {entry.name}: {entry.value?.toLocaleString()}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

type HeatmapDataItem = {
  date: string;
  day: number;
  consumption: number;
  intensity: number;
};

const CompactHeatmap: React.FC<{
  item: Item;
  dateRange: { start: string; end: string };
  onClose: () => void;
}> = ({ item, dateRange, onClose }) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapDataItem[]>([]);

  useEffect(() => {
    const records = item.consumptionRecords || [];
    
    if (records.length === 0) {
      const avgDaily = Number(item.avgDailyConsumption) || 0;
      const data: HeatmapDataItem[] = [];
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < Math.min(daysDiff, 90); i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        data.push({
          date: date.toISOString().slice(0, 10),
          day: date.getDate(),
          consumption: Math.round(avgDaily * (0.8 + Math.random() * 0.4)),
          intensity: 0.5
        });
      }
      setHeatmapData(data);
      return;
    }

    const maxConsumption = Math.max(...records.map((r: any) => Number(r.consumedQuantity || 0)));

    const data: HeatmapDataItem[] = records.map((record: any) => {
      const consumed = Number(record.consumedQuantity || 0);
      return {
        date: record.date,
        day: new Date(record.date).getDate(),
        consumption: consumed,
        intensity: maxConsumption > 0 ? consumed / maxConsumption : 0
      };
    }).filter((d: any) => {
      const recordDate = new Date(d.date);
      return recordDate >= new Date(dateRange.start) && recordDate <= new Date(dateRange.end);
    }).sort((a: any, b: any) => a.date.localeCompare(b.date));

    setHeatmapData(data);
  }, [item, dateRange]);

  const getColor = (intensity: number) => {
    if (intensity < 0.25) return '#dbeafe';
    if (intensity < 0.5) return '#93c5fd';
    if (intensity < 0.75) return '#3b82f6';
    return '#1e40af';
  };

  const groupedByMonth = heatmapData.reduce((acc, data) => {
    const monthKey = data.date.slice(0, 7);
    if (!acc[monthKey]) acc[monthKey] = [];
    acc[monthKey].push(data);
    return acc;
  }, {} as Record<string, HeatmapDataItem[]>);

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(2px)',
          zIndex: 1999
        }}
      />
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '480px',
        backgroundColor: COLORS.white,
        padding: '20px',
        overflowY: 'auto',
        zIndex: 2000,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: COLORS.dark, margin: 0 }}>
              {item.itemName}
            </h3>
            <p style={{ fontSize: '13px', color: COLORS.gray, margin: '4px 0 0 0' }}>
              Daily consumption pattern • {heatmapData.length} records • Unit: units
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.white,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} color={COLORS.gray} />
          </button>
        </div>

        {heatmapData.length > 0 && (
          <>
            <div style={{ marginBottom: '20px' }}>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={heatmapData.slice(-30)}>
                  <defs>
                    <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.info} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.info} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: COLORS.gray }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: COLORS.gray }} />
                  <Tooltip content={<CleanTooltip />} />
                  <Area type="monotone" dataKey="consumption" stroke={COLORS.info} fill="url(#gradientBlue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {Object.entries(groupedByMonth).map(([monthKey, monthData]) => (
                <div key={monthKey}>
                  <h4 style={{ fontSize: '12px', fontWeight: '600', color: COLORS.dark, marginBottom: '6px' }}>
                    {new Date(monthKey + '-01').toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                      <div key={d} style={{ fontSize: '9px', color: COLORS.gray, textAlign: 'center', fontWeight: '600' }}>
                        {d}
                      </div>
                    ))}
                    {monthData.length > 0 && Array.from({ length: new Date(monthData[0].date).getDay() }, (_, i) => (
                      <div key={`empty-${i}`} />
                    ))}
                    {monthData.map(data => (
                      <div
                        key={data.date}
                        title={`${data.date}: ${data.consumption} units`}
                        style={{
                          aspectRatio: '1',
                          backgroundColor: getColor(data.intensity),
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '9px',
                          fontWeight: '600',
                          color: data.intensity > 0.5 ? COLORS.white : COLORS.dark,
                          cursor: 'pointer'
                        }}
                      >
                        {data.day}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {heatmapData.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: COLORS.gray }}>
            No consumption records available for this period
          </div>
        )}
      </div>
    </>
  );
};

const SmartInsightsRightPanel: React.FC<{
  isOpen: boolean;
  selectedCategory: number | null;
  onClose: () => void;
}> = ({ isOpen, selectedCategory, onClose }) => {
  const { data: insights, loading, error } = useSmartInsights('standard', selectedCategory || undefined, 0.7, true);

  if (!isOpen) return null;

  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return { color: COLORS.danger, bg: '#fef2f2', border: COLORS.danger };
      case 'high':
        return { color: COLORS.warning, bg: '#fffbeb', border: COLORS.warning };
      case 'medium':
        return { color: COLORS.info, bg: '#eff6ff', border: COLORS.info };
      default:
        return { color: COLORS.gray, bg: COLORS.bg, border: COLORS.gray };
    }
  };

  const renderHealthScore = () => {
    if (!insights?.inventoryHealthScore) return null;
    
    const { overallScore, rating, healthyItems, warningItems, criticalItems, healthyPercentage } = insights.inventoryHealthScore;
    const ratingColors: Record<string, any> = {
      'EXCELLENT': { color: COLORS.success, bg: '#ecfdf5' },
      'GOOD': { color: COLORS.info, bg: '#eff6ff' },
      'FAIR': { color: COLORS.warning, bg: '#fffbeb' },
      'POOR': { color: COLORS.danger, bg: '#fef2f2' }
    };
    const style = ratingColors[rating] || ratingColors['GOOD'];

    return (
      <div style={{
        backgroundColor: COLORS.white,
        borderRadius: '16px',
        padding: '24px',
        border: `2px solid ${COLORS.border}`,
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Target size={24} color={COLORS.white} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.gray, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overall Health Score
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: COLORS.primary, lineHeight: '1' }}>
              {overallScore}/100
            </div>
          </div>
        </div>

        <div style={{
          display: 'inline-flex',
          padding: '8px 16px',
          borderRadius: '999px',
          backgroundColor: style.bg,
          color: style.color,
          fontSize: '14px',
          fontWeight: '700',
          marginBottom: '16px'
        }}>
          {rating}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#ecfdf5',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: COLORS.success }}>
              {healthyItems}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: COLORS.gray, marginTop: '4px' }}>
              Healthy
            </div>
          </div>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#fffbeb',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: COLORS.warning }}>
              {warningItems}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: COLORS.gray, marginTop: '4px' }}>
              Warning
            </div>
          </div>
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: '#fef2f2',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '800', color: COLORS.danger }}>
              {criticalItems}
            </div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: COLORS.gray, marginTop: '4px' }}>
              Critical
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAlerts = () => {
    if (!insights?.criticalAlerts || insights.criticalAlerts.length === 0) return null;

    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <AlertTriangle size={20} color={COLORS.danger} />
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: COLORS.dark,
            margin: 0
          }}>
            Critical Alerts ({insights.criticalAlerts.length})
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {insights.criticalAlerts.slice(0, 5).map((alert, idx) => {
            const style = getSeverityStyle(alert.severity);
            return (
              <div
                key={idx}
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: '12px',
                  border: `2px solid ${style.border}20`,
                  padding: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  backgroundColor: style.color
                }} />
                
                <div style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: COLORS.dark,
                  marginBottom: '4px'
                }}>
                  {alert.itemName}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: COLORS.gray,
                  marginBottom: '8px'
                }}>
                  {alert.categoryName}
                </div>
                
                {alert.daysRemaining !== undefined && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '4px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: '800',
                      color: style.color
                    }}>
                      {alert.daysRemaining.toFixed(1)}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: COLORS.gray,
                      fontWeight: '600'
                    }}>
                      days remaining
                    </div>
                  </div>
                )}

                <div style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: style.bg,
                  fontSize: '12px',
                  color: COLORS.dark,
                  fontWeight: '500'
                }}>
                  {alert.action.replace(/_/g, ' ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTrends = () => {
    if (!insights?.trendInsights) return null;

    const { overallTrend, volatility } = insights.trendInsights;
    const directionIcon = overallTrend.direction === 'INCREASING' ? TrendingUp : 
                          overallTrend.direction === 'DECREASING' ? TrendingDown : Activity;
    const DirectionIcon = directionIcon;

    return (
      <div style={{
        backgroundColor: COLORS.white,
        borderRadius: '12px',
        border: `2px solid ${COLORS.border}`,
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <BarChart3 size={20} color={COLORS.primary} />
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: COLORS.dark,
            margin: 0
          }}>
            Consumption Trends
          </h3>
        </div>

        <div style={{
          fontSize: '14px',
          color: COLORS.dark,
          marginBottom: '12px',
          fontWeight: '600'
        }}>
          {overallTrend.interpretation}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: COLORS.bg
          }}>
            <div style={{
              fontSize: '10px',
              color: COLORS.gray,
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              DIRECTION
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <DirectionIcon size={16} color={COLORS.primary} />
              <span style={{
                fontSize: '14px',
                fontWeight: '700',
                color: COLORS.dark
              }}>
                {overallTrend.direction}
              </span>
            </div>
          </div>

          <div style={{
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: COLORS.bg
          }}>
            <div style={{
              fontSize: '10px',
              color: COLORS.gray,
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              VOLATILITY
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: '700',
              color: COLORS.warning
            }}>
              {volatility.level} ({volatility.percentage.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCostOpportunities = () => {
    if (!insights?.costOpportunities || insights.costOpportunities.length === 0) return null;

    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <DollarSign size={20} color={COLORS.success} />
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: COLORS.dark,
            margin: 0
          }}>
            Cost Opportunities ({insights.costOpportunities.length})
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {insights.costOpportunities.slice(0, 3).map((opp, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: COLORS.white,
                borderRadius: '12px',
                border: `2px solid ${COLORS.success}20`,
                padding: '16px'
              }}
            >
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                color: COLORS.dark,
                marginBottom: '4px'
              }}>
                {opp.itemName}
              </div>
              
              <div style={{
                fontSize: '24px',
                fontWeight: '800',
                color: COLORS.success,
                marginBottom: '8px'
              }}>
                {currencyFormatter.format(opp.potentialSavings)}
              </div>

              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                fontSize: '12px',
                color: COLORS.dark,
                fontWeight: '500'
              }}>
                {opp.recommendation}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPredictions = () => {
    if (!insights?.predictions || insights.predictions.length === 0) return null;

    const stockoutPredictions = insights.predictions.filter(p => p.type === 'STOCKOUT_PREDICTION');
    
    if (stockoutPredictions.length === 0) return null;

    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <Clock size={20} color={COLORS.warning} />
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: COLORS.dark,
            margin: 0
          }}>
            Stockout Predictions ({stockoutPredictions.length})
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {stockoutPredictions.slice(0, 3).map((pred, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: COLORS.white,
                borderRadius: '12px',
                border: `2px solid ${COLORS.warning}20`,
                padding: '16px'
              }}
            >
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                color: COLORS.dark,
                marginBottom: '4px'
              }}>
                {pred.itemName}
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '6px',
                marginBottom: '8px'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: COLORS.warning
                }}>
                  {pred.daysUntilStockout}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: COLORS.gray,
                  fontWeight: '600'
                }}>
                  days until stockout
                </div>
              </div>

              <div style={{
                fontSize: '11px',
                color: COLORS.gray
              }}>
                Predicted date: {pred.predictedDate}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!insights?.recommendations || insights.recommendations.length === 0) return null;

    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <Sparkles size={20} color={COLORS.secondary} />
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: COLORS.dark,
            margin: 0
          }}>
            AI Recommendations ({insights.recommendations.length})
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {insights.recommendations.slice(0, 5).map((rec, idx) => {
            const priorityColor = rec.priority >= 7 ? COLORS.danger :
                                 rec.priority >= 5 ? COLORS.warning :
                                 rec.priority >= 3 ? COLORS.info : COLORS.gray;

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: COLORS.white,
                  borderRadius: '12px',
                  border: `2px solid ${COLORS.border}`,
                  padding: '16px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: COLORS.dark
                  }}>
                    {rec.title}
                  </div>
                  <div style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    backgroundColor: `${priorityColor}15`,
                    color: priorityColor,
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    P{rec.priority}
                  </div>
                </div>

                <div style={{
                  fontSize: '12px',
                  color: COLORS.gray,
                  marginBottom: '8px',
                  lineHeight: '1.5'
                }}>
                  {rec.description}
                </div>

                <div style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: COLORS.bg,
                  fontSize: '12px',
                  color: COLORS.dark,
                  fontWeight: '500'
                }}>
                  {rec.action}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '8px'
                }}>
                  <div style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    backgroundColor: '#ecfdf5',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '10px',
                      color: COLORS.gray,
                      fontWeight: '600'
                    }}>
                      IMPACT
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: COLORS.success
                    }}>
                      {rec.impact}
                    </div>
                  </div>
                  <div style={{
                    flex: 1,
                    padding: '6px',
                    borderRadius: '6px',
                    backgroundColor: '#eff6ff',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '10px',
                      color: COLORS.gray,
                      fontWeight: '600'
                    }}>
                      EFFORT
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: COLORS.info
                    }}>
                      {rec.effort}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderAnomalies = () => {
    if (!insights?.anomalies || insights.anomalies.length === 0) return null;

    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <Activity size={20} color={COLORS.info} />
          <h3 style={{
            fontSize: '16px',
            fontWeight: '700',
            color: COLORS.dark,
            margin: 0
          }}>
            Anomalies Detected ({insights.anomalies.length})
          </h3>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {insights.anomalies.slice(0, 3).map((anomaly, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: COLORS.white,
                borderRadius: '12px',
                border: `2px solid ${COLORS.info}20`,
                padding: '16px'
              }}
            >
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                color: COLORS.dark,
                marginBottom: '4px'
              }}>
                {anomaly.itemName}
              </div>
              
              <div style={{
                fontSize: '12px',
                color: COLORS.gray,
                marginBottom: '8px'
              }}>
                {anomaly.outlierCount} unusual patterns detected
              </div>

              <div style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                fontSize: '12px',
                color: COLORS.dark,
                fontWeight: '500'
              }}>
                Confidence: {(anomaly.confidence * 100).toFixed(1)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '90%',
        maxWidth: '500px',
        backgroundColor: COLORS.bg,
        padding: '24px',
        overflowY: 'auto',
        zIndex: 999,
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from { 
              opacity: 0;
              transform: translateX(20px);
            }
            to { 
              opacity: 1;
              transform: translateX(0);
            }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>

        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: `2px solid ${COLORS.border}`
        }}>
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '800', 
              color: COLORS.dark, 
              margin: 0,
              marginBottom: '4px'
            }}>
              Smart Insights
            </h2>
            <p style={{ fontSize: '14px', color: COLORS.gray, margin: 0 }}>
              AI-powered inventory analysis
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: `2px solid ${COLORS.border}`,
              backgroundColor: COLORS.white,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} color={COLORS.gray} />
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <RefreshCw size={32} color={COLORS.primary} style={{ animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
            <div style={{ fontSize: '16px', fontWeight: '700', color: COLORS.dark, marginBottom: '8px' }}>
              Analyzing Your Inventory
            </div>
            <div style={{ fontSize: '13px', color: COLORS.gray }}>
              AI is processing consumption patterns...
            </div>
          </div>
        )}

        {error && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <AlertTriangle size={32} color={COLORS.danger} style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '16px', fontWeight: '700', color: COLORS.dark, marginBottom: '8px' }}>
              Unable to Load Insights
            </div>
            <div style={{ fontSize: '13px', color: COLORS.gray }}>
              {error}
            </div>
          </div>
        )}

        {!loading && !error && insights && (
          <div>
            {renderHealthScore()}
            {renderAlerts()}
            {renderTrends()}
            {renderCostOpportunities()}
            {renderPredictions()}
            {renderAnomalies()}
            {renderRecommendations()}
          </div>
        )}

        {!loading && !error && !insights && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>✓</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: COLORS.dark, marginBottom: '8px' }}>
              No Insights Available
            </div>
            <div style={{ fontSize: '13px', color: COLORS.gray }}>
              Not enough data to generate insights
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Rest of the components remain the same...
// (HeatmapRightPanel, DatePresets, AnimatedFilterPanel, ActiveFilterChips, etc.)

const HeatmapRightPanel: React.FC<{
  isOpen: boolean;
  items: Item[];
  categories: Category[];
  dateRange: { start: string; end: string };
  selectedCategory: number | null;
  selectedItems: number[];
  onClose: () => void;
}> = ({ isOpen, items, categories, dateRange, selectedCategory: propSelectedCategory, selectedItems: propSelectedItems, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<number | null>(propSelectedCategory);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const availableMonths = useMemo(() => {
    const months: Date[] = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  }, [dateRange]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    availableMonths.forEach(month => years.add(month.getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [availableMonths]);

  useEffect(() => {
    if (isOpen && availableMonths.length > 0) {
      const lastMonth = availableMonths[availableMonths.length - 1];
      setCurrentMonth(lastMonth);
      setSelectedYear(lastMonth.getFullYear());
    }
  }, [isOpen, availableMonths]);

  const filteredItems = useMemo(() => {
    let result = items;
    
    if (selectedCategory) {
      result = result.filter(item => item.categoryId === selectedCategory);
    }
    
    if (selectedItem) {
      result = result.filter(item => item.id === selectedItem);
    }
    
    return result.filter(item => (item.consumptionRecords || []).length > 0);
  }, [items, selectedCategory, selectedItem]);

  const monthlyData = useMemo(() => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    return filteredItems.map(item => {
      const records = (item.consumptionRecords || []) as any[];
      
      const monthRecords = records.filter((r: any) => {
        const recordDate = new Date(r.date);
        return recordDate >= monthStart && recordDate <= monthEnd;
      });

      const totalConsumption = monthRecords.reduce((sum: number, r: any) => 
        sum + Number(r.consumedQuantity || 0), 0
      );

      const dailyData = monthRecords.map((r: any) => ({
        date: r.date,
        day: new Date(r.date).getDate(),
        consumption: Number(r.consumedQuantity || 0)
      }));

      return {
        item,
        itemName: item.itemName,
        categoryName: categories.find(c => c.id === item.categoryId)?.categoryName || 'Unknown',
        totalConsumption,
        dailyData,
        avgDaily: monthRecords.length > 0 ? totalConsumption / monthRecords.length : 0
      };
    }).filter(d => d.totalConsumption > 0)
      .sort((a, b) => b.totalConsumption - a.totalConsumption);
  }, [filteredItems, currentMonth, categories]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentIndex = availableMonths.findIndex(
      m => m.getMonth() === currentMonth.getMonth() && m.getFullYear() === currentMonth.getFullYear()
    );
    
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentMonth(availableMonths[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < availableMonths.length - 1) {
      setCurrentMonth(availableMonths[currentIndex + 1]);
    }
  };

  const canGoPrev = availableMonths.findIndex(
    m => m.getMonth() === currentMonth.getMonth() && m.getFullYear() === currentMonth.getFullYear()
  ) > 0;

  const canGoNext = availableMonths.findIndex(
    m => m.getMonth() === currentMonth.getMonth() && m.getFullYear() === currentMonth.getFullYear()
  ) < availableMonths.length - 1;

  if (!isOpen) return null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '90%',
        maxWidth: '900px',
        backgroundColor: COLORS.white,
        padding: '24px',
        overflowY: 'auto',
        zIndex: 999,
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from { 
              opacity: 0;
              transform: translateX(20px);
            }
            to { 
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          paddingBottom: '20px',
          borderBottom: `2px solid ${COLORS.border}`
        }}>
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '800', 
              color: COLORS.dark, 
              margin: 0,
              marginBottom: '4px'
            }}>
              Consumption Heatmap
            </h2>
            <p style={{ fontSize: '14px', color: COLORS.gray, margin: 0 }}>
              Monthly consumption patterns
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: `2px solid ${COLORS.border}`,
              backgroundColor: COLORS.white,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={20} color={COLORS.gray} />
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '12px', 
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: COLORS.bg,
          borderRadius: '12px'
        }}>
          <div>
            <label style={{ 
              fontSize: '11px', 
              fontWeight: '600', 
              color: COLORS.gray, 
              marginBottom: '8px', 
              display: 'block',
              textTransform: 'uppercase'
            }}>
              Year
            </label>
            <select 
              value={selectedYear} 
              onChange={(e) => {
                const year = Number(e.target.value);
                setSelectedYear(year);
                const firstMonthOfYear = availableMonths.find(m => m.getFullYear() === year);
                if (firstMonthOfYear) {
                  setCurrentMonth(firstMonthOfYear);
                }
              }}
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: COLORS.white, 
                border: `2px solid ${COLORS.border}`, 
                borderRadius: '8px', 
                fontSize: '14px', 
                color: COLORS.dark, 
                cursor: 'pointer', 
                fontWeight: '500'
              }}
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ 
              fontSize: '11px', 
              fontWeight: '600', 
              color: COLORS.gray, 
              marginBottom: '8px', 
              display: 'block',
              textTransform: 'uppercase'
            }}>
              Category
            </label>
            <select 
              value={selectedCategory || ''} 
              onChange={(e) => {
                setSelectedCategory(e.target.value ? Number(e.target.value) : null);
                setSelectedItem(null);
              }}
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: COLORS.white, 
                border: `2px solid ${COLORS.border}`, 
                borderRadius: '8px', 
                fontSize: '14px', 
                color: COLORS.dark, 
                cursor: 'pointer', 
                fontWeight: '500'
              }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ 
              fontSize: '11px', 
              fontWeight: '600', 
              color: COLORS.gray, 
              marginBottom: '8px', 
              display: 'block',
              textTransform: 'uppercase'
            }}>
              Item
            </label>
            <select 
              value={selectedItem || ''} 
              onChange={(e) => setSelectedItem(e.target.value ? Number(e.target.value) : null)}
              style={{ 
                width: '100%', 
                padding: '12px', 
                backgroundColor: COLORS.white, 
                border: `2px solid ${COLORS.border}`, 
                borderRadius: '8px', 
                fontSize: '14px', 
                color: COLORS.dark, 
                cursor: 'pointer', 
                fontWeight: '500'
              }}
            >
              <option value="">All Items</option>
              {items
                .filter(item => !selectedCategory || item.categoryId === selectedCategory)
                .map(item => (
                  <option key={item.id} value={item.id}>
                    {item.itemName}
                  </option>
                ))
              }
            </select>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: COLORS.bg,
          borderRadius: '12px'
        }}>
          <button
            onClick={() => navigateMonth('prev')}
            disabled={!canGoPrev}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: `2px solid ${canGoPrev ? COLORS.border : COLORS.bg}`,
              backgroundColor: COLORS.white,
              cursor: canGoPrev ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canGoPrev ? 1 : 0.3,
              transition: 'all 0.2s'
            }}
          >
            <ChevronDown size={20} color={COLORS.gray} style={{ transform: 'rotate(90deg)' }} />
          </button>

          <div style={{ textAlign: 'center', minWidth: '200px' }}>
            <div style={{ fontSize: '20px', fontWeight: '700', color: COLORS.dark }}>
              {currentMonth.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
            </div>
            <div style={{ fontSize: '12px', color: COLORS.gray, marginTop: '4px' }}>
              {monthlyData.length} items with consumption
            </div>
          </div>

          <button
            onClick={() => navigateMonth('next')}
            disabled={!canGoNext}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: `2px solid ${canGoNext ? COLORS.border : COLORS.bg}`,
              backgroundColor: COLORS.white,
              cursor: canGoNext ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canGoNext ? 1 : 0.3,
              transition: 'all 0.2s'
            }}
          >
            <ChevronDown size={20} color={COLORS.gray} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </div>

        {monthlyData.length === 0 ? (
          <div style={{ 
            padding: '60px', 
            textAlign: 'center', 
            color: COLORS.gray,
            backgroundColor: COLORS.bg,
            borderRadius: '12px'
          }}>
            <Activity size={48} color={COLORS.gray} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              No consumption data
            </div>
            <div style={{ fontSize: '13px' }}>
              No records found for this month
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {monthlyData.map((data, idx) => {
              const maxConsumption = Math.max(...monthlyData.map(d => d.totalConsumption));
              const percentage = (data.totalConsumption / maxConsumption) * 100;
              
              return (
                <div 
                  key={idx}
                  style={{
                    padding: '16px',
                    backgroundColor: COLORS.white,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setDetailItem(data.item)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: COLORS.dark, marginBottom: '2px' }}>
                        {data.itemName}
                      </div>
                      <div style={{ fontSize: '12px', color: COLORS.gray }}>
                        {data.categoryName}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '20px', fontWeight: '800', color: COLORS.primary }}>
                        {data.totalConsumption.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '11px', color: COLORS.gray }}>
                        {data.avgDaily.toFixed(1)} units/day
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: COLORS.bg,
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${percentage}%`, 
                      height: '100%', 
                      backgroundColor: COLORS.primary,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {detailItem && (
        <CompactHeatmap 
          item={detailItem} 
          dateRange={dateRange} 
          onClose={() => setDetailItem(null)} 
        />
      )}
    </>
  );
};

const DatePresets: React.FC<{
  onSelectPreset: (start: string, end: string) => void;
  currentStart: string;
  currentEnd: string;
}> = ({ onSelectPreset, currentStart, currentEnd }) => {
  const presets = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'This Month', days: 'month' as const },
    { label: 'Last Month', days: 'lastMonth' as const },
    { label: 'This Year', days: 'year' as const },
  ];

  const handlePreset = (preset: typeof presets[0]) => {
    const end = new Date();
    let start: Date;

    if (preset.days === 'year') {
      start = new Date(end.getFullYear(), 0, 1);
    } else if (preset.days === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (preset.days === 'lastMonth') {
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end.setDate(0);
    } else {
      start = new Date();
      start.setDate(start.getDate() - preset.days);
    }

    onSelectPreset(start.toISOString().slice(0, 10), end.toISOString().slice(0, 10));
  };

  const isActive = (preset: typeof presets[0]) => {
    const end = new Date();
    let start: Date;

    if (preset.days === 'year') {
      start = new Date(end.getFullYear(), 0, 1);
    } else if (preset.days === 'month') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (preset.days === 'lastMonth') {
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end.setDate(0);
    } else {
      start = new Date();
      start.setDate(start.getDate() - preset.days);
    }

    return currentStart === start.toISOString().slice(0, 10) && 
           currentEnd === end.toISOString().slice(0, 10);
  };

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {presets.map(preset => {
        const active = isActive(preset);
        return (
          <button
            key={preset.label}
            onClick={() => handlePreset(preset)}
            style={{
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: '600',
              color: active ? COLORS.white : COLORS.primary,
              backgroundColor: active ? COLORS.primary : COLORS.primary + '10',
              border: `1px solid ${COLORS.primary}${active ? '' : '30'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {preset.label}
          </button>
        );
      })}
    </div>
  );
};

const AnimatedFilterPanel: React.FC<{
  isOpen: boolean;
  categories: Category[];
  items: Item[];
  dateRange: { start: string; end: string };
  selectedCategory: number | null;
  selectedItems: number[];
  onCategoryChange: (id: number | null) => void;
  onItemsChange: (ids: number[]) => void;
  onDateChange: (range: { start: string; end: string }) => void;
  onClose: () => void;
}> = ({ isOpen, categories, items, dateRange, selectedCategory, selectedItems, onCategoryChange, onItemsChange, onDateChange, onClose }) => {
  const filteredItems = items.filter(item => 
    selectedCategory ? item.categoryId === selectedCategory : true
  );

  if (!isOpen) return null;

  return (
    <>
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      
      <div style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        width: '480px',
        maxHeight: 'calc(100vh - 100px)',
        backgroundColor: COLORS.white,
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        zIndex: 999,
        overflowY: 'auto',
        animation: 'slideInRight 0.3s ease-out'
      }}>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideInRight {
            from { 
              opacity: 0;
              transform: translateX(20px);
            }
            to { 
              opacity: 1;
              transform: translateX(0);
            }
          }
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

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: `2px solid ${COLORS.border}`
        }}>
          <div>
            <h3 style={{ 
              fontSize: '20px', 
              fontWeight: '800', 
              color: COLORS.dark, 
              margin: 0,
              marginBottom: '4px'
            }}>
              🎯 Filters
            </h3>
            <p style={{ fontSize: '13px', color: COLORS.gray, margin: 0 }}>
              Customize your analytics view
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: `1px solid ${COLORS.border}`,
              backgroundColor: COLORS.bg,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={18} color={COLORS.gray} />
          </button>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          <div>
            <label style={{ 
              fontSize: '13px', 
              fontWeight: '700', 
              color: COLORS.dark, 
              marginBottom: '12px', 
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Calendar size={16} color={COLORS.primary} />
              Date Range
            </label>
            <DatePresets 
              onSelectPreset={(start, end) => onDateChange({ start, end })} 
              currentStart={dateRange.start}
              currentEnd={dateRange.end}
            />
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px', 
              marginTop: '12px'
            }}>
              <div>
                <label style={{ 
                  fontSize: '11px', 
                  color: COLORS.gray, 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  From
                </label>
                <input 
                  type="date" 
                  value={dateRange.start} 
                  onChange={(e) => onDateChange({ ...dateRange, start: e.target.value })} 
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    border: `2px solid ${COLORS.border}`, 
                    borderRadius: '10px', 
                    fontSize: '13px', 
                    backgroundColor: COLORS.white,
                    fontWeight: '500',
                    transition: 'border-color 0.2s'
                  }} 
                />
              </div>
              <div>
                <label style={{ 
      fontSize: '11px', 
      color: COLORS.gray, 
      display: 'block', 
      marginBottom: '6px', 
      fontWeight: '600',
      textTransform: 'uppercase'
    }}>
      To
    </label>
    <input 
      type="date" 
      value={dateRange.end} 
      onChange={(e) => onDateChange({ ...dateRange, end: e.target.value })} 
      style={{ 
        width: '100%', 
        padding: '12px', 
        border: `2px solid ${COLORS.border}`, 
        borderRadius: '10px', 
        fontSize: '13px', 
        backgroundColor: COLORS.white,
        fontWeight: '500',
        transition: 'border-color 0.2s'
      }} 
    />
              </div>

              
            </div>
          </div>

          <div>
            <label style={{ 
              fontSize: '13px', 
              fontWeight: '700', 
              color: COLORS.dark, 
              marginBottom: '10px', 
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Filter size={16} color={COLORS.primary} />
              Category
            </label>
            <select 
              value={selectedCategory || ''} 
              onChange={(e) => { 
                onCategoryChange(e.target.value ? Number(e.target.value) : null); 
                onItemsChange([]);
              }} 
              style={{ 
                width: '100%', 
                padding: '14px 16px', 
                backgroundColor: COLORS.white, 
                border: `2px solid ${COLORS.border}`, 
                borderRadius: '10px', 
                fontSize: '14px', 
                color: COLORS.dark, 
                cursor: 'pointer', 
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              <option value="">All Categories ({categories.length})</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
          </div>

          {selectedCategory && (
            <div style={{ animation: 'slideDown 0.3s ease-out' }}>
              <label style={{ 
                fontSize: '13px', 
                fontWeight: '700', 
                color: COLORS.dark, 
                marginBottom: '10px', 
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Package size={16} color={COLORS.primary} />
                Specific Items
                <span style={{ 
                  fontSize: '11px', 
                  color: COLORS.gray, 
                  fontWeight: '500',
                  marginLeft: 'auto'
                }}>
                  {selectedItems.length} / {filteredItems.length} selected
                </span>
              </label>
              
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '10px'
              }}>
                <button
                  onClick={() => onItemsChange(filteredItems.map(i => i.id))}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: COLORS.primary,
                    backgroundColor: COLORS.primary + '10',
                    border: `1px solid ${COLORS.primary}30`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Select All
                </button>
                <button
                  onClick={() => onItemsChange([])}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: COLORS.gray,
                    backgroundColor: COLORS.bg,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Clear All
                </button>
              </div>

              <div style={{ 
                padding: '12px', 
                backgroundColor: COLORS.bg, 
                border: `2px solid ${COLORS.border}`, 
                borderRadius: '10px', 
                maxHeight: '300px', 
                overflowY: 'auto'
              }}>
                {filteredItems.length === 0 ? (
                  <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: COLORS.gray,
                    fontSize: '13px'
                  }}>
                    No items in this category
                  </div>
                ) : (
                  filteredItems.map(item => (
                    <label 
                      key={item.id} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        padding: '10px', 
                        cursor: 'pointer', 
                        fontSize: '13px', 
                        fontWeight: '500', 
                        color: COLORS.dark,
                        borderRadius: '8px',
                        transition: 'background-color 0.2s',
                        marginBottom: '4px'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={selectedItems.includes(item.id)} 
                        onChange={() => { 
                          if (selectedItems.includes(item.id)) { 
                            onItemsChange(selectedItems.filter(id => id !== item.id)); 
                          } else { 
                            onItemsChange([...selectedItems, item.id]); 
                          } 
                        }} 
                        style={{ 
                          width: '18px', 
                          height: '18px', 
                          cursor: 'pointer',
                          accentColor: COLORS.primary
                        }} 
                      />
                      <div style={{ flex: 1 }}>
                        <div>{item.itemName}</div>
                        {item.avgDailyConsumption && (
                          <div style={{ 
                            fontSize: '11px', 
                            color: COLORS.gray,
                            marginTop: '2px'
                          }}>
                            {Number(item.avgDailyConsumption).toFixed(1)} units/day
                          </div>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              onCategoryChange(null);
              onItemsChange([]);
              onDateChange({ 
                start: '2025-01-01', 
                end: '2025-05-31' 
              });
            }}
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '14px',
              fontWeight: '700',
              color: COLORS.white,
              backgroundColor: COLORS.gray,
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={16} />
            Reset All Filters
          </button>
        </div>
      </div>
    </>
  );
};

const ActiveFilterChips: React.FC<{
  dateRange: { start: string; end: string };
  selectedCategory: number | null;
  selectedItems: number[];
  categories: Category[];
  onCategoryChange: (id: number | null) => void;
  onItemsChange: (ids: number[]) => void;
}> = ({ dateRange, selectedCategory, selectedItems, categories, onCategoryChange, onItemsChange }) => {
  const categoryName = categories.find(c => c.id === selectedCategory)?.categoryName;
  
  const getDaysCount = () => {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getDateRangeLabel = () => {
    const days = getDaysCount();
    if (days === 7) return 'Last 7 days';
    if (days === 30) return 'Last 30 days';
    if (days === 90) return 'Last 90 days';
    
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    return `${start.toLocaleDateString('en', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })} (${days} days)`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: COLORS.info + '15', border: `1px solid ${COLORS.info}40`, borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: COLORS.info }}>
        <Calendar size={14} />
        {getDateRangeLabel()}
      </div>

      {selectedCategory && categoryName && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: COLORS.primary + '15', border: `1px solid ${COLORS.primary}40`, borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: COLORS.primary }}>
          <Filter size={14} />
          {categoryName}
          <button onClick={() => { onCategoryChange(null); onItemsChange([]); }} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: COLORS.primary }}>
            <X size={14} />
          </button>
        </div>
      )}

      {selectedItems.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', backgroundColor: COLORS.secondary + '15', border: `1px solid ${COLORS.secondary}40`, borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: COLORS.secondary }}>
          <Package size={14} />
          {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
          <button onClick={() => onItemsChange([])} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', color: COLORS.secondary }}>
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

const EnhancedMetricCard: React.FC<{
  icon: React.ElementType;
  iconColor: string;
  label: string;
  itemName: string;
  category: string;
  value: string;
  unit?: string;
  subtext: string;
}> = ({ icon: Icon, iconColor, label, itemName, category, value, unit, subtext }) => {
  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: iconColor + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={22} color={iconColor} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: COLORS.gray, fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: COLORS.dark, marginBottom: '2px' }}>
            {itemName}
          </div>
          <div style={{ fontSize: '11px', color: COLORS.gray, marginBottom: '6px' }}>
            {category}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: iconColor }}>
              {value}
            </div>
            {unit && (
              <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.gray }}>
                {unit}
              </div>
            )}
          </div>
          <div style={{ fontSize: '11px', color: COLORS.gray, marginTop: '4px' }}>
            {subtext}
          </div>
        </div>
      </div>
    </Card>
  );
};

const ConsumptionChart: React.FC<{
  categories: Category[];
  items: Item[];
  dateRange: { start: string; end: string };
  selectedCategory: number | null;
  selectedItems: number[];
}> = ({ categories, items, dateRange, selectedCategory, selectedItems }) => {
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    
    try {
      const dateMap = new Map<string, number>();
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);

      let filteredItems = items;
      
      if (selectedCategory) {
        filteredItems = filteredItems.filter(item => item.categoryId === selectedCategory);
      }
      
      if (selectedItems.length > 0) {
        filteredItems = filteredItems.filter(item => selectedItems.includes(item.id));
      }

      filteredItems.forEach(item => {
        const records = (item.consumptionRecords || []) as any[];
        
        records.forEach((record: any) => {
          const recordDate = new Date(record.date);
          
          if (recordDate >= startDate && recordDate <= endDate) {
            const dateKey = record.date.slice(0, 10);
            const consumption = Number(record.consumedQuantity || 0);
            
            dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + consumption);
          }
        });
      });

      const processed: any[] = [];
      dateMap.forEach((consumption, date) => {
        processed.push({ date, consumption });
      });
      processed.sort((a, b) => a.date.localeCompare(b.date));
      
      setChartData(processed);
      
    } catch (error) {
      console.error('Chart processing error:', error);
    } finally {
      setLoading(false);
    }
  }, [items, dateRange, selectedCategory, selectedItems]);

  const total = chartData.reduce((sum, item) => sum + item.consumption, 0);
  const avg = chartData.length > 0 ? total / chartData.length : 0;

  const getSelectedItemsText = () => {
    if (selectedItems.length === 0) return null;
    
    const selectedItemObjects = items.filter(item => selectedItems.includes(item.id));
    
    if (selectedItemObjects.length === 1) {
      return selectedItemObjects[0].itemName;
    } else if (selectedItemObjects.length <= 3) {
      return selectedItemObjects.map(item => item.itemName).join(', ');
    } else {
      return `${selectedItemObjects.slice(0, 2).map(item => item.itemName).join(', ')} +${selectedItemObjects.length - 2} more`;
    }
  };

  const selectedItemsText = getSelectedItemsText();

  return (
    <Card>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: COLORS.dark, margin: 0, marginBottom: '2px' }}>
              Consumption Trends
            </h3>
            <p style={{ fontSize: '12px', color: COLORS.gray, margin: 0 }}>
              {selectedItemsText ? (
                <>Daily usage for <span style={{ fontWeight: '600', color: COLORS.primary }}>{selectedItemsText}</span> • Unit: units</>
              ) : (
                <>Daily usage patterns over time • Unit: units</>
              )}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: COLORS.gray, fontWeight: '600', marginBottom: '2px' }}>TOTAL</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.dark }}>{total.toLocaleString()} units</div>
            </div>
            <div style={{ width: '1px', backgroundColor: COLORS.border }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: COLORS.gray, fontWeight: '600', marginBottom: '2px' }}>AVG/DAY</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.primary }}>{Math.round(avg).toLocaleString()} units</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.gray }}>
          <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : chartData.length === 0 ? (
        <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.gray, fontSize: '13px' }}>
          No data available for selected items
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: COLORS.gray }} tickFormatter={(value) => { const date = new Date(value); return `${date.getMonth() + 1}/${date.getDate()}`; }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: COLORS.gray }} />
            <Tooltip content={<CleanTooltip />} />
            <Bar dataKey="consumption" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="consumption" stroke={COLORS.primary} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

const CoreInventoryTable: React.FC<{
  items: Item[];
  categories: Category[];
  initialRows?: number;
  dateRange: { start: string; end: string };
}> = ({ items, categories, initialRows = 5, dateRange }) => {
  const [expanded, setExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<number | null>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const { data: dataRangeInfo } = useDataRange();

  const filteredItems = useMemo(() => {
    let result = items;
    
    if (searchText) {
      result = result.filter(item => 
        item.itemName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.itemCode?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    if (selectedCategoryFilter) {
      result = result.filter(item => item.categoryId === selectedCategoryFilter);
    }
    
    return result;
  }, [items, searchText, selectedCategoryFilter]);

  const visibleItems = expanded ? filteredItems : filteredItems.slice(0, initialRows);

  const computeAvgDaily = (item: Item) => {
    const records = (item.consumptionRecords || []) as any[];
    if (records.length === 0) return 0;
    const last30 = records.slice(-30);
    const total = last30.reduce((s, r) => s + Number(r.consumedQuantity || 0), 0);
    return +(total / Math.max(1, last30.length)).toFixed(1);
  };

  const formatDateRange = () => {
    if (!dataRangeInfo) return '';
    const startDate = new Date(dataRangeInfo.minDate);
    const endDate = new Date(dataRangeInfo.maxDate);
    return `${startDate.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })} - ${endDate.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <Card>
      <div style={{ marginBottom: 16 }}>
        <style>{`
          @keyframes slideInSearch {
            from {
              opacity: 0;
              transform: translateX(-10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          .search-input-container {
            animation: slideInSearch 0.3s ease-out;
          }
        `}</style>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: COLORS.dark, margin: '0 0 4px 0' }}>
              Core Inventory Stock Levels
            </h3>
            {dataRangeInfo && (
              <p style={{ fontSize: 11, color: COLORS.gray, margin: 0 }}>
                Data Period: {formatDateRange()} • {dataRangeInfo.availableMonths} months
              </p>
            )}
          </div>
          
          <div style={{ position: 'relative', width: '320px' }} className="search-input-container">
            <Search size={16} color={COLORS.gray} style={{ 
              position: 'absolute', 
              left: '12px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }} />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 40px 10px 38px',
                fontSize: '13px',
                border: `2px solid ${COLORS.border}`,
                borderRadius: '8px',
                outline: 'none',
                transition: 'all 0.2s ease',
                fontWeight: '500',
                boxShadow: searchText ? `0 0 0 3px ${COLORS.primary}20` : 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = COLORS.primary;
                e.target.style.boxShadow = `0 0 0 3px ${COLORS.primary}20`;
              }}
              onBlur={(e) => {
                if (!searchText) {
                  e.target.style.borderColor = COLORS.border;
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {searchText && (
              <button
                onClick={() => setSearchText('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  animation: 'slideInSearch 0.2s ease-out'
                }}
              >
                <X size={16} color={COLORS.gray} />
              </button>
            )}
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              padding: '10px 16px',
              backgroundColor: expanded ? COLORS.primary : COLORS.white,
              color: expanded ? COLORS.white : COLORS.dark,
              border: `2px solid ${expanded ? COLORS.primary : COLORS.border}`,
              borderRadius: 8,
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {expanded ? 'Show less' : `Show all (${filteredItems.length})`}
          </button>
        </div>

        <div style={{ fontSize: 11, color: COLORS.gray }}>
          Showing {visibleItems.length} of {filteredItems.length} items
          {searchText && ` (filtered from ${items.length} total)`}
        </div>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: COLORS.gray, fontSize: 11, fontWeight: 600, backgroundColor: COLORS.bg }}>
              <th style={{ padding: '10px 8px' }}>Item ID</th>
              <th style={{ padding: '10px 8px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Category
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    style={{
                      background: selectedCategoryFilter ? COLORS.primary : COLORS.white,
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: '4px',
                      padding: '4px 6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Filter size={12} color={selectedCategoryFilter ? COLORS.white : COLORS.gray} />
                  </button>
                </div>
                {showCategoryDropdown && (
                  <>
                    <div 
                      onClick={() => setShowCategoryDropdown(false)}
                      style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 99
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '8px',
                      backgroundColor: COLORS.white,
                      border: `2px solid ${COLORS.border}`,
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 100,
                      minWidth: '200px',
                      maxHeight: '250px',
                      overflowY: 'auto'
                    }}>
                      <div
                        onClick={() => {
                          setSelectedCategoryFilter(null);
                          setShowCategoryDropdown(false);
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: !selectedCategoryFilter ? COLORS.primary : COLORS.dark,
                          backgroundColor: !selectedCategoryFilter ? COLORS.primary + '10' : 'transparent',
                          borderBottom: `1px solid ${COLORS.border}`,
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.bg}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !selectedCategoryFilter ? COLORS.primary + '10' : 'transparent'}
                      >
                        All Categories ({items.length})
                      </div>
                      {categories.map(cat => {
                        const itemCount = items.filter(item => item.categoryId === cat.id).length;
                        return (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategoryFilter(cat.id);
                              setShowCategoryDropdown(false);
                            }}
                            style={{
                              padding: '10px 12px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500',
                              color: selectedCategoryFilter === cat.id ? COLORS.primary : COLORS.dark,
                              backgroundColor: selectedCategoryFilter === cat.id ? COLORS.primary + '10' : 'transparent',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.bg}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedCategoryFilter === cat.id ? COLORS.primary + '10' : 'transparent'}
                          >
                            <span>{cat.categoryName}</span>
                            <span style={{ fontSize: '10px', color: COLORS.gray }}>({itemCount})</span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </th>
              <th style={{ padding: '10px 8px' }}>Item Name</th>
              <th style={{ padding: '10px 8px', textAlign: 'right' }}>SIH</th>
              <th style={{ padding: '10px 8px', textAlign: 'right' }}>Avg. Daily</th>
              <th style={{ padding: '10px 8px', textAlign: 'right' }}>Coverage Days</th>
              <th style={{ padding: '10px 8px', textAlign: 'center' }}>Stock Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((it) => {
              const avg = computeAvgDaily(it);
              const current = Number(it.currentQuantity || it.closingStock || 0);
              const coverage = avg > 0 ? Math.floor(current / avg) : Infinity;
              const categoryName = categories.find(c => c.id === it.categoryId)?.categoryName || 'Unknown';

              const getStockStatus = (cov: number) => {
                if (cov === Infinity) return { label: 'Adequate', color: COLORS.success, bg: '#ecfdf5' };
                if (cov <= 7) return { label: 'Critical', color: COLORS.danger, bg: '#fef2f2' };
                if (cov <= 14) return { label: 'Low', color: COLORS.warning, bg: '#fffbeb' };
                return { label: 'Adequate', color: COLORS.success, bg: '#ecfdf5' };
              };

              const status = getStockStatus(coverage);

              return (
                <tr key={it.id} style={{ borderTop: `1px solid ${COLORS.border}`, transition: 'background-color 0.2s', fontSize: 12 }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.bg}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                    <div style={{ fontWeight: 700, color: COLORS.dark }}>{it.id}</div>
                  </td>
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle', color: COLORS.gray }}>{categoryName}</td>
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle' }}>
                    <div style={{ fontWeight: 700, color: COLORS.dark }}>{it.itemName}</div>
                    {it.itemCode && <div style={{ fontSize: 10, color: COLORS.gray }}>{it.itemCode}</div>}
                  </td>
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle', textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: COLORS.dark }}>{current.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: COLORS.gray }}>units</div>
                  </td>
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle', textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, color: COLORS.dark }}>{avg}</div>
                    <div style={{ fontSize: 10, color: COLORS.gray }}>units/day</div>
                  </td>
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle', textAlign: 'right', fontWeight: 700 }}>
                    <span style={{ color: coverage <= 7 ? COLORS.danger : COLORS.dark }}>
                      {coverage === Infinity ? '∞' : `${coverage}d`}
                    </span>
                  </td>
                  <td style={{ padding: '10px 8px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: status.bg,
                      color: status.color,
                      fontSize: 11,
                      fontWeight: 600
                    }}>
                      {status.label}
                    </div>
                  </td>
                </tr>
              );
            })}

            {visibleItems.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: COLORS.gray, fontSize: 12 }}>
                  {searchText || selectedCategoryFilter ? 'No items match your filters' : 'No items to display'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const ConsumptionInventory: React.FC = () => {
  const { data: categoriesData = [], loading: categoriesLoading } = useCategories();
  const { data: itemsData = [], loading: itemsLoading } = useItems();
  
  const categories = (categoriesData || []) as Category[];
  const items = (itemsData || []) as Item[];
  
  const getDefaultDateRange = useMemo(() => {
    return { 
      start: '2025-01-01', 
      end: '2025-05-31' 
    };
  }, []);
  
  const [dateRange, setDateRange] = useState(getDefaultDateRange);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    setDateRange(getDefaultDateRange);
  }, [getDefaultDateRange]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowFilters(false);
        setShowHeatmap(false);
        setShowInsights(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const topMetrics = useMemo(() => {
    if (!items || items.length === 0) {
      return {
        topConsumed: null,
        fastMoving: null,
        slowMoving: null,
        lowCategory: null
      };
    }

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);

    const storiesData = items.map(item => {
      const records = (item.consumptionRecords || []) as any[];
      const periodRecords = records.filter((r: any) => {
        const recordDate = new Date(r.date);
        return recordDate >= startDate && recordDate <= endDate;
      });

      const totalConsumed = periodRecords.reduce((sum: number, r: any) => 
        sum + Number(r.consumedQuantity || 0), 0
      );

      const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
      const avgDaily = totalConsumed / daysDiff;
      
      return {
        item,
        avgDaily,
        totalConsumed,
        category: categories.find(c => c.id === item.categoryId)?.categoryName || 'Unknown',
        categoryId: item.categoryId
      };
    }).filter(d => d.totalConsumed > 0);

    const topConsumed = [...storiesData].sort((a, b) => b.totalConsumed - a.totalConsumed)[0];
    const fastMoving = [...storiesData].filter(d => d.avgDaily > 5).sort((a, b) => b.avgDaily - a.avgDaily)[0];
    const slowMoving = [...storiesData].filter(d => d.avgDaily > 0 && d.avgDaily <= 2).sort((a, b) => a.avgDaily - b.avgDaily)[0];

    const categoryConsumption = new Map<number, { name: string; daily: number; total: number }>();
    storiesData.forEach(item => {
      const existing = categoryConsumption.get(item.categoryId) || { name: item.category, daily: 0, total: 0 };
      existing.daily += item.avgDaily;
      existing.total += item.totalConsumed;
      categoryConsumption.set(item.categoryId, existing);
    });
    const lowCategory = Array.from(categoryConsumption.values()).sort((a, b) => a.daily - b.daily)[0];

    return {
      topConsumed: topConsumed ? {
        itemName: topConsumed.item.itemName,
        category: topConsumed.category,
        value: topConsumed.totalConsumed.toLocaleString(),
        unit: 'units',
        subtext: `${topConsumed.avgDaily.toFixed(1)} units per day`
      } : null,
      fastMoving: fastMoving ? {
        itemName: fastMoving.item.itemName,
        category: fastMoving.category,
        value: fastMoving.avgDaily.toFixed(1),
        unit: 'units/day',
        subtext: `${fastMoving.totalConsumed.toLocaleString()} units total consumed`
      } : null,
      slowMoving: slowMoving ? {
        itemName: slowMoving.item.itemName,
        category: slowMoving.category,
        value: slowMoving.avgDaily.toFixed(1),
        unit: 'units/day',
        subtext: `${slowMoving.totalConsumed.toLocaleString()} units total consumed`
      } : null,
      lowCategory: lowCategory ? {
        itemName: lowCategory.name,
        category: 'Category-level',
        value: lowCategory.daily.toFixed(1),
        unit: 'units/day',
        subtext: `${lowCategory.total.toLocaleString()} units total consumed`
      } : null
    };
  }, [items, categories, dateRange]);

  const loading = categoriesLoading || itemsLoading;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg, padding: '20px' }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: COLORS.dark, margin: '0 0 4px 0', letterSpacing: '-0.5px' }}>
            Consumption & Usage
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.gray, margin: 0 }}>
            Real-time consumption and stock analytics
          </p>
        </div>

        {loading ? (
          <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.gray }}>
            <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              {topMetrics.topConsumed && (
                <EnhancedMetricCard 
                  icon={Zap} 
                  iconColor={COLORS.warning} 
                  label="TOP CONSUMED ITEM" 
                  itemName={topMetrics.topConsumed.itemName}
                  category={topMetrics.topConsumed.category}
                  value={topMetrics.topConsumed.value}
                  unit={topMetrics.topConsumed.unit}
                  subtext={topMetrics.topConsumed.subtext}
                />
              )}
              {topMetrics.fastMoving && (
                <EnhancedMetricCard 
                  icon={TrendingUp} 
                  iconColor={COLORS.success} 
                  label="FAST MOVING ITEM" 
                  itemName={topMetrics.fastMoving.itemName}
                  category={topMetrics.fastMoving.category}
                  value={topMetrics.fastMoving.value}
                  unit={topMetrics.fastMoving.unit}
                  subtext={topMetrics.fastMoving.subtext}
                />
              )}
              {topMetrics.slowMoving && (
                <EnhancedMetricCard 
                  icon={TrendingDown} 
                  iconColor={COLORS.info} 
                  label="SLOW MOVING ITEM" 
                  itemName={topMetrics.slowMoving.itemName}
                  category={topMetrics.slowMoving.category}
                  value={topMetrics.slowMoving.value}
                  unit={topMetrics.slowMoving.unit}
                  subtext={topMetrics.slowMoving.subtext}
                />
              )}
              {topMetrics.lowCategory && (
                <EnhancedMetricCard 
                  icon={Package} 
                  iconColor={COLORS.secondary} 
                  label="LOW CONSUMED CATEGORY" 
                  itemName={topMetrics.lowCategory.itemName}
                  category={topMetrics.lowCategory.category}
                  value={topMetrics.lowCategory.value}
                  unit={topMetrics.lowCategory.unit}
                  subtext={topMetrics.lowCategory.subtext}
                />
              )}
            </div>

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <ActiveFilterChips dateRange={dateRange} selectedCategory={selectedCategory} selectedItems={selectedItems} categories={categories} onCategoryChange={setSelectedCategory} onItemsChange={setSelectedItems} />
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => {
                    const next = !showHeatmap;
                    setShowHeatmap(next);
                    if (next) {
                      setShowInsights(false);
                    }
                  }} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '10px 16px', 
                    backgroundColor: showHeatmap ? COLORS.success : COLORS.white, 
                    border: `2px solid ${showHeatmap ? COLORS.success : COLORS.border}`, 
                    borderRadius: '10px', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: showHeatmap ? COLORS.white : COLORS.dark, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: showHeatmap ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
                  }}
                >
                  <Activity size={16} />
                  Heatmap
                </button>
                <button 
                  onClick={() => {
                    const next = !showInsights;
                    setShowInsights(next);
                    if (next) {
                      setShowHeatmap(false);
                      setShowFilters(false);
                    }
                  }} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '10px 16px', 
                    background: showInsights ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.92) 0%, rgba(139, 92, 246, 0.92) 100%)' : 'linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, rgba(139, 92, 246, 0.14) 100%)', 
                    border: showInsights ? '2px solid rgba(99, 102, 241, 0.55)' : '2px solid rgba(99, 102, 241, 0.2)', 
                    borderRadius: '10px', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: showInsights ? COLORS.white : COLORS.primary, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: showInsights ? '0 6px 18px rgba(99, 102, 241, 0.35)' : 'none'
                  }}
                >
                  <Sparkles size={16} />
                  Insights
                </button>
                <button 
                  onClick={() => {
                    const next = !showFilters;
                    setShowFilters(next);
                    if (next) {
                      setShowInsights(false);
                    }
                  }} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    padding: '10px 16px', 
                    backgroundColor: showFilters ? COLORS.primary : COLORS.white, 
                    border: `2px solid ${showFilters ? COLORS.primary : COLORS.border}`, 
                    borderRadius: '10px', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: showFilters ? COLORS.white : COLORS.dark, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: showFilters ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none'
                  }}
                >
                  <Filter size={16} />
                  Filters
                  <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <ConsumptionChart categories={categories} items={items} dateRange={dateRange} selectedCategory={selectedCategory} selectedItems={selectedItems} />
            </div>

            <div style={{ marginTop: '20px' }}>
              <CoreInventoryTable items={items} categories={categories} initialRows={6} dateRange={dateRange} />
            </div>
          </>
        )}
      </div>

      <AnimatedFilterPanel
        isOpen={showFilters}
        categories={categories}
        items={items}
        dateRange={dateRange}
        selectedCategory={selectedCategory}
        selectedItems={selectedItems}
        onCategoryChange={setSelectedCategory}
        onItemsChange={setSelectedItems}
        onDateChange={setDateRange}
        onClose={() => setShowFilters(false)}
      />

      <HeatmapRightPanel
        isOpen={showHeatmap}
        items={items}
        categories={categories}
        dateRange={dateRange}
        selectedCategory={selectedCategory}
        selectedItems={selectedItems}
        onClose={() => setShowHeatmap(false)}
      />

      <SmartInsightsRightPanel
        isOpen={showInsights}
        selectedCategory={selectedCategory}
        onClose={() => setShowInsights(false)}
      />
    </div>
  );
};

export default ConsumptionInventory;