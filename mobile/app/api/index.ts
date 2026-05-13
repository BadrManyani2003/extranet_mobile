import { apiRequest } from './BaseClient';
import { Police, Quittance, Sinistre } from '../types';

export const authAPI = {
  me: () => apiRequest<any>('/auth/me', 'GET'),
};

export const policesAPI = {
  getAll: (filters?: any) => apiRequest<Police[]>('/data/polices', 'GET', filters),
};

export const quittancesAPI = {
  getAll: (policeId?: number) => apiRequest<Quittance[]>('/data/quittances', 'GET', { policeId }),
  getImpayees: (policeId?: number) => apiRequest<Quittance[]>('/data/quittances/impayes', 'GET', { policeId, enCour: 'O' }),
};

export const sinistresAPI = {
  getAll: (policeId?: number) => apiRequest<Sinistre[]>('/data/sinistres', 'GET', { policeId }),
  getEnCours: (policeId?: number) => apiRequest<Sinistre[]>('/data/sinistres/en-cours', 'GET', { policeId }),
};

export const adherentsAPI = {
  getAll: (policeId?: number) => apiRequest<any[]>('/data/adherents', 'GET', { policeId }),
  getFamille: (adherentId: number) => apiRequest<any[]>('/data/adherents/famille', 'GET', { adherentId }),
};

export const reclamationsAPI = {
  getAll: () => apiRequest<any[]>('/reclamations/list', 'POST'),
  getDetails: (reclamationId: number) => apiRequest<any[]>('/reclamations/detail', 'POST', { reclamationId }),
  create: (sujet: string, nature: string, message: string) => apiRequest<any>('/reclamations/create', 'POST', { sujet, nature, message }),
  addMessage: (reclamationId: number, message: string, nature: string = 'C') => apiRequest<void>('/reclamations/add-message', 'POST', { reclamationId, message, nature }),
};

export const dataAPI = {
  getStats: () => apiRequest<any>('/data/stats', 'GET'),
  getStatsByPolice: (policeId: number) => apiRequest<any>('/data/stats-by-police', 'GET', { policeId }),
  getRisques: (policeId: number) => apiRequest<any[]>('/data/risques', 'GET', { policeId }),
  getGaranties: (risqueId: number) => apiRequest<any[]>('/data/garanties', 'GET', { risqueId }),
  getDocuments: (policeId: number) => apiRequest<any[]>('/data/documents', 'GET', { policeId }),
};
