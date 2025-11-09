import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const NEXT_PUBLIC_ADMIN_URL = 'http://localhost:8000/admin';

export const apiClient = axios.create({
  baseURL: NEXT_PUBLIC_ADMIN_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for HttpOnly cookies
});

const api = {
     auth: {
        login: (credentials: { username: string; password: string }) =>
          apiClient.post('/login/', credentials),
        
        register: (data: {
          username: string;
          email: string;
          password: string;
          first_name?: string;
          last_name?: string;
        }) => apiClient.post('/register/', data),

        logout: () => apiClient.post('/logout/'),

        getProfile: () => apiClient.get('/profile/'),
    }
}

export default api;