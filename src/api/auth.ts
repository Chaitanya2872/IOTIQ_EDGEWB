// ============================================================================
// OPTIMIZED AUTH.TS - Fast Load Strategy
// ============================================================================

export type SignInRequest = {
  email: string;
  password: string;
};

export type SignUpRequest = {
  fullName: string;
  email: string;
  password: string;
  roles: string[];
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  fullName: string;
  email: string;
  roles: string[];
};

export type User = Pick<AuthResponse, 'userId' | 'fullName' | 'email' | 'roles'>;

export type TokenValidationResponse = {
  valid: boolean;
  email?: string;
  userId?: number;
  fullName?: string;
  roles?: string[];
};

export type AuthStatusResponse = {
  isAuthenticated: boolean;
  user: User | null;
};

const API_BASE = (import.meta.env.VITE_AUTH_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '') as string;

const TIMEOUTS = {
  VALIDATE_TOKEN: 5000,  // Increased from 10s
  REFRESH_TOKEN: 3000,   // Increased from 2s
  AUTH_CHECK: 2000,      // Reduced from 3s for faster fallback
} as const;

const API_ENDPOINTS = {
  SIGN_IN: '/api/auth/signin',
  SIGN_UP: '/api/auth/signup',
  VALIDATE: '/api/validate',
  REFRESH: '/api/auth/refresh',
} as const;

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  TOKEN_TYPE: 'tokenType',
  USER: 'user',
  LAST_VALIDATED: 'lastValidated',  // NEW: Track last validation time
} as const;

// NEW: Token validation cache - 5 minutes
const TOKEN_VALIDATION_CACHE_MS = 5 * 60 * 1000;

const extractErrorMessage = (data: unknown): string => {
  if (typeof data === 'object' && data !== null) {
    const { message, error } = data as Record<string, unknown>;
    if (typeof message === 'string') return message;
    if (typeof error === 'string') return error;
  }
  return '';
};

const toUser = (auth: AuthResponse): User => ({
  userId: auth.userId,
  fullName: auth.fullName,
  email: auth.email,
  roles: auth.roles,
});

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = extractErrorMessage(data) || `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function signIn(body: SignInRequest): Promise<AuthResponse> {
  return request<AuthResponse>(API_ENDPOINTS.SIGN_IN, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function signUp(body: SignUpRequest): Promise<AuthResponse> {
  return request<AuthResponse>(API_ENDPOINTS.SIGN_UP, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const storage = {
  getAccessToken: (): string | null => localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
  getRefreshToken: (): string | null => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  getTokenType: (): string => localStorage.getItem(STORAGE_KEYS.TOKEN_TYPE) || 'Bearer',
  getLastValidated: (): number => {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_VALIDATED);
    return timestamp ? parseInt(timestamp, 10) : 0;
  },
  getUser: (): User | null => {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
  setAuth: (auth: AuthResponse): void => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, auth.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, auth.refreshToken);
    localStorage.setItem(STORAGE_KEYS.TOKEN_TYPE, auth.tokenType);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(toUser(auth)));
    localStorage.setItem(STORAGE_KEYS.LAST_VALIDATED, Date.now().toString());
  },
  updateLastValidated: (): void => {
    localStorage.setItem(STORAGE_KEYS.LAST_VALIDATED, Date.now().toString());
  },
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_TYPE);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.LAST_VALIDATED);
  },
};

export function getStoredAuth(): AuthResponse | null {
  const accessToken = storage.getAccessToken();
  const refreshToken = storage.getRefreshToken();
  const user = storage.getUser();

  if (!accessToken || !user) return null;

  return {
    accessToken,
    refreshToken: refreshToken || '',
    tokenType: storage.getTokenType(),
    ...user,
  };
}

export async function validateToken(token: string): Promise<TokenValidationResponse> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.VALIDATE_TOKEN);

  try {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.VALIDATE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = extractErrorMessage(data) || `validateToken failed: ${res.status}`;
      throw new Error(message);
    }

    // Update validation timestamp on success
    storage.updateLastValidated();

    return {
      valid: !!data.valid,
      email: data.email,
      userId: data.userId,
      fullName: data.fullName,
      roles: data.roles || [],
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const error = err as DOMException | Error;
    if (error?.name === 'AbortError') {
      console.warn('validateToken aborted');
      return { valid: false };
    }
    console.error('Token validation error:', err);
    return { valid: false };
  }
}

export async function refreshToken(): Promise<AuthResponse> {
  const token = storage.getRefreshToken();

  if (!token) {
    throw new Error('No refresh token available');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUTS.REFRESH_TOKEN);

  try {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.REFRESH}?refreshToken=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = extractErrorMessage(data) || `Token refresh failed: ${res.status}`;
      throw new Error(message);
    }

    storage.setAuth(data);
    return data as AuthResponse;
  } catch (error) {
    storage.clear();
    throw error;
  }
}

// ============================================================================
// OPTIMIZED: Fast Auth Check with Smart Caching
// ============================================================================

export async function checkAuthStatus(): Promise<AuthStatusResponse> {
  const storedAuth = getStoredAuth();

  // Quick exit if no token
  if (!storedAuth?.accessToken || storedAuth.accessToken === 'undefined') {
    return { isAuthenticated: false, user: null };
  }

  const user = toUser(storedAuth);
  const lastValidated = storage.getLastValidated();
  const timeSinceValidation = Date.now() - lastValidated;

  // ⚡ OPTIMIZATION: Skip backend validation if recently validated
  if (timeSinceValidation < TOKEN_VALIDATION_CACHE_MS) {
    console.log(`✅ Using cached auth (validated ${Math.round(timeSinceValidation / 1000)}s ago)`);
    return { isAuthenticated: true, user };
  }

  // Background validation - don't block UI
  console.log('🔄 Background token validation...');
  
  validateToken(storedAuth.accessToken)
    .then(validation => {
      if (!validation.valid) {
        console.log('🔄 Token invalid, attempting refresh...');
        return refreshToken();
      }
    })
    .catch(err => {
      console.warn('⚠️ Background auth check failed:', err);
      // Don't clear auth on background failure - let user continue
    });

  // Return cached auth immediately (optimistic)
  return { isAuthenticated: true, user };
}

// ============================================================================
// NEW: Force validation (for manual refresh)
// ============================================================================

export async function forceValidateAuth(): Promise<AuthStatusResponse> {
  const storedAuth = getStoredAuth();

  if (!storedAuth?.accessToken) {
    return { isAuthenticated: false, user: null };
  }

  const user = toUser(storedAuth);

  try {
    const validation = await validateToken(storedAuth.accessToken);

    if (validation.valid) {
      return { isAuthenticated: true, user };
    }

    // Try refresh if validation fails
    await refreshToken();
    return { isAuthenticated: true, user };
  } catch (err) {
    console.error('Force validation failed:', err);
    storage.clear();
    return { isAuthenticated: false, user: null };
  }
}

export const clearAuth = storage.clear;
export const getCurrentUser = storage.getUser;
export const getAccessToken = storage.getAccessToken;
export const storeAuth = storage.setAuth;