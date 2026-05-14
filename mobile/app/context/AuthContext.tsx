import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { jwtDecode } from 'jwt-decode';
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
  telephone?: string;
  role?: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  source: 'ADHERENT' | 'CLIENT' | 'EXPERT' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (userData: User, userToken: string, userSource: 'ADHERENT' | 'CLIENT' | 'EXPERT') => Promise<void>;
  logout: (shouldRedirect?: boolean) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [source, setSource] = useState<'ADHERENT' | 'CLIENT' | 'EXPERT' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Appelé après une authentification Keycloak réussie ───────
  const signin = useCallback(async (
    userData: User,
    userToken: string,
    userSource: 'ADHERENT' | 'CLIENT' | 'EXPERT'
  ) => {
    console.log("[AuthContext] Signin initiated for:", userData.email);
    // Stockage du token : SecureStore sur mobile, AsyncStorage sur Web
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem('token', userToken);
    } else {
      await SecureStore.setItemAsync('token', userToken);
    }

    // Les infos non sensibles restent dans AsyncStorage
    await Promise.all([
      AsyncStorage.setItem('user', JSON.stringify(userData)),
      AsyncStorage.setItem('user_source', userSource),
    ]);

    setUser(userData);
    setToken(userToken);
    setSource(userSource);
    console.log("[AuthContext] Signin complete. State updated.");

    // Récupérer immédiatement les données de la base de données
    try {
      const freshUser = await authAPI.me();
      setUser(prev => prev ? ({ ...prev, ...freshUser }) : null);
      console.log("[AuthContext] Database profile loaded.");
    } catch (err) {
      console.warn("[AuthContext] Failed to load database profile:", err);
    }
  }, []);

  const logout = useCallback(async (shouldRedirect: boolean = true) => {
    try {
      setUser(null);
      setToken(null);
      setSource(null);

      const tasks = [
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('user_source'),
        AsyncStorage.removeItem('token'), // Toujours nettoyer AsyncStorage par sécurité
      ];

      if (Platform.OS !== 'web') {
        tasks.push(SecureStore.deleteItemAsync('token'));
      }

      await Promise.all(tasks);
      console.log("[AuthContext] Local storage cleared.");

      if (shouldRedirect) {
        const logoutUrl = `${keycloakDiscovery.endSessionEndpoint}?client_id=${keycloakConfig.clientId}&post_logout_redirect_uri=${encodeURIComponent(keycloakConfig.redirectUri)}`;
        WebBrowser.openAuthSessionAsync(logoutUrl, keycloakConfig.redirectUri);
      }
    } catch (e) {
      console.error("[AuthContext] Logout error:", e);
    }
  }, [token, user]);

  // ── Restaurer la session persistée au démarrage de l'app ──────
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
          const user = JSON.parse(savedUser);
          const source = savedSource as 'ADHERENT' | 'CLIENT' | 'EXPERT';

          setToken(savedToken);
          setUser(user);
          setSource(source);
          
          // Libérer l'écran de chargement dès qu'on a les jetons locaux
          setIsLoading(false);

          try {
            const freshUser = await authAPI.me();
            setUser(prev => prev ? ({ ...prev, ...freshUser }) : null);
          } catch (err) {
            console.warn("Background user refresh failed:", err);
            // On ne déconnecte pas forcément ici si le token est encore valide localement
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
  }, []); // Run only once on mount

  // ── Gérer l'événement non autorisé depuis l'API ───────────────
  useEffect(() => {
    const handleUnauthorized = () => {
      console.log("[AuthContext] Unauthorized event received. Logging out...");
      logout(false);
    };
    authEvents.on('unauthorized', handleUnauthorized);
    return () => {
      authEvents.off('unauthorized', handleUnauthorized);
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
