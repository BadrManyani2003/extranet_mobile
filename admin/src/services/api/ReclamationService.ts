import { request } from './BaseClient'

export const ReclamationService = {
  getReclamations: () => 
    request<any[]>('/reclamations/list', { method: 'POST' }),

  getMessages: (reclamationId: string | number) => 
    request<any[]>('/reclamations/detail', { method: 'POST', body: JSON.stringify({ reclamationId }) }),

  createReclamation: (body: any) => 
    request<any>('/reclamations/create', { method: 'POST', body: JSON.stringify(body) }),

  sendMessage: (reclamationId: string | number, body: any) => 
    request<any>('/reclamations/add-message', { method: 'POST', body: JSON.stringify({ ...body, reclamationId }) }),

  replyToReclamation: (reclamationId: string | number, message: string) => 
    request<any>('/reclamations/add-message', { method: 'POST', body: JSON.stringify({ reclamationId, message, nature: 'A' }) }),

  updateStatus: (reclamationId: string | number, statut: string) => 
    request<any>('/reclamations/update-statut', { method: 'POST', body: JSON.stringify({ reclamationId, statut }) }),

  deleteMessage: (messageId: number, reclamationId: number) => 
    request<any>('/reclamations/delete-message', { method: 'POST', body: JSON.stringify({ messageId, reclamationId }) })
}
