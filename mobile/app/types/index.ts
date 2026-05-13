// ============================================================
// Types globaux de l'application AssurPlus
// ============================================================

// --- Utilisateur ---
export interface User {
  id: number;
  nom: string;
  username?: string;
  email: string;
  mobile: string;
  role: string;
  extranet: string;
  is_verified?: boolean;
  created_at?: string;
}


export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// --- Police d'assurance ---
export interface Police {
  id: number;
  num_police: string;
  police_num?: string; // Nom de champ standardisé depuis l'API
  categorie: string;
  compagnie: string;
  branche: string;
  souscripteur: string;
  assure: string;
  flotte: string;
  date_effet: string;
  date_souscription: string;
  statut: string;
  statut_variant?: 'success' | 'warning' | 'error' | 'neutral';
  is_active?: number;
  renouvelable: boolean;
  prime_totale?: number;
  date_echeance?: string;
}

// --- Quittance ---
export interface Quittance {
  id: number;
  num_quittance: string;
  num_police?: string;
  police_num?: string;
  compagnie?: string;
  branche?: string;
  date_effet: string;
  date_echeance: string;
  prime_totale: number;
  montant_encaisse: number;
  montant_impaye: number;
  statut: string;
  statut_variant?: 'success' | 'warning' | 'error' | 'neutral';
  is_active?: number;
}

// --- Sinistre ---
export interface Sinistre {
  id: number;
  num_police?: string;
  police_num?: string;
  compagnie?: string;
  branche?: string;
  mt_a_regle: number;
  date_dec_client: string;
  date_dec_compagnie: string;
  date_sinistre: string;
  lieu_sinistre: string;
  responsable: number;
  statut: string;
  statut_variant?: 'success' | 'warning' | 'error' | 'neutral';
  is_active?: number;
  objet?: string;
  identifiant?: string;
}

// --- Règlement sinistre ---
export interface SinReglement {
  id: number;
  sinistre_id: number;
  montant: number;
  mode_reglement: string;
  date_reglement: string;
  etat: string;
}

// --- Réponses API ---
export interface ApiResponse<T> {
  message?: string;
  data?: T; // Pour certains points de terminaison qui pourraient encore utiliser ce format
}

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
}
