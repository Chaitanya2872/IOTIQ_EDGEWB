import React, { useMemo } from 'react';
import { Row, Col, Card } from 'antd';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { Package, Layers, AlertTriangle, DollarSign, ListChecks } from 'lucide-react';
import { useItems } from '../api/hooks';

const numberFmt = new Intl.NumberFormat();

// Build a simple sparkline dataset based on a base value
function buildSpark(base: number) {
  const points = 14;
  const data = Array.from({ length: points }, (_, i) => {
    const drift = Math.sin(i / 2.5) * 0.04 * base;
    const noise = (i % 3 === 0 ? 0.02 : -0.015) * base;
    return { x: i, y: Math.max(0, Math.round(base + drift + noise)) };
  });
  return data;
}

// Props allow parent to react when a card is clicked
const InteractiveStatCards: React.FC<{ onCardClick?: (key: 'all' | 'sih' | 'low' | 'price') => void }> = ({ onCardClick }) => {
  const { data: items, loading, error } = useItems();
  const list = items || [];

  const metrics = useMemo(() => {
    const totalItems = list.length;
    const overallSIH = list.reduce((s: number, i: any) => s + (i.currentQuantity || 0), 0);
    const lowStock = list.filter((i: any) => (i.currentQuantity || 0) <= (i.minStockLevel || 0)).length;
    const totalPrice = list.reduce((s: number, i: any) => s + (Number(i.unitPrice) || 0) * (Number(i.currentQuantity) || 0), 0);
    return { totalItems, overallSIH, lowStock, totalPrice };
  }, [list]);

  const cards = useMemo(() => [
    {
      key: 'all' as const,
      title: 'Total Items',
      value: metrics.totalItems,
      icon: <ListChecks size={20} />, // list icon
      color: '#6366f1',
      spark: buildSpark(metrics.totalItems || 0),
    },
    {
      key: 'sih' as const,
      title: 'Overall SIH',
      value: metrics.overallSIH,
      icon: <Package size={20} />, // box icon
      color: '#3b82f6',
      spark: buildSpark(metrics.overallSIH || 0),
    },
    {
      key: 'low' as const,
      title: 'Low Stock',
      value: metrics.lowStock,
      icon: <AlertTriangle size={20} />,
      color: '#f59e0b',
      spark: buildSpark(metrics.lowStock || 0),
    },
    {
      key: 'price' as const,
      title: 'Total Value',
      value: metrics.totalPrice,
      icon: <DollarSign size={20} />, // currency icon
      color: '#22c55e',
      spark: buildSpark(metrics.totalPrice || 0),
    },
  ], [metrics]);

  return (
    <div style={{ marginBottom: 12 }}>
      {error && (
        <div style={{ color: 'red', marginBottom: 8 }}>{String(error)}</div>
      )}
      <Row gutter={[12, 12]}>
        {cards.map((c) => (
          <Col key={c.key} xs={24} sm={12} md={12} lg={6}>
            <Card
              loading={loading}
              bodyStyle={{ padding: 16 }}
              style={{
                borderRadius: 16,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden',
                cursor: onCardClick ? 'pointer' : 'default',
              }}
              onClick={() => onCardClick?.(c.key)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
                    <span style={{ color: c.color }}>{c.icon}</span>
                    <span style={{ fontWeight: 600 }}>{c.title}</span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, marginTop: 6 }}>
                    {c.key === 'price' ?
                      new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(c.value || 0) :
                      numberFmt.format(c.value || 0)
                    }
                  </div>
                </div>

                {/* Mini sparkline */}
                <div style={{ width: 120, height: 56 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={c.spark} margin={{ left: 0, right: 0, top: 6, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`g-${c.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={c.color} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={c.color} stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Tooltip cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }} formatter={(v: any) => numberFmt.format(Number(v))} />
                      <Area type="monotone" dataKey="y" stroke={c.color} fill={`url(#g-${c.key})`} strokeWidth={2} />
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

export default InteractiveStatCards;