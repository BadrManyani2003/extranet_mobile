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
    ...ReclamationService
  }
}