import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { AuthService } from '@/services/authService';
import { getErrorMessage } from '@/utils/errors';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ userId: string; phoneNumber: string; devOtp?: string }>();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (params.devOtp) setOtp(params.devOtp.split(''));
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
    if (!canResend || !params.userId) return;
    try {
      const result = await AuthService.sendOtp(params.userId);
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      if (result.devOtp) setOtp(result.devOtp.split(''));
    } catch (error: any) {
      setSubmitError(getErrorMessage(error));
    }
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (otp.join('').length !== 6) e.otp = 'Please enter the 6-digit code';
    if (newPassword.length < 8) e.newPassword = 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      e.newPassword = 'Must include uppercase, lowercase, and a number';
    }
    if (newPassword !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleReset = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    if (!params.userId) {
      setSubmitError('Unable to reset password. Please start over.');
      return;
    }
    setSubmitError('');
    setIsLoading(true);
    try {
      await AuthService.resetPassword(params.userId, otp.join(''), newPassword);
      router.replace({
        pathname: '/(auth)/signin',
        params: { resetSuccess: '1' },
      });
    } catch (error: any) {
      setSubmitError(getErrorMessage(error));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const maskedPhone = params.phoneNumber
    ? params.phoneNumber.replace(/(\+\d{3})\d+(\d{4})/, '$1****$2')
    : 'your phone';

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.topSection}>
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/forgot-password')}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter the code sent to {maskedPhone} and choose a new password</Text>
        </View>
      </View>

      <View style={styles.cardWrapper}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="key-outline" color="#ffffff" style={styles.avatarIcon} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.inputSection}>

            {/* OTP */}
            <View style={styles.group}>
              <Text style={styles.label}>Verification Code</Text>
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
                    style={[styles.otpBox, digit && styles.otpBoxFilled, errors.otp && styles.otpBoxError]}
                    value={digit}
                    onChangeText={v => { handleOtpChange(v, index); setErrors(p => { const e = { ...p }; delete e.otp; return e; }); }}
                    onKeyPress={e => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    autoFocus={index === 0}
                    editable={!isLoading}
                  />
                ))}
              </View>
              {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
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

            {/* New Password */}
            <View style={styles.group}>
              <Text style={styles.label}>New Password</Text>
              <View style={[styles.passwordContainer, errors.newPassword && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Min 8 characters"
                  placeholderTextColor={Colors.neutral[500]}
                  value={newPassword}
                  onChangeText={v => { setNewPassword(v); setErrors(p => { const e = { ...p }; delete e.newPassword; return e; }); }}
                  secureTextEntry={!showPassword}
                  editable={!isLoading}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={17} color={Colors.neutral[600]} />
                </Pressable>
              </View>
              {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
            </View>

            {/* Confirm Password */}
            <View style={styles.group}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={[styles.passwordContainer, errors.confirmPassword && styles.inputError]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Re-enter new password"
                  placeholderTextColor={Colors.neutral[500]}
                  value={confirmPassword}
                  onChangeText={v => { setConfirmPassword(v); setErrors(p => { const e = { ...p }; delete e.confirmPassword; return e; }); }}
                  secureTextEntry={!showConfirm}
                  editable={!isLoading}
                />
                <Pressable onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={17} color={Colors.neutral[600]} />
                </Pressable>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
            </View>

          </View>

          <View style={styles.buttonSection}>
            {submitError ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{submitError}</Text>
              </View>
            ) : null}
            <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleReset} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#FFFFFF" /> : (
                <>
                  <Text style={styles.buttonText}>Reset Password</Text>
                  <Text style={styles.arrow}>→</Text>
                </>
              )}
            </Pressable>
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
  backButton: { margin: Spacing.xl },
  backArrow: { fontSize: 24, fontFamily: Typography.fontFamily.regular, color: Colors.primary.main },
  header: { alignItems: 'center', marginBottom: Spacing['3xl'], paddingHorizontal: Spacing.xl },
  title: { fontSize: 28, fontFamily: Typography.fontFamily.bold, color: Colors.primary.main, marginBottom: Spacing.sm },
  subtitle: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600], textAlign: 'center', lineHeight: 20 },
  topSection: { backgroundColor: '#FFFFFF', paddingBottom: Spacing['3xl'] },
  cardWrapper: { position: 'relative', backgroundColor: '#b3ceef', flex: 1, borderTopLeftRadius: 50, borderTopRightRadius: 50 },
  avatarContainer: { position: 'absolute', top: -AVATAR_SIZE / 2, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: Colors.primary.main, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  avatarIcon: { fontSize: 44, fontFamily: Typography.fontFamily.regular },
  card: { backgroundColor: '#b3ceef', borderTopLeftRadius: 50, borderTopRightRadius: 50, paddingTop: AVATAR_SIZE / 2 + Spacing.xl, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg, flex: 1 },
  inputSection: { gap: Spacing.lg },
  group: { gap: Spacing.xs },
  label: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[400], marginLeft: Spacing.md },
  otpContainer: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm },
  otpBox: { width: 48, height: 54, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 2, borderColor: Colors.neutral[200], fontSize: 22, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, textAlign: 'center' },
  otpBoxFilled: { borderColor: Colors.primary.main },
  otpBoxError: { borderColor: '#ef4444' },
  resendContainer: { alignItems: 'center', marginTop: Spacing.sm },
  timerText: { fontSize: 13, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600] },
  resendText: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main, textDecorationLine: 'underline' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: Colors.neutral[200], paddingRight: Spacing.md },
  passwordInput: { flex: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light },
  inputError: { borderColor: '#ef4444' },
  errorText: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: '#ef4444', marginLeft: Spacing.xs },
  buttonSection: { paddingTop: Spacing.lg },
  button: { backgroundColor: Colors.primary.main, paddingVertical: 20, paddingHorizontal: Spacing.lg, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', fontFamily: Typography.fontFamily.semibold },
  arrow: { color: '#FFFFFF', fontSize: 24, fontFamily: Typography.fontFamily.regular },
  errorBanner: { backgroundColor: '#fee2e2', borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  errorBannerText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: '#b91c1c' },
  devBanner: { backgroundColor: '#fefce8', borderWidth: 1, borderColor: '#fde047', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: Spacing.xs },
  devBannerText: { fontSize: 12, fontFamily: Typography.fontFamily.semibold, color: '#854d0e', textAlign: 'center' },
});
