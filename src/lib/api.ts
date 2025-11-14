import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  ProductCreatePayload,
  ProductUpdatePayload,
  OrderAdminCreatePayload,
  OrderAdminUpdatePayload,
  AdminUserCreatePayload,
  AdminUserUpdatePayload,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/';

/**
 * Main Axios instance with JWT token handling
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HttpOnly cookies
});

/**
 * Request interceptor to add access token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor to handle token refresh
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Check if this is an admin session (from cookie)
        const isAdmin = typeof document !== 'undefined' && document.cookie.includes('is_admin=true');
        
        // Use admin refresh endpoint if this is an admin session, otherwise use user refresh
        const refreshEndpoint = isAdmin ? `${API_BASE_URL}api/admin/refresh/` : `${API_BASE_URL}api/users/refresh/`;
        const { data } = await axios.post(refreshEndpoint, {
          refresh: refreshToken,
        });

        // Store new access token
        localStorage.setItem('access_token', data.access);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * API Endpoints organized by feature
 */
export const api = {
  // Authentication
  auth: {
    login: (credentials: { username: string; password: string }) =>
      apiClient.post('api/users/login/', credentials),
    // Admin auth hits dedicated API endpoint. Adds X-CSRFToken header if present.
    adminLogin: (credentials: { username: string; password: string }) => {
      let csrf: string | undefined;
      if (typeof document !== 'undefined') {
        csrf = document.cookie
          .split('; ')
          .find((row) => row.startsWith('csrftoken='))
          ?.split('=')[1];
      }
      return apiClient.post('api/admin/login/', credentials, {
        headers: csrf ? { 'X-CSRFToken': csrf } : undefined,
        withCredentials: true,
      });
    },
    
    register: (data: {
      username: string;
      email: string;
      password: string;
      first_name?: string;
      last_name?: string;
    }) => apiClient.post('api/users/register/', data),

    logout: () => apiClient.post('api/users/logout/'),

    getUsers: () => apiClient.get('api/users/'),

    getUser: (id: number) => apiClient.get(`api/users/${id}/`),

    createUser: (data: AdminUserCreatePayload) => apiClient.post('api/users/', data),

    updateUser: (id: number, data: AdminUserUpdatePayload) =>
      apiClient.patch(`api/users/${id}/`, data),

    deleteUser: (id: number) => apiClient.delete(`api/users/${id}/`),

    getProfile: () => apiClient.get('api/users/profile/'),

    updateProfile: (data: Partial<{
      first_name: string;
      last_name: string;
      email: string;
    }>) => apiClient.patch('api/users/profile/', data),
    
    refreshToken: (refresh: string) =>
      apiClient.post('api/users/token/refresh/', { refresh }),

  },

  // Admin-only API
  admin: {
    getProfile: () => apiClient.get('api/admin/profile/'),

    refreshToken: (refresh: string) =>
      apiClient.post('api/admin/refresh/', { refresh }),
  },

  // Products
  products: {
    list: (params?: {
      category?: number;
      search?: string;
      min_price?: number;
      max_price?: number;
      ordering?: string;
      page?: number;
    }) => apiClient.get('api/products/products/', { params }),

    get: (id: number) => apiClient.get(`api/products/products/${id}/`),

    create: (data: ProductCreatePayload) =>
      apiClient.post('api/products/products/', data),

    update: (id: number, data: ProductUpdatePayload) =>
      apiClient.patch(`api/products/products/${id}/`, data),

    delete: (id: number) => apiClient.delete(`api/products/products/${id}/`),
  },

  // Categories
  categories: {
    list: () => apiClient.get('api/products/categories/'),

    get: (id: number) => apiClient.get(`api/products/categories/${id}/`),

    create: (data: { name: string; description?: string }) =>
      apiClient.post('api/products/categories/', data),
    
    update: (id: number, data: Partial<{ name: string; description: string }>) =>
      apiClient.patch(`api/products/categories/${id}/`, data),

    delete: (id: number) => apiClient.delete(`api/products/categories/${id}/`),
  },

  // Cart
  cart: {
    list: () => apiClient.get('api/orders/cart/'),
    
    add: (data: { product: number; quantity: number }) =>
      apiClient.post('api/orders/cart/', data),

    update: (id: number, data: { quantity: number }) =>
      apiClient.patch(`api/orders/cart/${id}/`, data),

    remove: (id: number) => apiClient.delete(`api/orders/cart/${id}/`),

    clear: () => apiClient.delete('api/orders/cart/clear/'),
  },

  // Orders
  orders: {
    list: () => apiClient.get('api/orders/orders/'),
    
    get: (id: number) => apiClient.get(`api/orders/orders/${id}/`),
    
    adminCreate: (data: OrderAdminCreatePayload) =>
      apiClient.post('api/orders/orders/', data),

    adminUpdate: (id: number, data: OrderAdminUpdatePayload) =>
      apiClient.patch(`api/orders/orders/${id}/`, data),

    adminDelete: (id: number) => apiClient.delete(`api/orders/orders/${id}/`),
    
    // Legacy support for creating an order from the current cart
    createFromCart: (data: {
      shipping_address: string;
      shipping_city: string;
      shipping_postal_code: string;
      shipping_country: string;
    }) => apiClient.post('api/orders/create-from-cart/', data),
    
    submit: (data: {
      items: Array<{ product: number; quantity: number }>;
      shipping_address: string;
      shipping_city: string;
      shipping_postal_code: string;
      shipping_country: string;
    }) => apiClient.post('api/orders/submit/', data),
    
    cancel: (id: number) => apiClient.post(`api/orders/orders/${id}/cancel/`),
  },

  // Payments
  payments: {
    list: () => apiClient.get('api/payments/'),
    
    get: (id: number) => apiClient.get(`api/payments/${id}/`),
    
    // Unified initiate endpoint (expects { method, order_id })
    initiate: (data: {
      method: 'esewa' | 'khalti' | 'fonepay' | 'bank';
      order_id: number;
      return_url?: string;
      cancel_url?: string;
    }) => apiClient.post('api/payments/initiate/', data),
  },
};

export default api;
