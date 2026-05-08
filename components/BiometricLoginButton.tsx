import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

interface BiometricLoginButtonProps {
  onSuccess: (userId: string) => void;
  onError?: (error: string) => void;
}

export default function BiometricLoginButton({ 
  onSuccess, 
  onError 
}: BiometricLoginButtonProps) {
  const {
    capabilities,
    isLoading,
    authenticate,
    isBiometricLoginEnabled,
    getBiometricUserId,
    getBiometricTypeName,
  } = useBiometricAuth();

  const [isEnabled, setIsEnabled] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkIfEnabled();
  }, []);

  const checkIfEnabled = async () => {
    const enabled = await isBiometricLoginEnabled();
    setIsEnabled(enabled);
  };

  const handleBiometricLogin = async () => {
    try {
      setIsAuthenticating(true);

      // Get stored user ID
      const userId = await getBiometricUserId();
      if (!userId) {
        onError?.('Biometric login not set up. Please log in with your credentials.');
        return;
      }

      // Authenticate
      const result = await authenticate('Log in to Ajosave');

      if (result.success) {
        onSuccess(userId);
      } else {
        onError?.(result.error || 'Authentication failed');
      }
    } catch (error: any) {
      console.error('Biometric login error:', error);
      onError?.(error.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Don't show button if biometrics not available or not enabled
  if (isLoading || !capabilities.isAvailable || !isEnabled) {
    return null;
  }

  const biometricTypeName = getBiometricTypeName();
  const icon = capabilities.supportedTypes.includes('Face Recognition') 
    ? 'scan' 
    : 'finger-print';

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.line} />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          isAuthenticating && styles.buttonDisabled,
        ]}
        onPress={handleBiometricLogin}
        disabled={isAuthenticating}
      >
        {isAuthenticating ? (
          <ActivityIndicator color={Colors.primary.main} size="small" />
        ) : (
          <>
            <Ionicons name={icon} size={24} color={Colors.primary.main} />
            <Text style={styles.buttonText}>
              Log in with {biometricTypeName}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.md,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutral[300],
  },
  dividerText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[500],
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary.light + '20',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary.main,
  },
});
