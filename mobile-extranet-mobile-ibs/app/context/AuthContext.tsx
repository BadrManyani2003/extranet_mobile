import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api';
import { User } from '../types';

// ============================================================
// Types du contexte Auth
// ============================================================
interface AuthContextType {
  user: User | null;
  token: string | null;
  source: 'ADHERENT' | 'CLIENT' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (identifier: string, password: string, userSource: 'ADHERENT' | 'CLIENT') => Promise<{ success: boolean }>;
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
// AuthProvider
// ============================================================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [source, setSource] = useState<'ADHERENT' | 'CLIENT' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restaurer la session au démarrage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [savedToken, savedUser, savedSource] = await Promise.all([
          AsyncStorage.getItem('token'),
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('user_source'),
        ]);
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setSource(savedSource as 'ADHERENT' | 'CLIENT');
        }
      } catch {
        // Session invalide, ignorer
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const signin = useCallback(async (userData: User, userToken: string, userSource: 'ADHERENT' | 'CLIENT') => {
    // Sauvegarder en local pour persistance
    await Promise.all([
      AsyncStorage.setItem('token', userToken),
      AsyncStorage.setItem('user', JSON.stringify(userData)),
      AsyncStorage.setItem('user_source', userSource),
    ]);

    setUser(userData);
    setToken(userToken);
    setSource(userSource);
  }, []);

  const login = useCallback(async (identifier: string, password: string, userSource: 'ADHERENT' | 'CLIENT') => {
    // On doit d'abord s'assurer que le source est mis pour l'appel login si le backend en a besoin
    // Mais ici le login semble être global. Cependant, on le stocke pour les appels suivants.
    await AsyncStorage.setItem('user_source', userSource);
    
    const data = await authAPI.login(identifier, password);
    
    if (!data.user || !data.access_token) {
      throw new Error('Informations de session manquantes');
    }

    await signin(data.user, data.access_token, userSource);
    return { success: true };
  }, [signin]);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    setSource(null);
    
    try {
      await Promise.all([
        AsyncStorage.removeItem('token'),
        AsyncStorage.removeItem('user'),
        AsyncStorage.removeItem('user_source'),
      ]);
      
      if (user?.email && token) {
        await authAPI.logout(user.email);
      }
    } catch (err) {
      console.warn("Erreur mineure durant la déconnexion:", err);
    }
  }, [user, token]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      source,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      signin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

