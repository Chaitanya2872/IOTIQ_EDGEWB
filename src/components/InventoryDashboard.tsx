import React, { useMemo } from "react";
import { Row, Col, Table, Card, Input, DatePicker, Space } from "antd";
import { useItems } from "../api/hooks";
import InteractiveStatCards from "./InteractiveStatCards";

const { RangePicker } = DatePicker;

const InventoryDashboard: React.FC = () => {
  const { data: items, loading, error } = useItems();

  const columns = [
    { title: "Item", dataIndex: "itemName", key: "itemName" },
    { title: "Description", dataIndex: "itemDescription", key: "itemDescription" },
    { title: "Unit", dataIndex: "unitOfMeasurement", key: "unitOfMeasurement" },
    { title: "Current Qty", dataIndex: "currentQuantity", key: "currentQuantity", sorter: (a: any, b: any) => (a.currentQuantity || 0) - (b.currentQuantity || 0) },
    { title: "Min Level", dataIndex: "minStockLevel", key: "minStockLevel", sorter: (a: any, b: any) => (a.minStockLevel || 0) - (b.minStockLevel || 0) },
    { title: "Max Level", dataIndex: "maxStockLevel", key: "maxStockLevel", sorter: (a: any, b: any) => (a.maxStockLevel || 0) - (b.maxStockLevel || 0) },
    { title: "Unit Price", dataIndex: "unitPrice", key: "unitPrice", render: (v: number) => v?.toFixed?.(2) ?? v, sorter: (a: any, b: any) => (a.unitPrice || 0) - (b.unitPrice || 0) },
    { title: "Category", dataIndex: "categoryId", key: "categoryId", filters: Array.from(new Set((items||[]).map(i=>String(i.categoryId||'')))).map(v => ({ text: v || 'N/A', value: v })), onFilter: (val: any, record: any) => String(record.categoryId||'') === String(val) },
    { title: "Expiry", dataIndex: "expiryDate", key: "expiryDate" },
  ];

  const dataSource = useMemo(
    () => (items || []).map((i) => ({ key: i.id, ...i })),
    [items]
  );

  return (
    <div style={{ padding: 16 }}>
      {/* Interactive stat cards */}
      <InteractiveStatCards />

      <Row gutter={[12, 12]}>
        <Col span={24}>
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <span>Inventory Table</span>
                {/* Table header with search + date filter */}
                <Space size={8}>
                  <Input.Search placeholder="Search items" allowClear style={{ width: 220 }} onSearch={() => { /* wiring later */ }} />
                  <RangePicker onChange={() => { /* wiring later */ }} />
                </Space>
              </div>
            }
            size="small"
          >
            {error && <div style={{ color: "red" }}>{error}</div>}
            <Table
              loading={loading}
              columns={columns as any}
              dataSource={dataSource}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InventoryDashboard;