import { request } from './BaseClient'

export const DocumentService = {
  /**
   * Charge un document lié à une entité (ex: sinistre).
   * @param nature       Nature de l'entité ('Sinistre', 'Contrat', etc.)
   * @param identifiant  Id de l'entité concernée
   * @param type         Description libre du type de document
   * @param fileBase64   Contenu du fichier encodé en base64
   */
  uploadDocument: (nature: string, identifiant: number, type: string, fileBase64: string) =>
    request<any>('/documents/upload', {
      method: 'POST',
      body: JSON.stringify({ nature, identifiant, type, fileBase64 })
    }),
}
