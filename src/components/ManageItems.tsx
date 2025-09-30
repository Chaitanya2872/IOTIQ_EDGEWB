import React, { useEffect, useMemo, useState } from 'react';
import { 
  Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Upload, 
  message, DatePicker, Row, Col, Statistic, Badge, Tooltip
} from 'antd';
import type { UploadProps } from 'antd';
import { useItems, useCategories } from '../api/hooks';
import type { Item } from '../api/inventory';
import { UploadAPI } from '../api/inventory';
import ManageItemsCards from './ManageItemsCards';
import { Edit3, Trash2, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface TransactionModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (data: any) => void;
  item: Item | null;
  type: 'consume' | 'receive';
  loading: boolean;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  visible, onCancel, onOk, item, type, loading
}) => {
  const [form] = Form.useForm();
  const [quantity, setQuantity] = useState<number>(0);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([dayjs(), dayjs()]);

  useEffect(() => {
    if (visible && item) {
      form.resetFields();
      setQuantity(0);
      setDateRange([dayjs(), dayjs()]);
    }
  }, [visible, item, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onOk({
        ...values,
        quantity,
        startDate: dateRange[0]?.format('YYYY-MM-DD'),
        endDate: dateRange[1]?.format('YYYY-MM-DD'),
        itemId: item?.id
      });
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const projectedQuantity = useMemo(() => {
    if (!item || !quantity) return item?.currentQuantity || 0;
    
    const current = item.currentQuantity || 0;
    return type === 'consume' ? current - quantity : current + quantity;
  }, [item, quantity, type]);

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: type === 'consume' ? '#ff4d4f' : '#52c41a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold'
          }}>
            {type === 'consume' ? 'C' : 'R'}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {type === 'consume' ? 'Record Consumption' : 'Record Receipt'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {item?.category?.categoryName} - {item?.itemName}
            </div>
          </div>
        </div>
      }
      width={600}
      confirmLoading={loading}
      okText={type === 'consume' ? 'Record Consumption' : 'Record Receipt'}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Card size="small" style={{ marginBottom: 16, backgroundColor: '#f8f9fa' }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic 
                    title="Current Quantity" 
                    value={item?.currentQuantity || 0} 
                    suffix={item?.unitOfMeasurement}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="Transaction Quantity" 
                    value={quantity} 
                    suffix={item?.unitOfMeasurement}
                    valueStyle={{ color: type === 'consume' ? '#ff4d4f' : '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="Projected Quantity" 
                    value={projectedQuantity} 
                    suffix={item?.unitOfMeasurement}
                    valueStyle={{ 
                      color: projectedQuantity < (item?.minStockLevel || 0) ? '#ff4d4f' : '#52c41a' 
                    }}
                  />
                </Col>
              </Row>
              {projectedQuantity < (item?.minStockLevel || 0) && (
                <div style={{ 
                  marginTop: 8, 
                  padding: 8, 
                  backgroundColor: '#fff2f0', 
                  border: '1px solid #ffccc7',
                  borderRadius: 4,
                  fontSize: '12px',
                  color: '#ff4d4f'
                }}>
                  ⚠️ Warning: Projected quantity will be below minimum stock level ({item?.minStockLevel})
                </div>
              )}
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item 
              label="Quantity" 
              name="quantity"
              rules={[
                { required: true, message: 'Please enter quantity' },
                { type: 'number', min: 0.01, message: 'Quantity must be positive' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                min={0.01}
                step={0.01}
                placeholder="Enter quantity"
                onChange={value => setQuantity(Number(value))}
                addonAfter={item?.unitOfMeasurement}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item 
              label="Date Range" 
              name="dateRange"
              rules={[{ required: true, message: 'Please select date range' }]}
            >
              <RangePicker 
                style={{ width: '100%' }}
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates.length === 2) setDateRange([dates[0]!, dates[1]!]);
                }}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>

        {type === 'consume' && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Department" name="department">
                <Input placeholder="Department (optional)" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Notes" name="notes">
                <Input.TextArea 
                  rows={2} 
                  placeholder="Additional notes (optional)" 
                />
              </Form.Item>
            </Col>
          </Row>
        )}

        {type === 'receive' && (
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Unit Price" name="unitPrice">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  step={0.01}
                  placeholder="Unit price"
                  addonBefore="$"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Reference Number" name="referenceNumber">
                <Input placeholder="PO/Invoice number" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Supplier" name="supplier">
                <Input placeholder="Supplier name" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Notes" name="notes">
                <Input.TextArea 
                  rows={2} 
                  placeholder="Additional notes (optional)" 
                />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
};

const ManageItems: React.FC = () => {
  const { data, loading, error, create, update, remove, refresh, consume, receive, search } = useItems();
  const { data: categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form] = Form.useForm<Item & { categoryId: number }>();
  const [rows, setRows] = useState<Item[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'sih' | 'low' | 'price' | 'low-stock-risk' | 'inventory-value' | 'quick-stats'>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Transaction modal states
  const [transactionModal, setTransactionModal] = useState<{
    visible: boolean;
    type: 'consume' | 'receive';
    item: Item | null;
    loading: boolean;
  }>({
    visible: false,
    type: 'consume',
    item: null,
    loading: false
  });

  useEffect(() => { setRows(data || []); }, [data]);

  const categoryOptions = useMemo(() => (categories || []).map(c => ({ label: c.categoryName, value: c.id })), [categories]);

  // Enhanced filtering with coverage days calculation
  const filteredRows = useMemo(() => {
    let r = [...(rows || [])];
    
    if (selectedCategory) {
      r = r.filter(i => i.category?.categoryName === selectedCategory);
      return r;
    }
    
    if (categoryFilter !== 'all') {
      r = r.filter(i => i.categoryId === categoryFilter);
    }
    
    if (activeFilter === 'low') {
      r = r.filter(i => (i.currentQuantity || 0) <= (i.minStockLevel || 0));
    }
    
    if (activeFilter === 'low-stock-risk') {
      r = r.filter(i => {
        const currentQty = i.currentQuantity || 0;
        const minStock = i.minStockLevel || 0;
        const avgDailyConsumption = i.avgDailyConsumption || (i.totalConsumedStock || 0) / 30;
        const coverageDays = avgDailyConsumption > 0 ? currentQty / avgDailyConsumption : 999;
        
        return currentQty <= minStock || coverageDays <= 7;
      }).map(i => {
        const avgDailyConsumption = i.avgDailyConsumption || (i.totalConsumedStock || 0) / 30;
        const coverageDays = avgDailyConsumption > 0 ? (i.currentQuantity || 0) / avgDailyConsumption : 999;
        
        return {
          ...i,
          coverageDays: Number(coverageDays.toFixed(1)),
          riskLevel: coverageDays <= 3 ? 'CRITICAL' : coverageDays <= 7 ? 'HIGH' : 'MEDIUM'
        };
      }).sort((a, b) => (a as any).coverageDays - (b as any).coverageDays);
    }
    
    return r;
  }, [rows, categoryFilter, activeFilter, selectedCategory]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70, sorter: (a: any, b: any) => a.id - b.id },
    { title: 'Code', dataIndex: 'itemCode', key: 'itemCode' },
    { title: 'Name', dataIndex: 'itemName', key: 'itemName', sorter: (a: any, b: any) => String(a.itemName).localeCompare(String(b.itemName)) },
    { title: 'Description', dataIndex: 'itemDescription', key: 'itemDescription' },
    { title: 'Unit', dataIndex: 'unitOfMeasurement', key: 'unitOfMeasurement' },
    { 
      title: 'Qty', 
      dataIndex: 'currentQuantity', 
      key: 'currentQuantity', 
      sorter: (a: any, b: any) => a.currentQuantity - b.currentQuantity,
      render: (qty: number, record: any) => (
        <Badge 
          count={qty} 
          overflowCount={9999}
          style={{ 
            backgroundColor: qty <= (record.minStockLevel || 0) ? '#ff4d4f' : '#52c41a' 
          }}
        />
      )
    },
    // Coverage Days Column - only show when viewing low stock risk items
    ...(activeFilter === 'low-stock-risk' ? [{
      title: 'Coverage Days',
      key: 'coverageDays',
      width: 120,
      sorter: (a: any, b: any) => (a.coverageDays || 999) - (b.coverageDays || 999),
      render: (_: any, record: any) => {
        if (record.coverageDays === undefined) return '—';
        
        const riskColor = record.riskLevel === 'CRITICAL' ? 'red' : 
                         record.riskLevel === 'HIGH' ? 'orange' : 'yellow';
        
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold',
              color: record.riskLevel === 'CRITICAL' ? '#ff4d4f' : 
                     record.riskLevel === 'HIGH' ? '#fa8c16' : '#fadb14'
            }}>
              {record.coverageDays}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Tag 
                color={riskColor}
                style={{ margin: 0, fontSize: '10px' }}
              >
                {record.riskLevel}
              </Tag>
              <div style={{ fontSize: '10px', color: '#666', marginTop: 2 }}>
                days
              </div>
            </div>
          </div>
        );
      }
    }] : []),
    {
      title: 'Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      sorter: (a: any, b: any) => (Number(a.unitPrice) || 0) - (Number(b.unitPrice) || 0),
      render: (v: number | null) => v != null ? `$${Number(v).toFixed(2)}` : '—'
    },
  {
  title: 'Category',
  key: 'category',
  dataIndex: ['category', 'categoryName'],
  filters: categories?.map(c => ({
    text: c.categoryName,
    value: c.id
  })) ?? [],
  onFilter: (val: any, rec: any) => rec?.category?.id === val || rec?.categoryId === val,
  render: (_: any, rec: any) => (
    <Tag color="blue">
      {rec?.category?.categoryName ||
        (categories?.find(c => c.id === rec.categoryId)?.categoryName ?? '—')}
    </Tag>
  )
},
    {
      title: 'Actions', 
      key: 'actions', 
      width: 220,
      render: (_: any, record: Item) => (
        <Space>
          <Button size="small" icon={<Edit3 size={14} />} onClick={() => onEdit(record)} />
          <Button size="small" danger icon={<Trash2 size={14} />} onClick={() => onDelete(record.id)} />
          
          {/* Circled C icon for Consumption */}
          <Tooltip title="Record Consumption">
            <Button
              size="small"
              shape="circle"
              style={{
                backgroundColor: '#ff4d4f',
                borderColor: '#ff4d4f',
                color: 'white',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => openTransactionModal('consume', record)}
            >
              C
            </Button>
          </Tooltip>
          
          {/* Circled R icon for Receipt */}
          <Tooltip title="Record Receipt">
            <Button
              size="small"
              shape="circle"
              style={{
                backgroundColor: '#52c41a',
                borderColor: '#52c41a',
                color: 'white',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => openTransactionModal('receive', record)}
            >
              R
            </Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  const dataSource = useMemo(() => (filteredRows || []).map(i => ({ key: i.id, ...i })), [filteredRows]);

  const openTransactionModal = (type: 'consume' | 'receive', item: Item) => {
    setTransactionModal({
      visible: true,
      type,
      item,
      loading: false
    });
  };

  const closeTransactionModal = () => {
    setTransactionModal({
      visible: false,
      type: 'consume',
      item: null,
      loading: false
    });
  };

  const handleTransaction = async (data: any) => {
    setTransactionModal(prev => ({ ...prev, loading: true }));
    
    try {
      if (transactionModal.type === 'consume') {
        await consume(
          data.itemId, 
          data.quantity, 
          data.department, 
          data.notes
        );
        message.success('Consumption recorded successfully');
      } else {
        await receive(
          data.itemId, 
          data.quantity, 
          data.unitPrice,
          data.referenceNumber,
          data.supplier,
          data.notes
        );
        message.success('Receipt recorded successfully');
      }
      
      closeTransactionModal();
      
      // Refresh data to show real-time updates
      setTimeout(() => {
        refresh();
      }, 100);
      
    } catch (e: any) {
      message.error(e?.message || `${transactionModal.type === 'consume' ? 'Consumption' : 'Receipt'} recording failed`);
    } finally {
      setTransactionModal(prev => ({ ...prev, loading: false }));
    }
  };

  const onAdd = () => { setEditing(null); form.resetFields(); setIsModalOpen(true); };

  const onEdit = (record: Item) => {
    setEditing(record);
    form.setFieldsValue({ ...record, categoryId: record.category?.id ?? record.categoryId } as any);
    setIsModalOpen(true);
  };

  const onDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete item?',
      okButtonProps: { danger: true },
      onOk: async () => {
        try { await remove(id); message.success('Deleted'); }
        catch (e: any) { message.error(e?.message || 'Delete failed'); }
      }
    });
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values } as any;
      if (editing) { await update(editing.id, payload); message.success('Updated'); }
      else { await create(payload); message.success('Created'); }
      setIsModalOpen(false);
    } catch (e: any) {
      if (!e?.errorFields) message.error(e?.message || 'Save failed');
    }
  };

  const handleSearch = async (q?: string) => {
    const query = (q || '').trim();
    if (!query) { setRows(data || []); return; }
    try { const results = await search(query); setRows(results); }
    catch (e: any) { message.error(e?.message || 'Search failed'); }
  };

  const uploadProps: UploadProps = {
    multiple: true,
    accept: '.csv,.xlsx',
    showUploadList: true,
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options as any;
      try {
        await UploadAPI.uploadItems(file as File);
        message.success(`${(file as File).name} uploaded`);
        onSuccess?.({}, file);
        refresh();
      } catch (e: any) {
        message.error(e?.message || 'Upload failed');
        onError?.(e);
      }
    },
  };

  const handleCardClick = (key: any) => {
    if (typeof key === 'string' && key.startsWith('category-')) {
      const catName = key.replace('category-', '');
      setSelectedCategory(catName);
      setCategoryFilter('all');
      setActiveFilter('all');
    } else {
      setSelectedCategory(null);
      setActiveFilter(key);
    }
  };

  const getTableTitle = () => {
    if (selectedCategory) return `Items in ${selectedCategory} Category`;
    if (activeFilter === 'low-stock-risk') return 'Low Stock Risk Items (with Coverage Days)';
    if (activeFilter === 'inventory-value') return 'Inventory Value Analysis';
    if (activeFilter === 'quick-stats') return 'Quick Statistics View';
    return 'Items';
  };

  return (
    <div style={{ padding: 16 }}>
      <ManageItemsCards onCardClick={handleCardClick} />

      {/* Show active filter status */}
      <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {selectedCategory && (
          <Tag color="purple" closable onClose={() => setSelectedCategory(null)}>
            Category: {selectedCategory}
          </Tag>
        )}
        {activeFilter === 'low-stock-risk' && (
          <Tag color="red" icon={<Clock size={12} />}>
            Low Stock Risk Items (with Coverage Days)
          </Tag>
        )}
        {activeFilter === 'inventory-value' && (
          <Tag color="green" icon={<TrendingUp size={12} />}>
            Inventory Value Analysis
          </Tag>
        )}
      </div>

      <Space style={{ marginBottom: 12, flexWrap: 'wrap' }}>
        <Button type="primary" onClick={onAdd}>Add Item</Button>
        <Button onClick={() => { 
          refresh(); 
          setSelectedCategory(null); 
          setActiveFilter('all');
        }}>
          Refresh All
        </Button>
        <Select
          allowClear={false}
          value={categoryFilter}
          style={{ minWidth: 220 }}
          options={[{ label: 'All Categories', value: 'all' }, ...categoryOptions]}
          onChange={(v) => { setSelectedCategory(null); setCategoryFilter(v as any); }}
        />
      </Space>

      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      {/* Import Items Section */}
      <Card title="Import Items (CSV/XLSX)" size="small" style={{ marginBottom: 12 }}>
        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">📥</p>
          <p className="ant-upload-text">Click or drag file to this area to upload</p>
          <p className="ant-upload-hint">Supports CSV and XLSX formats. Multiple files allowed.</p>
        </Upload.Dragger>
      </Card>

      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <span>{getTableTitle()}</span>
            <Input.Search
              placeholder="Search by name, description, etc."
              allowClear
              style={{ width: 260 }}
              onSearch={handleSearch}
              onChange={(e) => { if (!e.target.value) setRows(data || []); }}
            />
          </div>
        }
      >
        <Table
          loading={loading}
          columns={columns as any}
          dataSource={dataSource}
          pagination={{ pageSize: 10 }}
          size="small"
          rowKey="id"
        />
      </Card>

      {/* Item Form Modal */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={onSubmit}
        title={editing ? 'Edit Item' : 'Add Item'}
        okText={editing ? 'Update' : 'Create'}
        width={820}
        bodyStyle={{ maxHeight: 520, overflowY: 'auto' }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="itemName" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="itemDescription" label="Description" rules={[{ required: true }]}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="unitOfMeasurement" label="Unit" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="currentQuantity" label="Quantity" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unitPrice" label="Unit Price" rules={[{ required: true }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="categoryId" label="Category" rules={[{ required: true }]}>
            <Select options={categoryOptions} placeholder="Select category" />
          </Form.Item>
          <Form.Item name="expiryDate" label="Expiry (ISO)" tooltip="YYYY-MM-DD or ISO string">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Transaction Modal */}
      <TransactionModal
        visible={transactionModal.visible}
        onCancel={closeTransactionModal}
        onOk={handleTransaction}
        item={transactionModal.item}
        type={transactionModal.type}
        loading={transactionModal.loading}
      />
    </div>
  );
};

export default ManageItems;