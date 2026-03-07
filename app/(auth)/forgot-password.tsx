import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { AuthService } from '@/services/authService';
import { getErrorMessage } from '@/utils/errors';
import PhoneInput from '@/components/PhoneInput';

export default function ForgotPasswordScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      return;
    }
    setPhoneError('');
    setSubmitError('');
    setIsLoading(true);
    try {
      const result = await AuthService.forgotPassword(phoneNumber);
      // If no userId returned, the phone wasn't found — but we still navigate
      // to avoid leaking whether the number exists
      router.push({
        pathname: '/(auth)/reset-password',
        params: {
          userId: result.userId ?? '',
          phoneNumber: result.phoneNumber ?? phoneNumber,
          devOtp: result.devOtp ?? '',
        },
      });
    } catch (error: any) {
      setSubmitError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

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
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/signin')}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>Enter your phone number and we'll send you a reset code</Text>
        </View>
      </View>

      <View style={styles.cardWrapper}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="lock-open-outline" color="#ffffff" style={styles.avatarIcon} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.formContainer}>
            <View style={styles.inputSection}>
              <PhoneInput
                value={phoneNumber}
                onChangeText={v => { setPhoneNumber(v); setPhoneError(''); setSubmitError(''); }}
                error={phoneError}
                editable={!isLoading}
              />
            </View>

            <View style={styles.buttonSection}>
              {submitError ? (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>{submitError}</Text>
                </View>
              ) : null}
              <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleSend} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#FFFFFF" /> : (
                  <>
                    <Text style={styles.buttonText}>Send Reset Code</Text>
                    <Text style={styles.arrow}>→</Text>
                  </>
                )}
              </Pressable>

              <View style={styles.signinContainer}>
                <Text style={styles.signinText}>Remember your password? </Text>
                <Pressable onPress={() => router.replace('/(auth)/signin')}>
                  <Text style={styles.signinLink}>Sign In</Text>
                </Pressable>
              </View>
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
  card: { backgroundColor: '#b3ceef', borderTopLeftRadius: 50, borderTopRightRadius: 50, paddingTop: AVATAR_SIZE / 2 + Spacing.xl, paddingHorizontal: Spacing.lg, flex: 1 },
  formContainer: { flex: 1, justifyContent: 'space-between' },
  inputSection: { gap: Spacing.lg },
  buttonSection: { paddingTop: Spacing.lg },
  button: { backgroundColor: Colors.primary.main, paddingVertical: 20, paddingHorizontal: Spacing.lg, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', fontFamily: Typography.fontFamily.semibold },
  arrow: { color: '#FFFFFF', fontSize: 24, fontFamily: Typography.fontFamily.regular },
  signinContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signinText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600] },
  signinLink: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },
  errorBanner: { backgroundColor: '#fee2e2', borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  errorBannerText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: '#b91c1c' },
});
