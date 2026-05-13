import { request } from './BaseClient'

export const AdminService = {
  getMe: () => 
    request<any>('/auth/me', { method: 'GET' }),

  getUsers: (filters = {}) => 
    request<any[]>('/admin/users', { method: 'POST', body: JSON.stringify(filters) }),

  saveUser: (user: any) => 
    request<any>('/admin/users/save', { method: 'POST', body: JSON.stringify(user) }),

  deleteUser: (userId: number) => 
    request<any>('/admin/users/delete', { method: 'POST', body: JSON.stringify({ userId }) }),

  syncKeycloak: (id: number) => 
    request<any>('/admin/users/sync-keycloak', { method: 'POST', body: JSON.stringify({ id }) }),

  getClients: (filters = {}) => 
    request<any[]>('/admin/clients', { method: 'POST', body: JSON.stringify(filters) }),

  createUserFromClient: (clientId: number) => 
    request<any>('/admin/clients/create-user', { method: 'POST', body: JSON.stringify({ clientId }) }),

  linkUserToClient: (clientId: number, targetUserId: number) => 
    request<any>('/admin/clients/link-user', { method: 'POST', body: JSON.stringify({ clientId, targetUserId }) }),

  getAdherents: (filters = {}) => 
    request<any[]>('/admin/adherents', { method: 'POST', body: JSON.stringify(filters) }),

  createUserFromAdherent: (adherentId: number) => 
    request<any>('/admin/adherents/create-user', { method: 'POST', body: JSON.stringify({ adherentId }) }),

  linkUserToAdherent: (adherentId: number, targetUserId: number) => 
    request<any>('/admin/adherents/link-user', { method: 'POST', body: JSON.stringify({ adherentId, targetUserId }) }),

  getRoles: () => 
    request<any[]>('/admin/roles', { method: 'GET' }),

  updateUserRoles: (targetUserId: number, authId: string, roles: any[]) => 
    request<any>('/admin/users/roles', { method: 'POST', body: JSON.stringify({ targetUserId, authId, roles }) })
}
