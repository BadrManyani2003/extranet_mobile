import keycloak from '../services/keycloak'

const BASE_URL = import.meta.env.VITE_API_URL
let logoutPending = false;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!BASE_URL) {
    console.error('❌ VITE_API_URL is not defined in environment variables.');
    throw new Error('Configuration API manquante.');
  }

  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  headers.set('x-source', 'A') // A for Admin

  if (keycloak.getAuthenticated()) {
    // Force token refresh if it's about to expire (within 70s)
    await keycloak.updateToken(70)
    const token = keycloak.getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let url = `${BASE_URL.replace(/\/$/, '')}${endpoint}`
  
  if (options.method === 'GET' && options.body) {
    try {
      const params = JSON.parse(options.body as string)
      const queryString = new URLSearchParams(params).toString()
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
    result = await response.json().catch(() => ({ error: true, message: 'Erreur de lecture JSON' }))
  } else {
    const text = await response.text()
    result = { error: true, message: text || `Erreur serveur (${response.status})` }
  }

  if (!response.ok || result?.error || result?.success === false) {
    throw new Error(result?.message || result?.error || 'Erreur serveur inconnue')
  }

  // Handle different response formats (Direct array, or {success, data})
  if (Array.isArray(result)) return result as any;
  if (result?.success && 'data' in result) return result.data;
  
  return result as any;
}

export const api = {
  data: {
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
    sendMessage: (reclamationId: string | number, body: any) => request<any>('/reclamations/add-message', { method: 'POST', body: JSON.stringify({ ...body, reclamationId }) })
  },
  
  admin: {
    getMe: () => request<any>('/auth/me', { method: 'GET' }),
    getUsers: (filters = {}) => request<any[]>('/admin/users', { method: 'POST', body: JSON.stringify(filters) }),
    saveUser: (user: any) => request<any>('/admin/users/save', { method: 'POST', body: JSON.stringify(user) }),
    deleteUser: (userId: number) => request<any>('/admin/users/delete', { method: 'POST', body: JSON.stringify({ userId }) }),
    syncKeycloak: (id: number) => request<any>('/admin/users/sync-keycloak', { method: 'POST', body: JSON.stringify({ id }) }),
    getClients: (filters = {}) => request<any[]>('/admin/clients', { method: 'POST', body: JSON.stringify(filters) }),
    createUserFromClient: (clientId: number) => request<any>('/admin/clients/create-user', { method: 'POST', body: JSON.stringify({ clientId }) }),
    linkUserToClient: (clientId: number, targetUserId: number) => request<any>('/admin/clients/link-user', { method: 'POST', body: JSON.stringify({ clientId, targetUserId }) }),
    getAdherents: (filters = {}) => request<any[]>('/admin/adherents', { method: 'POST', body: JSON.stringify(filters) }),
    createUserFromAdherent: (adherentId: number) => request<any>('/admin/adherents/create-user', { method: 'POST', body: JSON.stringify({ adherentId }) }),
    linkUserToAdherent: (adherentId: number, targetUserId: number) => request<any>('/admin/adherents/link-user', { method: 'POST', body: JSON.stringify({ adherentId, targetUserId }) }),
    getReclamations: () => request<any[]>('/reclamations/list', { method: 'POST' }),
    replyToReclamation: (reclamationId: string | number, message: string) => request<any>('/reclamations/add-message', { method: 'POST', body: JSON.stringify({ reclamationId, message, nature: 'A' }) }),
    updateStatus: (reclamationId: string | number, statut: string) => request<any>('/reclamations/update-statut', { method: 'POST', body: JSON.stringify({ reclamationId, statut }) }),
    deleteMessage: (messageId: number, reclamationId: number) => request<any>('/reclamations/delete-message', { method: 'POST', body: JSON.stringify({ messageId, reclamationId }) }),
    getRoles: () => request<any[]>('/admin/roles', { method: 'GET' }),
    updateUserRoles: (targetUserId: number, authId: string, roles: any[]) => request<any>('/admin/users/roles', { method: 'POST', body: JSON.stringify({ targetUserId, authId, roles }) })
  }
}