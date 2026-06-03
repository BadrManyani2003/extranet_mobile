import { request } from './BaseClient'

export const AdminService = {
  getUsers: () => request<any[]>('/admin/users', { 
    method: 'POST', 
    headers: { 'x-source': 'A' },
    body: JSON.stringify({}) 
  }),
  getSimulationUsers: () => request<any[]>('/admin/simulation-users', { 
    method: 'POST', 
    headers: { 'x-source': 'A' },
    body: JSON.stringify({}) 
  }),
}
