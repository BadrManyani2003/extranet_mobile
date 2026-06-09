import { request } from './BaseClient'

export const DocumentService = {
  /**
   * Récupère la liste de tous les documents chargés (admin uniquement).
   */
  getDocuments: (filters: { nature?: string; identifiant?: number; dateFrom?: string; dateTo?: string } = {}) =>
    request<any[]>('/documents/list', { method: 'POST', body: JSON.stringify(filters) }),

  /**
   * Retourne le contenu d'un document par son Id (base64).
   */
  getDocumentById: (documentId: number) =>
    request<any>('/documents/view', { method: 'POST', body: JSON.stringify({ documentId }) }),

  /**
   * Supprime un document par son Id.
   */
  deleteDocument: (documentId: number) =>
    request<any>('/documents/delete', { method: 'POST', body: JSON.stringify({ documentId }) }),
}
