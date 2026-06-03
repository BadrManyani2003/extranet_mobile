import keycloak from '../keycloak'

function getBaseUrl(): string {
  const baseUrl = (window as any).APP_ENV?.VITE_API_URL || import.meta.env.VITE_API_URL;
  if (!baseUrl) {
    throw new Error("La configuration de l'API (VITE_API_URL) est manquante dans l'environnement.");
  }
  return baseUrl;
}

let logoutPending = false;

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw new Error('Configuration API manquante.');
  }

  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  headers.set('x-source', 'A')

  if (keycloak.getAuthenticated()) {
    await keycloak.updateToken(70)
    const token = keycloak.getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let url = `${baseUrl.replace(/\/$/, '')}${endpoint}`

  if (options.method === 'GET' && options.body) {
    try {
      const params = JSON.parse(options.body as string)
      const filtered: Record<string, any> = {};
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') filtered[k] = v;
      });
      const queryString = new URLSearchParams(filtered).toString()
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
    const errorData = await response.json().catch(() => ({}));
    const serverMessage = errorData.message || 'Session expirée ou accès refusé.';

    if (!logoutPending) {
      logoutPending = true;
      setTimeout(() => keycloak.logout(), 5000)
    }
    throw new Error(serverMessage)
  }

  const contentType = response.headers.get('content-type')
  let result: any

  if (contentType?.includes('application/json')) {
    result = await response.json().catch(() => ({ success: false, message: 'Erreur de lecture JSON' }))
  } else {
    const text = await response.text()
    result = { success: false, message: text || `Erreur serveur (${response.status})` }
  }

  if (!response.ok || result?.success === false) {
    throw new Error(result?.message || 'Erreur serveur inconnue')
  }

  if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
    return result.data as T;
  }

  return result as T;
}
// Force reload for IDE TS Server
