import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/authService';

export default function VerifyOTPScreen() {
  const { completeOtpLogin } = useAuth();
  const params = useLocalSearchParams<{ userId: string; phoneNumber: string; purpose: string; devOtp?: string }>();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Auto-fill in dev mode
    if (params.devOtp) {
      setOtp(params.devOtp.split(''));
    }
  }, [params.devOtp]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      const result = await AuthService.sendOtp(params.userId);
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      // Auto-fill new dev OTP if returned
      if (result.devOtp) {
        setOtp(result.devOtp.split(''));
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    try {
      setIsLoading(true);
      const result = await AuthService.verifyOtp(params.userId, otpCode);
      await completeOtpLogin(result.user, result.token);

      if (params.purpose === 'signup') {
        router.replace('/(auth)/setup-biometric');
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message || 'Invalid or expired OTP');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const isOtpComplete = otp.every(d => d !== '');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const maskedPhone = params.phoneNumber
    ? params.phoneNumber.replace(/(\+\d{3})\d+(\d{4})/, '$1****$2')
    : 'your phone';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/welcome')}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>We've sent a 6-digit code to {maskedPhone}</Text>
        </View>

        <View style={styles.cardWrapper}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="lock-closed" color="#ffffff" style={styles.avatarIcon} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.formContainer}>
              <View style={styles.inputSection}>
                <Text style={styles.otpLabel}>Enter Code</Text>

                {params.devOtp ? (
                  <View style={styles.devBanner}>
                    <Text style={styles.devBannerText}>DEV MODE — OTP auto-filled: {params.devOtp}</Text>
                  </View>
                ) : null}

                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => { inputRefs.current[index] = ref; }}
                      style={[styles.otpBox, digit && styles.otpBoxFilled]}
                      value={digit}
                      onChangeText={value => handleOtpChange(value, index)}
                      onKeyPress={e => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      autoFocus={index === 0}
                      editable={!isLoading}
                    />
                  ))}
                </View>

                <View style={styles.resendContainer}>
                  {!canResend ? (
                    <Text style={styles.timerText}>Resend code in {formatTime(timer)}</Text>
                  ) : (
                    <Pressable onPress={handleResend}>
                      <Text style={styles.resendText}>Resend Code</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              <View style={styles.buttonSection}>
                <Pressable
                  style={[styles.button, (!isOtpComplete || isLoading) && styles.buttonDisabled]}
                  onPress={handleVerify}
                  disabled={!isOtpComplete || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>Verify</Text>
                      <Text style={styles.arrow}>→</Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const AVATAR_SIZE = 90;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, paddingTop: Spacing.xl },
  backButton: { margin: Spacing.xl },
  backArrow: { fontSize: 24, fontFamily: Typography.fontFamily.regular, color: Colors.primary.main },
  header: { alignItems: 'center', marginBottom: Spacing['3xl'], paddingHorizontal: Spacing.xl },
  title: { fontSize: 25, fontFamily: Typography.fontFamily.bold, color: Colors.primary.main, marginBottom: Spacing.sm },
  subtitle: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600], textAlign: 'center', lineHeight: 20 },
  cardWrapper: { position: 'relative', flex: 1 },
  avatarContainer: { position: 'absolute', top: -AVATAR_SIZE / 2, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: Colors.primary.main, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  avatarIcon: { fontSize: 48, fontFamily: Typography.fontFamily.regular },
  card: { flex: 1, backgroundColor: '#b3ceefaf', borderTopLeftRadius: 50, borderTopRightRadius: 50, paddingTop: AVATAR_SIZE / 2 + Spacing.xl, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  formContainer: { flex: 1 },
  inputSection: { gap: Spacing.lg, alignItems: 'center' },
  buttonSection: { marginTop: 'auto' },
  otpLabel: { fontSize: 16, fontFamily: Typography.fontFamily.semibold, color: Colors.neutral[700], marginBottom: Spacing.sm },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, width: '100%', paddingHorizontal: Spacing.sm },
  otpBox: { width: 50, height: 56, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 2, borderColor: Colors.neutral[200], fontSize: 24, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, textAlign: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  otpBoxFilled: { borderColor: Colors.primary.main, borderWidth: 2 },
  resendContainer: { marginTop: Spacing.md, alignItems: 'center' },
  timerText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600] },
  resendText: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main, textDecorationLine: 'underline' },
  devBanner: { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde047', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  devBannerText: { fontSize: 12, fontFamily: Typography.fontFamily.semibold, color: '#854d0e', textAlign: 'center' },
  button: { backgroundColor: Colors.primary.main, paddingVertical: 20, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', fontFamily: Typography.fontFamily.semibold },
  arrow: { color: '#FFFFFF', fontSize: 24, fontFamily: Typography.fontFamily.regular },
});
