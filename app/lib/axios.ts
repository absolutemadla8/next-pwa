// src/lib/axios.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const TOKEN_KEY = 'auth_token';

// Create base axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
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

// Use a flag to ensure we only show one error at a time
let isShowingError = false;
// Use a debounce timer to reset the flag
let errorResetTimeout: NodeJS.Timeout | null = null;

// Dynamic import function for the store - memoize to prevent multiple imports
let bottomSheetStorePromise: Promise<any> | null = null;
const getBottomSheetStore = () => {
  if (typeof window === 'undefined') {
    return Promise.resolve(null);
  }
  
  if (!bottomSheetStorePromise) {
    bottomSheetStorePromise = import('../store/bottomSheetStore')
      .then(module => module.default)
      .catch(err => {
        console.error('Failed to load bottom sheet store:', err);
        bottomSheetStorePromise = null;
        return null;
      });
  }
  
  return bottomSheetStorePromise;
};

// Response interceptor for handling common errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Don't process AbortError as they're intentional cancellations
    if (error.name === 'AbortError' || axios.isCancel(error)) {
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;
    
    // Check if this might be a CORS preflight issue (network error without response)
    // We'll silently reject these without showing error UI to handle potential preflight cancellations
    if (!error.response && error.message && 
        (error.message.includes('Network Error') || error.message.includes('preflight'))) {
      console.warn('Possible CORS preflight issue:', error.message);
      return Promise.reject(error);
    }
    
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
    
    // Only show error bottom sheet for API errors with actual responses
    // This prevents showing errors for preflight issues or network problems
    if (typeof window !== 'undefined' && !isShowingError && error.response) {
      try {
        isShowingError = true;
        
        // Reset the flag after a delay
        if (errorResetTimeout) {
          clearTimeout(errorResetTimeout);
        }
        errorResetTimeout = setTimeout(() => {
          isShowingError = false;
        }, 2000); // Prevent showing another error for 2 seconds
        
        const bottomSheetStore = await getBottomSheetStore();
        if (bottomSheetStore) {
          const errorData = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            details: error.response?.data?.details || error.response?.data?.error || '',
            code: error.response?.status || error.code || ''
          };
          
          bottomSheetStore.showError(errorData);
        }
      } catch (e) {
        console.error('Failed to show error bottom sheet:', e);
        isShowingError = false;
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

// Helper functions for common request types - allowing signals to be passed through
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