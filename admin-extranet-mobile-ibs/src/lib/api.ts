import keycloak from '../services/keycloak'

const BASE_URL = 'http://localhost:5000/api'

const getHeaders = async () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  try {
    if (keycloak.authenticated) {
      await keycloak.updateToken(70)
      if (keycloak.token) {
        headers['Authorization'] = `Bearer ${keycloak.token}`
      }
    } else {
      console.warn('Keycloak not authenticated in getHeaders')
    }
  } catch (error) {
    console.error('Failed to refresh token', error)
  }
  
  return headers
}

const request = async (endpoint: string, options: RequestInit = {}) => {
  const headers = await getHeaders()
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur serveur');
  }
  return res.json()
}

export const api = {
  data: {
    getPolices: () => request('/data/policies'),
    getImpayes: () => request('/data/unpaid'),
    getStats: () => request('/data/stats'),
    getReclamations: () => request('/data/reclamations'),
    getMessages: (id: number) => request(`/data/reclamations/${id}/messages`),
    createReclamation: (data: any) => request('/data/reclamations', { method: 'POST', body: JSON.stringify(data) }),
    sendMessage: (id: number, msg: any) => request(`/data/reclamations/${id}/messages`, { method: 'POST', body: JSON.stringify(msg) })
  },
  
  admin: {
    // Users
    getUsers: (filters = {}) => request('/admin/users', { method: 'POST', body: JSON.stringify(filters) }).then(r => r.data),
    saveUser: (user: any) => request('/admin/users/save', { method: 'POST', body: JSON.stringify(user) }),
    deleteUser: (id: number) => request('/admin/users/delete', { method: 'POST', body: JSON.stringify({ id }) }),
    syncKeycloak: (id: number) => request('/admin/users/sync-keycloak', { method: 'POST', body: JSON.stringify({ id }) }),
    
    // Clients
    getClients: (filters = {}) => request('/admin/clients', { method: 'POST', body: JSON.stringify(filters) }).then(r => r.data),
    createUserFromClient: (clientId: number) => request('/admin/clients/create-user', { method: 'POST', body: JSON.stringify({ clientId }) }),
    
    // Adherents
    getAdherents: (filters = {}) => request('/admin/adherents', { method: 'POST', body: JSON.stringify(filters) }).then(r => r.data),
    createUserFromAdherent: (adherentId: number) => request('/admin/adherents/create-user', { method: 'POST', body: JSON.stringify({ adherentId }) }),

    // Reclamations
    getReclamations: () => request('/admin/reclamations', { method: 'POST' }).then(r => r.data),
    replyToReclamation: (id: number, message: string) => request('/admin/reclamations/reply', { method: 'POST', body: JSON.stringify({ id, message }) })
  }
}
