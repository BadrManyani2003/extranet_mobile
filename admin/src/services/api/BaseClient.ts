import keycloak from '../keycloak'

const BASE_URL = import.meta.env.VITE_API_URL
let logoutPending = false;

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!BASE_URL) {
    console.error('❌ VITE_API_URL is not defined in environment variables.');
    throw new Error('Configuration API manquante.');
  }

  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  headers.set('x-source', 'A') // A pour Admin

  if (keycloak.getAuthenticated()) {
    await keycloak.updateToken(70)
    const token = keycloak.getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let url = `${BASE_URL.replace(/\/$/, '')}${endpoint}`
  
  if (options.method === 'GET' && options.body) {
    try {
      const params = JSON.parse(options.body as string)
      const filteredParams: any = {};
      Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') filteredParams[k] = v;
      });
      const queryString = new URLSearchParams(filteredParams).toString()
      if (queryString) url += `?${queryString}`
      delete options.body
    } catch (e) {
      console.warn('Failed to parse GET body as JSON params', e)
    }
  }

  const response = await fetch(url, { ...options, headers })
  
  if (response.status === 429) {
    throw new Error('Trop de requêtes. Veuillez patienter quelques minutes.')
  }

  if (response.status === 401 || response.status === 403) {
    if (!logoutPending) {
      logoutPending = true;
      setTimeout(() => keycloak.logout(), 5000)
    }
    throw new Error('Session expirée ou accès refusé. Déconnexion automatique...')
  }

  const contentType = response.headers.get('content-type')
  let result: any
  
  if (contentType && contentType.includes('application/json')) {
    result = await response.json().catch(() => ({ success: false, message: 'Erreur de lecture JSON' }))
  } else {
    const text = await response.text()
    result = { success: false, message: text || `Erreur serveur (${response.status})` }
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || 'Erreur serveur inconnue')
  }

  // Si le serveur renvoie notre nouveau format { success: true, data: ... }
  if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
      return result.data as T;
  }

  // Solution de repli pour les anciennes réponses de type tableau
  return result as T;
}
