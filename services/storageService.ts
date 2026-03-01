import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage keys used throughout the application
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  BIOMETRIC_ENABLED: '@biometric_enabled',
  WALLET_DATA: '@wallet_data',
  TRANSACTIONS_DATA: '@transactions_data',
  GROUPS_DATA: '@groups_data',
  THEME_PREFERENCE: '@theme_preference',
  OFFLINE_QUEUE: '@offline_queue',
} as const;

/**
 * StorageService - Type-safe wrapper around AsyncStorage
 * 
 * Provides methods for storing and retrieving data with automatic
 * JSON serialization/deserialization and error handling.
 */
class StorageServiceClass {
  /**
   * Get a value from storage
   * @param key - Storage key
   * @returns Parsed value or null if not found
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error getting item ${key} from storage:`, error);
      return null;
    }
  }

  /**
   * Set a value in storage
   * @param key - Storage key
   * @param value - Value to store (will be JSON stringified)
   */
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error setting item ${key} in storage:`, error);
      throw error;
    }
  }

  /**
   * Remove a value from storage
   * @param key - Storage key
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key} from storage:`, error);
      throw error;
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Get multiple values from storage
   * @param keys - Array of storage keys
   * @returns Object mapping keys to their values
   */
  async multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      const result: Record<string, T | null> = {};
      
      for (const [key, value] of pairs) {
        if (value === null) {
          result[key] = null;
        } else {
          try {
            result[key] = JSON.parse(value) as T;
          } catch {
            result[key] = null;
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error getting multiple items from storage:', error);
      return keys.reduce((acc, key) => ({ ...acc, [key]: null }), {});
    }
  }

  /**
   * Set multiple values in storage
   * @param items - Object mapping keys to values
   */
  async multiSet(items: Record<string, any>): Promise<void> {
    try {
      const pairs: [string, string][] = Object.entries(items).map(([key, value]) => [
        key,
        JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error('Error setting multiple items in storage:', error);
      throw error;
    }
  }

  /**
   * Remove multiple values from storage
   * @param keys - Array of storage keys
   */
  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error removing multiple items from storage:', error);
      throw error;
    }
  }

  /**
   * Get all storage keys
   * @returns Array of all keys in storage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys from storage:', error);
      return [];
    }
  }

  /**
   * Check if a key exists in storage
   * @param key - Storage key
   * @returns True if key exists, false otherwise
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Error checking if key ${key} exists in storage:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const StorageService = new StorageServiceClass();
