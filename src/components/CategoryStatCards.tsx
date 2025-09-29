import React, { useMemo } from 'react';
import { Card, Col, Row } from 'antd';
import { ResponsiveContainer, AreaChart, Area, Tooltip } from 'recharts';
import { Layers3, Boxes, AlertTriangle } from 'lucide-react';
import { useCategories, useItems } from '../api/hooks';

const numberFmt = new Intl.NumberFormat();

function buildSpark(base: number) {
  const n = 12;
  return Array.from({ length: n }, (_, i) => {
    const drift = Math.sin(i / 2.3) * (base * 0.05);
    const noise = (i % 2 === 0 ? 0.02 : -0.015) * base;
    return { x: i, y: Math.max(0, Math.round(base + drift + noise)) };
  });
}

// Props allow parent to react when a card is clicked
const CategoryStatCards: React.FC<{ onCardClick?: (key: 'categories' | 'items' | 'risk') => void }> = ({ onCardClick }) => {
  const { data: categories, loading, error } = useCategories();
  const { data: items } = useItems();
  const list = categories || [];
  const itemList = items || [];

  const metrics = useMemo(() => {
    const totalCategories = list.length;
    const totalItems = itemList.length;
    const riskLevel = itemList.filter((i: any) => (i.currentQuantity || 0) <= (i.minStockLevel || 0)).length; // low stock count
    return { totalCategories, totalItems, riskLevel };
  }, [list, itemList]);

  const cards = [
    { key: 'categories' as const, title: 'Total Categories', value: metrics.totalCategories, color: '#3b82f6', icon: <Layers3 size={20} />, spark: buildSpark(metrics.totalCategories) },
    { key: 'items' as const, title: 'Total Items', value: metrics.totalItems, color: '#22c55e', icon: <Boxes size={20} />, spark: buildSpark(metrics.totalItems) },
    { key: 'risk' as const, title: 'Low Stock (Risk)', value: metrics.riskLevel, color: '#f59e0b', icon: <AlertTriangle size={20} />, spark: buildSpark(metrics.riskLevel) },
  ];

  return (
    <div style={{ marginBottom: 12 }}>
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{String(error)}</div>}
      <Row gutter={[12, 12]}>
        {cards.map((c) => (
          <Col key={c.key} xs={24} sm={12} md={12} lg={8}>
            <Card
              loading={loading}
              bodyStyle={{ padding: 16 }}
              style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.08)', cursor: onCardClick ? 'pointer' : 'default' }}
              onClick={() => onCardClick?.(c.key)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
                    <span style={{ color: c.color }}>{c.icon}</span>
                    <span style={{ fontWeight: 600 }}>{c.title}</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>
                    {numberFmt.format(c.value || 0)}
                  </div>
                </div>
                <div style={{ width: 120, height: 56 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={c.spark} margin={{ left: 0, right: 0, top: 6, bottom: 0 }}>
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