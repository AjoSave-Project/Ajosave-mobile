import { View, Text, StyleSheet, Pressable, Image, Platform, Animated, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { AuthService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

const IS_DEV = process.env.EXPO_PUBLIC_ENV !== 'production';

type ScanState = 'idle' | 'scanning' | 'success' | 'error';

export default function SetupBiometricScreen() {
  const { refreshUser } = useAuth();
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const scanLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => { scanLoopRef.current?.stop(); };
  }, []);

  const startScanAnimation = () => {
    scanLineAnim.setValue(0);
    scanLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(scanLineAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    );
    scanLoopRef.current.start();
  };

  const stopScanAnimation = () => {
    scanLoopRef.current?.stop();
  };

  const handleScan = async () => {
    if (scanState === 'scanning') return;
    setScanState('scanning');
    startScanAnimation();

    if (IS_DEV) {
      // Dev simulation — wait 2.5s then call backend
      setTimeout(async () => {
        stopScanAnimation();
        await submitVerification();
      }, 2500);
    } else {
      // Production: Launch Persona SDK
      // TODO: Install @persona-kyc/react-native and configure
      //
      // import Persona from '@persona-kyc/react-native';
      // Persona.start({
      //   templateId: process.env.EXPO_PUBLIC_PERSONA_TEMPLATE_ID,
      //   environment: 'production',
      //   onSuccess: async ({ inquiryId }) => {
      //     stopScanAnimation();
      //     await submitVerification(inquiryId);
      //   },
      //   onError: (error) => {
      //     stopScanAnimation();
      //     setScanState('error');
      //     Alert.alert('Verification Failed', error.message);
      //   },
      //   onCancel: () => {
      //     stopScanAnimation();
      //     setScanState('idle');
      //   },
      // });
      Alert.alert('Production Mode', 'Persona SDK not yet configured. Set EXPO_PUBLIC_ENV=production and install @persona-kyc/react-native.');
      stopScanAnimation();
      setScanState('idle');
    }
  };

  const submitVerification = async (inquiryId?: string) => {
    try {
      setIsSubmitting(true);
      await AuthService.verifyFace();
      await refreshUser();
      setScanState('success');
    } catch (err: any) {
      setScanState('error');
      Alert.alert('Verification Failed', err.message || 'Could not complete face verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetStarted = () => router.replace('/(tabs)/home');
  const handleSkip = () => router.replace('/(tabs)/home');

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 180],
  });

  if (scanState === 'success') {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>Verification Successful</Text>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={100} color="#FFFFFF" />
          </View>
          <Text style={styles.successSubtitle}>
            Congratulations! You have successfully created your account.
          </Text>
        </View>
        <Pressable style={styles.button} onPress={handleGetStarted}>
          <Text style={styles.buttonText}>Get Started</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/welcome')}>
        <Text style={styles.backArrow}>←</Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>Face Verification</Text>
        <Text style={styles.subtitle}>
          {IS_DEV ? 'Dev simulation — tap to verify instantly' : 'Position your face within the frame'}
        </Text>
      </View>

      {IS_DEV && (
        <View style={styles.devBanner}>
          <Text style={styles.devBannerText}>DEV MODE — Face scan is simulated</Text>
        </View>
      )}

      <View style={styles.faceFrameContainer}>
        <View style={styles.faceFrame}>
          <Image
            source={require('@/assets/images/icons8-face-scan.png')}
            style={styles.faceIcon}
            resizeMode="contain"
          />
          {scanState === 'scanning' && (
            <Animated.View
              style={[styles.scanLine, { transform: [{ translateY: scanLineTranslate }] }]}
            />
          )}
          {scanState === 'error' && (
            <View style={styles.errorOverlay}>
              <Ionicons name="close-circle" size={60} color={Colors.error.main} />
            </View>
          )}
        </View>

        <Text style={styles.scanStatus}>
          {scanState === 'idle' && 'Ready to scan'}
          {scanState === 'scanning' && (IS_DEV ? 'Simulating scan...' : 'Hold still...')}
          {scanState === 'error' && 'Scan failed — try again'}
        </Text>
      </View>

      <View style={styles.spacer} />

      {isSubmitting ? (
        <View style={[styles.button, styles.buttonDisabled]}>
          <ActivityIndicator color="#FFFFFF" />
          <Text style={styles.buttonText}>Verifying...</Text>
        </View>
      ) : (
        <Pressable
          style={[styles.button, scanState === 'scanning' && styles.buttonDisabled]}
          onPress={scanState === 'error' ? () => setScanState('idle') : handleScan}
          disabled={scanState === 'scanning'}
        >
          <Text style={styles.buttonText}>
            {scanState === 'error' ? 'Try Again' : scanState === 'scanning' ? 'Scanning...' : 'Scan my Face'}
          </Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      )}

      {scanState !== 'scanning' && !isSubmitting && (
        <Pressable onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.light, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.xl },
  backButton: { marginBottom: Spacing.lg },
  backArrow: { fontSize: 24, fontFamily: Typography.fontFamily.regular, color: Colors.primary.main },
  header: { alignItems: 'center', marginBottom: Spacing.lg },
  title: { fontSize: 32, fontWeight: '700', fontFamily: Typography.fontFamily.bold, color: Colors.primary.main, marginBottom: Spacing.sm },
  subtitle: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600], textAlign: 'center' },
  devBanner: { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde047', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: Spacing.md, alignItems: 'center' },
  devBannerText: { fontSize: 12, fontFamily: Typography.fontFamily.semibold, color: '#854d0e' },
  faceFrameContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg },
  faceFrame: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderRadius: 16, borderWidth: 2, borderColor: Colors.primary.light },
  faceIcon: { width: Platform.OS === 'ios' ? 150 : 190, height: Platform.OS === 'ios' ? 150 : 190 },
  scanLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: Colors.primary.main, opacity: 0.8, borderRadius: 2 },
  errorOverlay: { position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)', top: 0, left: 0, right: 0, bottom: 0 },
  scanStatus: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600], textAlign: 'center' },
  spacer: { height: Spacing.xl },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.lg },
  successTitle: { fontSize: 32, fontFamily: Typography.fontFamily.bold, color: Colors.primary.main, textAlign: 'center', marginBottom: Spacing.xl },
  checkmarkCircle: { width: 200, height: 200, borderRadius: 100, backgroundColor: Colors.success.main, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.xl },
  successSubtitle: { fontSize: 16, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600], textAlign: 'center', lineHeight: 24 },
  button: { backgroundColor: Colors.primary.main, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', fontFamily: Typography.fontFamily.semibold },
  arrow: { color: '#FFFFFF', fontSize: 24, fontFamily: Typography.fontFamily.regular },
  skipText: { color: Colors.neutral[600], fontSize: 16, fontFamily: Typography.fontFamily.regular, textAlign: 'center', marginBottom: Spacing.md },
});
