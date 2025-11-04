import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Card, Tooltip } from 'antd';
import { Package, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { useItems } from '../api/hooks';
import { AnalyticsAPI, type TopConsumersResponse } from '../api/inventory';

const numberFmt = new Intl.NumberFormat();

type CardKey = 'all' | 'sih' | 'low' | 'mostCategory' | 'totalItems';

const formatLastUpdated = (items: any[]): string => {
  if (!items || items.length === 0) return 'Never';
  
  const mostRecentDate = items.reduce((latest, item) => {
    const itemDate = item.updated_at ? new Date(item.updated_at) : new Date(0);
    return itemDate > latest ? itemDate : latest;
  }, new Date(0));
  
  if (mostRecentDate.getTime() === 0) return 'Never';
  
  const now = new Date();
  const diffMs = now.getTime() - mostRecentDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return mostRecentDate.toLocaleDateString();
};

const calculateBinPeriod = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const startDay = start.getDate();
  const endDay = end.getDate();
  const month = end.getMonth();
  
  if (startDay === 1 && endDay <= 15) {
    return `${monthNames[month]} 1-15`;
  } else if (startDay === 16) {
    return `${monthNames[month]} 16-${endDay}`;
  } else {
    return `${monthNames[month]} ${startDay}-${endDay}`;
  }
};

const ManageItemsCards: React.FC<{ onCardClick?: (key: CardKey) => void }> = ({ onCardClick }) => {
  const { data: items, loading: itemsLoading, error: itemsError } = useItems();
  const [topConsumersData, setTopConsumersData] = useState<TopConsumersResponse | null>(null);
  const [binLabel, setBinLabel] = useState<string>('Loading...');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const days = 30;

        const res = await AnalyticsAPI.topConsumers(days);

        if (mounted && res) {
          setTopConsumersData(res);
          const label = calculateBinPeriod(res.startDate, res.endDate);
          setBinLabel(label);
        } else {
          if (mounted) {
            setError('No consumption data available');
            setBinLabel('No Data');
          }
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Failed to load consumption data');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const topConsumedItem = useMemo(() => {
    if (!topConsumersData?.topConsumers || topConsumersData.topConsumers.length === 0) {
      return { name: null, category: null, totalQty: 0, avgDaily: 0 };
    }

    const topItem = topConsumersData.topConsumers[0];
    
    const start = new Date(topConsumersData.startDate);
    const end = new Date(topConsumersData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const consumedQty = Number(topItem.consumedQuantity || 0);
    const avgDaily = days > 0 ? consumedQty / days : consumedQty;

    return {
      name: topItem.itemName || 'Unknown',
      category: topItem.categoryName || 'Uncategorized',
      totalQty: consumedQty,
      avgDaily: avgDaily
    };
  }, [topConsumersData]);

  const totalItems = useMemo(() => (items || []).length, [items]);
  
  const stockMetrics = useMemo(() => {
    const list = items || [];
    const overallSIH = list.reduce((s: number, i: any) => {
      const qty = Number(i.currentQuantity || i.closingStock || 0);
      return s + (isNaN(qty) ? 0 : qty);
    }, 0);
    
    const lowStock = list.filter(
      (i: any) => {
        const currentQty = Number(i.currentQuantity || i.closingStock || 0);
        const minLevel = Number(i.minStockLevel || 0);
        return currentQty <= minLevel;
      }
    ).length;
    
    return { overallSIH, lowStock };
  }, [items]);

  const lastUpdated = useMemo(() => formatLastUpdated(items || []), [items]);

  const cards = useMemo(
    () => [
      {
        key: 'totalItems' as const,
        title: 'Total Items',
        value: numberFmt.format(totalItems || 0),
        sub: 'Unique inventory items',
        color: '#0ea5e9',
        icon: <Package size={20} />,
        delta: '',
        chartData: null,
        valueFormatter: (v: number) => numberFmt.format(v),
        infoTooltip: 'Total number of unique items in your inventory system',
        onClick: () => onCardClick?.('all'),
      },
      {
        key: 'topConsumedItem' as const,
        title: `Top Consumed Item (${binLabel})`,
        value: topConsumedItem.totalQty > 0 ? numberFmt.format(topConsumedItem.totalQty) : '—',
        sub: topConsumedItem.name
          ? `${topConsumedItem.name} | ${topConsumedItem.category} | Avg: ${numberFmt.format(Math.round(topConsumedItem.avgDaily || 0))}/day`
          : 'No consumption data',
        color: '#10b981',
        icon: <TrendingUp size={20} />,
        delta: '',
        chartData: null,
        valueFormatter: (v: number) => numberFmt.format(v),
        infoTooltip: `The most consumed item in the last available bin period (${binLabel}) with category and average daily consumption`,
        onClick: () => onCardClick?.('all'),
      },
      {
        key: 'low' as const,
        title: 'Low Stock Items',
        value: numberFmt.format(stockMetrics.lowStock || 0),
        sub: 'At or below minimum level',
        color: '#ef4444',
        icon: <AlertTriangle size={20} />,
        delta: '',
        chartData: null,
        valueFormatter: (v: number) => numberFmt.format(v),
        infoTooltip: 'Items that have reached or fallen below their minimum stock level and require immediate attention',
        onClick: () => onCardClick?.('low'),
      }
    ],
    [topConsumedItem, binLabel, totalItems, stockMetrics, onCardClick]
  );

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: 8,
        color: '#6b7280',
        fontSize: 12,
        fontWeight: 500
      }}>
        Last updated: {lastUpdated}
      </div>

      {(error || itemsError) && (
        <div style={{ color: 'red', marginBottom: 8 }}>
          {String(error || itemsError)}
        </div>
      )}
      <Row gutter={[12, 12]}>
        {cards.map((c) => (
          <Col key={c.key} xs={24} sm={12} md={8} lg={8}>
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
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
                    <span style={{ color: c.color }}>{c.icon}</span>
                    <span style={{ fontWeight: 600 }}>{c.title}</span>
                    <Tooltip title={c.infoTooltip} placement="top">
                      <Info 
                        size={14} 
                        style={{ 
                          color: '#94a3b8', 
                          cursor: 'help',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          (e.target as HTMLElement).style.color = c.color;
                        }}
                        onMouseLeave={(e) => {
                          (e.target as HTMLElement).style.color = '#94a3b8';
                        }}
                      />
                    </Tooltip>
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