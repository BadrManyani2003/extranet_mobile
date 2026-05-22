import AsyncStorage from '@react-native-async-storage/async-storage';

export const cacheService = {
  set: async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify({ timestamp: Date.now(), data }));
    } catch (error) {
      console.error(`[Cache] Error saving ${key}:`, error);
    }
  },

  get: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await AsyncStorage.getItem(`cache_${key}`);
      if (value) return JSON.parse(value).data as T;
    } catch (error) {
      console.error(`[Cache] Error reading ${key}:`, error);
    }
    return null;
  },

  remove: async (key: string) => {
    await AsyncStorage.removeItem(`cache_${key}`);
  },

  clear: async () => {
    const keys     = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith('cache_'));
    await AsyncStorage.multiRemove(cacheKeys);
  }
};
