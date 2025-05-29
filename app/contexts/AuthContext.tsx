'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { authAPI } from '@/app/utils/auth-client';
import type { UserRole } from '@/app/lib/auth-service';

interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: UserRole;
  isOnboarded?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, otp: string, userType?: 'seller' | 'buyer') => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check if user has a specific role
  const hasRole = useCallback((role: UserRole) => {
    if (!user) return false;
    return user.role === role || user.role === 'master';
  }, [user]);

  // Check if user can access based on required roles
  const canAccess = useCallback((requiredRoles: UserRole[]) => {
    if (!user) return false;
    if (user.role === 'master') return true;
    return requiredRoles.includes(user.role);
  }, [user]);

  // Initialize auth state - simplified for demo
  useEffect(() => {
    const initAuth = async () => {
      try {
        // For demo, just check if we have a token in localStorage
        const token = localStorage.getItem('accessToken');
        if (token) {
          // Create a demo user based on stored data
          const demoUser: User = {
            id: 'demo-user-id',
            phone: '9876543210',
            name: 'Demo User',
            role: 'seller',
            isOnboarded: false
          };
          setUser(demoUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (phone: string, otp: string, userType?: 'seller' | 'buyer') => {
    try {
      setLoading(true);
      const response = await authAPI.verifyOTP(phone, otp);
      
      if (response.user) {
        const authUser = response.user;
        // Convert AuthUser to User format with required role
        const user: User = {
          id: authUser.id,
          phone: authUser.phone,
          name: authUser.name,
          email: authUser.email,
          role: authUser.role || 'buyer', // Default to buyer if no role
          isOnboarded: authUser.isOnboarded
        };
        
        setUser(user);
        
        // Redirect based on role
        if (user.role === 'master') {
          router.push('/master');
        } else if (user.role === 'admin') {
          router.push('/admin');
        } else if (user.role === 'seller') {
          if (user.isOnboarded) {
            router.push('/dashboard');
          } else {
            router.push('/seller/onboard');
          }
        } else {
          // Buyer - redirect to previous page or home
          const from = new URLSearchParams(window.location.search).get('from');
          router.push(from || '/');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await authAPI.logout();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local state
      setUser(null);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  // Refresh auth state
  const refreshAuth = async () => {
    try {
      const response = await authAPI.refreshToken();
      if (response.user) {
        const authUser = response.user;
        const user: User = {
          id: authUser.id,
          phone: authUser.phone,
          name: authUser.name,
          email: authUser.email,
          role: authUser.role || 'buyer',
          isOnboarded: authUser.isOnboarded
        };
        setUser(user);
      }
    } catch (error) {
      console.error('Auth refresh error:', error);
      setUser(null);
      throw error;
    }
  };

  // Auto-refresh token before expiry - disabled for demo
  // useEffect(() => {
  //   if (!isAuthenticated) return;
  //   const interval = setInterval(() => {
  //     refreshAuth().catch(() => logout());
  //   }, 10 * 60 * 1000);
  //   return () => clearInterval(interval);
  // }, [isAuthenticated]);

  // Route protection - disabled, handled by middleware
  // useEffect(() => {
  //   // Route protection logic moved to middleware
  // }, [pathname, loading, isAuthenticated, user, router, canAccess]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshAuth,
        isAuthenticated,
        hasRole,
        canAccess,
      }}
    >
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

// HOC for protecting components
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requiredRoles?: UserRole[]
) {
  return function AuthenticatedComponent(props: P) {
    const { user, loading, canAccess } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.push('/login');
        } else if (requiredRoles && !canAccess(requiredRoles)) {
          router.push('/');
        }
      }
    }, [user, loading, router]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    if (!user || (requiredRoles && !canAccess(requiredRoles))) {
      return null;
    }

    return <Component {...props} />;
  };
}