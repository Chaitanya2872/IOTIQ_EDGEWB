// src/api/config.ts
import axios from 'axios';

// Base URL for your Spring Boot backend
// For Vite, use import.meta.env instead of process.env
export const BASE_URL = import.meta.env.VITE_API_IOT_BASE_URL || 'http://localhost:85/api';

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;