import keycloak from '../services/keycloak'

const BASE_URL = import.meta.env.VITE_API_URL
let logoutPending = false;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  headers.set('x-source', 'A')

  if (keycloak.getAuthenticated()) {
    await keycloak.updateToken(70)
    const token = keycloak.getToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  let url = `${BASE_URL}${endpoint}`
  if (options.method === 'GET' && options.body) {
    const params = JSON.parse(options.body as string)
    const queryString = new URLSearchParams(params).toString()
    if (queryString) url += `?${queryString}`
    delete options.body
  }

  const response = await fetch(url, { ...options, headers })
  
  if (response.status === 429) {
    throw new Error('Trop de requêtes. Veuillez patienter quelques minutes.')
  }

  if (response.status === 401 || response.status === 403) {
    if (!logoutPending) {
      logoutPending = true;
      setTimeout(() => {
        keycloak.logout()
      }, 7000)
    }
    throw new Error('Session expirée ou accès refusé. Déconnexion dans 7 secondes.')
  }

  const contentType = response.headers.get('content-type')
  let result: any
  if (contentType && contentType.includes('application/json')) {
    result = await response.json().catch(() => ({ error: true, message: 'JSON Parse Error' }))
  } else {
    const text = await response.text()
    result = { error: true, message: text || 'Server Error' }
  }

  if (!response.ok || result?.error || result?.success === false) {
    throw new Error(result?.message || 'Server Error')
  }

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