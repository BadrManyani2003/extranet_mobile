import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { authEvents } from '../utils/events';

// Attention: Si vous testez sur un appareil physique, localhost fera référence au téléphone lui-même.
// Utilisez l'adresse IP locale de votre machine (ex: http://192.168.1.X:5000/api) dans EXPO_PUBLIC_API_URL.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
if (!BASE_URL) {
  throw new Error("La configuration de l'API (EXPO_PUBLIC_API_URL) est manquante dans l'environnement mobile.");
}

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
    'Accept':       'application/json',
    'x-source':     'M',
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url     = new URL(`${BASE_URL}${endpoint}`);
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

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        authEvents.emit('unauthorized');
      }
      throw new Error(data?.message || data?.error || `Erreur serveur (${response.status})`);
    }

    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
      return data.data as T;
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Impossible de contacter le serveur. Vérifiez votre connexion.");
  }
}
