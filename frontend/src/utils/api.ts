// src/utils/api.ts - Fixed version with proper CSRF handling

import axios, { AxiosResponse } from 'axios';
import { CreateLinkData, Link, LoginCredentials, RegisterData, UpdateLinkData, User, UserProfile } from '@/types';

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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle CSRF token issues
    if (error.response?.status === 403 && 
        error.response?.data?.detail?.includes?.('CSRF')) {
      // Clear the token and try to get a fresh one
      csrfToken = null;
      console.warn('CSRF token issue, will retry with fresh token');
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
  
  login: async (credentials: LoginCredentials): Promise<AxiosResponse<{ user: User }>> => {
    await getCSRFToken(); // Ensure we have a fresh token
    return api.post('/auth/login/', credentials);
  },
  
  logout: (): Promise<AxiosResponse<{ detail: string }>> => 
    api.post('/auth/logout/'),
    
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

export default api;