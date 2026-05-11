import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginResponse, Police, Quittance, Sinistre, SinReglement } from '../types';

// ============================================================
// Configuration de base de l'API
// ============================================================
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// ============================================================
// Utilitaires
// ============================================================

/** Récupère le token stocké */
async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('token');
}

/** Récupère la source stockée (ADHERENT ou CLIENT) */
async function getSource(): Promise<string> {
  return (await AsyncStorage.getItem('user_source')) || 'CLIENT';
}

/** Crée les headers avec le token d'authentification */
async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  const source = await getSource();
  return {
    ...defaultHeaders,
    'Authorization': `Bearer ${token}`,
    'x-source': source,
  };
}

/** Helper pour faire les requêtes POST authentifiées */
async function authPost<T>(endpoint: string, body: Record<string, unknown> = {}): Promise<T> {
  const headers = await authHeaders();
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || data.error || `Erreur serveur (${response.status})`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Impossible de contacter le serveur. Vérifiez votre connexion.");
  }
}

// ============================================================
// Auth API
// ============================================================
export const authAPI = {
  /** Connexion : email/username + password → retourne user + token */
  login: async (identifier: string, password: string): Promise<{ success: boolean; message: string; access_token?: string; refresh_token?: string; user?: any }> => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify({ username: identifier, password }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Erreur de connexion');
    }
    return {
      success: result.success,
      message: result.message,
      access_token: result.access_token,
      refresh_token: result.refresh_token,
      user: result.user,
    };
  },

  /** Récupérer les infos de l'utilisateur connecté */
  me: async (): Promise<any> => {
    const headers = await authHeaders();
    const response = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Erreur');
    return result;
  },

  /** Déconnexion */
  logout: async (login: string): Promise<void> => {
    // Le backend n'a pas forcément de route logout si c'est du pur JWT/Keycloak géré côté client
    // Mais on peut appeler une route si elle existe
  },
};

// ============================================================
// Polices (Contrats) API
// ============================================================
export const policesAPI = {
  getAll: async (filters?: {
    num_police?: string;
    souscripteur?: string;
    compagnie?: string;
  }): Promise<Police[]> => {
    return authPost<Police[]>('/data/polices', {
      num_police: filters?.num_police || null,
      souscripteur: filters?.souscripteur || null,
      compagnie: filters?.compagnie || null,
    });
  },
};

// ============================================================
// Quittances API
// ============================================================
export const quittancesAPI = {
  getAll: async (policeId?: number): Promise<Quittance[]> => {
    return authPost<Quittance[]>('/data/quittances', {
      policeId: policeId || null,
    });
  },

  getImpayees: async (policeId?: number): Promise<Quittance[]> => {
    return authPost<Quittance[]>('/data/quittances/impayes', {
      policeId: policeId || null,
      enCour: 'O'
    });
  },
};

// ============================================================
// Sinistres API
// ============================================================
export const sinistresAPI = {
  getAll: async (policeId?: number): Promise<Sinistre[]> => {
    return authPost<Sinistre[]>('/data/sinistres', {
      policeId: policeId || null,
    });
  },

  getEnCours: async (policeId?: number): Promise<Sinistre[]> => {
    return authPost<Sinistre[]>('/data/sinistres/en-cours', {
      policeId: policeId || null,
    });
  },
};

// ============================================================
// Adhérents API
// ============================================================
export const adherentsAPI = {
  getAll: async (policeId?: number): Promise<any[]> => {
    return authPost<any[]>('/data/adherents', {
      policeId: policeId || null,
    });
  },

  getFamille: async (adherentId: number): Promise<any[]> => {
    return authPost<any[]>('/data/adherents/famille', {
      adherentId,
    });
  },
};

