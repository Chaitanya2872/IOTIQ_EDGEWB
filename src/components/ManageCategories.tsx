import React, { useMemo, useState } from 'react';
import { Button, Card, Form, Input, Modal, Space, Table, Tag, message } from 'antd';
import { useCategories, useItems } from '../api/hooks';
import CategoryStatCards from './CategoryStatCards';
import { Edit3, Trash2 } from 'lucide-react';

const ManageCategories: React.FC = () => {
  const { data, loading, error, create, update, remove, refresh } = useCategories();
  const { data: items } = useItems();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const countsByCategoryId = useMemo(() => {
    const map = new Map<number, number>();
    (items || []).forEach(i => map.set(i.categoryId, (map.get(i.categoryId) || 0) + 1));
    return map;
  }, [items]);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80, sorter: (a: any, b: any) => a.id - b.id },
    { title: 'Name', dataIndex: 'categoryName', key: 'categoryName', sorter: (a: any, b: any) => String(a.categoryName).localeCompare(String(b.categoryName)) },
    { title: 'Description', dataIndex: 'categoryDescription', key: 'categoryDescription' },
    { title: 'Items', key: 'itemsCount', width: 100, render: (_: any, rec: any) => <Tag color="blue">{countsByCategoryId.get(rec.id) || 0}</Tag> },
    {
      title: 'Actions', key: 'actions', width: 180,
      render: (_: any, record: any) => (
        <Space>
          <Button size="small" icon={<Edit3 size={14} />} onClick={() => onEdit(record)} />
          <Button size="small" danger icon={<Trash2 size={14} />} onClick={() => onDelete(record.id)} />
        </Space>
      )
    }
  ];

  const dataSource = useMemo(() => (data || []).map(c => ({ key: c.id, ...c })), [data]);

  const onAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const onEdit = (record: any) => {
    setEditingId(record.id);
    form.setFieldsValue({
      categoryName: record.categoryName,
      categoryDescription: record.categoryDescription
    });
    setIsModalOpen(true);
  };

  const onDelete = async (id: number) => {
    Modal.confirm({
      title: 'Delete category?',
      content: 'This action cannot be undone.',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await remove(id);
          message.success('Deleted');
        } catch (e: any) {
          message.error(e?.message || 'Delete failed');
        }
      }
    });
  };

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await update(editingId, values);
        message.success('Updated');
      } else {
        await create(values);
        message.success('Created');
      }
      setIsModalOpen(false);
    } catch (e: any) {
      if (!e?.errorFields) message.error(e?.message || 'Save failed');
    }
  };

  return (
    <div style={{ padding: 16 }}>
      {/* Stat cards */}
      <CategoryStatCards />

      <Space style={{ marginBottom: 12 }}>
        <Button type="primary" onClick={onAdd}>Add Category</Button>
        <Button onClick={refresh}>Refresh</Button>
      </Space>

      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}

      <Card title="Categories">
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
        title={editingId ? 'Edit Category' : 'Add Category'}
        okText={editingId ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="categoryName" label="Name" rules={[{ required: true, message: 'Enter category name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="categoryDescription" label="Description" rules={[{ required: true, message: 'Enter description' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageCategories;