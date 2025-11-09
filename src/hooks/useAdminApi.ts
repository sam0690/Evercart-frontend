'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type {
  User,
  Product,
  Order,
  OrderAdminCreatePayload,
  OrderAdminUpdatePayload,
  AdminUserCreatePayload,
  AdminUserUpdatePayload,
} from '@/types';

/**
 * Admin-specific hooks for fetching statistics and data
 */

// ============================================
// ADMIN STATISTICS
// ============================================

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  usersChange: string;
  productsChange: string;
  ordersChange: string;
  revenueChange: string;
}

/**
 * Fetch admin dashboard statistics
 * This aggregates data from multiple endpoints
 */
export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      // Fetch all required data in parallel
      const [productsRes, ordersRes] = await Promise.all([
        api.products.list(),
        api.orders.list(),
      ]);

      const products = Array.isArray(productsRes.data)
        ? productsRes.data
        : productsRes.data?.results || [];
      
      const orders = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : ordersRes.data?.results || [];

      // Calculate total revenue
      const totalRevenue = orders.reduce((sum: number, order: Order) => {
        return sum + parseFloat(order.total || '0');
      }, 0);

      // For now, use mock change percentages since we don't have historical data
      const stats: AdminStats = {
        totalUsers: 10, // This would come from a proper users list endpoint
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue,
        usersChange: '+12%',
        productsChange: '+8%',
        ordersChange: '+23%',
        revenueChange: '+15%',
      };

      return stats;
    },
    staleTime: 60000, // Cache for 1 minute
    refetchOnWindowFocus: false,
  });
}

// ============================================
// ADMIN USERS
// ============================================

/**
 * Fetch all users (admin only)
 * Note: Backend needs to provide a users list endpoint
 */
export function useAdminUsers() {
  return useQuery<User[]>({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data } = await api.auth.getUsers();
      return Array.isArray(data) ? data : data?.results || [];
    },
    staleTime: 30000,
  });
}

export function useAdminUser(userId?: number) {
  return useQuery<User>({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      if (typeof userId !== 'number' || Number.isNaN(userId)) {
        throw new Error('Invalid user id');
      }
      const { data } = await api.auth.getUser(userId);
      return data as User;
    },
    enabled: typeof userId === 'number' && !Number.isNaN(userId),
    staleTime: 30000,
  });
}

// ============================================
// ADMIN PRODUCTS
// ============================================

/**
 * Fetch all products for admin management
 */
export function useAdminProducts(searchQuery?: string) {
  return useQuery<Product[]>({
    queryKey: ['admin', 'products', searchQuery],
    queryFn: async () => {
      const { data } = await api.products.list({
        search: searchQuery,
      });
      
      return Array.isArray(data) ? data : data?.results || [];
    },
    staleTime: 30000,
  });
}

// ============================================
// ADMIN ORDERS
// ============================================

/**
 * Fetch all orders for admin management
 */
export function useAdminOrders(status?: string) {
  return useQuery<Order[]>({
    queryKey: ['admin', 'orders', status],
    queryFn: async () => {
      const { data } = await api.orders.list();
      let orders = Array.isArray(data) ? data : data?.results || [];
      console.log('Fetched orders:', orders);
      
      // Filter by status if provided
      if (status && status !== 'all') {
        orders = orders.filter((order: Order) => order.status === status);
      }
      
      // Sort by most recent first
      orders.sort((a: Order, b: Order) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      return orders;
    },
    staleTime: 15000, // Refresh more frequently for orders
  });
}

export function useAdminCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderAdminCreatePayload) => api.orders.adminCreate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}

export function useAdminUpdateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: OrderAdminUpdatePayload }) =>
      api.orders.adminUpdate(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}

export function useAdminDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.orders.adminDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
  });
}

export function useAdminCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminUserCreatePayload) => api.auth.createUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useAdminUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminUserUpdatePayload }) =>
      api.auth.updateUser(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', variables.id] });
    },
  });
}

export function useAdminDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.auth.deleteUser(id),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
    },
  });
}

/**
 * Fetch recent orders for dashboard
 */
export function useRecentOrders(limit: number = 5) {
  return useQuery<Order[]>({
    queryKey: ['admin', 'recent-orders', limit],
    queryFn: async () => {
      const { data } = await api.orders.list();
      let orders = Array.isArray(data) ? data : data?.results || [];
      
      // Sort by most recent and limit
      orders = orders
        .sort((a: Order, b: Order) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, limit);
      
      return orders;
    },
    staleTime: 15000,
  });
}

const adminHooks = {
  useAdminStats,
  useAdminUsers,
  useAdminProducts,
  useAdminOrders,
  useRecentOrders,
  useAdminCreateOrder,
  useAdminUpdateOrder,
  useAdminDeleteOrder,
  useAdminUser,
  useAdminCreateUser,
  useAdminUpdateUser,
  useAdminDeleteUser,
};

export default adminHooks;
