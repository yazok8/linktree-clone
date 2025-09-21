// hooks/useAuthGuard.ts
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface UseAuthGuardOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export const useAuthGuard = (options: UseAuthGuardOptions = {}) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { redirectTo = '/', requireAuth = true } = options;

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Redirect to homepage which will show the auth modal
        router.push(redirectTo);
      } else if (!requireAuth && user) {
        // User is logged in but trying to access auth pages
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, redirectTo, requireAuth]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    shouldShowContent: requireAuth ? !!user : !user
  };
};