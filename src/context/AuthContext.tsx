/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { User, LoginCredentials, RegisterData } from '@/types';
import { toast } from 'sonner';
import { useCartStore } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials, options?: { redirectTo?: string; adminOnly?: boolean }) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  const clearCartState = useCallback(() => {
    try {
      useCartStore.getState().clearCart();
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('evercart-storage');
      }
    } catch (error) {
      console.warn('Failed to clear cart state:', error);
    }
  }, []);

  /**
   * Fetch current user profile
   */
  const refreshUser = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setUser(null);
        setLoading(false);
        clearCartState();
        return;
      }

      // Check if this is an admin session
      const isAdmin = typeof window !== 'undefined' && localStorage.getItem('admin') === 'true';
      
      // Check if we already have user data in localStorage and can skip the profile fetch
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setLoading(false);
        // Optionally refresh profile in background, but don't block UX
        try {
          const { data } = await (api as any).auth.getProfile();
          // Only update if data changed
          if (JSON.stringify(data) !== JSON.stringify(parsedUser)) {
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
          }
        } catch (error) {
          console.warn('Background profile refresh failed:', error);
          // Don't clear user data on failure - they're already logged in
        }
        return;
      }

      // Try to fetch profile from appropriate endpoint - admin or user
      try {
        const response = isAdmin ? await (api as any).admin.getProfile() : await (api as any).auth.getProfile();
        const data = response.data;
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
      } catch (error) {
        console.warn('Profile endpoint not available:', error);
        // If profile fetch fails, fallback to stored user or clear state
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          setUser(null);
          clearCartState();
        }
      }
    } finally {
      setLoading(false);
    }
  }, [clearCartState]);

  /**
   * Login user
   */
  const login = async (credentials: LoginCredentials, options?: { redirectTo?: string; adminOnly?: boolean }) => {
    try {
      setLoading(true);
      const { data } = options?.adminOnly
        ? await (api as any).admin.login(credentials)
        : await api.auth.login(credentials);
      
      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      // Mirror tokens to cookies for middleware access (not HttpOnly)
      const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const cookieBase = `; path=/; SameSite=Lax${isSecure ? '; Secure' : ''}`;
      document.cookie = `access_token=${encodeURIComponent(data.access)}${cookieBase}`;
      document.cookie = `refresh_token=${encodeURIComponent(data.refresh)}${cookieBase}`;
      
      // Store user data if provided in login response
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        // Mirror admin flag to cookie for middleware
        const isAdmin = data.user.is_admin || data.user.is_staff || data.user.is_superuser;
        document.cookie = `is_admin=${isAdmin ? 'true' : 'false'}${cookieBase}`;
        try { localStorage.setItem('admin', isAdmin ? 'true' : 'false'); } catch {}
        if (options?.adminOnly && !isAdmin) {
          // Not an admin: clean up and block access
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          const expired = '; path=/; Max-Age=0';
          document.cookie = `access_token=${expired}`;
          document.cookie = `refresh_token=${expired}`;
          document.cookie = `is_admin=${expired}`;
          setUser(null);
          try { localStorage.removeItem('admin'); } catch {}
          toast.error('Admin access only. Please use an admin account.');
          throw new Error('AdminOnly');
        }
      } else {
        // Try to fetch user profile from appropriate endpoint
        try {
          // Use admin profile endpoint if admin login, otherwise use user endpoint
          const profileResponse = options?.adminOnly
            ? await (api as any).admin.getProfile()
            : await (api as any).auth.getProfile();
          const profileData = profileResponse.data;
          localStorage.setItem('user', JSON.stringify(profileData));
          setUser(profileData);
          const isAdmin = profileData?.is_admin || profileData?.is_staff || profileData?.is_superuser;
          document.cookie = `is_admin=${isAdmin ? 'true' : 'false'}${cookieBase}`;
          try { localStorage.setItem('admin', isAdmin ? 'true' : 'false'); } catch {}
          if (options?.adminOnly && !isAdmin) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            const expired = '; path=/; Max-Age=0';
            document.cookie = `access_token=${expired}`;
            document.cookie = `refresh_token=${expired}`;
            document.cookie = `is_admin=${expired}`;
            setUser(null);
            try { localStorage.removeItem('admin'); } catch {}
            toast.error('Admin access only. Please use an admin account.');
            throw new Error('AdminOnly');
          }
          if (data.user) {
            // We already handled this above, so just skip
          } else {
            // Create a basic user object from the credentials
            const basicUser = {
              username: credentials.username,
              id: 0, // Will be updated when profile is available
              email: '',
              first_name: '',
              last_name: '',
              is_customer: true,
              is_admin: false,
              is_staff: false,
              is_superuser: false,
              date_joined: new Date().toISOString(),
            };
            localStorage.setItem('user', JSON.stringify(basicUser));
            setUser(basicUser);
            document.cookie = `is_admin=false${cookieBase}`;
            try { localStorage.setItem('admin', 'false'); } catch {}
            if (options?.adminOnly) {
              // Enforce admin only: clear and block
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
              localStorage.removeItem('user');
              const expired = '; path=/; Max-Age=0';
              document.cookie = `access_token=${expired}`;
              document.cookie = `refresh_token=${expired}`;
              document.cookie = `is_admin=${expired}`;
              setUser(null);
              try { localStorage.removeItem('admin'); } catch {}
              toast.error('Admin access only. Please use an admin account.');
              throw new Error('AdminOnly');
            }
          }
        } catch (error) {
          console.warn('Profile fetch during login failed:', error);
          // Fallback to a basic user object when profile fetch fails
          const basicUser = {
            username: credentials.username,
            id: 0, // Will be updated when profile is available
            email: '',
            first_name: '',
            last_name: '',
            is_customer: true,
            is_admin: false,
            is_staff: false,
            is_superuser: false,
            date_joined: new Date().toISOString(),
          };
          localStorage.setItem('user', JSON.stringify(basicUser));
          setUser(basicUser);
          document.cookie = `is_admin=false${cookieBase}`;
          try { localStorage.setItem('admin', 'false'); } catch {}
          if (options?.adminOnly) {
            // Enforce admin only: clear and block
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            const expired = '; path=/; Max-Age=0';
            document.cookie = `access_token=${expired}`;
            document.cookie = `refresh_token=${expired}`;
            document.cookie = `is_admin=${expired}`;
            setUser(null);
            try { localStorage.removeItem('admin'); } catch {}
            toast.error('Admin access only. Please use an admin account.');
            throw new Error('AdminOnly');
          }
        }
      }
      
      toast.success('Welcome back!');
      router.push(options?.redirectTo ?? '/');
    } catch (error: unknown) {
      console.error('Login failed:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const message = (error as any).response?.data?.detail || 'Login failed. Please check your credentials.';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      await api.auth.register(data);
      
      // Auto-login after registration
      await login({
        username: data.username,
        password: data.password,
      });
      
      toast.success('Account created successfully!');
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors = (error as any).response?.data;
      
      if (errors) {
        // Display specific field errors
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Object.entries(errors).forEach(([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            messages.forEach((msg) => toast.error(`${field}: ${msg}`));
          }
        });
      } else {
        toast.error('Registration failed. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await (api as any).auth.logout?.();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear ALL auth-related data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
  // Clear cookies
      const expired = '; path=/; Max-Age=0';
      document.cookie = `access_token=${expired}`;
      document.cookie = `refresh_token=${expired}`;
      document.cookie = `is_admin=${expired}`;
  try { localStorage.removeItem('admin'); } catch {}
      setUser(null);
    clearCartState();
      toast.success('Logged out successfully');
      try {
        const current = typeof window !== 'undefined' ? window.location.pathname : '';
        if (current.startsWith('/admin')) {
          router.push('/admin/login');
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      }
    }
  };

  // Load user on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
