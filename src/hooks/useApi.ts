'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useCartStore } from '@/lib/store';
import { toast } from 'sonner';
import type {
  Category,
  CartItem,
  Order,
  Payment,
  ProductFilters,
  CartItemCreate,
  OrderCreate,
  PaymentInitiateRequest,
} from '@/types';

// ============================================
// PRODUCTS
// ============================================

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const { data } = await api.products.list(filters);
      return data;
    },
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data } = await api.products.get(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.products.create(formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
    },
    onError: () => {
      toast.error('Failed to create product');
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }: { id: number; formData: FormData }) => {
      const { data } = await api.products.update(id, formData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully');
    },
    onError: () => {
      toast.error('Failed to update product');
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.products.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete product');
    },
  });
}

// ============================================
// CATEGORIES
// ============================================

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.categories.list();
      return data as Category[];
    },
  });
}

export function useCategory(id: number) {
  return useQuery({
    queryKey: ['categories', id],
    queryFn: async () => {
      const { data } = await api.categories.get(id);
      return data;
    },
    enabled: !!id,
  });
}

// ============================================
// CART
// ============================================

export function useCart() {
  const setItems = useCartStore((state) => state.setItems);

  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      try {
        const { data } = await api.cart.list();
        const items = Array.isArray(data) ? data : data.results || [];
        console.log('Cart items fetched:', items); // Debug log
        setItems(items);
        return items as CartItem[];
      } catch (error) {
        console.error('Failed to fetch cart:', error);
        return [];
      }
    },
    retry: 1,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  return useMutation({
    mutationFn: async (data: CartItemCreate) => {
      const { data: cartItem } = await api.cart.add(data);
      return cartItem;
    },
    onSuccess: (cartItem: CartItem) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      addItem(cartItem);
      openCart(); // Automatically open cart when item is added
      toast.success('Added to cart');
    },
    onError: (error: unknown) => {
      console.error('Add to cart error:', error);
      const errorMessage = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to add to cart';
      toast.error(errorMessage);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const updateItem = useCartStore((state) => state.updateItem);

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      const { data } = await api.cart.update(id, { quantity });
      return data;
    },
    onSuccess: (data: CartItem) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      updateItem(data.id, data.quantity);
      toast.success('Cart updated');
    },
    onError: () => {
      toast.error('Failed to update cart');
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const removeItem = useCartStore((state) => state.removeItem);

  return useMutation({
    mutationFn: async (id: number) => {
      await api.cart.remove(id);
      return id;
    },
    onSuccess: (id: number) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      removeItem(id);
      toast.success('Removed from cart');
    },
    onError: () => {
      toast.error('Failed to remove from cart');
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: async () => {
      // Get current cart items first
      const { data } = await api.cart.list();
      const items = Array.isArray(data) ? data : data.results || [];
      
      // Remove each item individually if clear endpoint doesn't exist
      await Promise.all(items.map((item: CartItem) => api.cart.remove(item.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      clearCart();
      toast.success('Cart cleared');
    },
    onError: (error: unknown) => {
      console.error('Clear cart error:', error);
      toast.error('Failed to clear cart');
    },
  });
}

// ============================================
// ORDERS
// ============================================

export function useOrders() {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.orders.list();
      return Array.isArray(data) ? data : data.results || [];
    },
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data } = await api.orders.get(id);
      return data as Order;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OrderCreate) => {
      const { data: order } = await api.orders.createFromCart(data);
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Order created successfully');
    },
    onError: () => {
      toast.error('Failed to create order');
    },
  });
}

// ============================================
// PAYMENTS
// ============================================

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const { data } = await api.payments.list();
      return Array.isArray(data) ? data : data.results || [];
    },
  });
}

export function usePayment(id: number) {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: async () => {
      const { data } = await api.payments.get(id);
      return data as Payment;
    },
    enabled: !!id,
  });
}

export function useInitiatePayment() {
  return useMutation({
    mutationFn: async (data: PaymentInitiateRequest) => {
      const { gateway, order_id, ...rest } = data;
      const response = await api.payments.initiate({ method: gateway, order_id, ...rest });
      return response.data;
    },
    onError: () => {
      toast.error('Failed to initiate payment');
    },
  });
}

export function useSubmitOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      items: Array<{ product: number; quantity: number }>;
      shipping_address: string;
      shipping_city: string;
      shipping_postal_code: string;
      shipping_country: string;
    }) => {
      const { data: result } = await api.orders.submit(data);
      return result as { order_id: number; total: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: unknown) => {
      console.error('Order submit error:', error);
      toast.error('Failed to create order');
    },
  });
}
