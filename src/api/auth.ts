// Simple auth API client
// Uses Vite env var VITE_AUTH_API_BASE_URL (preferred) or VITE_API_BASE_URL as fallback

export type SignInRequest = {
  email: string;
  password: string;
};

export type SignUpRequest = {
  fullName: string;
  email: string;
  password: string;
  roles: string[]; // e.g., ["USER"]
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string; // e.g., "Bearer"
  userId: number;
  fullName: string;
  email: string;
  roles: string[];
};

const VITE_ENV: any = (import.meta as any).env || {};
const API_BASE = VITE_ENV.VITE_AUTH_API_BASE_URL || VITE_ENV.VITE_API_BASE_URL || ""; // e.g., http://localhost:8084

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