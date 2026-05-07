import keycloak from '../services/keycloak'

const BASE_URL = import.meta.env.VITE_API_URL

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  headers.set('x-source', 'A')

  if (keycloak.authenticated) {
    await keycloak.updateToken(70)
    if (keycloak.token) headers.set('Authorization', `Bearer ${keycloak.token}`)
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
  const result = await response.json().catch(() => ({ error: true, message: 'JSON Parse Error' }))

  if (!response.ok || result?.error || result?.success === false) {
    throw new Error(result?.message || 'Server Error')
  }

  // Si l'API retourne un tableau directement
  if (Array.isArray(result)) return result as any;
  
  // Si l'API retourne un objet avec success: true
  if (result?.success && 'data' in result) return result.data;
  
  return result as any;
}

export const api = {
  data: {
    getPolices: () => request<any[]>('/data/polices', { method: 'POST' }),
    getImpayes: () => request<any[]>('/data/quittances/impayes', { method: 'POST' }), // Updated route path if necessary, wait I see '/data/quittances' in the old code, let's keep the updated one
    getStats: () => request<any[]>('/data/stats', { method: 'POST' }),
    getReclamations: () => request<any[]>('/reclamations/list', { method: 'POST' }),
    getMessages: (reclamationId: string | number) => request<any[]>('/reclamations/detail', { method: 'POST', body: JSON.stringify({ reclamationId }) }),
    createReclamation: (body: any) => request<any>('/reclamations/create', { method: 'POST', body: JSON.stringify(body) }),
    sendMessage: (reclamationId: string | number, body: any) => request<any>('/reclamations/add-message', { method: 'POST', body: JSON.stringify({ ...body, reclamationId }) })
  },
  
  admin: {
    getUsers: (filters = {}) => request<any[]>('/admin/users', { method: 'POST', body: JSON.stringify(filters) }),
    saveUser: (user: any) => request<any>('/admin/users/save', { method: 'POST', body: JSON.stringify(user) }),
    deleteUser: (userId: number) => request<any>('/admin/users/delete', { method: 'POST', body: JSON.stringify({ userId }) }),
    syncKeycloak: (Id: number) => request<any>('/admin/users/sync-keycloak', { method: 'POST', body: JSON.stringify({ Id }) }),
    getClients: (filters = {}) => request<any[]>('/admin/clients', { method: 'POST', body: JSON.stringify(filters) }),
    createUserFromClient: (clientId: number) => request<any>('/admin/clients/create-user', { method: 'POST', body: JSON.stringify({ clientId }) }),
    getAdherents: (filters = {}) => request<any[]>('/admin/adherents', { method: 'POST', body: JSON.stringify(filters) }),
    createUserFromAdherent: (adherentId: number) => request<any>('/admin/adherents/create-user', { method: 'POST', body: JSON.stringify({ adherentId }) }),
    // Note: getReclamations is defined in the old code under admin, but my refactoring only has it in reclamation.routes.js
    getReclamations: () => request<any[]>('/reclamations/list', { method: 'POST' }),
    replyToReclamation: (reclamationId: string | number, Message: string) => request<any>('/reclamations/add-message', { method: 'POST', body: JSON.stringify({ reclamationId, message: Message, nature: 'A' }) }) // nature: 'A' for admin or 'E'
  }
}
