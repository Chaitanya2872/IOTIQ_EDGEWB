import React, { useEffect, useMemo, useState } from 'react';
import { 
  Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Upload, 
  message, DatePicker, Row, Col, Statistic, Badge, Tooltip, Alert, Divider
} from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { useItems, useCategories } from '../api/hooks';
import type { Item } from '../api/inventory';
import { UploadAPI } from '../api/inventory';
import ManageItemsCards from './ManageItemsCards';
import { Edit3, Trash2, Clock, TrendingUp, Download, Upload as UploadIcon, FileSpreadsheet, TableIcon } from 'lucide-react';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

const { RangePicker } = DatePicker;

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

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
                  addonBefore="₹"
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

interface UploadModalProps {
  visible: boolean;
  onCancel: () => void;
  type: 'items' | 'consumption';
  onRefresh: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ visible, onCancel, type, onRefresh }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setFileList([]);
    }
  }, [visible]);

  // Generate XLSX template
  const downloadTemplate = () => {
    let data: any[] = [];
    let filename = '';

    if (type === 'items') {
      data = [
        { 
          Category: 'HK Chemicals', 
          'Item Name': 'Pril-Dishwash', 
          'Item SKU': '125ml', 
          UOM: 'Bottle', 
          Price: 17.00, 
          Stock: 50, 
          'Reorder Level': 10 
        },
        { 
          Category: 'HK Chemicals', 
          'Item Name': 'Pril-Dishwash', 
          'Item SKU': '500ml', 
          UOM: 'Bottle', 
          Price: 52.00, 
          Stock: 30, 
          'Reorder Level': 10 
        },
        { 
          Category: 'Beverages', 
          'Item Name': 'Coffee Beans', 
          'Item SKU': '500g', 
          UOM: 'kg', 
          Price: 450, 
          Stock: 20, 
          'Reorder Level': 5 
        },
        { 
          Category: 'Pantry Items', 
          'Item Name': 'Sugar', 
          'Item SKU': '1kg', 
          UOM: 'kg', 
          Price: 45, 
          Stock: 100, 
          'Reorder Level': 20 
        },
        { 
          Category: 'Cleaning', 
          'Item Name': 'Hand Soap', 
          'Item SKU': '100ml', 
          UOM: 'Bottle', 
          Price: 15, 
          Stock: 75, 
          'Reorder Level': 15 
        }
      ];
      filename = 'items_template.xlsx';
    } else {
      data = [
        { 
          'Item Name': 'Pril-Dishwash', 
          'Item SKU': '125ml', 
          Date: '2024-01-15', 
          'Opening Stock': 50, 
          'Received Quantity': 10, 
          'Consumed Quantity': 5, 
          'Closing Stock': 55, 
          Department: 'Kitchen', 
          Notes: 'Regular usage' 
        },
        { 
          'Item Name': 'Coffee Beans', 
          'Item SKU': '500g', 
          Date: '2024-01-15', 
          'Opening Stock': 20, 
          'Received Quantity': 0, 
          'Consumed Quantity': 2, 
          'Closing Stock': 18, 
          Department: 'Pantry', 
          Notes: 'Morning coffee' 
        },
        { 
          'Item Name': 'Sugar', 
          'Item SKU': '1kg', 
          Date: '2024-01-15', 
          'Opening Stock': 100, 
          'Received Quantity': 50, 
          'Consumed Quantity': 10, 
          'Closing Stock': 140, 
          Department: 'Pantry', 
          Notes: 'Event catering' 
        },
        { 
          'Item Name': 'Hand Soap', 
          'Item SKU': '100ml', 
          Date: '2024-01-15', 
          'Opening Stock': 75, 
          'Received Quantity': 0, 
          'Consumed Quantity': 8, 
          'Closing Stock': 67, 
          Department: 'Restroom', 
          Notes: '' 
        }
      ];
      filename = 'consumption_template.xlsx';
    }

    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    (XLSX as any).utils.book_append_sheet(wb, ws, type === 'items' ? 'Items' : 'Consumption');

    // Auto-size columns
    const maxWidth = data.reduce((w, r) => Math.max(w, ...Object.keys(r).map(k => k.length)), 10);
    ws['!cols'] = Object.keys(data[0]).map(() => ({ wch: maxWidth + 2 }));

    // Download
    XLSX.writeFile(wb, filename);
    message.success(`${filename} downloaded`);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file first');
      return;
    }

    const file = fileList[0].originFileObj as File;
    setUploading(true);

    try {
      const result = type === 'items' 
        ? await UploadAPI.uploadItems(file)
        : await UploadAPI.uploadConsumption(file);
      
      if (result.success) {
        const count = type === 'items' ? result.itemsCreated : result.recordsCreated;
        message.success(`Successfully ${type === 'items' ? 'created' : 'recorded'} ${count} ${type === 'items' ? 'items' : 'records'}`);
        setFileList([]);
        onRefresh();
        
        // Show detailed results if there are warnings or errors
        if (result.warnings?.length > 0 || result.parseErrors?.length > 0 || result.creationErrors?.length > 0) {
          setTimeout(() => {
            Modal.info({
              title: `Upload Results - ${type === 'items' ? 'Items' : 'Consumption'}`,
              width: 700,
              content: (
                <div>
                  <p><strong>Total Rows Processed:</strong> {result.totalRowsProcessed}</p>
                  <p><strong>{type === 'items' ? 'Items Created' : 'Records Created'}:</strong> {count}</p>
                  {type === 'consumption' && result.missingItemsCount > 0 && (
                    <p><strong>Missing Items:</strong> {result.missingItemsCount}</p>
                  )}
                  
                  {result.parseErrors?.length > 0 && (
                    <Alert 
                      type="warning" 
                      message="Parse Errors" 
                      description={
                        <div style={{ maxHeight: 150, overflow: 'auto' }}>
                          {result.parseErrors.slice(0, 10).map((e: string, i: number) => (
                            <div key={i} style={{ fontSize: '12px' }}>• {e}</div>
                          ))}
                          {result.parseErrors.length > 10 && (
                            <div style={{ fontSize: '12px', marginTop: 4 }}>
                              ... and {result.parseErrors.length - 10} more
                            </div>
                          )}
                        </div>
                      }
                      style={{ marginTop: 12 }}
                    />
                  )}
                  
                  {result.creationErrors?.length > 0 && (
                    <Alert 
                      type="error" 
                      message="Creation Errors" 
                      description={
                        <div style={{ maxHeight: 150, overflow: 'auto' }}>
                          {result.creationErrors.slice(0, 10).map((e: string, i: number) => (
                            <div key={i} style={{ fontSize: '12px' }}>• {e}</div>
                          ))}
                          {result.creationErrors.length > 10 && (
                            <div style={{ fontSize: '12px', marginTop: 4 }}>
                              ... and {result.creationErrors.length - 10} more
                            </div>
                          )}
                        </div>
                      }
                      style={{ marginTop: 12 }}
                    />
                  )}
                  
                  {result.warnings?.length > 0 && (
                    <Alert 
                      type="warning" 
                      message="Warnings" 
                      description={
                        <div style={{ maxHeight: 200, overflow: 'auto' }}>
                          {result.warnings.slice(0, 15).map((w: string, i: number) => (
                            <div key={i} style={{ fontSize: '12px' }}>{w}</div>
                          ))}
                          {result.warnings.length > 15 && (
                            <div style={{ fontSize: '12px', marginTop: 4 }}>
                              ... and {result.warnings.length - 15} more
                            </div>
                          )}
                        </div>
                      }
                      style={{ marginTop: 12 }}
                    />
                  )}
                </div>
              )
            });
          }, 500);
        }
        
        onCancel();
      } else {
        Modal.error({
          title: 'Upload Failed',
          content: result.message || 'Upload failed. Please check your file format.'
        });
      }
    } catch (e: any) {
      message.error(e?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    fileList,
    beforeUpload: (file) => {
      setFileList([file]);
      return false;
    },
    onRemove: () => {
      setFileList([]);
    },
    accept: '.xlsx,.xls',
    maxCount: 1,
  };

  const title = type === 'items' ? 'Import Items' : 'Import Consumption';
  const icon = type === 'items' ? <TableIcon size={20} /> : <FileSpreadsheet size={20} />;

  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon}
          <span>{title}</span>
        </div>
      }
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button 
          key="upload" 
          type="primary" 
          onClick={handleUpload}
          loading={uploading}
          disabled={fileList.length === 0}
          icon={<UploadIcon size={14} />}
        >
          Upload
        </Button>
      ]}
    >
      <div style={{ padding: '8px 0' }}>
        {/* Info Alert */}
        {type === 'consumption' && (
          <Alert 
            message="Important: Items must exist before importing consumption records" 
            type="info" 
            showIcon 
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Download Template */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Step 1: Download Template</div>
          <Button 
            icon={<Download size={16} />} 
            onClick={downloadTemplate}
            block
            size="large"
          >
            Download {type === 'items' ? 'Items' : 'Consumption'} Template (Excel)
          </Button>
          <div style={{ fontSize: '12px', color: '#666', marginTop: 8 }}>
            {type === 'items' 
              ? 'Excel file with sample items (5 examples included)'
              : 'Excel file with sample consumption records (4 examples included)'}
          </div>
        </div>

        <Divider />

        {/* Upload File */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Step 2: Select File</div>
          <Upload {...uploadProps}>
            <Button icon={<UploadIcon size={16} />} block size="large">
              {fileList.length > 0 ? 'Change File' : 'Select Excel File'}
            </Button>
          </Upload>
          {fileList.length > 0 && (
            <div style={{ 
              marginTop: 8, 
              padding: 8, 
              backgroundColor: '#f0f5ff', 
              borderRadius: 4,
              fontSize: '12px'
            }}>
              Selected: <strong>{fileList[0].name}</strong>
            </div>
          )}
        </div>

        {/* Requirements */}
        <div style={{ 
          padding: 12, 
          backgroundColor: '#f9f9f9', 
          borderRadius: 4,
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>
            Required Columns:
          </div>
          {type === 'items' ? (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Category</li>
              <li>Item Name</li>
              <li>Stock (opening/current/closing)</li>
            </ul>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>Item Name</li>
              <li>Date</li>
              <li>Consumed Quantity</li>
            </ul>
          )}
          <div style={{ marginTop: 8, color: '#666' }}>
            Optional: {type === 'items' 
              ? 'Item SKU, UOM, Price, Reorder Level' 
              : 'Item SKU, Opening/Received/Closing Stock, Department, Notes'}
          </div>
        </div>
      </div>
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
  
  // Upload modal states
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadType, setUploadType] = useState<'items' | 'consumption'>('items');
  
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

  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => { setRows(data || []); }, [data]);

  const categoryOptions = useMemo(() => (categories || []).map(c => ({ label: c.categoryName, value: c.id })), [categories]);

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
    {
      title: 'Category',
      key: 'category',
      width: 150,
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
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      sorter: (a: any, b: any) => String(a.itemName).localeCompare(String(b.itemName))
    },
    {
      title: 'Item SKU',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 120,
      sorter: (a: any, b: any) => String(a.itemCode || '').localeCompare(String(b.itemCode || ''))
    },
    {
      title: 'Qty',
      dataIndex: 'currentQuantity',
      key: 'currentQuantity',
      width: 100,
      sorter: (a: any, b: any) => (Number(a.currentQuantity) || 0) - (Number(b.currentQuantity) || 0),
      render: (qty: number, record: any) => {
        const quantity = Number.isFinite(Number(qty)) ? Number(qty) : Number(record?.currentQuantity) || 0;
        const badgeColor = quantity <= (record?.minStockLevel || 0) ? '#ff4d4f' : '#52c41a';
        return (
          <Badge 
            count={quantity.toLocaleString('en-IN')} 
            overflowCount={Number.MAX_SAFE_INTEGER}
            style={{ backgroundColor: badgeColor }}
          />
        );
      }
    },
    { 
      title: 'Unit', 
      dataIndex: 'unitOfMeasurement', 
      key: 'unitOfMeasurement',
      width: 80
    },
    {
      title: 'Unit Price (₹)',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      sorter: (a: any, b: any) => (Number(a.unitPrice) || 0) - (Number(b.unitPrice) || 0),
      render: (v: number | null) => v != null ? currencyFormatter.format(Number(v) || 0) : '—'
    },
    {
      title: 'Actions', 
      key: 'actions', 
      width: 220,
      fixed: 'right' as const,
      render: (_: any, record: Item) => (
        <Space>
          <Button size="small" icon={<Edit3 size={14} />} onClick={() => onEdit(record)} />
          <Button size="small" danger icon={<Trash2 size={14} />} onClick={() => onDelete(record.id)} />
          
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
    },
    {
      title: 'Last Updated',
      key: 'lastUpdated',
      width: 150,
      sorter: (a: any, b: any) => {
        const dateA = a.updated_at || '';
        const dateB = b.updated_at || '';
        return dateA.localeCompare(dateB);
      },
      render: (_: any, rec: any) => {
        const lastDate = rec.updated_at;
        if (!lastDate) return <Tag color="default">—</Tag>;
        const date = new Date(lastDate);
        return (
          <div style={{ fontSize: '12px' }}>
            {date.toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </div>
        );
      }
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

  const openUploadModal = (type: 'items' | 'consumption') => {
    setUploadType(type);
    setUploadModalVisible(true);
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
    if (activeFilter === 'low-stock-risk') return 'Low Stock Risk Items';
    if (activeFilter === 'inventory-value') return 'Inventory Value Analysis';
    if (activeFilter === 'quick-stats') return 'Quick Statistics View';
    return 'Items';
  };

  return (
    <div style={{ padding: 16 }}>
      <ManageItemsCards onCardClick={handleCardClick} />

      {/* Active filter status */}
      {(selectedCategory || activeFilter !== 'all') && (
        <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {selectedCategory && (
            <Tag color="purple" closable onClose={() => setSelectedCategory(null)}>
              Category: {selectedCategory}
            </Tag>
          )}
          {activeFilter === 'low-stock-risk' && (
            <Tag color="red" icon={<Clock size={12} />}>
              Low Stock Risk Items
            </Tag>
          )}
          {activeFilter === 'inventory-value' && (
            <Tag color="green" icon={<TrendingUp size={12} />}>
              Inventory Value Analysis
            </Tag>
          )}
        </div>
      )}

      <Space style={{ marginBottom: 12, flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
        <Space>
          <Button type="primary" onClick={onAdd}>Add Item</Button>
          <Button onClick={() => {
            refresh();
            setSelectedCategory(null);
            setActiveFilter('all');
          }}>
            Refresh
          </Button>
          <Button
            icon={<TableIcon size={14} />}
            onClick={() => openUploadModal('items')}
          >
            Import Items
          </Button>
          <Button
            icon={<FileSpreadsheet size={14} />}
            onClick={() => openUploadModal('consumption')}
          >
            Import Consumption
          </Button>
        </Space>
        <Space>
          <Select
            allowClear={false}
            value={categoryFilter}
            style={{ minWidth: 200 }}
            options={[{ label: 'All Categories', value: 'all' }, ...categoryOptions]}
            onChange={(v) => { setSelectedCategory(null); setCategoryFilter(v as any); }}
          />
          <Input.Search
            placeholder="Search items..."
            allowClear
            style={{ width: searchFocused ? 300 : 250, transition: 'width 0.3s ease' }}
            onSearch={handleSearch}
            onChange={(e) => { if (!e.target.value) setRows(data || []); }}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </Space>
      </Space>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 12 }} />}

      <Card
        title={getTableTitle()}
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

      {/* Upload Modal */}
      <UploadModal
        visible={uploadModalVisible}
        onCancel={() => setUploadModalVisible(false)}
        type={uploadType}
        onRefresh={refresh}
      />
    </div>
  );
};

export default ManageItems;