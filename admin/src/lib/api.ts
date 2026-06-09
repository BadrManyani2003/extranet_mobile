import { AdminService }       from '../services/api/AdminService'
import { DataService }        from '../services/api/DataService'
import { ReclamationService } from '../services/api/ReclamationService'
import { DocumentService }    from '../services/api/DocumentService'

export const api = {
  data: {
    ...DataService,
    getReclamations:  ReclamationService.getReclamations,
    getMessages:      ReclamationService.getMessages,
    createReclamation: ReclamationService.createReclamation,
    sendMessage:      ReclamationService.sendMessage,
    deleteReclamation: ReclamationService.deleteReclamation
  },
  admin: {
    ...AdminService,
    getReclamations:    ReclamationService.getReclamations,
    replyToReclamation: ReclamationService.replyToReclamation,
    updateStatus:       ReclamationService.updateStatus,
    deleteMessage:      ReclamationService.deleteMessage,
    deleteReclamation:  ReclamationService.deleteReclamation
  },
  document: DocumentService
}