/**
 * Tests for StorageService
 * 
 * These tests verify the StorageService wrapper provides type-safe
 * access to AsyncStorage with proper error handling.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService, STORAGE_KEYS } from '../storageService';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
  getAllKeys: jest.fn(),
}));

describe('StorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('STORAGE_KEYS', () => {
    it('should have all required storage keys', () => {
      expect(STORAGE_KEYS.AUTH_TOKEN).toBe('@auth_token');
      expect(STORAGE_KEYS.USER_DATA).toBe('@user_data');
      expect(STORAGE_KEYS.BIOMETRIC_ENABLED).toBe('@biometric_enabled');
      expect(STORAGE_KEYS.WALLET_DATA).toBe('@wallet_data');
      expect(STORAGE_KEYS.TRANSACTIONS_DATA).toBe('@transactions_data');
      expect(STORAGE_KEYS.GROUPS_DATA).toBe('@groups_data');
      expect(STORAGE_KEYS.THEME_PREFERENCE).toBe('@theme_preference');
      expect(STORAGE_KEYS.OFFLINE_QUEUE).toBe('@offline_queue');
    });
  });

  describe('get', () => {
    it('should retrieve and parse stored value', async () => {
      const mockData = { id: 1, name: 'Test' };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockData));

      const result = await StorageService.get<typeof mockData>(STORAGE_KEYS.USER_DATA);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_DATA);
      expect(result).toEqual(mockData);
    });

    it('should return null when key does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await StorageService.get(STORAGE_KEYS.AUTH_TOKEN);

      expect(result).toBeNull();
    });

    it('should return null on parse error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      const result = await StorageService.get(STORAGE_KEYS.USER_DATA);

      expect(result).toBeNull();
    });

    it('should return null on storage error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.get(STORAGE_KEYS.AUTH_TOKEN);

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should stringify and store value', async () => {
      const mockData = { id: 1, name: 'Test' };
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await StorageService.set(STORAGE_KEYS.USER_DATA, mockData);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(mockData)
      );
    });

    it('should throw error on storage failure', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(StorageService.set(STORAGE_KEYS.AUTH_TOKEN, 'token')).rejects.toThrow(error);
    });
  });

  describe('remove', () => {
    it('should remove item from storage', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await StorageService.remove(STORAGE_KEYS.AUTH_TOKEN);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
    });

    it('should throw error on removal failure', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(error);

      await expect(StorageService.remove(STORAGE_KEYS.AUTH_TOKEN)).rejects.toThrow(error);
    });
  });

  describe('clear', () => {
    it('should clear all storage', async () => {
      (AsyncStorage.clear as jest.Mock).mockResolvedValue(undefined);

      await StorageService.clear();

      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('should throw error on clear failure', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.clear as jest.Mock).mockRejectedValue(error);

      await expect(StorageService.clear()).rejects.toThrow(error);
    });
  });

  describe('multiGet', () => {
    it('should retrieve and parse multiple values', async () => {
      const mockData = {
        [STORAGE_KEYS.AUTH_TOKEN]: 'token123',
        [STORAGE_KEYS.USER_DATA]: { id: 1, name: 'Test' },
      };

      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        [STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(mockData[STORAGE_KEYS.AUTH_TOKEN])],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(mockData[STORAGE_KEYS.USER_DATA])],
      ]);

      const result = await StorageService.multiGet([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      expect(result[STORAGE_KEYS.AUTH_TOKEN]).toBe(mockData[STORAGE_KEYS.AUTH_TOKEN]);
      expect(result[STORAGE_KEYS.USER_DATA]).toEqual(mockData[STORAGE_KEYS.USER_DATA]);
    });

    it('should handle null values', async () => {
      (AsyncStorage.multiGet as jest.Mock).mockResolvedValue([
        [STORAGE_KEYS.AUTH_TOKEN, null],
        [STORAGE_KEYS.USER_DATA, null],
      ]);

      const result = await StorageService.multiGet([
        STORAGE_KEYS.AUTH_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      expect(result[STORAGE_KEYS.AUTH_TOKEN]).toBeNull();
      expect(result[STORAGE_KEYS.USER_DATA]).toBeNull();
    });

    it('should return null for all keys on error', async () => {
      (AsyncStorage.multiGet as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const keys = [STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA];
      const result = await StorageService.multiGet(keys);

      expect(result[STORAGE_KEYS.AUTH_TOKEN]).toBeNull();
      expect(result[STORAGE_KEYS.USER_DATA]).toBeNull();
    });
  });

  describe('multiSet', () => {
    it('should stringify and store multiple values', async () => {
      const items = {
        [STORAGE_KEYS.AUTH_TOKEN]: 'token123',
        [STORAGE_KEYS.USER_DATA]: { id: 1, name: 'Test' },
      };

      (AsyncStorage.multiSet as jest.Mock).mockResolvedValue(undefined);

      await StorageService.multiSet(items);

      expect(AsyncStorage.multiSet).toHaveBeenCalledWith([
        [STORAGE_KEYS.AUTH_TOKEN, JSON.stringify(items[STORAGE_KEYS.AUTH_TOKEN])],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(items[STORAGE_KEYS.USER_DATA])],
      ]);
    });

    it('should throw error on storage failure', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.multiSet as jest.Mock).mockRejectedValue(error);

      await expect(
        StorageService.multiSet({ [STORAGE_KEYS.AUTH_TOKEN]: 'token' })
      ).rejects.toThrow(error);
    });
  });

  describe('multiRemove', () => {
    it('should remove multiple items from storage', async () => {
      const keys = [STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA];
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      await StorageService.multiRemove(keys);

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(keys);
    });

    it('should throw error on removal failure', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.multiRemove as jest.Mock).mockRejectedValue(error);

      await expect(
        StorageService.multiRemove([STORAGE_KEYS.AUTH_TOKEN])
      ).rejects.toThrow(error);
    });
  });

  describe('getAllKeys', () => {
    it('should return all storage keys', async () => {
      const mockKeys = [STORAGE_KEYS.AUTH_TOKEN, STORAGE_KEYS.USER_DATA];
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(mockKeys);

      const result = await StorageService.getAllKeys();

      expect(AsyncStorage.getAllKeys).toHaveBeenCalled();
      expect(result).toEqual(mockKeys);
    });

    it('should return empty array on error', async () => {
      (AsyncStorage.getAllKeys as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.getAllKeys();

      expect(result).toEqual([]);
    });
  });

  describe('has', () => {
    it('should return true when key exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('some value');

      const result = await StorageService.has(STORAGE_KEYS.AUTH_TOKEN);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      expect(result).toBe(true);
    });

    it('should return false when key does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await StorageService.has(STORAGE_KEYS.AUTH_TOKEN);

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await StorageService.has(STORAGE_KEYS.AUTH_TOKEN);

      expect(result).toBe(false);
    });
  });
});
