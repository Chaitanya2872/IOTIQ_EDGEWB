import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { useItems, useCategories } from '../api/hooks';
import type { Item } from '../api/inventory';
import { UploadAPI } from '../api/inventory';
import ManageItemsCards from './ManageItemsCards';
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

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => { setRows(data || []); }, [data]);

  const categoryOptions = useMemo(() => (categories || []).map(c => ({ label: c.categoryName, value: c.id })), [categories]);

  const filteredRows = useMemo(() => {
    let r = [...(rows || [])];
    if (selectedCategory) {
      r = r.filter(i => i.category?.categoryName === selectedCategory);
      return r;
    }
    if (categoryFilter !== 'all') r = r.filter(i => i.categoryId === categoryFilter);
    if (activeFilter === 'low') r = r.filter(i => (i.currentQuantity || 0) <= (i.minStockLevel || 0));
    return r;
  }, [rows, categoryFilter, activeFilter, selectedCategory]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 70, sorter: (a: any, b: any) => a.id - b.id },
    { title: 'Code', dataIndex: 'itemCode', key: 'itemCode' },
    { title: 'Name', dataIndex: 'itemName', key: 'itemName', sorter: (a: any, b: any) => String(a.itemName).localeCompare(String(b.itemName)) },
    { title: 'Description', dataIndex: 'itemDescription', key: 'itemDescription' },
    { title: 'Unit', dataIndex: 'unitOfMeasurement', key: 'unitOfMeasurement' },
    { title: 'Qty', dataIndex: 'currentQuantity', key: 'currentQuantity', sorter: (a: any, b: any) => a.currentQuantity - b.currentQuantity },
    {
      title: 'Price',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      sorter: (a: any, b: any) => (Number(a.unitPrice) || 0) - (Number(b.unitPrice) || 0),
      render: (v: number | null) => v != null ? (Number(v).toFixed(2)) : '—'
    },
    {
      title: 'Category',
      key: 'category',
      dataIndex: ['category', 'categoryName'],
      filters: categoryOptions,
      onFilter: (val: any, rec: any) => rec?.category?.id === val,
      render: (_: any, rec: any) => <Tag color="blue">{rec?.category?.categoryName || '—'}</Tag>
    },
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
    })
  };

  const onConsume = async (id: number) => {
    const qty = Number(prompt('Consume quantity:'));
    if (!qty || qty <= 0) return;
    try { await consume(id, qty); message.success('Consumption recorded'); }
    catch (e: any) { message.error(e?.message || 'Failed'); }
  };

  const onReceive = async (id: number) => {
    const qty = Number(prompt('Receive quantity:'));
    if (!qty || qty <= 0) return;
    try { await receive(id, qty); message.success('Receipt recorded'); }
    catch (e: any) { message.error(e?.message || 'Failed'); }
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

  return (
    <div style={{ padding: 16 }}>
      <ManageItemsCards onCardClick={handleCardClick} />

      {/* Show active Most Consumed Category */}
      {selectedCategory && (
        <div style={{ marginBottom: 12 }}>
          <Tag color="purple">Most Consumed Category: {selectedCategory}</Tag>
        </div>
      )}

      <Space style={{ marginBottom: 12, flexWrap: 'wrap' }}>
        <Button type="primary" onClick={onAdd}>Add Item</Button>
        <Button onClick={() => { refresh(); setSelectedCategory(null); }}>Refresh</Button>
        <Select
          allowClear={false}
          value={categoryFilter}
          style={{ minWidth: 220 }}
          options={[{ label: 'All Categories', value: 'all' }, ...categoryOptions]}
          onChange={(v) => { setSelectedCategory(null); setCategoryFilter(v as any); }}
        />
      </Space>

      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      {/* ✅ Import Items Section */}
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
          rowKey="id"
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
