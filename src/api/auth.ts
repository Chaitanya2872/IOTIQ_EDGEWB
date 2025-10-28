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
  VALIDATE_TOKEN: 10000,
  REFRESH_TOKEN: 2000,
  AUTH_CHECK: 3000,
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
} as const;

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
  },
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.TOKEN_TYPE);
    localStorage.removeItem(STORAGE_KEYS.USER);
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

export async function checkAuthStatus(): Promise<AuthStatusResponse> {
  const storedAuth = getStoredAuth();

  // 🚀 Quick exit if token missing or empty
  if (!storedAuth?.accessToken || storedAuth.accessToken === 'undefined') {
    return { isAuthenticated: false, user: null };
  }

  const user = toUser(storedAuth);

  // ⏱ Short timeout for validation (default 1s fallback)
  const AUTH_CHECK_TIMEOUT = 1000;

  const authCheckPromise = (async (): Promise<AuthStatusResponse> => {
    try {
      const validation = await validateToken(storedAuth.accessToken);

      if (validation.valid) {
        return { isAuthenticated: true, user };
      }

      // Try refresh token if access invalid
      await refreshToken();
      return { isAuthenticated: true, user };
    } catch (err) {
      console.warn("Auth validation or refresh failed:", err);
      return { isAuthenticated: false, user: null };
    }
  })();

  // Fallback in case backend is slow or unreachable
  const timeoutPromise = new Promise<AuthStatusResponse>((resolve) => {
    setTimeout(() => {
      console.log("Auth check timed out — defaulting to stored auth.");
      resolve({ isAuthenticated: true, user });
    }, AUTH_CHECK_TIMEOUT);
  });

  try {
    // whichever finishes first (validation or timeout)
    return await Promise.race([authCheckPromise, timeoutPromise]);
  } catch (error) {
    console.error("Auth status check error:", error);
    return { isAuthenticated: false, user: null };
  }
}


export const clearAuth = storage.clear;
export const getCurrentUser = storage.getUser;
export const getAccessToken = storage.getAccessToken;
export const storeAuth = storage.setAuth;