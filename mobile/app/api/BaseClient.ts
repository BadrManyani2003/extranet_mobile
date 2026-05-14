import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authEvents } from '../utils/events';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Helper générique pour les requêtes API sur Mobile
 */
export async function apiRequest<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body: any = null
): Promise<T> {
  const token = Platform.OS === 'web' 
    ? await AsyncStorage.getItem('token')
    : await SecureStore.getItemAsync('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'x-source': 'M',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = new URL(`${BASE_URL}${endpoint}`);
  const options: RequestInit = { method, headers };

  if (method === 'GET' && body) {
    Object.keys(body).forEach(key => {
      if (body[key] !== null && body[key] !== undefined && body[key] !== '') {
        url.searchParams.append(key, String(body[key]));
      }
    });
  } else if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url.toString(), options);

    if (response.status === 204) return {} as T;

    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        authEvents.emit('unauthorized');
      }

      // Prise en charge de notre nouveau format de réponse API
      const errorMsg = data?.message || data?.error || `Erreur serveur (${response.status})`;
      throw new Error(errorMsg);
    }

    // Prise en charge de notre nouveau format de réponse API { success: true, data: ... }
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data.data as T;
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Impossible de contacter le serveur. Vérifiez votre connexion.");
  }
}
