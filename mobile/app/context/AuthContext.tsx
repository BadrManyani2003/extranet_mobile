import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../api';
import { authEvents } from '../utils/events';
import { keycloakDiscovery, keycloakConfig } from '../utils/keycloak';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  role?: string;
  roles?: string[];
  particulier?: string;
  Particulier?: string;
  Nature?: string;
  reclamation?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  source: 'ADHERENT' | 'CLIENT' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (userData: User, userToken: string, userSource: 'ADHERENT' | 'CLIENT') => Promise<any>;
  logout: (shouldRedirect?: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user,      setUser]      = useState<User | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [source,    setSource]    = useState<'ADHERENT' | 'CLIENT' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signin = useCallback(async (
    userData: User,
    userToken: string,
    userSource: 'ADHERENT' | 'CLIENT'
  ) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('token', userToken);
    } else {
      await SecureStore.setItemAsync('token', userToken);
    }

    await Promise.all([
      AsyncStorage.setItem('user', JSON.stringify(userData)),
      AsyncStorage.setItem('user_source', userSource),
    ]);

    let fullUser = userData;
    try {
      const freshUser = await authAPI.me();
      fullUser = { ...userData, ...freshUser };
    } catch (err) {
      console.warn("[AuthContext] Failed to load database profile during signin:", err);
    }

    const isAdherent    = (fullUser.roles || []).some(r => r.toUpperCase() === 'ADHERENT');
    const particulierVal = fullUser.particulier || fullUser.Particulier;
    const isParticulier = particulierVal?.toString().trim().toUpperCase() === 'O';

    if (!isAdherent && !isParticulier) {
      throw new Error("Accès refusé : Seuls les clients particuliers ou les adhérents sont autorisés sur l'application mobile.");
    }

    setToken(userToken);
    setSource(userSource);
    setUser(fullUser);

    return fullUser;
  }, []);

  const logout = useCallback(async (shouldRedirect: boolean = true) => {
    try {
      setUser(null);
      setToken(null);
      setSource(null);

      const tasks: Promise<any>[] = [
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('user_source'),
        AsyncStorage.removeItem('token'),
      ];

      if (Platform.OS !== 'web') {
        tasks.push(SecureStore.deleteItemAsync('token'));
      }

      await Promise.all(tasks);

      if (shouldRedirect) {
        const logoutUrl = `${keycloakDiscovery.endSessionEndpoint}?client_id=${keycloakConfig.clientId}&post_logout_redirect_uri=${encodeURIComponent(keycloakConfig.redirectUri)}`;
        WebBrowser.openAuthSessionAsync(logoutUrl, keycloakConfig.redirectUri);
      }
    } catch (e) {
      console.error("[AuthContext] Logout error:", e);
    }
  }, [token, user]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = Platform.OS === 'web'
          ? await AsyncStorage.getItem('token')
          : await SecureStore.getItemAsync('token');

        const [savedUser, savedSource] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('user_source'),
        ]);

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setSource(savedSource as 'ADHERENT' | 'CLIENT');
          setIsLoading(false);

          try {
            const freshUser = await authAPI.me();
            setUser(prev => prev ? ({ ...prev, ...freshUser }) : null);
          } catch (err) {
            console.warn("Background user refresh failed:", err);
          }
        } else {
          setIsLoading(false);
        }
      } catch (e) {
        console.error("Session restoration error:", e);
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => logout(false);
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
