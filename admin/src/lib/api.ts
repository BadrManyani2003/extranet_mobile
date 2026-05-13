import { AdminService } from '../services/api/AdminService'
import { DataService } from '../services/api/DataService'
import { ReclamationService } from '../services/api/ReclamationService'

/**
 * API Facade
 * Provides a centralized entry point for all API calls while maintaining
 * a clean separation of concerns into domain-specific services.
 */
export const api = {
  data: {
    ...DataService,
    getReclamations: ReclamationService.getReclamations,
    getMessages: ReclamationService.getMessages,
    createReclamation: ReclamationService.createReclamation,
    sendMessage: ReclamationService.sendMessage
  },
  admin: {
    ...AdminService,
    getReclamations: ReclamationService.getReclamations,
    replyToReclamation: ReclamationService.replyToReclamation,
    updateStatus: ReclamationService.updateStatus,
    deleteMessage: ReclamationService.deleteMessage
  }
}