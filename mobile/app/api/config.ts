import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Police, Quittance, Sinistre, SinReglement } from '../types';

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
    'x-source': 'M',
  };
}

/** Helper générique pour les requêtes API */
async function apiRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
  body: any = null
): Promise<T> {
  const headers = await authHeaders();
  const url = new URL(`${BASE_URL}${endpoint}`);
  
  const options: RequestInit = {
    method,
    headers,
  };

  if (method === 'GET' && body) {
    Object.keys(body).forEach(key => {
      if (body[key] !== null && body[key] !== undefined) {
        url.searchParams.append(key, String(body[key]));
      }
    });
  } else if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url.toString(), options);
    
    // Si la réponse est vide (204 No Content)
    if (response.status === 204) return {} as T;

    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const errorMsg = data.message || data.error || `Erreur serveur (${response.status})`;
      // Debug log for developer
      console.error(`[API Error] ${method} ${endpoint}:`, response.status, data);
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
  /** Récupérer les infos de l'utilisateur connecté (depuis le JWT Keycloak) */
  me: async (): Promise<any> => {
    return apiRequest<any>('/auth/me', 'GET');
  },

  /** Déconnexion locale */
  logout: async (): Promise<void> => {
    // Géré côté AuthContext
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
    // On passe en GET car c'est une récupération de données
    return apiRequest<Police[]>('/data/polices', 'GET', {
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
    return apiRequest<Quittance[]>('/data/quittances', 'GET', {
      policeId: policeId || null,
    });
  },

  getImpayees: async (policeId?: number): Promise<Quittance[]> => {
    return apiRequest<Quittance[]>('/data/quittances/impayes', 'GET', {
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
    return apiRequest<Sinistre[]>('/data/sinistres', 'GET', {
      policeId: policeId || null,
    });
  },

  getEnCours: async (policeId?: number): Promise<Sinistre[]> => {
    return apiRequest<Sinistre[]>('/data/sinistres/en-cours', 'GET', {
      policeId: policeId || null,
    });
  },
};

// ============================================================
// Adhérents API
// ============================================================
export const adherentsAPI = {
  getAll: async (policeId?: number): Promise<any[]> => {
    return apiRequest<any[]>('/data/adherents', 'GET', {
      policeId: policeId || null,
    });
  },

  getFamille: async (adherentId: number): Promise<any[]> => {
    return apiRequest<any[]>('/data/adherents/famille', 'GET', {
      adherentId,
    });
  },
};


