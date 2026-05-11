import keycloakService from '../services/keycloak'

const BASE_URL = import.meta.env.VITE_API_URL

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = options.method || 'POST'
  const headers = new Headers(options.headers)
  
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  
  if (keycloakService.getAuthenticated()) {
    const token = keycloakService.getToken() || ''
    headers.set('Authorization', `Bearer ${token}`)
    headers.set('x-source', 'E')
  }

  let url = `${BASE_URL}${endpoint}`
  let requestOptions: RequestInit = { ...options, method, headers }

  if (method === 'GET' && options.body) {
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
  }

  const response = await fetch(url, requestOptions)
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
  },
  
  admin: {
    getUsers: (filters = {}) => request<any[]>('/admin/users', { method: 'POST', body: JSON.stringify(filters) }),
    saveUser: (user: any) => request<any>('/admin/users/save', { method: 'POST', body: JSON.stringify(user) }),
    deleteUser: (userId: number) => request<any>('/admin/users/delete', { method: 'POST', body: JSON.stringify({ userId }) }),
    syncKeycloak: (id: number) => request<any>('/admin/users/sync-keycloak', { method: 'POST', body: JSON.stringify({ id }) }),
    getClients: (filters = {}) => request<any[]>('/admin/clients', { method: 'POST', body: JSON.stringify(filters) }),
    createUserFromClient: (clientId: number) => request<any>('/admin/clients/create-user', { method: 'POST', body: JSON.stringify({ clientId }) }),
    getAdherents: (filters = {}) => request<any[]>('/admin/adherents', { method: 'POST', body: JSON.stringify(filters) }),
    createUserFromAdherent: (adherentId: number) => request<any>('/admin/adherents/create-user', { method: 'POST', body: JSON.stringify({ adherentId }) })
  }
}