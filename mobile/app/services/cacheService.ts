import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Service de cache pour optimiser les performances de l'application
 */
export const cacheService = {
  /**
   * Sauvegarde des données dans le cache
   */
  set: async (key: string, data: any) => {
    try {
      const cacheData = {
        timestamp: Date.now(),
        data,
      };
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error(`[Cache] Error saving ${key}:`, error);
    }
  },

  /**
   * Récupère les données du cache
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(`cache_${key}`);
      if (value) {
        const { data } = JSON.parse(value);
        return data as T;
      }
    } catch (error) {
      console.error(`[Cache] Error reading ${key}:`, error);
    }
    return null;
  },

  /**
   * Supprime une entrée du cache
   */
  remove: async (key: string) => {
    await AsyncStorage.removeItem(`cache_${key}`);
  },

  /**
   * Vide tout le cache lié à l'API
   */
  clear: async () => {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith('cache_'));
    await AsyncStorage.multiRemove(cacheKeys);
  }
};
