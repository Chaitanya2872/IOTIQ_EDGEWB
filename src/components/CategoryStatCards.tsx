import React, { useEffect, useMemo, useState } from 'react';
import { Card, Col, Row } from 'antd';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { Layers3, Boxes, TrendingUp } from 'lucide-react';
import { useCategories, useItems } from '../api/hooks';
import { AnalyticsAPI, type TopConsumersResponse } from '../api/inventory';

const numberFmt = new Intl.NumberFormat();

function buildSpark(base: number) {
  const n = 12;
  return Array.from({ length: n }, (_, i) => {
    const drift = Math.sin(i / 2.3) * (base * 0.05);
    const noise = (i % 2 === 0 ? 0.02 : -0.015) * base;
    return { x: i, y: Math.max(0, Math.round(base + drift + noise)) };
  });
}

// Helper function to calculate bin period from date range
const calculateBinPeriod = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const startDay = start.getDate();
  const endDay = end.getDate();
  const month = end.getMonth();
  
  // Determine if it's a first half or second half bin
  if (startDay === 1 && endDay <= 15) {
    return `${monthNames[month]} 1-15`;
  } else if (startDay === 16) {
    return `${monthNames[month]} 16-${endDay}`;
  } else {
    // Fallback for other ranges
    return `${monthNames[month]} ${startDay}-${endDay}`;
  }
};

// Props allow parent to react when a card is clicked
const CategoryStatCards: React.FC<{ onCardClick?: (key: 'categories' | 'items' | 'topCategory') => void }> = ({ onCardClick }) => {
  const { data: categories, loading: categoriesLoading, error } = useCategories();
  const { data: items, loading: itemsLoading } = useItems();
  const [topConsumersData, setTopConsumersData] = useState<TopConsumersResponse | null>(null);
  const [binLabel, setBinLabel] = useState<string>('Loading...');
  const [loading, setLoading] = useState(false);

  const list = categories || [];
  const itemList = items || [];

  // Fetch top consumers based on default period (last 30 days)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // Use default 30-day period instead of dataRange API
        const days = 30;

        // Fetch top consumers for that period (get all items, not just top 10)
        const res = await AnalyticsAPI.topConsumers(days, 100);

        if (mounted && res) {
          setTopConsumersData(res);
          const label = calculateBinPeriod(res.startDate, res.endDate);
          setBinLabel(label);
        } else {
          if (mounted) {
            setBinLabel('No Data');
          }
        }
      } catch (e: any) {
        console.error('Failed to load consumption data:', e);
        if (mounted) {
          setBinLabel('No Data');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Aggregate consumption by category from top consumers data
  const topConsumedCategory = useMemo(() => {
    if (!topConsumersData?.topConsumers || topConsumersData.topConsumers.length === 0) {
      return { name: null, consumption: 0 };
    }

    // Aggregate by category
    const categoryTotals: Record<string, number> = {};

    for (const item of topConsumersData.topConsumers) {
      const categoryName = item.categoryName || 'Uncategorized';
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = 0;
      }
      categoryTotals[categoryName] += item.consumedQuantity;
    }

    // Find category with maximum consumption
    let topCategoryName: string | null = null;
    let maxConsumption = 0;

    for (const [categoryName, totalConsumption] of Object.entries(categoryTotals)) {
      if (totalConsumption > maxConsumption) {
        maxConsumption = totalConsumption;
        topCategoryName = categoryName;
      }
    }

    console.log('Category Totals:', categoryTotals);
    console.log('Top Category:', topCategoryName, 'Consumption:', maxConsumption);

    if (!topCategoryName) {
      return { name: null, consumption: 0 };
    }

    return {
      name: topCategoryName,
      consumption: maxConsumption
    };
  }, [topConsumersData]);

  const metrics = useMemo(() => {
    const totalCategories = list.length;
    const totalItems = itemList.length;
    return { totalCategories, totalItems };
  }, [list, itemList]);

  const cards = [
    { 
      key: 'categories' as const, 
      title: 'Total Categories', 
      value: metrics.totalCategories, 
      subtitle: 'Active categories',
      color: '#3b82f6', 
      icon: <Layers3 size={20} />, 
      spark: buildSpark(metrics.totalCategories) 
    },
    { 
      key: 'items' as const, 
      title: 'Total Items', 
      value: metrics.totalItems, 
      subtitle: 'In inventory',
      color: '#22c55e', 
      icon: <Boxes size={20} />, 
      spark: buildSpark(metrics.totalItems) 
    },
    { 
      key: 'topCategory' as const, 
      title: `Top Category (${binLabel})`, 
      value: topConsumedCategory.consumption, 
      subtitle: topConsumedCategory.name || 'No data',
      color: '#f59e0b', 
      icon: <TrendingUp size={20} />, 
      spark: buildSpark(topConsumedCategory.consumption) 
    },
  ];

  return (
    <div style={{ marginBottom: 12 }}>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{String(error)}</div>}
      <Row gutter={[8, 8]}>
        {cards.map((c) => (
          <Col key={c.key} xs={24} sm={12} md={8} lg={8}>
            <Card
              loading={categoriesLoading || itemsLoading || loading}
              bodyStyle={{ padding: 12 }}
              style={{ 
                borderRadius: 12, 
                boxShadow: '0 4px 12px rgba(0,0,0,0.06)', 
                cursor: onCardClick ? 'pointer' : 'default' 
              }}
              onClick={() => onCardClick?.(c.key)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#475569' }}>
                    <span style={{ color: c.color }}>{c.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{c.title}</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
                    {numberFmt.format(c.value || 0)}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                    {c.subtitle}
                  </div>
                </div>
                <div style={{ width: 100, height: 48 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={c.spark} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`cg-${c.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={c.color} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={c.color} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Tooltip cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }} />
                      <Area type="monotone" dataKey="y" stroke={c.color} fill={`url(#cg-${c.key})`} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CategoryStatCards;