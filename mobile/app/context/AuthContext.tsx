import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { authAPI } from '../api';
import { authEvents } from '../utils/events';
import { keycloakDiscovery, keycloakConfig } from '../utils/keycloak';

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
// AuthProvider — sessions basées sur les tokens Keycloak
// ============================================================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]     = useState<User | null>(null);
  const [token, setToken]   = useState<string | null>(null);
  const [source, setSource] = useState<'ADHERENT' | 'CLIENT' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Appelé après une authentification Keycloak réussie ───────
  const signin = useCallback(async (
    userData: User,
    userToken: string,
    userSource: 'ADHERENT' | 'CLIENT'
  ) => {
    // Le token est stocké de manière chiffrée
    await SecureStore.setItemAsync('token', userToken);
    
    // Les infos non sensibles restent dans AsyncStorage
    await Promise.all([
      AsyncStorage.setItem('user', JSON.stringify(userData)),
      AsyncStorage.setItem('user_source', userSource),
    ]);
    
    setUser(userData);
    setToken(userToken);
    setSource(userSource);
  }, []);

  const logout = useCallback(async () => {
    try {
      setUser(null);
      setToken(null);
      setSource(null);

      await Promise.all([
        SecureStore.deleteItemAsync('token'),
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('user_source'),
      ]);

      const logoutUrl = `${keycloakDiscovery.endSessionEndpoint}?client_id=${keycloakConfig.clientId}&post_logout_redirect_uri=${encodeURIComponent(keycloakConfig.redirectUri)}`;
      WebBrowser.openAuthSessionAsync(logoutUrl, keycloakConfig.redirectUri);
    } catch {
      // Ignorer les erreurs de déconnexion
    }
  }, []);

  // ── Restaurer la session persistée au démarrage de l'app ──────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('token');
        const [savedUser, savedSource] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('user_source'),
        ]);

        if (savedToken && savedUser) {
          const user = JSON.parse(savedUser);
          const source = savedSource as 'ADHERENT' | 'CLIENT';

          setToken(savedToken);
          setUser(user);
          setSource(source);

          try {
            const freshUser = await authAPI.me();
            setUser(prev => prev ? ({ ...prev, ...freshUser }) : null);
          } catch {
            logout();
          }
        }
      } catch {
        // Session invalide ou corrompue
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, [logout]);

  // ── Gérer l'événement non autorisé depuis l'API ───────────────
  useEffect(() => {
    let logoutTimer: NodeJS.Timeout;
    const handleUnauthorized = () => {
      if (!logoutTimer) {
        logoutTimer = setTimeout(() => logout(), 7000);
      }
    };
    authEvents.on('unauthorized', handleUnauthorized);
    return () => {
      authEvents.off('unauthorized', handleUnauthorized);
      if (logoutTimer) clearTimeout(logoutTimer);
    };
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
