import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { AuthService } from '@/services/authService';
import { getErrorMessage } from '@/utils/errors';

/**
 * Verify Contact Screen - Step 2 of 4
 * 
 * Sends OTP to email and verifies it before proceeding to identity verification
 */
export default function VerifyContactScreen() {
  const params = useLocalSearchParams<{ email: string; phoneNumber: string }>();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [userId, setUserId] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Send initial OTP on mount
  useEffect(() => {
    sendInitialOtp();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const sendInitialOtp = async () => {
    setIsSending(true);
    try {
      // Create a temporary user to send OTP
      const response = await AuthService.sendOtpToEmail(params.email, params.phoneNumber);
      setUserId(response.userId);
    } catch (error: any) {
      Alert.alert('Error', getErrorMessage(error));
      router.back();
    } finally {
      setIsSending(false);
    }
  };

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
    if (!canResend || !userId) return;
    try {
      const result = await AuthService.sendOtp(userId);
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Success', `Verification code sent to ${result.email || params.email}`);
    } catch (error: any) {
      Alert.alert('Error', getErrorMessage(error));
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    if (!userId) {
      Alert.alert('Error', 'Session expired. Please start over.');
      router.back();
      return;
    }

    setIsLoading(true);
    try {
      // Verify OTP without completing signup
      await AuthService.verifyContactOtp(userId, otpCode);
      
      // Navigate to BVN verification with contact info
      router.push({
        pathname: '/(auth)/verify-bvn',
        params: { 
          email: params.email, 
          phoneNumber: params.phoneNumber,
          userId 
        },
      });
    } catch (error: any) {
      Alert.alert('Verification Failed', getErrorMessage(error));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const isOtpComplete = otp.every(d => d !== '');
  const maskedEmail = params.email ? params.email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 'your email';
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSending) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Sending verification code...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      <View style={styles.topSection}>
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/create-account')}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Verify Email</Text>
          <Text style={styles.subtitle}>Step 2 of 4: Email Verification</Text>
          <Text style={styles.maskedEmail}>Code sent to {maskedEmail}</Text>
        </View>
      </View>

      <View style={styles.cardWrapper}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="mail-open" color="#ffffff" style={styles.avatarIcon} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.formContainer}>
            <View style={styles.inputSection}>
              <View style={styles.testBanner}>
                <Ionicons name="information-circle" size={20} color="#1e40af" />
                <Text style={styles.testBannerText}>Test step: Use code 123456</Text>
              </View>
              
              <Text style={styles.otpLabel}>Enter Code</Text>

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

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '50%' }]} />
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
                    <Text style={styles.buttonText}>Verify & Continue</Text>
                    <Text style={styles.arrow}>→</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const AVATAR_SIZE = 90;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, paddingTop: Spacing.xl },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  loadingText: { marginTop: Spacing.md, fontSize: 16, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600] },
  backButton: { margin: Spacing.xl },
  backArrow: { fontSize: 24, fontFamily: Typography.fontFamily.regular, color: Colors.primary.main },
  header: { alignItems: 'center', marginBottom: Spacing['3xl'], paddingHorizontal: Spacing.xl },
  title: { fontSize: 28, fontFamily: Typography.fontFamily.bold, color: Colors.primary.main, marginBottom: Spacing.xs },
  subtitle: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: Colors.primary.light, marginBottom: Spacing.xs },
  maskedEmail: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], textAlign: 'center' },
  topSection: { backgroundColor: '#FFFFFF', paddingBottom: Spacing['3xl'] },
  cardWrapper: { position: 'relative', backgroundColor: '#b3ceef', flex: 1, borderTopLeftRadius: 50, borderTopRightRadius: 50 },
  avatarContainer: { position: 'absolute', top: -AVATAR_SIZE / 2, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: Colors.primary.main, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  avatarIcon: { fontSize: 48, fontFamily: Typography.fontFamily.regular },
  card: { backgroundColor: '#b3ceef', borderTopLeftRadius: 50, borderTopRightRadius: 50, paddingTop: AVATAR_SIZE / 2 + Spacing.xl, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, flex: 1 },
  formContainer: { flex: 1, justifyContent: 'space-between' },
  inputSection: { gap: Spacing.lg, alignItems: 'center' },
  buttonSection: { marginTop: 'auto' },
  testBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#dbeafe', borderWidth: 1, borderColor: '#3b82f6', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, width: '100%' },
  testBannerText: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: '#1e40af' },
  otpLabel: { fontSize: 16, fontFamily: Typography.fontFamily.semibold, color: Colors.neutral[700], marginBottom: Spacing.sm },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.md, width: '100%', paddingHorizontal: Spacing.sm },
  otpBox: { width: 50, height: 56, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 2, borderColor: Colors.neutral[200], fontSize: 24, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, textAlign: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  otpBoxFilled: { borderColor: Colors.primary.main, borderWidth: 2 },
  resendContainer: { marginTop: Spacing.md, alignItems: 'center' },
  timerText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600] },
  resendText: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main, textDecorationLine: 'underline' },
  devBanner: { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde047', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12 },
  devBannerText: { fontSize: 12, fontFamily: Typography.fontFamily.semibold, color: '#854d0e', textAlign: 'center' },
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden', marginTop: Spacing.md, width: '100%' },
  progressFill: { height: '100%', backgroundColor: Colors.primary.main, borderRadius: 2 },
  button: { backgroundColor: Colors.primary.main, paddingVertical: 20, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', fontFamily: Typography.fontFamily.semibold },
  arrow: { color: '#FFFFFF', fontSize: 24, fontFamily: Typography.fontFamily.regular },
});
