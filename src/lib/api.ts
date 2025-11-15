import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  ProductCreatePayload,
  ProductUpdatePayload,
  OrderAdminCreatePayload,
  OrderAdminUpdatePayload,
  AdminUserCreatePayload,
  AdminUserUpdatePayload,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://evercart-backend.onrender.com';

/**
 * Axios instance for JWT-based API requests
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: attach JWT access token
 */
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor: auto-refresh token if 401
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const refreshEndpoint = `${API_BASE_URL}/api/users/token/refresh/`;
        const { data } = await axios.post(refreshEndpoint, { refresh: refreshToken });

        localStorage.setItem('access_token', data.access);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API methods
 */
export const api = {
  // JWT-auth endpoints
  auth: {
    login: (credentials: { username: string; password: string }) =>
      apiClient.post('/api/users/login/', credentials),
    register: (data: { username: string; email: string; password: string }) =>
      apiClient.post('/api/users/register/', data),
    refreshToken: (refresh: string) =>
      apiClient.post('/api/users/token/refresh/', { refresh }),
  },

  // Admin login (session + CSRF)
  admin: {
    login: (credentials: { username: string; password: string }) => {
      let csrf: string | undefined;
      if (typeof document !== 'undefined') {
        csrf = document.cookie
          .split('; ')
          .find((row) => row.startsWith('csrftoken='))
          ?.split('=')[1];
      }

      return axios.post(
        `${API_BASE_URL}/api/admin/login/`,
        credentials,
        {
          headers: csrf ? { 'X-CSRFToken': csrf } : undefined,
          withCredentials: true, // only for session login
        }
      );
    },
  },

  // Products
  products: {
    list: (params?: Record<string, unknown>) => apiClient.get('/api/products/products/', { params }),
    get: (id: number) => apiClient.get(`/api/products/products/${id}/`),
    create: (data: ProductCreatePayload) => apiClient.post('/api/products/products/', data),
    update: (id: number, data: ProductUpdatePayload) =>
      apiClient.patch(`/api/products/products/${id}/`, data),
    delete: (id: number) => apiClient.delete(`/api/products/products/${id}/`),
  },

  // Categories
  categories: {
    list: () => apiClient.get('/api/products/categories/'),
    create: (data: { name: string; description?: string }) =>
      apiClient.post('/api/products/categories/', data),
  },
  // Cart
  cart: {
    list: () => apiClient.get('/api/orders/cart/'),
    
    add: (data: { product: number; quantity: number }) =>
      apiClient.post('/api/orders/cart/', data),

    update: (id: number, data: { quantity: number }) =>
      apiClient.patch(`/api/orders/cart/${id}/`, data),

    remove: (id: number) => apiClient.delete(`/api/orders/cart/${id}/`),

    clear: () => apiClient.delete('/api/orders/cart/clear/'),
  },

  // Orders
  orders: {
    list: () => apiClient.get('/api/orders/orders/'),
    
    get: (id: number) => apiClient.get(`/api/orders/orders/${id}/`),
    
    adminCreate: (data: OrderAdminCreatePayload) =>
      apiClient.post('/api/orders/orders/', data),

    adminUpdate: (id: number, data: OrderAdminUpdatePayload) =>
      apiClient.patch(`/api/orders/orders/${id}/`, data),

    adminDelete: (id: number) => apiClient.delete(`/api/orders/orders/${id}/`),
    
    // Legacy support for creating an order from the current cart
    createFromCart: (data: {
      shipping_address: string;
      shipping_city: string;
      shipping_postal_code: string;
      shipping_country: string;
    }) => apiClient.post('/api/orders/create-from-cart/', data),
    
    submit: (data: {
      items: Array<{ product: number; quantity: number }>;
      shipping_address: string;
      shipping_city: string;
      shipping_postal_code: string;
      shipping_country: string;
      shipping_phone: string;
    }) => apiClient.post('/api/orders/submit/', data),
    
    cancel: (id: number) => apiClient.post(`/api/orders/orders/${id}/cancel/`),
  },

  // Payments
  payments: {
    list: () => apiClient.get('/api/payments/'),
    
    get: (id: number) => apiClient.get(`/api/payments/${id}/`),
    
    // Unified initiate endpoint (expects { method, order_id })
    initiate: (data: {
      method: 'esewa' | 'khalti' | 'fonepay' | 'bank';
      order_id: number;
      return_url?: string;
      cancel_url?: string;
    }) => apiClient.post('/api/payments/initiate/', data),
  },
};

export default api;
