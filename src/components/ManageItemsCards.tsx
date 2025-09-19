import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Card } from 'antd';
import { Package, AlertTriangle, Activity } from 'lucide-react';
import { useItems } from '../api/hooks';
import { AnalyticsAPI, type ConsumptionTrendsResponse, type Item, type DataRangeResponse } from '../api/inventory';

const numberFmt = new Intl.NumberFormat();

// Props keep compatibility with ManageItems filters
type CardKey = 'all' | 'sih' | 'low' | 'mostCategory' | 'totalItems';

const ManageItemsCards: React.FC<{ onCardClick?: (key: CardKey) => void }> = ({ onCardClick }) => {
  const { data: items, loading: itemsLoading, error: itemsError } = useItems();
  const [consumption, setConsumption] = useState<ConsumptionTrendsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch monthly consumption grouped by items
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const dr: DataRangeResponse = await AnalyticsAPI.dataRange();
        const available = dr?.availableMonths || [];
        const sorted = [...available].sort();

        let startDate = '2025-01-01';
        let endDate = '2025-12-31';
        if (sorted.length > 0) {
          const lastFive = sorted.slice(-5);
          startDate = `${lastFive[0]}-01`;
          endDate = `${lastFive[lastFive.length - 1]}-31`;
        }

        const res = await AnalyticsAPI.consumptionTrends(
          'monthly',
          'items',
          undefined,
          startDate,
          endDate
        );

        if (mounted) setConsumption(res);
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load consumption');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Build price map
  const priceById = useMemo(() => {
    const map: Record<number, number> = {};
    (items || []).forEach((it: Item) => {
      map[it.id] = Number(it.unitPrice) || 0;
    });
    return map;
  }, [items]);

  // Aggregate monthly totals
  const monthly = useMemo(() => {
  const acc: Record<
    string,
    { qty: number; cost: number; byCategory: Record<string, number> }
  > = {};

  if (!consumption?.data) return { keys: [] as string[], data: acc };

  for (const row of consumption.data) {
    const category =
      (row as any).categoryName ||
      (row as any).category?.categoryName ||
      'Uncategorized';
    const itemId = (row as any).itemId as number | undefined;

    for (const dp of row.dataPoints || []) {
      const key = dp?.monthStart
        ? String(dp.monthStart).slice(0, 7)
        : dp?.date
        ? String(dp.date).slice(0, 7)
        : undefined;
      if (!key) continue;

      if (!acc[key])
        acc[key] = { qty: 0, cost: 0, byCategory: {} };

      const qty = Number(dp.consumption) || 0;
      const unitPrice = itemId ? (priceById[itemId] || 0) : 0;

      // overall totals
      acc[key].qty += qty;
      acc[key].cost += qty * unitPrice;

      // category breakdown
      acc[key].byCategory[category] =
        (acc[key].byCategory[category] || 0) + qty;
    }
  }

  const keys = Object.keys(acc).sort();
  return { keys, data: acc };
}, [consumption, priceById]);


  const currentKey = monthly.keys.length ? monthly.keys[monthly.keys.length - 1] : undefined;

  // Most consumed category with fallback
  const mostConsumedCategory = useMemo(() => {
    let topCat: string | null = null;
    let maxQty = 0;

    if (currentKey && monthly.data[currentKey]) {
      const catMap = monthly.data[currentKey]?.byCategory || {};
      for (const [cat, qty] of Object.entries(catMap)) {
        if (qty > maxQty) {
          topCat = cat;
          maxQty = qty;
        }
      }
      if (topCat) return { name: topCat, qty: maxQty };
    }

    const catTotals: Record<string, number> = {};
    (items || []).forEach((it: Item) => {
      const cat = it.category?.categoryName || 'Uncategorized';
      catTotals[cat] = (catTotals[cat] || 0) + (Number(it.currentQuantity) || 0);
    });

    for (const [cat, qty] of Object.entries(catTotals)) {
      if (qty > maxQty) {
        topCat = cat;
        maxQty = qty;
      }
    }
    return { name: topCat, qty: maxQty };
  }, [monthly, currentKey, items]);

  // Average monthly consumption of that category
  const avgMonthlyConsumption = useMemo(() => {
    if (!mostConsumedCategory.name || monthly.keys.length === 0) return 0;
    let total = 0;
    let months = 0;
    for (const key of monthly.keys) {
      const catMap = monthly.data[key]?.byCategory || {};
      if (catMap[mostConsumedCategory.name] != null) {
        total += catMap[mostConsumedCategory.name];
        months++;
      }
    }
    return months > 0 ? total / months : 0;
  }, [mostConsumedCategory, monthly]);

  // Inventory metrics
  const totalItems = useMemo(() => (items || []).length, [items]);
  const stockMetrics = useMemo(() => {
    const list = items || [];
    const overallSIH = list.reduce((s: number, i: any) => s + (Number(i.currentQuantity) || 0), 0);
    const lowStock = list.filter(
      (i: any) => (Number(i.currentQuantity) || 0) <= (Number(i.minStockLevel) || 0)
    ).length;
    return { overallSIH, lowStock };
  }, [items]);

  const cards = useMemo(
    () => [
      {
        key: 'mostCategory' as const,
        title: 'Most Consumed Category',
        // show quantity on top
        value: numberFmt.format(mostConsumedCategory.qty || 0),
        // show category name + avg below
        sub: mostConsumedCategory.name
          ? `${mostConsumedCategory.name} | Avg: ${numberFmt.format(Math.round(avgMonthlyConsumption))}/month`
          : '—',
        color: '#3b82f6',
        icon: <Activity size={20} />,
        delta: '',
        chartData: null,
        valueFormatter: (v: number) => numberFmt.format(v),
        onClick: () => {
          if (mostConsumedCategory.name) {
            onCardClick?.(`category-${mostConsumedCategory.name}` as any);
          }
        },
      },
      {
        key: 'totalItems' as const,
        title: 'Total Items',
        value: numberFmt.format(totalItems),
        sub: 'Unique inventory items',
        color: '#0ea5e9',
        icon: <Package size={20} />,
        delta: '',
        chartData: null,
        valueFormatter: (v: number) => numberFmt.format(v),
        onClick: () => onCardClick?.('all'),
      },
      {
        key: 'low' as const,
        title: 'Low Stock Items',
        value: numberFmt.format(stockMetrics.lowStock || 0),
        sub: 'Qty <= Min Level',
        color: '#f59e0b',
        icon: <AlertTriangle size={20} />,
        delta: '',
        chartData: null,
        valueFormatter: (v: number) => numberFmt.format(v),
        onClick: () => onCardClick?.('low'),
      },
      {
        key: 'sih' as const,
        title: 'Stock In Hand',
        value: numberFmt.format(Math.round(stockMetrics.overallSIH || 0)),
        sub: 'Total quantity on hand',
        color: '#6366f1',
        icon: <Package size={20} />,
        delta: '',
        chartData: null,
        valueFormatter: (v: number) => numberFmt.format(v),
        onClick: () => onCardClick?.('sih'),
      },
    ],
    [mostConsumedCategory, avgMonthlyConsumption, totalItems, stockMetrics, onCardClick]
  );

  return (
    <div style={{ marginBottom: 12 }}>
      {(error || itemsError) && (
        <div style={{ color: 'red', marginBottom: 8 }}>
          {String(error || itemsError)}
        </div>
      )}
      <Row gutter={[12, 12]}>
        {cards.map((c) => (
          <Col key={c.key} xs={24} sm={12} md={12} lg={6}>
            <Card
              loading={loading || itemsLoading}
              bodyStyle={{ padding: 16 }}
              style={{
                borderRadius: 16,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                position: 'relative',
                overflow: 'hidden',
                cursor: onCardClick ? 'pointer' : 'default',
              }}
              onClick={c.onClick}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
                    <span style={{ color: c.color }}>{c.icon}</span>
                    <span style={{ fontWeight: 600 }}>{c.title}</span>
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>
                    {c.value}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'baseline',
                      color: '#6b7280',
                      marginTop: 2,
                    }}
                  >
                    <span style={{ fontSize: 12 }}>{c.sub}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ManageItemsCards;
