import { useState, useCallback } from 'react';

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

export function formatMontant(montant: any): string {
  if (montant === null || montant === undefined) return '0,00';
  const num = typeof montant === 'number' ? montant : parseFloat(String(montant));
  if (isNaN(num)) return '0,00';
  return `${num.toFixed(2).replace('.', ',')}`;
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() || '')
    .join('');
}
