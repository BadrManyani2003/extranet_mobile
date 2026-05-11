import { useState, useCallback } from 'react';

// ============================================================
// Hook générique pour les appels API
// Gère automatiquement : loading, erreur, données
// ============================================================
interface ApiCallState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApiCall<T>() {
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>, background = false) => {
    if (!background) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue';
      setState(prev => ({ ...prev, loading: false, error: message }));
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

// ============================================================
// Formatter les montants en format marocain
// ============================================================
export function formatMontant(montant: any): string {
  if (montant === null || montant === undefined) return '0,00 DH';
  
  const num = typeof montant === 'number' ? montant : parseFloat(String(montant));
  if (isNaN(num)) return '0,00 DH';
  
  return `${num.toFixed(2).replace('.', ',')} DH`;
}

// ============================================================
// Formatter les dates
// ============================================================
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ============================================================
// Obtenir les initiales d'un nom
// ============================================================
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() || '')
    .join('');
}
