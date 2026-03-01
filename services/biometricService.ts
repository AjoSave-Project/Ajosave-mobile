/**
 * BiometricService - Face ID/Touch ID authentication wrapper
 * 
 * Provides biometric authentication methods:
 * - Check hardware availability and supported types
 * - Authenticate with biometric prompt
 * - Check enrollment status
 * - Manage biometric preference (enable/disable)
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { StorageService, STORAGE_KEYS } from './storageService';

/**
 * Supported biometric authentication types
 */
export type BiometricType = 'fingerprint' | 'facial' | 'iris';

/**
 * Options for biometric authentication prompt
 */
export interface BiometricOptions {
  promptMessage?: string;
  cancelLabel?: string;
  disableDeviceFallback?: boolean;
  fallbackLabel?: string;
}

/**
 * Result of biometric authentication attempt
 */
export interface BiometricResult {
  success: boolean;
  error?: string;
  warning?: string;
}

/**
 * BiometricService class for biometric authentication operations
 */
class BiometricServiceClass {
  /**
   * Check if biometric authentication is available on the device
   * @returns True if biometric hardware is available, false otherwise
   */
  async isAvailable(): Promise<boolean> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      return hasHardware;
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get supported biometric authentication types
   * @returns Array of supported biometric types
   */
  async getSupportedTypes(): Promise<BiometricType[]> {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const supportedTypes: BiometricType[] = [];

      for (const type of types) {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            supportedTypes.push('fingerprint');
            break;
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            supportedTypes.push('facial');
            break;
          case LocalAuthentication.AuthenticationType.IRIS:
            supportedTypes.push('iris');
            break;
        }
      }

      return supportedTypes;
    } catch (error) {
      console.error('Error getting supported biometric types:', error);
      return [];
    }
  }

  /**
   * Authenticate user with biometric prompt
   * @param options - Optional configuration for the authentication prompt
   * @returns Result indicating success or failure with error details
   */
  async authenticate(options?: BiometricOptions): Promise<BiometricResult> {
    try {
      // Check if biometric is available
      const available = await this.isAvailable();
      if (!available) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      // Check if user has enrolled biometrics
      const enrolled = await this.isEnrolled();
      if (!enrolled) {
        return {
          success: false,
          error: 'No biometric credentials are enrolled on this device',
        };
      }

      // Perform authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: options?.promptMessage || 'Authenticate to continue',
        cancelLabel: options?.cancelLabel || 'Cancel',
        disableDeviceFallback: options?.disableDeviceFallback || false,
        fallbackLabel: options?.fallbackLabel,
      });

      if (result.success) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
          warning: result.warning,
        };
      }
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Check if user has enrolled biometric credentials
   * @returns True if biometric credentials are enrolled, false otherwise
   */
  async isEnrolled(): Promise<boolean> {
    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return enrolled;
    } catch (error) {
      console.error('Error checking biometric enrollment:', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication is enabled in app preferences
   * @returns True if biometric is enabled, false otherwise
   */
  async isEnabled(): Promise<boolean> {
    try {
      const enabled = await StorageService.get<boolean>(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === true;
    } catch (error) {
      console.error('Error checking biometric preference:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication in app preferences
   */
  async enable(): Promise<void> {
    try {
      await StorageService.set(STORAGE_KEYS.BIOMETRIC_ENABLED, true);
    } catch (error) {
      console.error('Error enabling biometric:', error);
      throw error;
    }
  }

  /**
   * Disable biometric authentication in app preferences
   */
  async disable(): Promise<void> {
    try {
      await StorageService.set(STORAGE_KEYS.BIOMETRIC_ENABLED, false);
    } catch (error) {
      console.error('Error disabling biometric:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const BiometricService = new BiometricServiceClass();
