'use client';

import { LoginCredentials, RegisterData, UserProfile } from '@/types';
import { authAPI } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await authAPI.getProfile();
        setUser(res.data);
      } catch (error: any) {
        // Silently handle authentication errors - user just isn't logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      await authAPI.login(credentials);
      // Get user profile after successful login
      const profileRes = await authAPI.getProfile();
      setUser(profileRes.data);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authAPI.register(data);
      // After registration, automatically log them in with username and password1
      await login({ username: data.username, password: data.password1 });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Ensure we have CSRF token before logout
      await authAPI.initializeCSRF();
      
      // Attempt server-side logout
      await authAPI.logout();
      console.log('Server logout successful');
      
    } catch (error: any) {
      console.warn('Server logout failed:', error);
      
      // Handle different error scenarios gracefully
      if (error?.response?.status === 403) {
        const errorMessage = error?.response?.data?.detail || '';
        
        if (errorMessage.includes('CSRF')) {
          console.warn('CSRF token issue during logout - this is common');
        } else if (errorMessage.includes('credentials')) {
          console.warn('Session expired during logout - proceeding with local logout');
        } else {
          console.warn('403 Forbidden during logout - likely session/auth issue');
        }
      } else if (error?.response?.status === 401) {
        console.warn('Authentication failed during logout - user already logged out');
      } else if (error?.code === 'NETWORK_ERROR' || !error?.response) {
        console.warn('Network error during logout - proceeding with local logout');
      } else {
        console.error('Unexpected logout error:', error);
      }
      
      // Continue with local logout regardless of server response
    } finally {
      // Always perform local cleanup
      performLocalLogout();
    }
  };

  const performLocalLogout = () => {
    // Clear any stored tokens (if you're using them)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      
      // Clear any other auth-related storage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('auth_') || key.startsWith('token_')) {
          localStorage.removeItem(key);
        }
      });
    }
    
    // Clear user state
    setUser(null);
    
    // Navigate to login
    router.push('/login');
  };

  // Emergency logout function (client-side only)
  const forceLogout = () => {
    console.warn('Performing force logout (client-side only)');
    performLocalLogout();
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}