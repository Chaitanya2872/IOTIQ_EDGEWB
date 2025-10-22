/* eslint-disable @typescript-eslint/no-explicit-any */


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

const VITE_ENV: any = (import.meta as any).env || {};
const API_BASE = VITE_ENV.VITE_AUTH_API_BASE_URL || VITE_ENV.VITE_API_BASE_URL || "";

async function request<T>(path: string, options: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `Request failed: ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function signIn(body: SignInRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/signin", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function signUp(body: SignUpRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
}



// Add these functions to your existing auth.ts file

export type TokenValidationResponse = {
  valid: boolean;
  email?: string;
  userId?: number;
  fullName?: string;
  roles?: string[];
};

// Get stored authentication data
export function getStoredAuth(): AuthResponse | null {
  try {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    const tokenType = localStorage.getItem("tokenType") || "Bearer";
    const userStr = localStorage.getItem("user");
    
    if (!accessToken || !userStr) return null;
    
    const user = JSON.parse(userStr);
    return {
      accessToken,
      refreshToken: refreshToken || "",
      tokenType,
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      roles: user.roles || []
    };
  } catch (error) {
    console.error('Error getting stored auth:', error);
    return null;
  }
}

// Validate current token with your backend
export async function validateToken(token: string): Promise<TokenValidationResponse> {
  try {
    // Using FormData as your backend expects form data
    const formData = new FormData();
    formData.append('token', token);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const res = await fetch(`${API_BASE}/api/validate/token`, {
      method: "POST",
      body: formData, // Don't set Content-Type, let browser set it for FormData
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { valid: false };
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false };
  }
}

// Refresh token using your backend endpoint
export async function refreshToken(): Promise<AuthResponse> {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    // Your backend expects refreshToken as query parameter
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const res = await fetch(`${API_BASE}/api/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`, {
      method: "POST",
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = (data && (data.message || data.error)) || `Token refresh failed: ${res.status}`;
      throw new Error(message);
    }

    // Update stored tokens
    storeAuth(data);
    return data as AuthResponse;
  } catch (error) {
    // Clear invalid tokens
    clearAuth();
    throw error;
  }
}

// Check authentication status on app load
export async function checkAuthStatus(): Promise<{ isAuthenticated: boolean; user: any | null }> {
  const storedAuth = getStoredAuth();

  if (!storedAuth) {
    return { isAuthenticated: false, user: null };
  }

  // If no API base URL configured, skip server validation
  if (!API_BASE) {
    return {
      isAuthenticated: true, // Assume valid if stored and no API check
      user: {
        userId: storedAuth.userId,
        fullName: storedAuth.fullName,
        email: storedAuth.email,
        roles: storedAuth.roles
      }
    };
  }
  
  try {
    // Add overall timeout for auth check
    const authCheckPromise = (async () => {
      // First validate current token
      const validation = await validateToken(storedAuth.accessToken);
    
    if (validation.valid) {
      return {
        isAuthenticated: true,
        user: {
          userId: storedAuth.userId,
          fullName: storedAuth.fullName,
          email: storedAuth.email,
          roles: storedAuth.roles
        }
      };
    } else {
      // Try to refresh token
      try {
        const newAuth = await refreshToken();
        return {
          isAuthenticated: true,
          user: {
            userId: newAuth.userId,
            fullName: newAuth.fullName,
            email: newAuth.email,
            roles: newAuth.roles
          }
        };
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        return { isAuthenticated: false, user: null };
      }
    }
    })();

    // Race against a timeout
    const timeoutPromise = new Promise<{ isAuthenticated: boolean; user: any | null }>((resolve) => {
      setTimeout(() => {
        console.log('Auth check timed out, using stored auth');
        resolve({
          isAuthenticated: true, // Assume valid if stored
          user: {
            userId: storedAuth.userId,
            fullName: storedAuth.fullName,
            email: storedAuth.email,
            roles: storedAuth.roles
          }
        });
      }, 3000); // 3 second overall timeout
    });

    return await Promise.race([authCheckPromise, timeoutPromise]);
  } catch (error) {
    console.error('Auth status check failed:', error);
    // Even on error, return stored auth to avoid blocking
    return {
      isAuthenticated: true,
      user: {
        userId: storedAuth.userId,
        fullName: storedAuth.fullName,
        email: storedAuth.email,
        roles: storedAuth.roles
      }
    };
  }
}

// Clear authentication data
export function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("tokenType");
  localStorage.removeItem("user");
}

// Get current user info
export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

// Get current access token
export function getAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

export function storeAuth(auth: AuthResponse) {
  localStorage.setItem("accessToken", auth.accessToken);
  localStorage.setItem("refreshToken", auth.refreshToken);
  localStorage.setItem("tokenType", auth.tokenType);
  localStorage.setItem("user", JSON.stringify({
    userId: auth.userId,
    fullName: auth.fullName,
    email: auth.email,
    roles: auth.roles,
  }));
}