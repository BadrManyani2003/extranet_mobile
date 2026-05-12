import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api';
import { authEvents } from '../utils/events';

// ============================================================
// Types
// ============================================================
export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role?: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  source: 'ADHERENT' | 'CLIENT' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (userData: User, userToken: string, userSource: 'ADHERENT' | 'CLIENT') => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};

// ============================================================
// AuthProvider — sessions backed by Keycloak tokens
// ============================================================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]     = useState<User | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [source, setSource] = useState<'ADHERENT' | 'CLIENT' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Called after successful Keycloak authentication ─────────
  const signin = useCallback(async (
    userData: User,
    userToken: string,
    userSource: 'ADHERENT' | 'CLIENT'
  ) => {
    await Promise.all([
      AsyncStorage.setItem('token', userToken),
      AsyncStorage.setItem('user', JSON.stringify(userData)),
      AsyncStorage.setItem('user_source', userSource),
    ]);
    setUser(userData);
    setToken(userToken);
    setSource(userSource);
  }, []);

  const logout = useCallback(async () => {
    console.log('🔄 Logout initiated...');
    try {
      // 1. Clear local state immediately for fast UI response
      setUser(null);
      setToken(null);
      setSource(null);

      // 2. Clear persisted data
      await Promise.all([
        AsyncStorage.removeItem('token'),
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('user_source'),
      ]);
      
      console.log('✅ Local session cleared successfully');
    } catch (err) {
      console.error('❌ Error during logout:', err);
    }
  }, []);

  // ── Restore persisted session on app start ──────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [savedToken, savedUser, savedSource] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('user_source'),
        ]);
        if (savedToken && savedUser) {
          const token = savedToken;
          const user = JSON.parse(savedUser);
          const source = savedSource as 'ADHERENT' | 'CLIENT';

          setToken(token);
          setUser(user);
          setSource(source);

          // Verify token with backend
          try {
            const freshUser = await authAPI.me();
            // Optional: update local user with fresh data from DB
            setUser(prev => ({ ...prev, ...freshUser }));
          } catch (err) {
            console.log('🔄 Token verification failed on startup:', err);
            // If it's a 401 (handled by interceptor) or other error, logout
            logout();
          }
        }
      } catch {
        // Session invalide ou corrompue — ignorer
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, [logout]);

  // ── Handle unauthorized event from API ──────────────────────
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log('⚠️ Unauthorized access detected, logging out...');
      logout();
    };
    authEvents.on('unauthorized', handleUnauthorized);
    return () => authEvents.off('unauthorized', handleUnauthorized);
  }, [logout]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      source,
      isAuthenticated: !!token && !!user,
      isLoading,
      signin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
