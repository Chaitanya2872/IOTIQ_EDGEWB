import React, { useState, useMemo, useEffect, useReducer, useCallback, useRef } from 'react';
import {
  Search, Filter, Download, Plus, Edit, Trash2, Eye,
  MapPin, Calendar, DollarSign, Activity, CheckCircle,
  AlertCircle, Clock, Package, ChevronLeft, ChevronRight,
  Loader, RefreshCw, QrCode, X
} from 'lucide-react';

// ==================== FONT STYLING ====================
const fontImport = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');
`;

// ==================== TYPES ====================
interface Asset {
  assetId: string;
  assetName: string;
  assetCategory: string;
  assetType?: string;
  modelNumber?: string;
  serialNumber?: string;
  quantity?: number;
  manufacturer?: string;
  dateOfInstallation?: string;
  location?: string;
  description?: string;
  branch?: string;
  dlpEndDate?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
}

interface AssetCreateRequest {
  assetName: string;
  category: string;
  location?: string;
}

// ==================== QR CODE GENERATOR ====================
const QRCodeGenerator: React.FC<{ value: string; size?: number }> = ({ value, size = 128 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Simple QR Code generation using canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Create a simple QR-like pattern (for demo purposes)
    // In production, use a proper QR library like qrcode or qrcode.react
    const cellSize = size / 25;
    ctx.fillStyle = '#000000';
    
    // Generate pseudo-random pattern based on value
    const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        const seed = (i * 25 + j + hash) % 7;
        if (seed < 3) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize - 1, cellSize - 1);
        }
      }
    }

    // Add corner markers (typical QR code markers)
    const markerSize = cellSize * 7;
    const drawMarker = (x: number, y: number) => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, markerSize, markerSize);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + cellSize, y + cellSize, markerSize - cellSize * 2, markerSize - cellSize * 2);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + cellSize * 2, y + cellSize * 2, markerSize - cellSize * 4, markerSize - cellSize * 4);
    };

    drawMarker(0, 0);
    drawMarker(size - markerSize, 0);
    drawMarker(0, size - markerSize);

  }, [value, size]);

  return <canvas ref={canvasRef} width={size} height={size} style={{ imageRendering: 'pixelated' }} />;
};

// ==================== API SETUP ====================
const BASE_URL = import.meta.env.VITE_ASSET_API_BASE_URL || 'http://localhost:8088/api/assets';

const getAuthToken = () => {
  const token = localStorage.getItem('accessToken');
  return token && token !== 'undefined' ? token : null;
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const tokenType = localStorage.getItem('tokenType') || 'Bearer';
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `${tokenType} ${token}`;
  }
  
  return headers;
};

async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = getAuthHeaders();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });
    
    if (response.status === 401) {
      console.error('🚫 Unauthorized - token may be invalid');
    }
    
    return response;
  } catch (error) {
    console.error('💥 Network error:', error);
    throw error;
  }
}

const AssetApi = {
  getAll: async (): Promise<Asset[]> => {
    const res = await authenticatedFetch(BASE_URL);
    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      throw new Error(`Failed to fetch assets: ${res.status} ${errorText}`);
    }
    return res.json();
  },

  create: async (data: AssetCreateRequest): Promise<Asset> => {
    const res = await authenticatedFetch(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Create asset failed');
    return res.json();
  },

  update: async (id: string, data: Partial<Asset>): Promise<Asset> => {
    const res = await authenticatedFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Update failed');
    return res.json();
  },

  updateStatus: async (id: string, status: string): Promise<Asset> => {
    const res = await authenticatedFetch(`${BASE_URL}/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Status update failed');
    return res.json();
  },

  remove: async (id: string): Promise<void> => {
    const res = await authenticatedFetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Delete failed');
  },

  search: async (params: Record<string, string>): Promise<Asset[]> => {
    const query = new URLSearchParams(params).toString();
    const res = await authenticatedFetch(`${BASE_URL}/search?${query}`);
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  },
};

// ==================== STATE MANAGEMENT ====================
interface AppState {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  currentPage: number;
  selectedAsset: Asset | null;
  showDetailModal: boolean;
  showAddModal: boolean;
  showQRModal: boolean;
  qrAsset: Asset | null;
  operationInProgress: boolean;
  activeTab: 'all' | 'category' | 'location';
  showEditModal: boolean;
  editingAsset: Asset | null;
}

type Action =
  | { type: 'SET_ASSETS'; payload: Asset[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_TERM'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: string }
  | { type: 'SET_CATEGORY_FILTER'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_SELECTED_ASSET'; payload: Asset | null }
  | { type: 'SET_SHOW_DETAIL_MODAL'; payload: boolean }
  | { type: 'SET_SHOW_ADD_MODAL'; payload: boolean }
  | { type: 'SET_SHOW_QR_MODAL'; payload: boolean }
  | { type: 'SET_QR_ASSET'; payload: Asset | null }
  | { type: 'SET_OPERATION_IN_PROGRESS'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: 'all' | 'category' | 'location' }
  | { type: 'SET_SHOW_EDIT_MODAL'; payload: boolean }
  | { type: 'SET_EDITING_ASSET'; payload: Asset | null }
  | { type: 'RESET_FILTERS' };

const initialState: AppState = {
  assets: [],
  loading: true,
  error: null,
  searchTerm: '',
  statusFilter: 'all',
  categoryFilter: 'all',
  currentPage: 1,
  selectedAsset: null,
  showDetailModal: false,
  showAddModal: false,
  showQRModal: false,
  qrAsset: null,
  operationInProgress: false,
  activeTab: 'all',
  showEditModal: false,
  editingAsset: null,
};

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ASSETS':
      return { ...state, assets: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SEARCH_TERM':
      return { ...state, searchTerm: action.payload, currentPage: 1 };
    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload, currentPage: 1 };
    case 'SET_CATEGORY_FILTER':
      return { ...state, categoryFilter: action.payload, currentPage: 1 };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_SELECTED_ASSET':
      return { ...state, selectedAsset: action.payload };
    case 'SET_SHOW_DETAIL_MODAL':
      return { ...state, showDetailModal: action.payload };
    case 'SET_SHOW_ADD_MODAL':
      return { ...state, showAddModal: action.payload };
    case 'SET_SHOW_QR_MODAL':
      return { ...state, showQRModal: action.payload };
    case 'SET_QR_ASSET':
      return { ...state, qrAsset: action.payload };
    case 'SET_OPERATION_IN_PROGRESS':
      return { ...state, operationInProgress: action.payload };
    case 'SET_SHOW_EDIT_MODAL':
       return { ...state, showEditModal: action.payload };
    case 'SET_EDITING_ASSET':
        return { ...state, editingAsset: action.payload };
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload, currentPage: 1 };
    case 'RESET_FILTERS':
      return {
        ...state,
        searchTerm: '',
        statusFilter: 'all',
        categoryFilter: 'all',
        currentPage: 1,
      };
    default:
      return state;
  }
}

// ==================== STYLES ====================
const globalStyles = `
  ${fontImport}
  
  * {
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;

const styles = {
  container: {
    fontFamily: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', system-ui, sans-serif`,
    padding: '24px',
    backgroundColor: '#FAFAFA',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '24px',
    animation: 'fadeIn 0.6s ease-out',
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    color: '#0F172A',
    margin: '0 0 6px 0',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
    fontWeight: 400,
    letterSpacing: '-0.01em',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    border: '1px solid #F1F3F5',
    overflow: 'hidden',
    animation: 'scaleIn 0.5s ease-out',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #F1F3F5',
    padding: '0 20px',
    gap: '4px',
    backgroundColor: '#FAFAFA',
  },
  tab: (active: boolean) => ({
    padding: '14px 20px',
    fontSize: '13px',
    fontWeight: active ? 500 : 400,
    color: active ? '#0F172A' : '#64748B',
    border: 'none',
    background: active ? '#FFFFFF' : 'transparent',
    cursor: 'pointer',
    borderBottom: active ? '2px solid #6366F1' : '2px solid transparent',
    marginBottom: '-1px',
    transition: 'all 0.2s ease',
    borderRadius: '8px 8px 0 0',
  }),
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    gap: '12px',
    borderBottom: '1px solid #F1F3F5',
    flexWrap: 'wrap' as const,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1',
    minWidth: '280px',
  },
  searchInput: {
    flex: '1',
    padding: '9px 12px 9px 38px',
    fontSize: '13px',
    fontWeight: 400,
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: '#FAFAFA',
    transition: 'all 0.2s ease',
  },
  filterGroup: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  select: {
    padding: '9px 32px 9px 12px',
    fontSize: '13px',
    fontWeight: 400,
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    backgroundColor: '#FAFAFA',
    cursor: 'pointer',
    outline: 'none',
    fontFamily: 'inherit',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748B' d='M6 8L2 4h8z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    transition: 'all 0.2s ease',
  },
  button: {
    padding: '9px 16px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  primaryButton: {
    padding: '9px 16px',
    fontSize: '13px',
    fontWeight: 500,
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#6366F1',
    color: '#FFFFFF',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    boxShadow: '0 1px 2px rgba(99, 102, 241, 0.2)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left' as const,
    fontSize: '11px',
    fontWeight: 500,
    color: '#64748B',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    borderBottom: '1px solid #F1F3F5',
    backgroundColor: '#FAFAFA',
  },
  td: {
    padding: '16px',
    fontSize: '13px',
    fontWeight: 400,
    color: '#0F172A',
    borderBottom: '1px solid #F8FAFC',
  },
  statusBadge: (status: string) => {
    const colors = {
      active: { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
      inactive: { bg: '#FEE2E2', text: '#DC2626', border: '#FCA5A5' },
      maintenance: { bg: '#FEF3C7', text: '#D97706', border: '#FCD34D' },
      pending: { bg: '#E0E7FF', text: '#4F46E5', border: '#A5B4FC' },
    };
    const color = colors[status.toLowerCase()] || colors.pending;
    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 10px',
      fontSize: '11px',
      fontWeight: 500,
      borderRadius: '12px',
      backgroundColor: color.bg,
      color: color.text,
      border: `1px solid ${color.border}`,
      letterSpacing: '0.01em',
    };
  },
  actionButton: {
    padding: '6px',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    color: '#64748B',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderTop: '1px solid #F1F3F5',
    backgroundColor: '#FAFAFA',
  },
  pageInfo: {
    fontSize: '13px',
    fontWeight: 400,
    color: '#64748B',
  },
  pageButtons: {
    display: 'flex',
    gap: '8px',
  },
  categoryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
    padding: '20px',
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #F1F3F5',
    borderRadius: 12,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
    animation: 'fadeIn 0.5s ease-out',
  },
  categoryHeader: {
    padding: '16px 20px',
    backgroundColor: '#FAFAFA',
    borderBottom: '1px solid #F1F3F5',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#0F172A',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  categoryBadge: {
    backgroundColor: '#6366F1',
    color: '#FFFFFF',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 500,
  },
  assetList: {
    padding: '12px',
  },
  assetItem: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '8px',
    backgroundColor: '#FAFAFA',
    border: '1px solid #F1F3F5',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  assetItemName: {
    fontSize: '13px',
    fontWeight: 500,
    color: '#0F172A',
    marginBottom: '4px',
  },
  assetItemMeta: {
    fontSize: '11px',
    fontWeight: 400,
    color: '#64748B',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
};

// ==================== MAIN COMPONENT ====================
const AssetInventoryList = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const itemsPerPage = 10;

  const loadAssets = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      const data = await AssetApi.getAll();
      dispatch({ type: 'SET_ASSETS', payload: data });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assets';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error loading assets:', err);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    loadAssets();
  }, [loadAssets]);

  // Filter and group assets
  const { filteredAssets, groupedData } = useMemo(() => {
    const filtered = state.assets.filter((asset) => {
      const matchesSearch = 
        asset.assetName?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        asset.assetId?.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        asset.location?.toLowerCase().includes(state.searchTerm.toLowerCase());

      const matchesStatus = 
        state.statusFilter === 'all' || 
        asset.status?.toLowerCase() === state.statusFilter.toLowerCase();

      const matchesCategory = 
        state.categoryFilter === 'all' || 
        asset.assetCategory?.toLowerCase() === state.categoryFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Group by category
    const byCategory = filtered.reduce((acc, asset) => {
      const cat = asset.assetCategory || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(asset);
      return acc;
    }, {} as Record<string, Asset[]>);

    // Group by location
    const byLocation = filtered.reduce((acc, asset) => {
      const loc = asset.location || 'Unassigned';
      if (!acc[loc]) acc[loc] = [];
      acc[loc].push(asset);
      return acc;
    }, {} as Record<string, Asset[]>);

    return {
      filteredAssets: filtered,
      groupedData: {
        category: byCategory,
        location: byLocation,
      },
    };
  }, [state.assets, state.searchTerm, state.statusFilter, state.categoryFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = useMemo(() => {
    const start = (state.currentPage - 1) * itemsPerPage;
    return filteredAssets.slice(start, start + itemsPerPage);
  }, [filteredAssets, state.currentPage]);

  const handleDeleteAsset = async (assetId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    
    try {
      dispatch({ type: 'SET_OPERATION_IN_PROGRESS', payload: true });
      await AssetApi.remove(assetId);
      await loadAssets();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete asset');
    } finally {
      dispatch({ type: 'SET_OPERATION_IN_PROGRESS', payload: false });
    }
  };

  const handleViewDetails = (asset: Asset, e?: React.MouseEvent) => {
    e?.stopPropagation();
    dispatch({ type: 'SET_SELECTED_ASSET', payload: asset });
    dispatch({ type: 'SET_SHOW_DETAIL_MODAL', payload: true });
  };

  const handleShowQR = (asset: Asset, e?: React.MouseEvent) => {
    e?.stopPropagation();
    dispatch({ type: 'SET_QR_ASSET', payload: asset });
    dispatch({ type: 'SET_SHOW_QR_MODAL', payload: true });
  };

  const handleEditAsset = (asset: Asset, e?: React.MouseEvent) => {
    e?.stopPropagation();
    dispatch({ type: 'SET_EDITING_ASSET', payload: asset });
    dispatch({ type: 'SET_SHOW_EDIT_MODAL', payload: true });
  };

  const handleExport = () => {
    const csv = [
      ['Asset ID', 'Name', 'Category', 'Location', 'Status', 'Installation Date'].join(','),
      ...filteredAssets.map(a => 
        [a.assetId, a.assetName, a.assetCategory, a.location, a.status, a.dateOfInstallation].join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assets_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Render table rows
  const renderTableRows = (assets: Asset[]) => {
    return assets.map((asset, index) => (
      <tr 
        key={asset.assetId} 
        style={{ 
          transition: 'background-color 0.2s',
          animation: `slideIn ${0.3 + index * 0.05}s ease-out`
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#FAFAFA';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <td style={styles.td}>
          <div style={{ fontWeight: 500, marginBottom: '2px' }}>{asset.assetName}</div>
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
            {asset.assetId}
          </div>
        </td>
        <td style={styles.td}>
          {asset.dateOfInstallation 
            ? new Date(asset.dateOfInstallation).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            : '-'}
        </td>
        <td style={styles.td}>{asset.assetCategory || '-'}</td>
        <td style={styles.td}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={13} style={{ color: '#94A3B8' }} />
            {asset.location || '-'}
          </div>
        </td>
        <td style={styles.td}>
          <span style={styles.statusBadge(asset.status || 'pending')}>
            {asset.status || 'Pending'}
          </span>
        </td>
        <td style={styles.td}>{asset.manufacturer || '-'}</td>
        <td style={styles.td}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={(e) => handleShowQR(asset, e)}
              style={styles.actionButton}
              title="View QR Code"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#6366F1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <QrCode size={16} />
            </button>
            {/* NEW: Edit Button */}
    <button
      onClick={(e) => handleEditAsset(asset, e)}
      style={styles.actionButton}
      title="Edit Asset"
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F8FAFC';
        e.currentTarget.style.borderColor = '#6366F1';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#FFFFFF';
        e.currentTarget.style.borderColor = '#E2E8F0';
      }}
    >
      <Edit size={16} />
    </button>
            <button
              onClick={(e) => handleViewDetails(asset, e)}
              style={styles.actionButton}
              title="View Details"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F8FAFC';
                e.currentTarget.style.borderColor = '#10B981';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <Eye size={16} />
            </button>
            <button
              onClick={(e) => handleDeleteAsset(asset.assetId, e)}
              style={styles.actionButton}
              title="Delete"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FEE2E2';
                e.currentTarget.style.borderColor = '#EF4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FFFFFF';
                e.currentTarget.style.borderColor = '#E2E8F0';
              }}
            >
              <Trash2 size={16} color="#EF4444" />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  // Render category/location cards
  const renderCategoryCards = (groupedData: Record<string, Asset[]>, type: 'category' | 'location') => {
    return Object.entries(groupedData).map(([group, assets]) => (
      <div 
        key={group} 
        style={styles.categoryCard}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.12)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.06)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '#F1F3F5';
        }}
      >
        <div style={styles.categoryHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {type === 'category' ? <Package size={16} color="#6366F1" /> : <MapPin size={16} color="#6366F1" />}
            <h3 style={styles.categoryTitle}>{group}</h3>
          </div>
          <span style={styles.categoryBadge}>{assets.length}</span>
        </div>
        <div style={styles.assetList}>
          {assets.map((asset) => (
            <div
              key={asset.assetId}
              style={styles.assetItem}
              onClick={() => handleViewDetails(asset)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.borderColor = '#CBD5E1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FAFAFA';
                e.currentTarget.style.borderColor = '#F1F3F5';
              }}
            >
              <div style={styles.assetItemName}>{asset.assetName}</div>
              <div style={styles.assetItemMeta}>
                <span>{asset.assetId}</span>
                <span>•</span>
                <span style={styles.statusBadge(asset.status || 'pending')}>
                  {asset.status || 'Pending'}
                </span>
              </div>
              <div style={{ ...styles.assetItemMeta, marginTop: '6px' }}>
                {type === 'category' ? (
                  <>
                    <MapPin size={12} />
                    <span>{asset.location || 'No location'}</span>
                  </>
                ) : (
                  <>
                    <Package size={12} />
                    <span>{asset.assetCategory || 'No category'}</span>
                  </>
                )}
                <span style={{ marginLeft: 'auto', display: 'flex', gap: '4px' }}>
                  <button
                    onClick={(e) => handleShowQR(asset, e)}
                    style={{
                      ...styles.actionButton,
                      padding: '4px',
                      border: 'none',
                    }}
                    title="View QR Code"
                  >
                    <QrCode size={14} />
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  };

  if (state.loading) {
    return (
      <>
        <style>{globalStyles}</style>
        <div style={{ 
          ...styles.container, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #F3F4F6',
            borderTop: '3px solid #0588f0',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>Loading assets...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Asset Inventory</h1>
          <p style={styles.subtitle}>
            Manage and track all your assets in one centralized location
          </p>
        </div>

        {/* Main Card */}
        <div style={styles.card}>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={styles.tab(state.activeTab === 'all')}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'all' })}
            >
              All Assets
            </button>
            <button
              style={styles.tab(state.activeTab === 'category')}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'category' })}
            >
              By Category
            </button>
            <button
              style={styles.tab(state.activeTab === 'location')}
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'location' })}
            >
              By Location
            </button>
          </div>

          {/* Toolbar */}
          <div style={styles.toolbar}>
            <div style={styles.searchBox}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search 
                  size={16} 
                  style={{ 
                    position: 'absolute', 
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#94A3B8'
                  }} 
                />
                <input
                  type="text"
                  placeholder="Search by name, ID, or location..."
                  value={state.searchTerm}
                  onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
                  style={styles.searchInput}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#0588f0';
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.backgroundColor = '#FAFAFA';
                  }}
                />
              </div>
            </div>

            <div style={styles.filterGroup}>
              <select
                value={state.statusFilter}
                onChange={(e) => dispatch({ type: 'SET_STATUS_FILTER', payload: e.target.value })}
                style={styles.select}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#6366F1';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderRadius = '8px';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>

              <button 
                style={styles.button} 
                onClick={handleExport}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                  e.currentTarget.style.borderColor = '#CBD5E1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E2E8F0';
                }}
              >
                <Download size={16} />
                Export
              </button>

              <button 
                style={styles.primaryButton}
                onClick={() => dispatch({ type: 'SET_SHOW_ADD_MODAL', payload: true })}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4F46E5';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#6366F1';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(99, 102, 241, 0.2)';
                }}
              >
                <Plus size={16} />
                Add Asset
              </button>
            </div>
          </div>

          {/* Content Area */}
          {state.activeTab === 'all' && (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Asset Name</th>
                      <th style={styles.th}>Installation Date</th>
                      <th style={styles.th}>Category</th>
                      <th style={styles.th}>Location</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Manufacturer</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAssets.length > 0 ? (
                      renderTableRows(paginatedAssets)
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>
                          <Package size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
                          <div style={{ color: '#64748B', fontSize: '13px' }}>No assets found</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredAssets.length > 0 && (
                <div style={styles.pagination}>
                  <div style={styles.pageInfo}>
                    Showing {Math.min((state.currentPage - 1) * itemsPerPage + 1, filteredAssets.length)} to{' '}
                    {Math.min(state.currentPage * itemsPerPage, filteredAssets.length)} of {filteredAssets.length} assets
                  </div>
                  <div style={styles.pageButtons}>
                    <button
                      style={styles.actionButton}
                      onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: state.currentPage - 1 })}
                      disabled={state.currentPage === 1}
                      onMouseEnter={(e) => {
                        if (state.currentPage !== 1) {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                          e.currentTarget.style.borderColor = '#6366F1';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      style={styles.actionButton}
                      onClick={() => dispatch({ type: 'SET_CURRENT_PAGE', payload: state.currentPage + 1 })}
                      disabled={state.currentPage >= totalPages}
                      onMouseEnter={(e) => {
                        if (state.currentPage < totalPages) {
                          e.currentTarget.style.backgroundColor = '#F8FAFC';
                          e.currentTarget.style.borderColor = '#6366F1';
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {state.activeTab === 'category' && (
            <div style={styles.categoryGrid}>
              {Object.keys(groupedData.category).length > 0 ? (
                renderCategoryCards(groupedData.category, 'category')
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
                  <Package size={48} style={{ color: '#CBD5E1', margin: '0 auto 16px' }} />
                  <div style={{ color: '#64748B', fontSize: '14px', fontWeight: 500 }}>No categories found</div>
                  <div style={{ color: '#94A3B8', fontSize: '12px', marginTop: '4px' }}>
                    Add assets to see them grouped by category
                  </div>
                </div>
              )}
            </div>
          )}

          {state.activeTab === 'location' && (
            <div style={styles.categoryGrid}>
              {Object.keys(groupedData.location).length > 0 ? (
                renderCategoryCards(groupedData.location, 'location')
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px' }}>
                  <MapPin size={48} style={{ color: '#CBD5E1', margin: '0 auto 16px' }} />
                  <div style={{ color: '#64748B', fontSize: '14px', fontWeight: 500 }}>No locations found</div>
                  <div style={{ color: '#94A3B8', fontSize: '12px', marginTop: '4px' }}>
                    Add locations to your assets to see them grouped by location
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        {state.showDetailModal && state.selectedAsset && (
          <AssetDetailModal
            asset={state.selectedAsset}
            onClose={() => dispatch({ type: 'SET_SHOW_DETAIL_MODAL', payload: false })}
          />
        )}
        {state.showEditModal && state.editingAsset && (
  <EditAssetModal
    asset={state.editingAsset}
    onClose={() => {
      dispatch({ type: 'SET_SHOW_EDIT_MODAL', payload: false });
      dispatch({ type: 'SET_EDITING_ASSET', payload: null });
    }}
    onSuccess={() => {
      dispatch({ type: 'SET_SHOW_EDIT_MODAL', payload: false });
      dispatch({ type: 'SET_EDITING_ASSET', payload: null });
      loadAssets();
    }}
  />
)}

        {state.showAddModal && (
          <AddAssetModal
            onClose={() => dispatch({ type: 'SET_SHOW_ADD_MODAL', payload: false })}
            onSuccess={() => {
              dispatch({ type: 'SET_SHOW_ADD_MODAL', payload: false });
              loadAssets();
            }}
          />
        )}

        {state.showQRModal && state.qrAsset && (
          <QRModal
            asset={state.qrAsset}
            onClose={() => dispatch({ type: 'SET_SHOW_QR_MODAL', payload: false })}
          />
        )}
      </div>
    </>
  );
};

// ==================== QR CODE MODAL ====================
const QRModal = ({ asset, onClose }: { asset: Asset; onClose: () => void }) => {
  const qrData = JSON.stringify({
    assetId: asset.assetId,
    assetName: asset.assetName,
    category: asset.assetCategory,
    location: asset.location,
  });

  const handleDownload = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `QR_${asset.assetId}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'scaleIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #F1F3F5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>
            Asset QR Code
          </h2>
          <button
            onClick={onClose}
            style={{
              ...styles.actionButton,
              border: 'none',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ 
          padding: '32px', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: '#FAFAFA',
            borderRadius: 12,
            border: '2px solid #F1F3F5',
          }}>
            <QRCodeGenerator value={qrData} size={200} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
              {asset.assetName}
            </div>
            <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '2px' }}>
              {asset.assetId}
            </div>
            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
              {asset.assetCategory} • {asset.location || 'No location'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button
              onClick={handleDownload}
              style={{
                ...styles.button,
                flex: 1,
                justifyContent: 'center',
              }}
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={handlePrint}
              style={{
                ...styles.primaryButton,
                flex: 1,
                justifyContent: 'center',
              }}
            >
              Print
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==================== EDIT ASSET MODAL ====================
const EditAssetModal = ({ 
  asset, 
  onClose, 
  onSuccess 
}: { 
  asset: Asset; 
  onClose: () => void; 
  onSuccess: () => void 
}) => {
  const [formData, setFormData] = useState({
    assetName: asset.assetName,
    assetCategory: asset.assetCategory,
    assetType: asset.assetType || '',
    modelNumber: asset.modelNumber || '',
    serialNumber: asset.serialNumber || '',
    manufacturer: asset.manufacturer || '',
    location: asset.location || '',
    branch: asset.branch || '',
    description: asset.description || '',
    status: asset.status || 'ACTIVE',
    quantity: asset.quantity || 1,
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.assetName || !formData.assetCategory) {
      setError('Asset name and category are required');
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      await AssetApi.update(asset.assetId, formData);
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update asset';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'scaleIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #F1F3F5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>
              Edit Asset
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748B' }}>
              {asset.assetId}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              ...styles.actionButton,
              border: 'none',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              color: '#DC2626',
              fontSize: '13px',
              fontWeight: 400,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Asset Name */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
                Asset Name *
              </label>
              <input
                type="text"
                value={formData.assetName}
                onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                style={styles.searchInput}
                placeholder="Enter asset name"
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
                Category *
              </label>
              <input
                type="text"
                value={formData.assetCategory}
                onChange={(e) => setFormData({ ...formData, assetCategory: e.target.value })}
                style={styles.searchInput}
                placeholder="e.g., HVAC, Electrical"
              />
            </div>

            {/* Asset Type */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
                Asset Type
              </label>
              <input
                type="text"
                value={formData.assetType}
                onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                style={styles.searchInput}
                placeholder="Type"
              />
            </div>

            {/* Status */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={styles.select}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="RETIRED">Retired</option>
              </select>
            </div>

            {/* Model Number */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
                Model Number
              </label>
              <input
                type="text"
                value={formData.modelNumber}
                onChange={(e) => setFormData({ ...formData, modelNumber: e.target.value })}
                style={styles.searchInput}
                placeholder="Model"
              />
            </div>

            {/* Serial Number */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
                Serial Number
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                style={styles.searchInput}
                placeholder="Serial"
              />
            </div>

            {/* Manufacturer */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                style={styles.searchInput}
                placeholder="Manufacturer"
              />
            </div>

            {/* Quantity */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
                Quantity
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                style={styles.searchInput}
                min="1"
              />
            </div>

            {/* Location */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                style={styles.searchInput}
                placeholder="e.g., 3rd floor, Room 201"
              />
            </div>

            {/* Branch */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
                Branch
              </label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                style={styles.searchInput}
                placeholder="Branch"
              />
            </div>

            {/* Description - Full Width */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  ...styles.searchInput,
                  width: '100%',
                  minHeight: '80px',
                  resize: 'vertical' as const,
                  fontFamily: 'inherit',
                }}
                placeholder="Additional details about the asset"
              />
            </div>
          </div>
        </div>

        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #F1F3F5',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              ...styles.button,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              ...styles.primaryButton,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Updating...' : 'Update Asset'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== ASSET DETAIL MODAL ====================
const AssetDetailModal = ({ asset, onClose }: { asset: Asset; onClose: () => void }) => {
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          maxWidth: '640px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'scaleIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #F1F3F5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>
            Asset Details
          </h2>
          <button
            onClick={onClose}
            style={{
              ...styles.actionButton,
              border: 'none',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Asset Name
            </div>
            <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 500 }}>
              {asset.assetName}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Asset ID
            </div>
            <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 500 }}>
              {asset.assetId}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Category
            </div>
            <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 500 }}>
              {asset.assetCategory}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Status
            </div>
            <span style={styles.statusBadge(asset.status)}>
              {asset.status}
            </span>
          </div>

          {asset.location && (
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Location
              </div>
              <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 500 }}>
                {asset.location}
              </div>
            </div>
          )}

          {asset.manufacturer && (
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Manufacturer
              </div>
              <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 500 }}>
                {asset.manufacturer}
              </div>
            </div>
          )}

          {asset.modelNumber && (
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Model Number
              </div>
              <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 500 }}>
                {asset.modelNumber}
              </div>
            </div>
          )}

          {asset.serialNumber && (
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Serial Number
              </div>
              <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 500 }}>
                {asset.serialNumber}
              </div>
            </div>
          )}

          {asset.dateOfInstallation && (
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Installation Date
              </div>
              <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 500 }}>
                {new Date(asset.dateOfInstallation).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          )}

          {asset.dlpEndDate && (
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                DLP End Date
              </div>
              <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 500 }}>
                {new Date(asset.dlpEndDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          )}

          {asset.description && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Description
              </div>
              <div style={{ fontSize: '14px', color: '#0F172A', fontWeight: 400, lineHeight: 1.6 }}>
                {asset.description}
              </div>
            </div>
          )}
        </div>

        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #F1F3F5',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={styles.primaryButton}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== ADD ASSET MODAL ====================
const AddAssetModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    assetName: '',
    category: '',
    location: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!formData.assetName || !formData.category) {
      setError('Asset name and category are required');
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      await AssetApi.create(formData);
      onSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create asset';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          animation: 'scaleIn 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #F1F3F5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0F172A' }}>
            Add New Asset
          </h2>
          <button
            onClick={onClose}
            style={{
              ...styles.actionButton,
              border: 'none',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              color: '#DC2626',
              fontSize: '13px',
              fontWeight: 400,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
              Asset Name *
            </label>
            <input
              type="text"
              value={formData.assetName}
              onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '13px',
                fontWeight: 400,
                outline: 'none',
                fontFamily: 'inherit',
                backgroundColor: '#FAFAFA',
                transition: 'all 0.2s ease',
              }}
              placeholder="Enter asset name"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366F1';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
              Category *
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '13px',
                fontWeight: 400,
                outline: 'none',
                fontFamily: 'inherit',
                backgroundColor: '#FAFAFA',
                transition: 'all 0.2s ease',
              }}
              placeholder="e.g., HVAC, Electrical, UPS"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366F1';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#0F172A', marginBottom: '8px' }}>
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '13px',
                fontWeight: 400,
                outline: 'none',
                fontFamily: 'inherit',
                backgroundColor: '#FAFAFA',
                transition: 'all 0.2s ease',
              }}
              placeholder="e.g., 3rd floor, Room 201"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#6366F1';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.backgroundColor = '#FAFAFA';
              }}
            />
          </div>
        </div>

        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #F1F3F5',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{
              ...styles.button,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              ...styles.primaryButton,
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Creating...' : 'Create Asset'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetInventoryList;
