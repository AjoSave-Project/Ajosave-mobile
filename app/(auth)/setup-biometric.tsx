import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

/**
 * Biometric Setup Screen
 * 
 * Allows users to set up Face ID/Touch ID for quick access
 */
export default function SetupBiometricScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);

  const handleScanFace = () => {
    setIsScanning(true);
    
    // Simulate scanning for 2 seconds, then show success
    setTimeout(() => {
      setScanSuccess(true);
      setIsScanning(false);
    }, 2000);
  };

  const handleGetStarted = () => {
    router.replace('/(tabs)/home');
  };

  const handleSkip = () => {
    router.replace('/(tabs)/home');
  };

  // Show verification successful screen
  if (scanSuccess) {
    return (
      <View style={styles.container}>
        <View style={styles.successScreenContainer}>
          {/* Title */}
          <Text style={styles.successTitle}>Verification Successful</Text>
          
          {/* Green Circle with Checkmark */}
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={100} color="#FFFFFF" />
          </View>
          
          {/* Subtitle */}
          <Text style={styles.successSubtitle}>
            Congratulations! You have successfully created your account.
          </Text>
        </View>

        {/* Get Started Button */}
        <Pressable style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => {
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(auth)/welcome');
        }
      }}>
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Set up Face ID</Text>
        <Text style={styles.subtitle}>
          Unlock your wallet with your FaceID,{'\n'}quick and secured
        </Text>
      </View>

      {/* Face ID Icon */}
      <View style={styles.iconContainer}>
        <View style={styles.faceFrame}>
          <Image 
            source={require('@/assets/images/icons8-face-scan.png')} 
            style={styles.faceIcon}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Scan Button */}
      <Pressable 
        style={[styles.button, isScanning && styles.buttonDisabled]} 
        onPress={handleScanFace}
        disabled={isScanning}
      >
        <Text style={styles.buttonText}>
          {isScanning ? 'Scanning...' : 'Scan my Face'}
        </Text>
        <Text style={styles.arrow}>→</Text>
      </Pressable>

      {/* Skip Option */}
      {!isScanning && (
        <Pressable onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    marginBottom: Spacing.lg,
  },
  backArrow: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.primary.main,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  iconContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceFrame: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceIcon: {
    width: Platform.OS === 'ios' ? 150 : 200,
    height: Platform.OS === 'ios' ? 150 : 200
  },
  successScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  successTitle: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  checkmarkCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.success.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  successSubtitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  spacer: {
    height: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: Typography.fontFamily.regular,
  },
  skipText: {
    color: Colors.neutral[600],
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
});
