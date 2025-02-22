// src/lib/axios.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';

// Create base axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Request interceptor to add the auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from cookies
    const token = Cookies.get(TOKEN_KEY);
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // You could implement token refresh logic here
      // For now, just log the user out by removing the token
      Cookies.remove(TOKEN_KEY);
      
      // Redirect to login if on client side
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // Handle other common errors (500, 503, etc.)
    if (error.response?.status >= 500) {
      console.error('Server error:', error.response.status);
      // You could implement retry logic here
    }
    
    return Promise.reject(error);
  }
);

// Helper functions for common request types
export const api = {
  get: <T>(url: string, config = {}) => 
    axiosInstance.get<T>(url, config),
  
  post: <T>(url: string, data = {}, config = {}) => 
    axiosInstance.post<T>(url, data, config),
  
  put: <T>(url: string, data = {}, config = {}) => 
    axiosInstance.put<T>(url, data, config),
  
  patch: <T>(url: string, data = {}, config = {}) => 
    axiosInstance.patch<T>(url, data, config),
  
  delete: <T>(url: string, config = {}) => 
    axiosInstance.delete<T>(url, config),
};

export default axiosInstance;