// src/providers/AuthProvider.tsx
'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuthStore, initializeAuth, setupAuthInterceptors } from '../store/authStore';
import { useRouter, usePathname } from 'next/navigation';

// Define protected routes and public routes
const PROTECTED_ROUTES = ['/trippy'];
const AUTH_ROUTES = ['/login', '/verify'];

interface AuthProviderProps {
  children: ReactNode;
}

// Setup context for components that need auth but don't want to use the store directly
const AuthContext = createContext<ReturnType<typeof useAuthStore> | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { authenticated } = useAuthStore();

  // Setup axios interceptors
  useEffect(() => {
    setupAuthInterceptors();
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    const init = async () => {
      await initializeAuth();
    };
    init();
  }, []);

  // Route protection
  useEffect(() => {
    // Skip if auth state is still loading
    if (authenticated === null) return;

    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname === route || pathname?.startsWith(route + '/')
    );
    
    const isAuthRoute = AUTH_ROUTES.some(route => 
      pathname === route || pathname?.startsWith(route + '/')
    );

    if (isProtectedRoute && !authenticated) {
      router.push('/login');
    } else if (isAuthRoute && authenticated) {
      router.push('/trippy');
    }
  }, [authenticated, pathname, router]);

  // Provide the store to all children
  return (
    <AuthContext.Provider value={useAuthStore()}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};