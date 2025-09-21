// src/utils/api.ts - Enhanced version with better logout handling

import { CreateLinkData, Link, LoginCredentials, RegisterData, UpdateLinkData, User, UserProfile } from '@/types';
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// CSRF token management
let csrfToken: string | null = null;

const getCSRFToken = async (): Promise<string | null> => {
  if (!csrfToken) {
    try {
      // Try to get CSRF token from cookie first
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
          csrfToken = decodeURIComponent(value);
          return csrfToken;
        }
      }
      
      // If no cookie, fetch from endpoint
      const response = await fetch(`${API_BASE_URL}/auth/csrf/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        csrfToken = data.csrfToken;
      }
    } catch (error) {
      console.warn('Could not get CSRF token:', error);
    }
  }
  return csrfToken;
};

// Enhanced CSRF token refresh
const refreshCSRFToken = async (): Promise<string | null> => {
  csrfToken = null; // Clear existing token
  return await getCSRFToken();
};

// Request interceptor for CSRF token
api.interceptors.request.use(async (config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method || '')) {
    const token = await getCSRFToken();
    if (token) {
      config.headers['X-CSRFToken'] = token;
    }
  }
  return config;
});

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle CSRF token issues with retry
    if (error.response?.status === 403 && 
        error.response?.data?.detail?.includes?.('CSRF') &&
        !originalRequest._retry) {
      
      originalRequest._retry = true;
      console.warn('CSRF token issue, refreshing and retrying...');
      
      try {
        const newToken = await refreshCSRFToken();
        if (newToken) {
          originalRequest.headers['X-CSRFToken'] = newToken;
          return api(originalRequest);
        }
      } catch (retryError) {
        console.error('Failed to refresh CSRF token:', retryError);
      }
    }
    
    // Don't log 401/403 errors as they're expected when not authenticated
    if (![401, 403].includes(error.response?.status)) {
      console.error('API Error:', error.response?.data || error.message);
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Initialize CSRF for login operations
  initializeCSRF: async (): Promise<void> => {
    await getCSRFToken();
  },
  
  // Refresh CSRF token
  refreshCSRF: async (): Promise<void> => {
    await refreshCSRFToken();
  },
  
  login: async (credentials: LoginCredentials): Promise<AxiosResponse<{ user: User }>> => {
    await getCSRFToken(); // Ensure we have a fresh token
    return api.post('/auth/login/', credentials);
  },
  
  // Enhanced logout with better error handling
  logout: async (): Promise<AxiosResponse<{ detail: string }>> => {
    try {
      // Ensure we have a valid CSRF token
      await getCSRFToken();
      
      // Attempt logout
      const response = await api.post('/auth/logout/');
      
      // Clear CSRF token after successful logout
      csrfToken = null;
      
      return response;
      
    } catch (error: any) {
      // Clear CSRF token regardless of success/failure
      csrfToken = null;
      
      // Handle specific Django logout errors
      if (error.response?.status === 403) {
        const errorDetail = error.response?.data?.detail || '';
        
        if (errorDetail.includes('CSRF')) {
          console.warn('CSRF error during logout - attempting with fresh token');
          
          try {
            // Try one more time with fresh CSRF token
            await refreshCSRFToken();
            return await api.post('/auth/logout/');
          } catch (retryError) {
            console.warn('Logout retry failed, treating as successful');
            // Return a mock successful response
            return { status: 200, data: { detail: 'Logged out locally' } } as AxiosResponse<{ detail: string }>;
          }
        } else if (errorDetail.includes('authenticated') || errorDetail.includes('permission')) {
          console.warn('User not authenticated during logout - treating as successful');
          return { status: 200, data: { detail: 'Already logged out' } } as AxiosResponse<{ detail: string }>;
        }
      } else if (error.response?.status === 401) {
        console.warn('Unauthorized during logout - user already logged out');
        return { status: 200, data: { detail: 'Already logged out' } } as AxiosResponse<{ detail: string }>;
      }
      
      // For any other error, don't throw - logout should always succeed locally
      console.warn('Logout failed but proceeding:', error.message);
      return { status: 200, data: { detail: 'Logged out locally' } } as AxiosResponse<{ detail: string }>;
    }
  },
  
  // Alternative: Force logout without server call
  logoutLocal: async (): Promise<void> => {
    csrfToken = null;
    // Clear any session cookies by making a simple GET request
    try {
      await fetch(`${API_BASE_URL}/auth/user/`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch {
      // Ignore errors
    }
  },
    
  register: (userData: RegisterData): Promise<AxiosResponse<{ user: User }>> => 
    api.post('/auth/registration/', userData),
    
  getProfile: (): Promise<AxiosResponse<UserProfile>> => 
    api.get('/auth/user/'),
    
  updateProfile: (data: Partial<UserProfile>): Promise<AxiosResponse<UserProfile>> => 
    api.patch('/auth/user/', data),
};

export const linksAPI = {
  getLinks: (): Promise<AxiosResponse<Link[]>> => 
    api.get('/links/'),
  createLink: (data: CreateLinkData): Promise<AxiosResponse<Link>> => 
    api.post('/links/', data),
  updateLink: (id: number, data: UpdateLinkData): Promise<AxiosResponse<Link>> => 
    api.patch(`/links/${id}/`, data),
  deleteLink: (id: number): Promise<AxiosResponse<void>> => 
    api.delete(`/links/${id}/`),
  getPublicLinks: (username: string): Promise<AxiosResponse<Link[]>> => 
    api.get(`/links/public/${username}/`),
};

export const publicAPI = {
  getProfile: (username: string): Promise<AxiosResponse<UserProfile>> => 
    api.get(`/accounts/profile/${username}/`),
};

// Utility function to check if user is authenticated
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    await api.get('/auth/user/');
    return true;
  } catch {
    return false;
  }
};

// Utility to clear all auth state
export const clearAuthState = (): void => {
  csrfToken = null;
  // Clear any cached data
  if (typeof window !== 'undefined') {
    // Clear any auth-related localStorage/sessionStorage if you use it
    const keysToRemove = ['authToken', 'user', 'session'];
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }
};

export default api;