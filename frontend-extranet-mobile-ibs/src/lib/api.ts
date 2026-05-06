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
    const tokenParsed = keycloak.tokenParsed as any
    const userId = tokenParsed?.sub_id || tokenParsed?.id || tokenParsed?.sub || 1
    
    body = {
      ...body,
      FK_User_Id: userId,
      Source: 'M',
      Token: token
    }
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, { 
    ...options, 
    method,
    headers,
    body: JSON.stringify(body)
  })
  
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
    getMessages: (id: string | number) => request<any[]>('/data/messages', { body: JSON.stringify({ id }) }),
    createReclamation: (body: any) => request<any>('/data/reclamation/create', { body: JSON.stringify(body) }),
    sendMessage: (id: string | number, body: any) => request<any>('/data/reclamation/send-message', { body: JSON.stringify({ ...body, id }) })
  },
  
  admin: {
    getUsers: (filters = {}) => request<any[]>('/admin/users', { body: JSON.stringify(filters) }),
    saveUser: (user: any) => request<any>('/admin/users/save', { body: JSON.stringify(user) }),
    deleteUser: (Id: number) => request<any>('/admin/users/delete', { body: JSON.stringify({ Id }) }),
    syncKeycloak: (Id: number) => request<any>('/admin/users/sync-keycloak', { body: JSON.stringify({ Id }) }),
    getClients: (filters = {}) => request<any[]>('/admin/clients', { body: JSON.stringify(filters) }),
    createUserFromClient: (Id: number) => request<any>('/admin/clients/create-user', { body: JSON.stringify({ Id }) }),
    getAdherents: (filters = {}) => request<any[]>('/admin/adherents', { body: JSON.stringify(filters) }),
    createUserFromAdherent: (Id: number) => request<any>('/admin/adherents/create-user', { body: JSON.stringify({ Id }) })
  }
}
