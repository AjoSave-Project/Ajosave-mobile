/**
 * Tests for Onboarding Helper Utilities
 * 
 * These tests verify the onboarding state management functions
 */

import { StorageService, STORAGE_KEYS } from '@/services/storageService';
import {
  hasSeenOnboarding,
  markOnboardingAsSeen,
  resetOnboardingStatus,
  setOnboardingStatus,
} from '../onboardingHelpers';

// Mock StorageService
jest.mock('@/services/storageService', () => ({
  StorageService: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
  STORAGE_KEYS: {
    HAS_SEEN_ONBOARDING: '@has_seen_onboarding',
  },
}));

describe('Onboarding Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasSeenOnboarding', () => {
    it('should return true when onboarding has been seen', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(true);

      const result = await hasSeenOnboarding();

      expect(StorageService.get).toHaveBeenCalledWith(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
      expect(result).toBe(true);
    });

    it('should return false when onboarding has not been seen', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(null);

      const result = await hasSeenOnboarding();

      expect(StorageService.get).toHaveBeenCalledWith(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
      expect(result).toBe(false);
    });

    it('should return false when onboarding value is false', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(false);

      const result = await hasSeenOnboarding();

      expect(result).toBe(false);
    });

    it('should return false on storage error', async () => {
      (StorageService.get as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await hasSeenOnboarding();

      expect(result).toBe(false);
    });
  });

  describe('markOnboardingAsSeen', () => {
    it('should set onboarding flag to true', async () => {
      (StorageService.set as jest.Mock).mockResolvedValue(undefined);

      await markOnboardingAsSeen();

      expect(StorageService.set).toHaveBeenCalledWith(STORAGE_KEYS.HAS_SEEN_ONBOARDING, true);
    });

    it('should throw error on storage failure', async () => {
      const error = new Error('Storage error');
      (StorageService.set as jest.Mock).mockRejectedValue(error);

      await expect(markOnboardingAsSeen()).rejects.toThrow(error);
    });
  });

  describe('resetOnboardingStatus', () => {
    it('should remove onboarding flag from storage', async () => {
      (StorageService.remove as jest.Mock).mockResolvedValue(undefined);

      await resetOnboardingStatus();

      expect(StorageService.remove).toHaveBeenCalledWith(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
    });

    it('should throw error on removal failure', async () => {
      const error = new Error('Storage error');
      (StorageService.remove as jest.Mock).mockRejectedValue(error);

      await expect(resetOnboardingStatus()).rejects.toThrow(error);
    });
  });

  describe('setOnboardingStatus', () => {
    it('should set onboarding status to true', async () => {
      (StorageService.set as jest.Mock).mockResolvedValue(undefined);

      await setOnboardingStatus(true);

      expect(StorageService.set).toHaveBeenCalledWith(STORAGE_KEYS.HAS_SEEN_ONBOARDING, true);
    });

    it('should set onboarding status to false', async () => {
      (StorageService.set as jest.Mock).mockResolvedValue(undefined);

      await setOnboardingStatus(false);

      expect(StorageService.set).toHaveBeenCalledWith(STORAGE_KEYS.HAS_SEEN_ONBOARDING, false);
    });

    it('should throw error on storage failure', async () => {
      const error = new Error('Storage error');
      (StorageService.set as jest.Mock).mockRejectedValue(error);

      await expect(setOnboardingStatus(true)).rejects.toThrow(error);
    });
  });
});
