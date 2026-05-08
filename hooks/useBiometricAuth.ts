import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface BiometricAuthResult {
  success: boolean;
  error?: string;
  biometricType?: string;
}

interface BiometricCapabilities {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: string[];
  hasHardware: boolean;
}

export const useBiometricAuth = () => {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    isAvailable: false,
    isEnrolled: false,
    supportedTypes: [],
    hasHardware: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBiometricCapabilities();
  }, []);

  /**
   * Check device biometric capabilities
   */
  const checkBiometricCapabilities = async () => {
    try {
      setIsLoading(true);

      // Check if hardware supports biometrics
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      
      // Check if biometrics are enrolled
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      // Get supported authentication types
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      const typeNames = supportedTypes.map(type => {
        switch (type) {
          case LocalAuthentication.AuthenticationType.FINGERPRINT:
            return 'Fingerprint';
          case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
            return 'Face Recognition';
          case LocalAuthentication.AuthenticationType.IRIS:
            return 'Iris';
          default:
            return 'Unknown';
        }
      });

      setCapabilities({
        isAvailable: hasHardware && isEnrolled,
        isEnrolled,
        supportedTypes: typeNames,
        hasHardware,
      });
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      setCapabilities({
        isAvailable: false,
        isEnrolled: false,
        supportedTypes: [],
        hasHardware: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Authenticate user with biometrics
   */
  const authenticate = async (
    promptMessage: string = 'Authenticate to continue'
  ): Promise<BiometricAuthResult> => {
    try {
      // Check if biometrics are available
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      // Perform authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        cancelLabel: 'Cancel',
        disableDeviceFallback: false, // Allow PIN/Password fallback
        fallbackLabel: 'Use PIN',
      });

      if (result.success) {
        return {
          success: true,
          biometricType: capabilities.supportedTypes[0],
        };
      } else {
        return {
          success: false,
          error: result.error || 'Authentication failed',
        };
      }
    } catch (error: any) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  };

  /**
   * Enable biometric login for user
   */
  const enableBiometricLogin = async (userId: string): Promise<boolean> => {
    try {
      // Authenticate first
      const authResult = await authenticate('Enable biometric login');
      
      if (!authResult.success) {
        return false;
      }

      // Store user preference
      await SecureStore.setItemAsync('biometric_enabled', 'true');
      await SecureStore.setItemAsync('biometric_user_id', userId);
      
      return true;
    } catch (error) {
      console.error('Error enabling biometric login:', error);
      return false;
    }
  };

  /**
   * Disable biometric login
   */
  const disableBiometricLogin = async (): Promise<boolean> => {
    try {
      await SecureStore.deleteItemAsync('biometric_enabled');
      await SecureStore.deleteItemAsync('biometric_user_id');
      return true;
    } catch (error) {
      console.error('Error disabling biometric login:', error);
      return false;
    }
  };

  /**
   * Check if biometric login is enabled
   */
  const isBiometricLoginEnabled = async (): Promise<boolean> => {
    try {
      const enabled = await SecureStore.getItemAsync('biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric login status:', error);
      return false;
    }
  };

  /**
   * Get stored user ID for biometric login
   */
  const getBiometricUserId = async (): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync('biometric_user_id');
    } catch (error) {
      console.error('Error getting biometric user ID:', error);
      return null;
    }
  };

  /**
   * Get user-friendly biometric type name
   */
  const getBiometricTypeName = (): string => {
    if (capabilities.supportedTypes.includes('Face Recognition')) {
      return Platform.OS === 'ios' ? 'Face ID' : 'Face Recognition';
    } else if (capabilities.supportedTypes.includes('Fingerprint')) {
      return Platform.OS === 'ios' ? 'Touch ID' : 'Fingerprint';
    } else if (capabilities.supportedTypes.includes('Iris')) {
      return 'Iris Recognition';
    }
    return 'Biometric Authentication';
  };

  return {
    capabilities,
    isLoading,
    authenticate,
    enableBiometricLogin,
    disableBiometricLogin,
    isBiometricLoginEnabled,
    getBiometricUserId,
    getBiometricTypeName,
    checkBiometricCapabilities,
  };
};
