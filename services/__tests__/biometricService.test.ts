/**
 * Tests for BiometricService
 * 
 * These tests verify the BiometricService wrapper provides proper
 * biometric authentication functionality with error handling.
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { BiometricService } from '../biometricService';
import { StorageService, STORAGE_KEYS } from '../storageService';

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
}));

// Mock StorageService
jest.mock('../storageService', () => ({
  StorageService: {
    get: jest.fn(),
    set: jest.fn(),
  },
  STORAGE_KEYS: {
    BIOMETRIC_ENABLED: '@biometric_enabled',
  },
}));

describe('BiometricService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isAvailable', () => {
    it('should return true when biometric hardware is available', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);

      const result = await BiometricService.isAvailable();

      expect(LocalAuthentication.hasHardwareAsync).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when biometric hardware is not available', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

      const result = await BiometricService.isAvailable();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockRejectedValue(
        new Error('Hardware check failed')
      );

      const result = await BiometricService.isAvailable();

      expect(result).toBe(false);
    });
  });

  describe('getSupportedTypes', () => {
    it('should return fingerprint type', async () => {
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);

      const result = await BiometricService.getSupportedTypes();

      expect(result).toEqual(['fingerprint']);
    });

    it('should return facial recognition type', async () => {
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);

      const result = await BiometricService.getSupportedTypes();

      expect(result).toEqual(['facial']);
    });

    it('should return iris type', async () => {
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.IRIS,
      ]);

      const result = await BiometricService.getSupportedTypes();

      expect(result).toEqual(['iris']);
    });

    it('should return multiple types', async () => {
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);

      const result = await BiometricService.getSupportedTypes();

      expect(result).toEqual(['fingerprint', 'facial']);
    });

    it('should return empty array on error', async () => {
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockRejectedValue(
        new Error('Failed to get types')
      );

      const result = await BiometricService.getSupportedTypes();

      expect(result).toEqual([]);
    });
  });

  describe('authenticate', () => {
    beforeEach(() => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
    });

    it('should authenticate successfully with default options', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await BiometricService.authenticate();

      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Authenticate to continue',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: undefined,
      });
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should authenticate successfully with custom options', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
      });

      const options = {
        promptMessage: 'Scan your face',
        cancelLabel: 'Not now',
        disableDeviceFallback: true,
        fallbackLabel: 'Use password',
      };

      const result = await BiometricService.authenticate(options);

      expect(LocalAuthentication.authenticateAsync).toHaveBeenCalledWith(options);
      expect(result.success).toBe(true);
    });

    it('should fail when biometric is not available', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

      const result = await BiometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Biometric authentication is not available on this device');
    });

    it('should fail when biometric is not enrolled', async () => {
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

      const result = await BiometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('No biometric credentials are enrolled on this device');
    });

    it('should handle authentication failure', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: 'User cancelled',
      });

      const result = await BiometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('User cancelled');
    });

    it('should handle authentication warning', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Too many attempts',
        warning: 'Biometric locked',
      });

      const result = await BiometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Too many attempts');
      expect(result.warning).toBe('Biometric locked');
    });

    it('should handle authentication exception', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(
        new Error('Authentication error')
      );

      const result = await BiometricService.authenticate();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Authentication error');
    });
  });

  describe('isEnrolled', () => {
    it('should return true when biometric is enrolled', async () => {
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const result = await BiometricService.isEnrolled();

      expect(LocalAuthentication.isEnrolledAsync).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when biometric is not enrolled', async () => {
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

      const result = await BiometricService.isEnrolled();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockRejectedValue(
        new Error('Enrollment check failed')
      );

      const result = await BiometricService.isEnrolled();

      expect(result).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('should return true when biometric is enabled in preferences', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(true);

      const result = await BiometricService.isEnabled();

      expect(StorageService.get).toHaveBeenCalledWith(STORAGE_KEYS.BIOMETRIC_ENABLED);
      expect(result).toBe(true);
    });

    it('should return false when biometric is disabled in preferences', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(false);

      const result = await BiometricService.isEnabled();

      expect(result).toBe(false);
    });

    it('should return false when preference is not set', async () => {
      (StorageService.get as jest.Mock).mockResolvedValue(null);

      const result = await BiometricService.isEnabled();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (StorageService.get as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await BiometricService.isEnabled();

      expect(result).toBe(false);
    });
  });

  describe('enable', () => {
    it('should enable biometric in preferences', async () => {
      (StorageService.set as jest.Mock).mockResolvedValue(undefined);

      await BiometricService.enable();

      expect(StorageService.set).toHaveBeenCalledWith(STORAGE_KEYS.BIOMETRIC_ENABLED, true);
    });

    it('should throw error on storage failure', async () => {
      const error = new Error('Storage error');
      (StorageService.set as jest.Mock).mockRejectedValue(error);

      await expect(BiometricService.enable()).rejects.toThrow(error);
    });
  });

  describe('disable', () => {
    it('should disable biometric in preferences', async () => {
      (StorageService.set as jest.Mock).mockResolvedValue(undefined);

      await BiometricService.disable();

      expect(StorageService.set).toHaveBeenCalledWith(STORAGE_KEYS.BIOMETRIC_ENABLED, false);
    });

    it('should throw error on storage failure', async () => {
      const error = new Error('Storage error');
      (StorageService.set as jest.Mock).mockRejectedValue(error);

      await expect(BiometricService.disable()).rejects.toThrow(error);
    });
  });
});
