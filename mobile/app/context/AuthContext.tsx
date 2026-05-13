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
  login: () => void;
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
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // ── Configuration Expo AuthSession ──────────────────────────
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    keycloakConfig,
    keycloakDiscovery
  );

  // ── Appelé après une authentification Keycloak réussie ───────
  const signin = useCallback(async (
    userData: User,
    userToken: string,
    userSource: 'ADHERENT' | 'CLIENT' | 'EXPERT'
  ) => {
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
  }, []);

  const logout = useCallback(async (shouldRedirect: boolean = true) => {
    try {
      setUser(null);
      setToken(null);
      setSource(null);

      const tasks = [
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('user_source'),
      ];

      if (Platform.OS === 'web') {
        tasks.push(AsyncStorage.removeItem('token'));
      } else {
        tasks.push(SecureStore.deleteItemAsync('token'));
      }

      await Promise.all(tasks);

      if (shouldRedirect) {
        const logoutUrl = `${keycloakDiscovery.endSessionEndpoint}?client_id=${keycloakConfig.clientId}&post_logout_redirect_uri=${encodeURIComponent(keycloakConfig.redirectUri)}`;
        WebBrowser.openAuthSessionAsync(logoutUrl, keycloakConfig.redirectUri);
      }
    } catch {
      // Ignorer les erreurs de déconnexion
    }
  }, []);

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

          try {
            const freshUser = await authAPI.me();
            setUser(prev => prev ? ({ ...prev, ...freshUser }) : null);
          } catch {
            logout(false);
          }
        }
      } catch (e) {
        console.error("Session restoration error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, [logout]);

  // ── Gérer la réponse Keycloak ───────────────────────────────
  useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;

      const exchangeCode = async () => {
        setIsAuthenticating(true);
        try {
          const tokenResult = await AuthSession.exchangeCodeAsync(
            {
              clientId: keycloakConfig.clientId,
              code,
              redirectUri: keycloakConfig.redirectUri,
              extraParams: { code_verifier: request?.codeVerifier || '' },
            },
            keycloakDiscovery
          );

          const accessToken = tokenResult.accessToken;
          const decoded: any = jwtDecode(accessToken);

          const realmRoles: string[] = decoded.realm_access?.roles || [];
          const clientRoles: string[] = decoded.resource_access?.[keycloakConfig.clientId]?.roles || [];
          const roles = [...new Set([...realmRoles, ...clientRoles])];

          const isAdherent = roles.some(r => r.toUpperCase() === 'ADHERENT');
          const isClient = roles.some(r => r.toUpperCase() === 'CLIENT');
          const isExpert = roles.some(r => r.toUpperCase() === 'EXPERT');

          if (!isAdherent && !isClient && !isExpert) {
            alert("Accès non autorisé.");
            return;
          }

          let userSource: 'ADHERENT' | 'CLIENT' | 'EXPERT' = 'ADHERENT';
          if (isExpert) userSource = 'EXPERT';
          else if (isClient) userSource = 'CLIENT';
          const userData = {
            id: decoded.sub,
            email: decoded.email || '',
            nom: decoded.family_name || '',
            prenom: decoded.given_name || '',
            roles,
          };

          await signin(userData, accessToken, userSource);
        } catch (error) {
          console.error("Keycloak exchange error:", error);
        } finally {
          setIsAuthenticating(false);
        }
      };

      exchangeCode();
    }
  }, [response, request, signin]);

  // ── Gérer l'événement non autorisé depuis l'API ───────────────
  useEffect(() => {
    let logoutTimer: NodeJS.Timeout;
    const handleUnauthorized = () => {
      if (!logoutTimer) {
        // Déconnexion sans redirection automatique après expiration (évite blocage popup)
        logoutTimer = setTimeout(() => logout(false), 7000);
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
      login: () => promptAsync(),
    }}>
      {children}
    </AuthContext.Provider>
  );
};
