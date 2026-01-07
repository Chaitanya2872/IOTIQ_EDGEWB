// src/hooks/useAssets.ts - Custom hooks for Asset Management

import { useState, useEffect, useCallback, useRef } from 'react';
import { AssetApi, type Asset, type AssetCreateRequest, type AssetUpdateRequest } from './assets';

// ============================================================================
// TYPES
// ============================================================================

interface UseAssetsResult {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  refresh: (force?: boolean) => Promise<void>;
  create: (data: AssetCreateRequest) => Promise<Asset>;
  update: (id: string, data: AssetUpdateRequest) => Promise<Asset>;
  updateStatus: (id: string, status: string) => Promise<Asset>;
  updateLocation: (id: string, location: string) => Promise<Asset>;
  remove: (id: string) => Promise<void>;
}

interface UseAssetByIdResult {
  asset: Asset | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

interface UseAssetSearchResult {
  assets: Asset[];
  loading: boolean;
  error: string | null;
  search: (params: { name?: string; category?: string; status?: string }) => Promise<void>;
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 30000; // 30 seconds

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const age = Date.now() - entry.timestamp;
  if (age > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return entry.data;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }
  
  const keysToDelete: string[] = [];
  cache.forEach((_, key) => {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => cache.delete(key));
}

// ============================================================================
// HOOK: useAssets - Fetch all assets
// ============================================================================

export function useAssets(): UseAssetsResult {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refresh = useCallback(async (force = false) => {
    // Check cache first
    if (!force) {
      const cached = getCached<Asset[]>('assets-all');
      if (cached) {
        setAssets(cached);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await AssetApi.getAll();
      
      if (isMounted.current) {
        setAssets(data);
        setCache('assets-all', data);
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load assets';
        setError(errorMessage);
        console.error('Error loading assets:', err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  const create = useCallback(async (data: AssetCreateRequest): Promise<Asset> => {
    setLoading(true);
    setError(null);

    try {
      const newAsset = await AssetApi.create(data);
      invalidateCache('assets-');
      await refresh(true);
      return newAsset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create asset';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const update = useCallback(async (id: string, data: AssetUpdateRequest): Promise<Asset> => {
    setLoading(true);
    setError(null);

    try {
      const updatedAsset = await AssetApi.update(id, data);
      invalidateCache('assets-');
      await refresh(true);
      return updatedAsset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update asset';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const updateStatus = useCallback(async (id: string, status: string): Promise<Asset> => {
    setLoading(true);
    setError(null);

    try {
      const updatedAsset = await AssetApi.updateStatus(id, status);
      invalidateCache('assets-');
      await refresh(true);
      return updatedAsset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const updateLocation = useCallback(async (id: string, location: string): Promise<Asset> => {
    setLoading(true);
    setError(null);

    try {
      const updatedAsset = await AssetApi.updateLocation(id, location);
      invalidateCache('assets-');
      await refresh(true);
      return updatedAsset;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update location';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const remove = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await AssetApi.remove(id);
      invalidateCache('assets-');
      await refresh(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete asset';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    assets,
    loading,
    error,
    refresh,
    create,
    update,
    updateStatus,
    updateLocation,
    remove,
  };
}

// ============================================================================
// HOOK: useAssetById - Fetch single asset
// ============================================================================

export function useAssetById(id: string | null): UseAssetByIdResult {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!id) {
      setAsset(null);
      return;
    }

    // Check cache
    const cached = getCached<Asset>(`asset-${id}`);
    if (cached) {
      setAsset(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await AssetApi.getById(id);
      
      if (isMounted.current) {
        setAsset(data);
        setCache(`asset-${id}`, data);
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load asset';
        setError(errorMessage);
        console.error('Error loading asset:', err);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { asset, loading, error, refresh };
}

// ============================================================================
// HOOK: useAssetsByStatus - Fetch assets by status
// ============================================================================

export function useAssetsByStatus(status: string) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const cacheKey = `assets-status-${status}`;
    const cached = getCached<Asset[]>(cacheKey);
    
    if (cached) {
      setAssets(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await AssetApi.getByStatus(status);
      setAssets(data);
      setCache(cacheKey, data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assets';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { assets, loading, error, refresh };
}

// ============================================================================
// HOOK: useAssetsByCategory - Fetch assets by category
// ============================================================================

export function useAssetsByCategory(category: string) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const cacheKey = `assets-category-${category}`;
    const cached = getCached<Asset[]>(cacheKey);
    
    if (cached) {
      setAssets(cached);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await AssetApi.getByCategory(category);
      setAssets(data);
      setCache(cacheKey, data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load assets';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { assets, loading, error, refresh };
}

// ============================================================================
// HOOK: useAssetSearch - Search assets
// ============================================================================

export function useAssetSearch(): UseAssetSearchResult {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: {
    name?: string;
    category?: string;
    status?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const data = await AssetApi.search(params);
      setAssets(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return { assets, loading, error, search };
}

// ============================================================================
// HOOK: useAssetCounts - Get asset counts
// ============================================================================

export function useAssetCounts() {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const count = await AssetApi.count();
      setTotal(count);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load count';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { total, loading, error, refresh };
}

// ============================================================================
// UTILITY: Clear all asset caches
// ============================================================================

export function clearAssetCache() {
  invalidateCache('assets-');
  console.log('🧹 Asset cache cleared');
}