// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

// Constants
export const API_URL = process.env.NEXT_PUBLIC_API_URL;
const TOKEN_KEY = 'auth_token';

// Types
interface User {
  id: number;
  phone_number: string;
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  authenticated: boolean | null;
  phoneNumber: string | null;
  user: User | null;
}

interface AuthStore extends AuthState {
  // Auth actions
  login: (phone_number: string) => Promise<any>;
  verifyOtp: (otp: string) => Promise<any>;
  resendOtp: () => Promise<any>;
  logout: () => Promise<void>;
  fetchUserInfo: () => Promise<any>;
  
  // Helper methods
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

// Create store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      token: null,
      authenticated: null,
      phoneNumber: null,
      user: null,

      // Actions
      login: async (phone_number: string) => {
        try {
          const response = await axios.post(`${API_URL}/auth/send-otp`, { phone_number });
          
          // Save phone number for OTP verification
          set({ phoneNumber: phone_number });
          
          return response.data;
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.error('Login error: ', error.response?.data || error.message);
            return { error: true, msg: error.response?.data?.message || 'Login failed' };
          } else {
            console.error('Login error: ', error);
            return { error: true, msg: 'An unexpected error occurred' };
          }
        }
      },

      verifyOtp: async (otp: string) => {
        try {
          const phoneNumber = get().phoneNumber;
          
          if (!phoneNumber) {
            throw new Error('Phone number is missing');
          }

          const response = await axios.post(`${API_URL}/auth/verify-otp`, {
            otp,
            phone_number: phoneNumber,
          });

          const { token, user } = response.data;
          
          if (!token) {
            throw new Error('Token is missing in the response');
          }

          // Set token in cookies for server-side access
          Cookies.set(TOKEN_KEY, token, { secure: true, sameSite: 'strict' });
          
          // Update axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Update state
          set({
            token,
            authenticated: true,
            user
          });

          return response.data;
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.error('OTP error: ', error.response?.data || error.message);
            return { error: true, msg: error.response?.data?.message || 'OTP verification failed' };
          } else {
            console.error('OTP error: ', error);
            return { error: true, msg: 'An unexpected error occurred' };
          }
        }
      },

      resendOtp: async () => {
        try {
          const phoneNumber = get().phoneNumber;
          
          if (!phoneNumber) {
            throw new Error('Phone number is missing');
          }

          const response = await axios.post(`${API_URL}/auth/send-otp`, {
            phone_number: phoneNumber,
          });
          
          return response.data;
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            console.error('Resend OTP error: ', error.response?.data || error.message);
            return { error: true, msg: error.response?.data?.message || 'Resend OTP failed' };
          } else {
            console.error('Resend OTP error: ', error);
            return { error: true, msg: 'An unexpected error occurred' };
          }
        }
      },

      logout: async () => {
        // Remove token from cookies
        Cookies.remove(TOKEN_KEY);
        
        // Clear auth headers
        axios.defaults.headers.common['Authorization'] = '';
        
        // Reset state
        set({
          token: null,
          authenticated: false,
          user: null,
        });
      },

      fetchUserInfo: async () => {
        try {
          const response = await axios.get(`${API_URL}/user`);
          const userData = response.data;
          
          set({ user: userData });
          
          return userData;
        } catch (error) {
          console.error('Fetch user info error: ', error);
          
          // Clear auth on error
          get().clearAuth();
          throw error;
        }
      },

      // Helper methods
      setToken: (token: string) => {
        Cookies.set(TOKEN_KEY, token, { secure: true, sameSite: 'strict' });
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ token, authenticated: true });
      },

      setUser: (user: User) => {
        set({ user });
      },

      clearAuth: () => {
        Cookies.remove(TOKEN_KEY);
        axios.defaults.headers.common['Authorization'] = '';
        set({
          token: null,
          authenticated: false,
          user: null,
        });
      }
    }),
    {
      name: 'auth-storage',
      // Only persist these fields
      partialize: (state) => ({
        token: state.token,
        authenticated: state.authenticated,
        phoneNumber: state.phoneNumber,
      }),
    }
  )
);

// Create Auth middleware for axios
export const setupAuthInterceptors = () => {
  // Response interceptor for handling 401 errors
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().clearAuth();
      }
      return Promise.reject(error);
    }
  );

  // Request interceptor to add token
  axios.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token || Cookies.get(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

// Hook for components
export function useAuth() {
  const router = useRouter();
  const authStore = useAuthStore();
  
  // Enhanced logout that handles navigation
  const logout = async () => {
    await authStore.logout();
    router.push('/login');
  };

  return {
    ...authStore,
    logout,
  };
}

// Initialize auth from server-side token on app load
export const initializeAuth = async () => {
  const token = Cookies.get(TOKEN_KEY);
  
  if (token) {
    try {
      useAuthStore.getState().setToken(token);
      await useAuthStore.getState().fetchUserInfo();
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  } else {
    useAuthStore.getState().clearAuth();
  }
};