import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { AuthContextType } from '@/types/auth.types';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

// Safe hook that doesn't throw
export const useSafeAuthContext = (): AuthContextType | null => {
  console.log('[useSafeAuthContext] Called from component');
  
  try {
    const context = useContext(AuthContext);
    console.log('[useSafeAuthContext] Raw context:', context);
    
    if (!context) {
      console.warn('[AuthContext] Context not found, returning null. This usually means the component is not wrapped by AuthProvider.');
      return null;
    }
    
    console.log('[useSafeAuthContext] Context found successfully:', {
      isAuthenticated: context.isAuthenticated,
      isLoading: context.isLoading,
      hasUser: !!context.user
    });
    
    return context;
  } catch (error) {
    console.error('[AuthContext] Error accessing context:', error);
    return null;
  }
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log('[AuthProvider] Rendering with children:', !!children);
  
  const auth = useAuth();
  
  // Add debug logging for initial render
  useEffect(() => {
    console.log('[AuthProvider] Initial mount - Auth state:', {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      hasUser: !!auth.user,
      error: auth.error
    });
  }, []);

  // Add debug logging for state changes
  useEffect(() => {
    console.log('[AuthProvider] Auth state updated:', {
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      hasUser: !!auth.user,
      error: auth.error,
      timestamp: new Date().toISOString()
    });
  }, [auth.isAuthenticated, auth.isLoading, auth.user, auth.error]);

  // Ensure we always provide a value
  if (!auth) {
    console.error('[AuthProvider] useAuth returned null or undefined!');
    return null;
  }

  console.log('[AuthProvider] Rendering Provider with auth value');

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
