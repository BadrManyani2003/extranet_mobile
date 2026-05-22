import keycloakService from '../keycloak'

const BASE_URL = import.meta.env.VITE_API_URL
let logoutPending = false;

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!BASE_URL) throw new Error('Configuration API manquante.');

  const method  = options.method || 'POST'
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  headers.set('x-source', 'E')

  if (keycloakService.getAuthenticated()) {
    await keycloakService.updateToken(70)
    const token = keycloakService.getToken() || ''
    headers.set('Authorization', `Bearer ${token}`)
  }

  let url = `${BASE_URL.replace(/\/$/, '')}${endpoint}`
  let requestOptions: RequestInit = { ...options, method, headers }

  if (method === 'GET' && options.body) {
    try {
      const bodyObj = JSON.parse(options.body as string)
      const params  = new URLSearchParams()
      Object.keys(bodyObj).forEach(key => {
        if (bodyObj[key] !== undefined && bodyObj[key] !== null && bodyObj[key] !== '') {
          params.append(key, bodyObj[key].toString())
        }
      })
      const queryString = params.toString()
      if (queryString) url += `?${queryString}`
      delete requestOptions.body
    } catch (e) {
      console.warn('Failed to parse GET body as JSON params', e)
    }
  }

  const response = await fetch(url, requestOptions)

  if (response.status === 429) {
    throw new Error('Trop de requêtes. Veuillez patienter quelques minutes.')
  }

  if (response.status === 401 || response.status === 403) {
    if (!logoutPending) {
      logoutPending = true;
      setTimeout(() => keycloakService.logout(), 5000)
    }
    throw new Error('Session expirée ou accès refusé. Déconnexion automatique...')
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
