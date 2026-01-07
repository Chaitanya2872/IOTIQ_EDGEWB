// src/api/vendor-management.ts
// Complete API client for Vendor Management, Maintenance, Work Orders, and Documents

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Vendor {
  vendorId: string;
  vendorName: string;
  vendorEmail: string;
  vendorPhone?: string;
  vendorAddress?: string;
  contactPerson?: string;
  website?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'BLACKLISTED';
  specialization?: string;
  rating?: number;
  notes?: string;
  assetIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Maintenance {
  maintenanceId: string;
  assetId: string;
  vendorId?: string;
  maintenanceType: 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE' | 'EMERGENCY';
  scheduledDate?: string;
  completedDate?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE' | 'ON_HOLD';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description?: string;
  workPerformed?: string;
  partsReplaced?: string;
  cost?: number;
  technicianName?: string;
  notes?: string;
  nextMaintenanceDate?: string;
  downtimeHours?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkOrder {
  workOrderId: string;
  assetId: string;
  vendorId?: string;
  maintenanceId?: string;
  workOrderNumber: string;
  title: string;
  description?: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  workType: 'REPAIR' | 'MAINTENANCE' | 'INSTALLATION' | 'INSPECTION' | 'UPGRADE';
  assignedTo?: string;
  requestedBy?: string;
  dueDate?: string;
  startDate?: string;
  completionDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  estimatedCost?: number;
  actualCost?: number;
  laborCost?: number;
  partsCost?: number;
  workPerformed?: string;
  partsUsed?: string;
  notes?: string;
  completionNotes?: string;
  requiresFollowup?: boolean;
  followupDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetDocument {
  documentId: string;
  assetId: string;
  vendorId?: string;
  documentName: string;
  documentType: 'PDF' | 'DOCX' | 'IMAGE' | 'OTHER';
  filePath: string;
  fileSize?: number;
  mimeType?: string;
  category: 'WARRANTY' | 'MANUAL' | 'INVOICE' | 'MAINTENANCE_REPORT' | 'COMPLIANCE' | 'OTHER';
  description?: string;
  uploadedBy?: string;
  tags?: string;
  version?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URLS = {
  vendor: import.meta.env.VITE_VENDOR_API_BASE_URL || 'http://localhost:8088/api/vendors',
  maintenance: import.meta.env.VITE_MAINTENANCE_API_BASE_URL || 'http://localhost:8088/api/maintenance',
  workOrder: import.meta.env.VITE_WORKORDER_API_BASE_URL || 'http://localhost:8088/api/work-orders',
  document: import.meta.env.VITE_DOCUMENT_API_BASE_URL || 'http://localhost:8088/api/documents',
};

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('accessToken');
  const tokenType = localStorage.getItem('tokenType') || 'Bearer';
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token && token !== 'undefined') {
    headers['Authorization'] = `${tokenType} ${token}`;
  }
  
  return headers;
};

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============================================================================
// VENDOR API
// ============================================================================

export const VendorApi = {
  getAll: () => apiFetch<Vendor[]>(BASE_URLS.vendor),
  
  getById: (id: string) => apiFetch<Vendor>(`${BASE_URLS.vendor}/${id}`),
  
  getByEmail: (email: string) => apiFetch<Vendor>(`${BASE_URLS.vendor}/email/${encodeURIComponent(email)}`),
  
  getByStatus: (status: string) => apiFetch<Vendor[]>(`${BASE_URLS.vendor}/status/${status}`),
  
  getByAssetId: (assetId: string) => apiFetch<Vendor[]>(`${BASE_URLS.vendor}/asset/${assetId}`),
  
  search: (query: string) => apiFetch<Vendor[]>(`${BASE_URLS.vendor}/search?query=${encodeURIComponent(query)}`),
  
  create: (data: Partial<Vendor>) => 
    apiFetch<Vendor>(BASE_URLS.vendor, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Vendor>) =>
    apiFetch<Vendor>(`${BASE_URLS.vendor}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updateStatus: (id: string, status: string) =>
    apiFetch<Vendor>(`${BASE_URLS.vendor}/${id}/status?status=${status}`, {
      method: 'PATCH',
    }),
  
  updateRating: (id: string, rating: number) =>
    apiFetch<Vendor>(`${BASE_URLS.vendor}/${id}/rating?rating=${rating}`, {
      method: 'PATCH',
    }),
  
  addAsset: (vendorId: string, assetId: string) =>
    apiFetch<Vendor>(`${BASE_URLS.vendor}/${vendorId}/assets/${assetId}`, {
      method: 'POST',
    }),
  
  removeAsset: (vendorId: string, assetId: string) =>
    apiFetch<Vendor>(`${BASE_URLS.vendor}/${vendorId}/assets/${assetId}`, {
      method: 'DELETE',
    }),
  
  delete: (id: string) =>
    apiFetch<void>(`${BASE_URLS.vendor}/${id}`, {
      method: 'DELETE',
    }),
  
  count: () => apiFetch<number>(`${BASE_URLS.vendor}/count`),
  
  getAssetCount: (id: string) => apiFetch<number>(`${BASE_URLS.vendor}/${id}/assets/count`),
};

// ============================================================================
// MAINTENANCE API
// ============================================================================

export const MaintenanceApi = {
  getAll: () => apiFetch<Maintenance[]>(BASE_URLS.maintenance),
  
  getById: (id: string) => apiFetch<Maintenance>(`${BASE_URLS.maintenance}/${id}`),
  
  getByAsset: (assetId: string) => apiFetch<Maintenance[]>(`${BASE_URLS.maintenance}/asset/${assetId}`),
  
  getByVendor: (vendorId: string) => apiFetch<Maintenance[]>(`${BASE_URLS.maintenance}/vendor/${vendorId}`),
  
  getByStatus: (status: string) => apiFetch<Maintenance[]>(`${BASE_URLS.maintenance}/status/${status}`),
  
  getOverdue: () => apiFetch<Maintenance[]>(`${BASE_URLS.maintenance}/overdue`),
  
  getUpcoming: (days: number = 30) => apiFetch<Maintenance[]>(`${BASE_URLS.maintenance}/upcoming?days=${days}`),
  
  create: (data: Partial<Maintenance>) =>
    apiFetch<Maintenance>(BASE_URLS.maintenance, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<Maintenance>) =>
    apiFetch<Maintenance>(`${BASE_URLS.maintenance}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  complete: (id: string, workPerformed: string, cost: number) =>
    apiFetch<Maintenance>(`${BASE_URLS.maintenance}/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ workPerformed, cost }),
    }),
  
  delete: (id: string) =>
    apiFetch<void>(`${BASE_URLS.maintenance}/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// WORK ORDER API
// ============================================================================

export const WorkOrderApi = {
  getAll: () => apiFetch<WorkOrder[]>(BASE_URLS.workOrder),
  
  getById: (id: string) => apiFetch<WorkOrder>(`${BASE_URLS.workOrder}/${id}`),
  
  getByNumber: (number: string) => apiFetch<WorkOrder>(`${BASE_URLS.workOrder}/number/${number}`),
  
  getByAsset: (assetId: string) => apiFetch<WorkOrder[]>(`${BASE_URLS.workOrder}/asset/${assetId}`),
  
  getByVendor: (vendorId: string) => apiFetch<WorkOrder[]>(`${BASE_URLS.workOrder}/vendor/${vendorId}`),
  
  getByStatus: (status: string) => apiFetch<WorkOrder[]>(`${BASE_URLS.workOrder}/status/${status}`),
  
  getByAssignee: (assignedTo: string) => apiFetch<WorkOrder[]>(`${BASE_URLS.workOrder}/assigned/${assignedTo}`),
  
  getActive: () => apiFetch<WorkOrder[]>(`${BASE_URLS.workOrder}/active`),
  
  getOverdue: () => apiFetch<WorkOrder[]>(`${BASE_URLS.workOrder}/overdue`),
  
  create: (data: Partial<WorkOrder>) =>
    apiFetch<WorkOrder>(BASE_URLS.workOrder, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  update: (id: string, data: Partial<WorkOrder>) =>
    apiFetch<WorkOrder>(`${BASE_URLS.workOrder}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  updateStatus: (id: string, status: string) =>
    apiFetch<WorkOrder>(`${BASE_URLS.workOrder}/${id}/status?status=${status}`, {
      method: 'PATCH',
    }),
  
  delete: (id: string) =>
    apiFetch<void>(`${BASE_URLS.workOrder}/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// DOCUMENT API
// ============================================================================

export const DocumentApi = {
  getAll: () => apiFetch<AssetDocument[]>(BASE_URLS.document),
  
  getById: (id: string) => apiFetch<AssetDocument>(`${BASE_URLS.document}/${id}`),
  
  getByAsset: (assetId: string) => apiFetch<AssetDocument[]>(`${BASE_URLS.document}/asset/${assetId}`),
  
  getByVendor: (vendorId: string) => apiFetch<AssetDocument[]>(`${BASE_URLS.document}/vendor/${vendorId}`),
  
  getByCategory: (category: string) => apiFetch<AssetDocument[]>(`${BASE_URLS.document}/category/${category}`),
  
  upload: async (file: File, metadata: Partial<AssetDocument>) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await fetch(`${BASE_URLS.document}/upload`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Don't set Content-Type for FormData
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    return response.json();
  },
  
  download: async (id: string): Promise<Blob> => {
    const response = await fetch(`${BASE_URLS.document}/${id}/download`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Download failed');
    }
    
    return response.blob();
  },
  
  delete: (id: string) =>
    apiFetch<void>(`${BASE_URLS.document}/${id}`, {
      method: 'DELETE',
    }),
};