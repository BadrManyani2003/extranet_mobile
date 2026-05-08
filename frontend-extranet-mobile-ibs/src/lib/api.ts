import keycloak from '../services/keycloak'

const BASE_URL = import.meta.env.VITE_API_URL

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || 'POST'
  const headers = new Headers(options.headers)
  
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  
  let body = {}
  if (options.body) {
    try {
      body = JSON.parse(options.body as string)
    } catch (e) {
      body = {}
    }
  }

  if (keycloak.authenticated) {
    await keycloak.updateToken(70)
    const token = keycloak.token || ''
    
    headers.set('Authorization', `Bearer ${token}`)
    headers.set('x-source', 'E')
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { 
    ...options, 
    method,
    headers,
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
  })
  
  const result = await response.json().catch(() => ({ error: true, message: 'JSON Parse Error' }))

  if (!response.ok || result?.error || result?.success === false) {
    throw new Error(result?.message || 'Server Error')
  }

  if (Array.isArray(result)) return result as any;

  if (result?.success && 'data' in result) return result.data;
  
  return result as any;
}

export const api = {
  data: {
    getUserInfo: () => request<any>('/auth/me', { method: 'GET' }),
    getPolices: () => request<any[]>('/data/polices'),
    getRisques: (policeId: number) => request<any[]>('/data/risques', { body: JSON.stringify({ policeId }) }),
    getSinistres: (policeId: number) => request<any[]>('/data/sinistres', { body: JSON.stringify({ policeId }) }),
    getSinistresEnCours: (policeId: number) => request<any[]>('/data/sinistres/en-cours', { body: JSON.stringify({ policeId }) }),
    getQuittances: (policeId: number) => request<any[]>('/data/quittances', { body: JSON.stringify({ policeId }) }),
    getImpayes: (policeId?: number) => request<any[]>('/data/quittances/impayes', { body: JSON.stringify({ policeId }) }),
    getStatsByPolice: (policeId: number) => request<any>('/data/stats/police', { body: JSON.stringify({ policeId }) }),
    getAdherents: (policeId: number) => request<any[]>('/data/adherents', { body: JSON.stringify({ policeId }) }),
    getGaranties: (risqueId: number) => request<any[]>('/data/garanties', { body: JSON.stringify({ risqueId }) }),
    getPersACharge: (adherentId: number) => request<any[]>('/data/adherents/famille', { body: JSON.stringify({ adherentId }) }),
    getStats: () => request<any[]>('/data/stats'),
    getReclamations: () => request<any[]>('/reclamations/list'),
    getMessages: (reclamationId: string | number) => request<any[]>('/reclamations/detail', { body: JSON.stringify({ reclamationId }) }),
    createReclamation: (body: any) => request<any>('/reclamations/create', { body: JSON.stringify(body) }),
    sendMessage: (reclamationId: string | number, body: any) => request<any>('/reclamations/add-message', { body: JSON.stringify({ ...body, reclamationId }) }),
    updateStatut: (reclamationId: string | number, statut: string) => request<any>('/reclamations/update-statut', { body: JSON.stringify({ reclamationId, statut }) }),
    deleteMessage: (messageId: number, reclamationId: number) => request<any>('/reclamations/delete-message', { body: JSON.stringify({ messageId, reclamationId }) })
  },
  
  admin: {
    getUsers: (filters = {}) => request<any[]>('/admin/users', { body: JSON.stringify(filters) }),
    saveUser: (user: any) => request<any>('/admin/users/save', { body: JSON.stringify(user) }),
    deleteUser: (userId: number) => request<any>('/admin/users/delete', { body: JSON.stringify({ userId }) }),
    syncKeycloak: (Id: number) => request<any>('/admin/users/sync-keycloak', { body: JSON.stringify({ Id }) }),
    getClients: (filters = {}) => request<any[]>('/admin/clients', { body: JSON.stringify(filters) }),
    createUserFromClient: (clientId: number) => request<any>('/admin/clients/create-user', { body: JSON.stringify({ clientId }) }),
    getAdherents: (filters = {}) => request<any[]>('/admin/adherents', { body: JSON.stringify(filters) }),
    createUserFromAdherent: (adherentId: number) => request<any>('/admin/adherents/create-user', { body: JSON.stringify({ adherentId }) })
  }
}