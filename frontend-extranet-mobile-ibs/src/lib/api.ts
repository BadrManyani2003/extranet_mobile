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
    
    headers.set('Authorization', `Bearer ${token}`)

    body = {
      ...body,
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
    getPolices: () => request<any[]>('/data/polices'),
    getImpayes: () => request<any[]>('/data/quittances'),
    getStats: () => request<any[]>('/data/stats'),
    getReclamations: () => request<any[]>('/reclamations/list'),
    getMessages: (Id: string | number) => request<any[]>('/reclamations/detail', { body: JSON.stringify({ Id }) }),
    createReclamation: (body: any) => request<any>('/reclamations/create', { body: JSON.stringify(body) }),
    sendMessage: (Id: string | number, body: any) => request<any>('/reclamations/add-message', { body: JSON.stringify({ ...body, Id }) })
  },
  
  admin: {
    getUsers: (filters = {}) => request<any[]>('/admin/users', { body: JSON.stringify(filters) }),
    saveUser: (user: any) => request<any>('/admin/users/save', { body: JSON.stringify(user) }),
    deleteUser: (Id: number) => request<any>('/admin/users/delete', { body: JSON.stringify({ Id }) }),
    syncKeycloak: (Id: number) => request<any>('/admin/users/sync-keycloak', { body: JSON.stringify({ Id }) }),
    getClients: (filters = {}) => request<any[]>('/admin/clients', { body: JSON.stringify(filters) }),
    createUserFromClient: (FK_Client_Id: number) => request<any>('/admin/clients/create-user', { body: JSON.stringify({ FK_Client_Id }) }),
    getAdherents: (filters = {}) => request<any[]>('/admin/adherents', { body: JSON.stringify(filters) }),
    createUserFromAdherent: (FK_Adherent_Id: number) => request<any>('/admin/adherents/create-user', { body: JSON.stringify({ FK_Adherent_Id }) })
  }
}
