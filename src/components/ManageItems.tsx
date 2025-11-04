/* eslint-disable no-useless-escape */
import React, { useEffect, useMemo, useState } from 'react';
import { 
  Button, Card, Form, Input, InputNumber, Modal, Select, Space, Table, Tag, Upload, 
  message, DatePicker, Row, Col, Statistic, Badge, Tooltip, Alert, Divider
} from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { useItems, useCategories } from '../api/hooks';
import type { Item, UploadConsumptionResponse, UploadItemsResponse } from '../api/inventory';
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

/**
 * Detect if consumption file is WIDE format (dates as columns) or TALL format (date as row)
 */
function detectConsumptionFormat(rawData: any[][]): 'WIDE' | 'TALL' | 'UNKNOWN' {
  // Check first 10 rows for headers
  for (let i = 0; i < Math.min(10, rawData.length); i++) {
    const row = rawData[i];
    if (!row || row.length === 0) continue;
    
    const rowValues = row.map(cell => 
      cell ? String(cell).trim().toLowerCase() : ''
    );
    
    // WIDE format indicators: has date columns (DD/MM/YYYY, DD-Mon, etc.)
    const dateColumnCount = rowValues.filter(val => {
      // Check for date patterns: DD/MM/YYYY, DD-Mon, 01-Jun, 1-Jun, 01-Jun-2025
      return /^\d{1,2}[-\/]\w{3}(?:[-\/]\d{4})?$/.test(val) || // 01-Jun or 01-Jun-2025
             /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/.test(val) ||  // 01/06/2025 or 1/6/25
             /^\d{2}-\w{3}$/.test(val);                         // 01-Jun
    }).length;
    
    if (dateColumnCount >= 3) {
      return 'WIDE';
    }
    
    // TALL format indicators: has "date" column and "consumed" column
    const hasDate = rowValues.some(val => val === 'date' || val.includes('date'));
    const hasConsumed = rowValues.some(val => 
      val.includes('consumed') || val.includes('consumption')
    );
    
    if (hasDate && hasConsumed) {
      return 'TALL';
    }
  }
  
  return 'UNKNOWN';
}

/**
 * Preprocesses Excel file to handle templates with extra rows (titles, instructions, etc.)
 * Detects where actual data headers start and creates a clean file for upload
 * CRITICAL: For WIDE format consumption files, preserves ALL columns including date columns
 * CRITICAL: Converts date headers from DD-Mon format to DD/MM/YYYY for backend compatibility
 */
async function preprocessExcelFile(file: File, type: 'items' | 'consumption'): Promise<File> {
  console.log('🔍 Preprocessing Excel file...');
  
  try {
    // Read the file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, {
      cellStyles: true,
      cellDates: true,
      cellNF: true,
      sheetStubs: false
    });
    
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(firstSheet, { 
      header: 1, // Get raw array of arrays
      defval: null,
      blankrows: false
    }) as any[][];
    
    console.log('📊 Raw data rows:', rawData.length);
    
    // For consumption files, detect format first
    if (type === 'consumption') {
      const format = detectConsumptionFormat(rawData);
      console.log('📋 Detected consumption format:', format);
      
      if (format === 'WIDE') {
        // WIDE format: Minimal preprocessing - just remove completely empty rows
        // and find the header row, but preserve ALL columns including date columns
        console.log('✅ WIDE format detected - using minimal preprocessing');
        
        let headerRowIndex = -1;
        
        // Find header row - look for "item" or "category" column
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
          const row = rawData[i];
          if (!row || row.length === 0) continue;
          
          const rowValues = row.map(cell => 
            cell ? String(cell).trim().toLowerCase() : ''
          );
          
          // Header row should have "item" or "category" and at least 3 date columns
          const hasItem = rowValues.some(val => 
            val === 'item' || val === 'item name' || val.includes('item')
          );
          const dateCount = rowValues.filter(val => 
            /^\d{1,2}[-\/]\w{3}(?:[-\/]\d{4})?$/.test(val) || // 01-Jun or 01-Jun-2025
            /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/.test(val)     // 01/06/2025
          ).length;
          
          if (hasItem && dateCount >= 3) {
            headerRowIndex = i;
            break;
          }
        }
        
        if (headerRowIndex === -1) {
          console.warn('⚠️ Could not detect header row for WIDE format, using first row');
          headerRowIndex = 0;
        }
        
        console.log('✅ Found WIDE format header at row:', headerRowIndex);
        
        // Extract from header row onwards, keeping ALL columns
        const cleanData = rawData.slice(headerRowIndex);
        
        // Only filter completely empty rows
        const filteredData = cleanData.filter(row => 
          row && row.some(cell => 
            cell !== null && cell !== undefined && String(cell).trim() !== ''
          )
        );
        
        console.log('✅ WIDE format - preserved', filteredData.length - 1, 'data rows with', filteredData[0].length, 'columns');
        
        // Convert date headers to backend-compatible format (DD/MM/YYYY)
        const headerRow = filteredData[0];
        const currentYear = new Date().getFullYear();
        
        for (let i = 0; i < headerRow.length; i++) {
          const header = String(headerRow[i] || '').trim();
          
          // Try to parse dates like "01-Jun", "1-Jun", "01-Jun-2025"
          const dateMatch = header.match(/^(\d{1,2})[-\/](\w{3})(?:[-\/](\d{4}))?$/);
          if (dateMatch) {
            const day = dateMatch[1].padStart(2, '0');
            const monthStr = dateMatch[2].toLowerCase();
            const year = dateMatch[3] || currentYear;
            
            // Month mapping
            const months: { [key: string]: string } = {
              'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
              'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
              'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
            };
            
            const month = months[monthStr];
            if (month) {
              // Convert to DD/MM/YYYY format that backend can parse
              headerRow[i] = `${day}/${month}/${year}`;
              console.log(`📅 Converted date header: "${header}" → "${headerRow[i]}"`);
            }
          }
        }
        
        // Create workbook preserving original structure with converted dates
        const newWorkbook = XLSX.utils.book_new();
        const newWorksheet = XLSX.utils.aoa_to_sheet(filteredData);
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Data');
        
        // Convert to file
        const binaryString = XLSX.write(newWorkbook, { 
          bookType: 'xlsx', 
          type: 'binary' 
        });
        
        const buffer = new ArrayBuffer(binaryString.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < binaryString.length; i++) {
          view[i] = binaryString.charCodeAt(i) & 0xFF;
        }
        
        const blob = new Blob([buffer], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
        
        return new File([blob], file.name, { type: blob.type });
      }
    }
    
    // Standard preprocessing for ITEMS or TALL format consumption
    const expectedHeaders = type === 'items' 
      ? ['category', 'item name', 'item sku', 'uom', 'stock', 'price', 'reorder']
      : ['item name', 'item sku', 'date', 'opening', 'received', 'consumed', 'closing', 'department', 'notes'];
    
    // Find the header row by looking for rows that contain expected column names
    let headerRowIndex = -1;
    let detectedHeaders: string[] = [];
    
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;
      
      // Convert row to strings and trim
      const rowValues = row.map(cell => 
        cell ? String(cell).trim().toLowerCase() : ''
      );
      
      // Check if this row contains expected headers
      const matchCount = expectedHeaders.filter(header => 
        rowValues.some(val => val.includes(header))
      ).length;
      
      // If we find at least 3 matching headers, this is likely the header row
      if (matchCount >= 3) {
        headerRowIndex = i;
        detectedHeaders = row.map(cell => cell ? String(cell).trim() : '');
        console.log('✅ Found header row at index:', headerRowIndex);
        console.log('📋 Detected headers:', detectedHeaders);
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      console.warn('⚠️ Could not detect header row, using first row');
      headerRowIndex = 0;
      detectedHeaders = rawData[0].map(cell => cell ? String(cell).trim() : '');
    }
    
    // Extract data starting from header row
    const cleanData = rawData.slice(headerRowIndex);
    
    // Filter out empty rows
    const filteredData = cleanData.filter(row => 
      row && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
    );
    
    console.log('✅ Cleaned data rows:', filteredData.length - 1, '(excluding header)');
    
    // Create a new workbook with cleaned data
    const newWorkbook = XLSX.utils.book_new();
    const newWorksheet = XLSX.utils.aoa_to_sheet(filteredData);
    
    // Set column widths for better readability
    const colWidths = filteredData[0].map(() => ({ wch: 15 }));
    newWorksheet['!cols'] = colWidths;
    
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Data');
    
    // Convert to binary and create new File
    const binaryString = XLSX.write(newWorkbook, { 
      bookType: 'xlsx', 
      type: 'binary' 
    });
    
    const buffer = new ArrayBuffer(binaryString.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < binaryString.length; i++) {
      view[i] = binaryString.charCodeAt(i) & 0xFF;
    }
    
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const processedFile = new File(
      [blob], 
      file.name, 
      { type: blob.type }
    );
    
    console.log('✅ File preprocessed successfully');
    return processedFile;
    
  } catch (error: any) {
    console.error('❌ Preprocessing error:', error);
    console.warn('⚠️ Falling back to original file');
    return file; // Return original file if preprocessing fails
  }
}

interface UploadModalProps {
  visible: boolean;
  onCancel: () => void;
  type: 'items' | 'consumption';
  onRefresh: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ visible, onCancel, type, onRefresh }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<{
    headers: string[];
    rows: any[][];
    totalRows: number;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!visible) {
      setFileList([]);
      setSelectedFile(null);
      setPreviewData(null);
      setShowPreview(false);
    }
  }, [visible]);

  const downloadTemplate = async () => {
    try {
      message.loading({ content: 'Downloading template...', key: 'template-download' });
      
      console.log('📥 Starting template download for:', type);
      
      const blob = type === 'items' 
        ? await UploadAPI.getItemsTemplate()
        : await UploadAPI.getConsumptionTemplate();
      
      console.log('✅ Blob received:', blob.size, 'bytes');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = type === 'items' ? 'items_template.xlsx' : 'consumption_template.xlsx';
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      message.success({ 
        content: `Template downloaded successfully`, 
        key: 'template-download',
        duration: 2
      });
      
    } catch (error: any) {
      console.error('❌ Template download error:', error);
      message.error({ 
        content: error?.message || 'Failed to download template. Check console for details.', 
        key: 'template-download',
        duration: 5
      });
    }
  };

  const generatePreview = async (file: File) => {
    try {
      console.log('🔍 Generating preview...');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { cellDates: true });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json(firstSheet, { 
        header: 1,
        defval: null,
        blankrows: false
      }) as any[][];
      
      // For consumption, detect format
      let headerRowIndex = 0;
      
      if (type === 'consumption') {
        const format = detectConsumptionFormat(rawData);
        console.log('📋 Preview format detected:', format);
        
        if (format === 'WIDE') {
          // For WIDE format, look for row with item/category + date columns
          for (let i = 0; i < Math.min(10, rawData.length); i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue;
            
            const rowValues = row.map(cell => 
              cell ? String(cell).trim().toLowerCase() : ''
            );
            
            const hasItem = rowValues.some(val => 
              val === 'item' || val === 'item name' || val.includes('item')
            );
            const dateCount = rowValues.filter(val => 
              /^\d{1,2}[-\/]\w{3}(?:[-\/]\d{4})?$/.test(val) || // 01-Jun or 01-Jun-2025
              /^\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}$/.test(val)     // 01/06/2025
            ).length;
            
            if (hasItem && dateCount >= 3) {
              headerRowIndex = i;
              break;
            }
          }
        } else {
          // TALL format - use standard detection
          const expectedHeaders = ['item name', 'date', 'consumed', 'opening', 'received', 'closing'];
          for (let i = 0; i < Math.min(10, rawData.length); i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue;
            
            const rowValues = row.map(cell => 
              cell ? String(cell).trim().toLowerCase() : ''
            );
            
            const matchCount = expectedHeaders.filter(header => 
              rowValues.some(val => val.includes(header))
            ).length;
            
            if (matchCount >= 3) {
              headerRowIndex = i;
              break;
            }
          }
        }
      } else {
        // Items format
        const expectedHeaders = ['category', 'item name', 'item sku', 'uom', 'stock', 'price', 'reorder'];
        for (let i = 0; i < Math.min(10, rawData.length); i++) {
          const row = rawData[i];
          if (!row || row.length === 0) continue;
          
          const rowValues = row.map(cell => 
            cell ? String(cell).trim().toLowerCase() : ''
          );
          
          const matchCount = expectedHeaders.filter(header => 
            rowValues.some(val => val.includes(header))
          ).length;
          
          if (matchCount >= 3) {
            headerRowIndex = i;
            break;
          }
        }
      }
      
      const cleanData = rawData.slice(headerRowIndex).filter(row => 
        row && row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
      );
      
      setPreviewData({
        headers: cleanData[0].map(h => String(h || '')),
        rows: cleanData.slice(1, 6), // Show first 5 data rows
        totalRows: cleanData.length - 1
      });
      setShowPreview(true);
      
      console.log('✅ Preview generated:', cleanData.length - 1, 'data rows');
    } catch (error: any) {
      console.error('❌ Preview generation failed:', error);
      message.warning('Could not generate preview, but you can still upload');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      message.error('Please select a file first');
      return;
    }
    
    console.log('📤 Starting upload:', {
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type,
      uploadType: type
    });

    setUploading(true);

    try {
      // Preprocess the Excel file to handle templates with extra rows
      message.loading({ content: 'Processing file...', key: 'upload-process' });
      const processedFile = await preprocessExcelFile(selectedFile, type);
      
      message.loading({ content: 'Uploading...', key: 'upload-process' });
      const result = type === 'items' 
        ? await UploadAPI.uploadItems(processedFile)
        : await UploadAPI.uploadConsumption(processedFile);
      
      message.destroy('upload-process');
      console.log('✅ Upload result:', result);
      
      const isConsumption = type === 'consumption';
      const records = isConsumption 
        ? (result as UploadConsumptionResponse).records 
        : (result as UploadItemsResponse).items;
      
      const count = records?.length || 0;
      const hasRecords = count > 0;
      const hasErrors = (result.creationErrors?.length || 0) > 0;
      
      if (hasRecords && !hasErrors) {
        message.success({
          content: `Successfully ${isConsumption ? 'recorded' : 'created'} ${count} ${isConsumption ? 'records' : 'items'}`,
          duration: 3
        });
        setFileList([]);
        setSelectedFile(null);
        setPreviewData(null);
        setShowPreview(false);
        onRefresh();
        setTimeout(() => onCancel(), 500);
      } else if (hasRecords) {
        message.warning(`Uploaded with ${count} ${isConsumption ? 'records' : 'items'}, but some errors occurred`);
        setFileList([]);
        setSelectedFile(null);
        setPreviewData(null);
        setShowPreview(false);
        onRefresh();
      }
      
      if (result.warnings?.length > 0 || result.parseErrors?.length > 0 || result.creationErrors?.length > 0) {
        setTimeout(() => {
          Modal.info({
            title: `Upload Results - ${isConsumption ? 'Consumption' : 'Items'}`,
            width: 700,
            content: (
              <div>
                <p><strong>{isConsumption ? 'Records' : 'Items'} Processed:</strong> {count}</p>
                {result.totalRowsProcessed !== undefined && (
                  <p><strong>Total Rows Processed:</strong> {result.totalRowsProcessed}</p>
                )}
                {isConsumption && (result as UploadConsumptionResponse).missingItemsCount && (
                  <p><strong>Missing Items:</strong> {(result as UploadConsumptionResponse).missingItemsCount}</p>
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
      
      if (!hasRecords && hasErrors) {
        Modal.error({
          title: 'Upload Failed',
          content: 'No records could be created. Please check your file format and try again.'
        });
      }
    } catch (e: any) {
      console.error('❌ Upload error:', e);
      message.error({
        content: e?.message || 'Upload failed. Check console for details.',
        duration: 5
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadProps: UploadProps = {
    fileList,
    beforeUpload: (file) => {
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        message.error('File size must be less than 10MB');
        return false;
      }
      
      // Validate file type
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        message.error('Only Excel files (.xlsx, .xls) are allowed');
        return false;
      }
      
      // Store the raw File object for upload
      setSelectedFile(file);
      
      // Generate preview
      generatePreview(file);
      
      // Store in fileList for UI display
      const uploadFile: UploadFile = {
        uid: file.name,
        name: file.name,
        status: 'done',
        size: file.size,
        type: file.type,
      };
      setFileList([uploadFile]);
      
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setFileList([]);
      setSelectedFile(null);
      setPreviewData(null);
      setShowPreview(false);
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
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel} disabled={uploading}>
          Cancel
        </Button>,
        <Button 
          key="upload" 
          type="primary" 
          onClick={handleUpload}
          loading={uploading}
          disabled={!selectedFile}
          icon={<UploadIcon size={14} />}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      ]}
    >
      <div style={{ padding: '8px 0' }}>
        {/* Important Info for Consumption */}
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
              : 'Excel file with sample consumption records (supports WIDE & TALL formats)'}
          </div>
        </div>

        <Divider />

        {/* Upload File */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Step 2: Select File</div>
          <Upload {...uploadProps}>
            <Button 
              icon={<UploadIcon size={16} />} 
              block 
              size="large"
            >
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
              Selected: <strong>{fileList[0].name}</strong> ({(fileList[0].size! / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        {/* Data Preview */}
        {showPreview && previewData && (
          <div style={{ marginBottom: 20 }}>
            <Alert
              type="success"
              message={`✅ File validated: ${previewData.totalRows} data rows detected`}
              style={{ marginBottom: 12 }}
            />
            <div style={{ 
              padding: 12, 
              backgroundColor: '#fafafa', 
              borderRadius: 4,
              fontSize: '11px',
              maxHeight: 200,
              overflow: 'auto'
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Preview (first 5 rows):</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {previewData.headers.map((h, i) => (
                      <th key={i} style={{ 
                        padding: '4px 8px', 
                        backgroundColor: '#e6f7ff', 
                        border: '1px solid #91d5ff',
                        fontWeight: 600,
                        textAlign: 'left'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.rows.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ 
                          padding: '4px 8px', 
                          border: '1px solid #d9d9d9',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: 100
                        }}>
                          {String(cell || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requirements */}
        <div style={{ 
          padding: 12, 
          backgroundColor: '#f9f9f9', 
          borderRadius: 4,
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>
            📋 File Requirements:
          </div>
          {type === 'items' ? (
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li><strong>Required:</strong> Category, Item Name, Stock (opening/current/closing)</li>
              <li><strong>Optional:</strong> Item SKU, UOM, Price, Reorder Level</li>
            </ul>
          ) : (
            <>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                📊 Supported Formats:
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, marginBottom: 12 }}>
                <li>
                  <strong>WIDE Format:</strong> One row per item, dates as column headers
                  <div style={{ fontSize: '11px', color: '#666', marginTop: 4 }}>
                    Example: Category | Item Name | UOM | 01-Jun | 02-Jun | 03-Jun ...
                  </div>
                </li>
                <li>
                  <strong>TALL Format:</strong> One row per item per date
                  <div style={{ fontSize: '11px', color: '#666', marginTop: 4 }}>
                    Example: Item Name | Date | Consumed Quantity
                  </div>
                </li>
              </ul>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Required Columns:</div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><strong>WIDE:</strong> Item Name, Date columns (DD-Mon format like 01-Jun)</li>
                <li><strong>TALL:</strong> Item Name, Date, Consumed Quantity</li>
                <li><strong>Optional:</strong> Opening/Received/Closing Stock, Department, Notes</li>
              </ul>
            </>
          )}
          <div style={{ marginTop: 12, padding: 8, backgroundColor: '#e6f7ff', borderRadius: 4 }}>
            <strong>✨ Smart Detection:</strong> The system automatically detects your file format (WIDE/TALL) and header row, and converts date formats for compatibility!
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

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setRows(data || []); }, [data]);

  const categoryOptions = useMemo(() => (categories || []).map(c => ({ label: c.categoryName, value: c.id })), [categories]);

  const filteredRows = useMemo(() => {
    let r = [...(rows || [])];
    
    // Apply search filter first
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      r = r.filter(i => 
        i.itemName?.toLowerCase().includes(query) ||
        i.itemCode?.toLowerCase().includes(query) ||
        i.category?.categoryName?.toLowerCase().includes(query) ||
        i.itemDescription?.toLowerCase().includes(query)
      );
    }
    
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
  }, [rows, categoryFilter, activeFilter, selectedCategory, searchQuery]);

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
      dataIndex: 'itemSku',
      key: 'itemSku',
      width: 120,
      sorter: (a: any, b: any) => String(a.itemSku || '').localeCompare(String(b.itemSku || ''))
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
        const getTs = (r: any) => {
          const d = r.lastConsumedAt ?? r.lastConsumedDate ?? r.last_consumed ?? r.lastConsumptionDate ?? r.last_consumption_date ?? r.updated_at ?? r.updatedAt ?? null;
          const dt = d ? dayjs(d) : null;
          return dt && dt.isValid() ? dt.valueOf() : 0;
        };
        return getTs(a) - getTs(b);
      },
      render: (_: any, rec: any) => {
        const last = rec.lastConsumedAt ?? rec.lastConsumedDate ?? rec.last_consumed ?? rec.lastConsumptionDate ?? rec.last_consumption_date ?? rec.updated_at ?? rec.updatedAt ?? null;
        if (!last) return <Tag color="default">—</Tag>;
        const d = dayjs(last);
        if (!d.isValid()) return <Tag color="default">—</Tag>;
        return (
          <div style={{ fontSize: '12px' }}>
            {d.format('D MMM YYYY')}
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
    if (!query) { 
      setSearchQuery('');
      setRows(data || []); 
      return; 
    }
    setSearchQuery(query);
    try { 
      const results = await search(query); 
      setRows(results); 
    }
    catch (e: any) { 
      message.error(e?.message || 'Search failed'); 
    }
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
            setSearchQuery('');
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
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => { 
              const value = e.target.value;
              setSearchQuery(value);
              if (!value) {
                setRows(data || []);
              }
            }}
            style={{ width: 200, fontWeight: 700 }}
            allowClear
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