import keycloakService from '../services/keycloak'

const BASE_URL = import.meta.env.VITE_API_URL
let logoutPending = false;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!BASE_URL) {
    console.error('❌ VITE_API_URL is not defined.');
    throw new Error('Configuration API manquante.');
  }

  const method = options.method || 'POST'
  const headers = new Headers(options.headers)
  
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  headers.set('x-source', 'E') // E for Extranet (Client)

  if (keycloakService.getAuthenticated()) {
    // Proactively refresh token if about to expire
    await keycloakService.updateToken(70)
    const token = keycloakService.getToken() || ''
    headers.set('Authorization', `Bearer ${token}`)
  }

  let url = `${BASE_URL.replace(/\/$/, '')}${endpoint}`
  let requestOptions: RequestInit = { ...options, method, headers }

  if (method === 'GET' && options.body) {
    try {
      const bodyObj = JSON.parse(options.body as string)
      const params = new URLSearchParams()
      Object.keys(bodyObj).forEach(key => {
        if (bodyObj[key] !== undefined && bodyObj[key] !== null) {
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
  if (contentType && contentType.includes('application/json')) {
    result = await response.json().catch(() => ({ error: true, message: 'Erreur de lecture JSON' }))
  } else {
    const text = await response.text()
    result = { error: true, message: text || `Erreur serveur (${response.status})` }
  }

  if (!response.ok || result?.error || result?.success === false) {
    throw new Error(result?.message || result?.error || 'Erreur serveur inconnue')
  }

  if (Array.isArray(result)) return result as any;
  if (result?.success && 'data' in result) return result.data;
  return result as any;
}

export const api = {
  data: {
    getUserInfo: () => request<any>('/auth/me', { method: 'GET' }),
    getPolices: () => request<any[]>('/data/polices', { method: 'GET' }),
    getRisques: (policeId: number) => request<any[]>('/data/risques', { method: 'GET', body: JSON.stringify({ policeId }) }),
    getSinistres: (policeId: number) => request<any[]>('/data/sinistres', { method: 'GET', body: JSON.stringify({ policeId }) }),
    getSinistresEnCours: (policeId: number) => request<any[]>('/data/sinistres/en-cours', { method: 'GET', body: JSON.stringify({ policeId }) }),
    getQuittances: (policeId: number) => request<any[]>('/data/quittances', { method: 'GET', body: JSON.stringify({ policeId }) }),
    getImpayes: (policeId?: number) => request<any[]>('/data/quittances/impayes', { method: 'GET', body: JSON.stringify({ policeId: policeId || '' }) }),
    getStatsByPolice: (policeId: number) => request<any>('/data/stats/police', { method: 'GET', body: JSON.stringify({ policeId }) }),
    getAdherents: (policeId: number) => request<any[]>('/data/adherents', { method: 'GET', body: JSON.stringify({ policeId }) }),
    getGaranties: (risqueId: number) => request<any[]>('/data/garanties', { method: 'GET', body: JSON.stringify({ risqueId }) }),
    getPersACharge: (adherentId: number) => request<any[]>('/data/adherents/famille', { method: 'GET', body: JSON.stringify({ adherentId }) }),
    getStats: () => request<any[]>('/data/stats', { method: 'GET' }),
    getReclamations: () => request<any[]>('/reclamations/list', { method: 'POST' }),
    getMessages: (reclamationId: string | number) => request<any[]>('/reclamations/detail', { method: 'POST', body: JSON.stringify({ reclamationId }) }),
    createReclamation: (body: any) => request<any>('/reclamations/create', { method: 'POST', body: JSON.stringify(body) }),
    sendMessage: (reclamationId: string | number, body: any) => request<any>('/reclamations/add-message', { method: 'POST', body: JSON.stringify({ ...body, reclamationId }) }),
    updateStatut: (reclamationId: string | number, statut: string) => request<any>('/reclamations/update-statut', { method: 'POST', body: JSON.stringify({ reclamationId, statut }) }),
    deleteMessage: (messageId: number, reclamationId: number) => request<any>('/reclamations/delete-message', { method: 'POST', body: JSON.stringify({ messageId, reclamationId }) })
  }
}