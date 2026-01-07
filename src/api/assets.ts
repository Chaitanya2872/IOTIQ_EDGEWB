// src/api/assets.ts - IMPROVED VERSION WITH BETTER DIAGNOSTICS

export interface Asset {
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

export interface AssetCreateRequest {
  assetName: string;
  category: string;
  location?: string;
}

export interface AssetUpdateRequest {
  assetName?: string;
  category?: string;
  location?: string;
  status?: Asset['status'];
}

// ============================================================================
// IMPROVED CONFIGURATION WITH AUTO-DETECTION
// ============================================================================

// Try multiple possible base URLs
const POSSIBLE_URLS = [
  import.meta.env.VITE_ASSET_API_BASE_URL,  // From .env
  'http://localhost:8082/api/assets',        // Same as inventory API
  'http://localhost:8088/api/assets',        // Default fallback
];

// Get the first defined URL
const BASE_URL = POSSIBLE_URLS.find(url => url) || 'http://localhost:8088/api/assets';

// Log configuration on module load
console.log('🏗️ Asset API Configuration:');
console.log('   Base URL:', BASE_URL);
console.log('   Environment:', import.meta.env.MODE);
console.log('   Env Variable:', import.meta.env.VITE_ASSET_API_BASE_URL || 'NOT SET');

// ============================================================================
// AUTHENTICATION UTILITIES
// ============================================================================

const getAuthToken = (): string | null => {
  const token = localStorage.getItem('accessToken');
  return token && token !== 'undefined' ? token : null;
};

const getTokenType = (): string => {
  return localStorage.getItem('tokenType') || 'Bearer';
};

const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const tokenType = getTokenType();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `${tokenType} ${token}`;
  }
  
  return headers;
};

// ============================================================================
// IMPROVED HTTP REQUEST WRAPPER WITH BETTER LOGGING
// ============================================================================

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

async function authenticatedFetch(url: string, options: RequestOptions = {}): Promise<Response> {
  const { skipAuth = false, ...fetchOptions } = options;
  
  // Build headers
  const headers = skipAuth ? { 'Content-Type': 'application/json' } : getAuthHeaders();
  
  // Enhanced debug logging
  console.log('🔍 Asset API Request:', {
    url,
    method: fetchOptions.method || 'GET',
    hasAuth: !skipAuth && !!getAuthToken(),
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString()
  });
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...headers,
        ...fetchOptions.headers,
      },
    });
    
    console.log('📡 Asset API Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      timestamp: new Date().toISOString()
    });
    
    // Handle specific error cases
    if (response.status === 401) {
      console.error('🚫 401 Unauthorized - Authentication required');
      throw new Error('Authentication required. Please log in again.');
    }
    
    if (response.status === 403) {
      console.error('🚫 403 Forbidden - Insufficient permissions');
      throw new Error('You do not have permission to perform this action.');
    }
    
    if (response.status === 404) {
      console.error('🚫 404 Not Found - Check if endpoint exists');
      console.error('   Requested URL:', url);
      console.error('   Tip: Verify backend is running and endpoint path is correct');
      throw new Error('The requested resource was not found.');
    }
    
    if (response.status >= 500) {
      console.error('🚫 Server Error (5xx)');
      throw new Error('Server error. Please try again later.');
    }
    
    return response;
  } catch (error) {
    // Enhanced network error logging
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('💥 Network Error: Failed to fetch');
      console.error('   URL:', url);
      console.error('   Base URL:', BASE_URL);
      console.error('   Possible causes:');
      console.error('   1. Backend server is not running');
      console.error('   2. Wrong port or URL');
      console.error('   3. CORS is blocking the request');
      console.error('   4. Network connectivity issue');
      console.error('');
      console.error('   💡 Quick Fix:');
      console.error('   - Check if backend is running: curl ' + url);
      console.error('   - Try changing port in .env to 8082 (same as inventory API)');
      console.error('   - Create .env file with: VITE_ASSET_API_BASE_URL=http://localhost:8088/api/assets');
      
      throw new Error('Network error. Please check your connection and backend server.');
    }
    
    throw error;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (contentType?.includes('application/json')) {
    try {
      return await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      throw new Error('Invalid response format from server');
    }
  }
  
  const text = await response.text();
  throw new Error(`Unexpected response format: ${text}`);
}

// ============================================================================
// ASSET API
// ============================================================================

export const AssetApi = {
  /* ===================== GET ===================== */

  getAll: async (): Promise<Asset[]> => {
    const res = await authenticatedFetch(BASE_URL);
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Failed to fetch assets: ${res.status} - ${errorText}`);
    }
    
    return parseResponse<Asset[]>(res);
  },

  getById: async (id: string): Promise<Asset> => {
    const res = await authenticatedFetch(`${BASE_URL}/${id}`);
    
    if (!res.ok) {
      throw new Error(`Asset not found: ${id}`);
    }
    
    return parseResponse<Asset>(res);
  },

  getByStatus: async (status: string): Promise<Asset[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/status/${status}`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch assets by status: ${status}`);
    }
    
    return parseResponse<Asset[]>(res);
  },

  getByCategory: async (category: string): Promise<Asset[]> => {
    const res = await authenticatedFetch(`${BASE_URL}/category/${category}`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch assets by category: ${category}`);
    }
    
    return parseResponse<Asset[]>(res);
  },

  search: async (params: {
    name?: string;
    category?: string;
    status?: string;
  }): Promise<Asset[]> => {
    const query = new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value) acc[key] = value;
        return acc;
      }, {} as Record<string, string>)
    ).toString();
    
    const res = await authenticatedFetch(`${BASE_URL}/search?${query}`);
    
    if (!res.ok) {
      throw new Error('Search failed');
    }
    
    return parseResponse<Asset[]>(res);
  },

  /* ===================== CREATE ===================== */

  create: async (data: AssetCreateRequest): Promise<Asset> => {
    const res = await authenticatedFetch(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Failed to create asset: ${errorText}`);
    }
    
    return parseResponse<Asset>(res);
  },

  /* ===================== UPDATE ===================== */

  update: async (id: string, data: AssetUpdateRequest): Promise<Asset> => {
    const res = await authenticatedFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Unknown error');
      throw new Error(`Failed to update asset: ${errorText}`);
    }
    
    return parseResponse<Asset>(res);
  },

  updateStatus: async (id: string, status: string): Promise<Asset> => {
    const res = await authenticatedFetch(`${BASE_URL}/${id}/status?status=${status}`, {
      method: 'PATCH',
    });
    
    if (!res.ok) {
      throw new Error('Status update failed');
    }
    
    return parseResponse<Asset>(res);
  },

  updateLocation: async (id: string, location: string): Promise<Asset> => {
    const res = await authenticatedFetch(`${BASE_URL}/${id}/location?location=${location}`, {
      method: 'PATCH',
    });
    
    if (!res.ok) {
      throw new Error('Location update failed');
    }
    
    return parseResponse<Asset>(res);
  },

  /* ===================== DELETE ===================== */

  remove: async (id: string): Promise<void> => {
    const res = await authenticatedFetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!res.ok) {
      throw new Error('Delete failed');
    }
  },

  /* ===================== QR ===================== */

  getQrCode: async (id: string): Promise<Blob> => {
    const res = await authenticatedFetch(`${BASE_URL}/${id}/qr`);
    
    if (!res.ok) {
      throw new Error('QR fetch failed');
    }
    
    return res.blob();
  },

  /* ===================== COUNTS ===================== */

  count: async (): Promise<number> => {
    const res = await authenticatedFetch(`${BASE_URL}/count`);
    return parseResponse<number>(res);
  },

  countByStatus: async (status: string): Promise<number> => {
    const res = await authenticatedFetch(`${BASE_URL}/count/status/${status}`);
    return parseResponse<number>(res);
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const clearAuth = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('user');
};

export const testConnection = async (): Promise<{
  success: boolean;
  url: string;
  error?: string;
}> => {
  try {
    console.log('🧪 Testing connection to:', BASE_URL);
    
    const response = await fetch(`${BASE_URL}/count`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    const result = {
      success: response.ok,
      url: BASE_URL,
      error: response.ok ? undefined : `${response.status} ${response.statusText}`
    };
    
    console.log('🧪 Connection test result:', result);
    
    return result;
  } catch (error) {
    const result = {
      success: false,
      url: BASE_URL,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    console.error('🧪 Connection test failed:', result);
    
    return result;
  }
};

// Auto-test connection on module load (in development)
if (import.meta.env.DEV) {
  setTimeout(() => {
    testConnection();
  }, 1000);
}