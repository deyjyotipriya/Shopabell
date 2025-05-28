import axios from 'axios';
import type { 
  SendOTPRequest, 
  SendOTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse
} from '@/app/types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Create axios instance with default config
const authClient = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
authClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth client functions
export const authAPI = {
  async sendOTP(phone: string): Promise<SendOTPResponse> {
    const { data } = await authClient.post<SendOTPResponse>('/send-otp', {
      phone,
    } as SendOTPRequest);
    return data;
  },

  async verifyOTP(phone: string, otp: string): Promise<VerifyOTPResponse> {
    const { data } = await authClient.post<VerifyOTPResponse>('/verify-otp', {
      phone,
      otp,
    } as VerifyOTPRequest);
    
    // Store tokens
    if (data.tokens) {
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
    }
    
    return data;
  },

  async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const { data } = await authClient.post<RefreshTokenResponse>('/refresh', {
      refreshToken,
    } as RefreshTokenRequest);
    
    // Update tokens
    if (data.tokens) {
      localStorage.setItem('accessToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
    }
    
    return data;
  },

  async logout(): Promise<LogoutResponse> {
    const { data } = await authClient.post<LogoutResponse>('/logout');
    
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    return data;
  },

  // Helper to get current auth status
  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },

  // Helper to get auth headers
  getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// Auto refresh token on 401 responses
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await authAPI.refreshToken();
        // Retry original request with new token
        const token = localStorage.getItem('accessToken');
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return authClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);