import keycloak from '../services/keycloak'

const BASE_URL = import.meta.env.VITE_API_URL

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  headers.set('x-source', 'Cabinet')

  if (keycloak.authenticated) {
    await keycloak.updateToken(70)
    if (keycloak.token) headers.set('Authorization', `Bearer ${keycloak.token}`)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
  const result = await response.json().catch(() => ({ success: false, message: 'JSON Parse Error' }))

  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Server Error')
  }

  return result.data
}

export const api = {
  data: {
    getPolices: () => request<any[]>('/data/policies'),
    getImpayes: () => request<any[]>('/data/unpaid'),
    getStats: () => request<any[]>('/data/stats'),
    getReclamations: () => request<any[]>('/data/reclamations'),
    getMessages: (id: string | number) => request<any[]>(`/data/reclamations/${id}/messages`),
    createReclamation: (body: any) => request<any>('/data/reclamations', { method: 'POST', body: JSON.stringify(body) }),
    sendMessage: (id: string | number, body: any) => request<any>(`/data/reclamations/${id}/messages`, { method: 'POST', body: JSON.stringify(body) })
  },
  
  admin: {
    getUsers: (filters = {}) => request<any[]>('/admin/users', { method: 'POST', body: JSON.stringify(filters) }),
    saveUser: (user: any) => request<any>('/admin/users/save', { method: 'POST', body: JSON.stringify(user) }),
    deleteUser: (id: number) => request<any>('/admin/users/delete', { method: 'POST', body: JSON.stringify({ id }) }),
    syncKeycloak: (id: number) => request<any>('/admin/users/sync-keycloak', { method: 'POST', body: JSON.stringify({ id }) }),
    getClients: (filters = {}) => request<any[]>('/admin/clients', { method: 'POST', body: JSON.stringify(filters) }),
    createUserFromClient: (clientId: number) => request<any>('/admin/clients/create-user', { method: 'POST', body: JSON.stringify({ clientId }) }),
    getAdherents: (filters = {}) => request<any[]>('/admin/adherents', { method: 'POST', body: JSON.stringify(filters) }),
    createUserFromAdherent: (adherentId: number) => request<any>('/admin/adherents/create-user', { method: 'POST', body: JSON.stringify({ adherentId }) }),
    getReclamations: () => request<any[]>('/admin/reclamations', { method: 'POST' }),
    replyToReclamation: (id: string | number, message: string) => request<any>('/admin/reclamations/reply', { method: 'POST', body: JSON.stringify({ id, message }) })
  }
}
