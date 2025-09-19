import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { useItems, useCategories } from '../api/hooks';
import type { Item } from '../api/inventory';
import { UploadAPI } from '../api/inventory';
import InteractiveStatCards from './InteractiveStatCards';
import { Edit3, Trash2, PackageMinus, PackagePlus } from 'lucide-react';

const ManageItems: React.FC = () => {
  const { data, loading, error, create, update, remove, refresh, consume, receive, search } = useItems();
  const { data: categories } = useCategories();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);
  const [form] = Form.useForm<Item & { categoryId: number }>();
  const [rows, setRows] = useState<Item[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'sih' | 'low' | 'price'>('all');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');

  useEffect(() => { setRows(data || []); }, [data]);

  const categoryOptions = useMemo(() => (categories || []).map(c => ({ label: c.categoryName, value: c.id })), [categories]);

  const filteredRows = useMemo(() => {
    let r = [...(rows || [])];
    if (categoryFilter !== 'all') r = r.filter(i => i.categoryId === categoryFilter);
    if (activeFilter === 'low') r = r.filter(i => (i.currentQuantity || 0) <= (i.minStockLevel || 0));
    return r;
  }, [rows, categoryFilter, activeFilter]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70, sorter: (a: any, b: any) => a.id - b.id },
    { title: 'Name', dataIndex: 'itemName', key: 'itemName', sorter: (a: any, b: any) => String(a.itemName).localeCompare(String(b.itemName)) },
    { title: 'Description', dataIndex: 'itemDescription', key: 'itemDescription' },
    { title: 'Unit', dataIndex: 'unitOfMeasurement', key: 'unitOfMeasurement' },
    { title: 'Qty', dataIndex: 'currentQuantity', key: 'currentQuantity', sorter: (a: any, b: any) => a.currentQuantity - b.currentQuantity },
    { title: 'Min', dataIndex: 'minStockLevel', key: 'minStockLevel', sorter: (a: any, b: any) => a.minStockLevel - b.minStockLevel },
    { title: 'Max', dataIndex: 'maxStockLevel', key: 'maxStockLevel', sorter: (a: any, b: any) => a.maxStockLevel - b.maxStockLevel },
    { title: 'Price', dataIndex: 'unitPrice', key: 'unitPrice', sorter: (a: any, b: any) => a.unitPrice - b.unitPrice, render: (v: number) => v?.toFixed?.(2) ?? v },
    { title: 'Category', dataIndex: 'categoryId', key: 'categoryId', filters: categoryOptions, onFilter: (val: any, rec: any) => rec.categoryId === val, render: (v: number) => {
      const name = categoryOptions.find(c => c.value === v)?.label || v;
      return <Tag color="blue">{name}</Tag>;
    } },
    {
      title: 'Actions', key: 'actions', width: 220,
      render: (_: any, record: Item) => (
        <Space>
          <Button size="small" icon={<Edit3 size={14} />} onClick={() => onEdit(record)} />
          <Button size="small" danger icon={<Trash2 size={14} />} onClick={() => onDelete(record.id)} />
          <Button size="small" icon={<PackageMinus size={14} />} onClick={() => onConsume(record.id)} />
          <Button size="small" icon={<PackagePlus size={14} />} onClick={() => onReceive(record.id)} />
        </Space>
      )
    }
  ];

  const dataSource = useMemo(() => (filteredRows || []).map(i => ({ key: i.id, ...i })), [filteredRows]);

  const onAdd = () => {
    setEditing(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const onEdit = (record: Item) => {
    setEditing(record);
    form.setFieldsValue(record as any);
    setIsModalOpen(true);
  };

  const onDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete item?',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await remove(id);
          message.success('Deleted');
        } catch (e: any) {
          message.error(e?.message || 'Delete failed');
        }
      }
    })
  };

  const onConsume = async (id: number) => {
    const qty = Number(prompt('Consume quantity:'));
    if (!qty || qty <= 0) return;
    try {
      await consume(id, qty);
      message.success('Consumption recorded');
    } catch (e: any) {
      message.error(e?.message || 'Failed');
    }
  };

  const onReceive = async (id: number) => {
    const qty = Number(prompt('Receive quantity:'));
    if (!qty || qty <= 0) return;
    try {
      await receive(id, qty);
      message.success('Receipt recorded');
    } catch (e: any) {
      message.error(e?.message || 'Failed');
    }
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        await update(editing.id, values as any);
        message.success('Updated');
      } else {
        const payload = { ...values } as Omit<Item, 'id'>;
        await create(payload);
        message.success('Created');
      }
      setIsModalOpen(false);
    } catch (e: any) {
      if (!e?.errorFields) message.error(e?.message || 'Save failed');
    }
  };

  const handleSearch = async (q?: string) => {
    const query = (q || '').trim();
    if (!query) { setRows(data || []); return; }
    try {
      const results = await search(query);
      setRows(results);
    } catch (e: any) {
      message.error(e?.message || 'Search failed');
    }
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

  const handleCardClick = (key: 'all' | 'sih' | 'low' | 'price') => {
    setActiveFilter(key);
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Stat cards - clickable to filter */}
      <InteractiveStatCards onCardClick={handleCardClick} />

      <Space style={{ marginBottom: 12, flexWrap: 'wrap' }}>
        <Button type="primary" onClick={onAdd}>Add Item</Button>
        <Button onClick={refresh}>Refresh</Button>
        <Select
          allowClear={false}
          value={categoryFilter}
          style={{ minWidth: 220 }}
          options={[{ label: 'All Categories', value: 'all' }, ...categoryOptions]}
          onChange={(v) => setCategoryFilter(v as any)}
        />
      </Space>

      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      {/* Search and CSV/XLSX import */}
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
            <span>Items</span>
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
        />
      </Card>

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
          <Form.Item name="minStockLevel" label="Min Level" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="maxStockLevel" label="Max Level" rules={[{ required: true }]}>
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
    </div>
  );
};

export default ManageItems;