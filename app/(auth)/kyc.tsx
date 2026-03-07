import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ScrollView, ActivityIndicator
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/AuthContext';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { extractFieldErrors, getErrorMessage } from '@/utils/errors';
import DateOfBirthInput from '@/components/DateOfBirthInput';

export default function KYCScreen() {
  const { signup, isLoading } = useAuth();
  const keyboardVisible = useKeyboardVisible();

  // Basic info passed from create-account screen
  const params = useLocalSearchParams<{
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
  }>();

  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (bvn.length !== 11) e.bvn = 'BVN must be 11 digits';
    if (nin.length !== 11) e.nin = 'NIN must be 11 digits';
    if (!dateOfBirth.trim()) e.dateOfBirth = 'Date of birth is required';
    return e;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setSubmitError('');

    try {
      const result = await signup({
        firstName: params.firstName,
        lastName: params.lastName,
        email: params.email,
        phoneNumber: params.phoneNumber,
        password: params.password,
        bvn,
        nin,
        dateOfBirth,
      });
      if (result && (result as any).requiresOtp) {
        router.replace({
          pathname: '/(auth)/verify-otp',
          params: { userId: (result as any).userId, phoneNumber: (result as any).phoneNumber, purpose: 'signup', devOtp: (result as any).devOtp ?? '' },
        });
      } else {
        router.replace('/(auth)/setup-biometric');
      }
    } catch (error: any) {
      const fieldErrors = extractFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      }
      setSubmitError(getErrorMessage(error));
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
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/welcome')}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.subtitle}>Complete your KYC verification</Text>
        </View>
        </View>

        <View style={[styles.cardWrapper, { paddingBottom: keyboardVisible ? 300 : 80 }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="location" color="#ffffff" style={styles.avatarIcon} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.formContainer}>
              <View style={styles.inputSection}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Please provide your identity details to complete registration.
                  </Text>
                </View>

                <Field label="BVN (11 digits)" error={errors.bvn}>
                  <TextInput
                    style={[styles.input, errors.bvn && styles.inputError]}
                    placeholder="Enter your BVN"
                    placeholderTextColor={Colors.neutral[500]}
                    value={bvn}
                    onChangeText={v => { setBvn(v.replace(/\D/g, '')); if (errors.bvn) setErrors(p => { const e = { ...p }; delete e.bvn; return e; }); }}
                    keyboardType="number-pad"
                    maxLength={11}
                    editable={!isLoading}
                  />
                </Field>

                <Field label="NIN (11 digits)" error={errors.nin}>
                  <TextInput
                    style={[styles.input, errors.nin && styles.inputError]}
                    placeholder="Enter your NIN"
                    placeholderTextColor={Colors.neutral[500]}
                    value={nin}
                    onChangeText={v => { setNin(v.replace(/\D/g, '')); if (errors.nin) setErrors(p => { const e = { ...p }; delete e.nin; return e; }); }}
                    keyboardType="number-pad"
                    maxLength={11}
                    editable={!isLoading}
                  />
                </Field>

                <DateOfBirthInput
                  value={dateOfBirth}
                  onChangeText={v => { setDateOfBirth(v); if (errors.dateOfBirth) setErrors(p => { const e = { ...p }; delete e.dateOfBirth; return e; }); }}
                  error={errors.dateOfBirth}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.buttonSection}>
                {submitError ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{submitError}</Text>
                  </View>
                ) : null}
                <Pressable style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleSubmit} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator color="#FFFFFF" /> : (
                    <>
                      <Text style={styles.buttonText}>Complete Registration</Text>
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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
      {error && <Text style={fieldStyles.error}>{error}</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[400], marginLeft: Spacing.md },
  error: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: '#ef4444', marginLeft: Spacing.xs },
});

const AVATAR_SIZE = 90;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, paddingTop: Spacing.xl },
  backButton: { margin: Spacing.xl },
  backArrow: { fontSize: 24, fontFamily: Typography.fontFamily.regular, color: Colors.primary.main },
  header: { alignItems: 'center', marginBottom: Spacing['3xl'] },
  title: { fontSize: 32, fontFamily: Typography.fontFamily.bold, color: Colors.primary.main },
  subtitle: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: Colors.primary.light },
  topSection: { backgroundColor: '#FFFFFF', paddingBottom: Spacing['3xl'] },
  cardWrapper: { position: 'relative', backgroundColor: '#b3ceef', paddingBottom: 80, borderTopLeftRadius: 50, borderTopRightRadius: 50 },
  avatarContainer: { position: 'absolute', top: -AVATAR_SIZE / 2, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: Colors.primary.main, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  avatarIcon: { fontSize: 48, fontFamily: Typography.fontFamily.regular },
  card: { backgroundColor: '#b3ceef', borderTopLeftRadius: 50, borderTopRightRadius: 50, paddingTop: AVATAR_SIZE / 2 + Spacing.xl, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  formContainer: {},
  inputSection: { gap: Spacing.lg },
  infoBox: { backgroundColor: 'rgba(255,255,255,0.7)', padding: Spacing.md, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: Colors.primary.main },
  infoText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[700], lineHeight: 20 },
  buttonSection: { paddingTop: Spacing.lg },
  input: { backgroundColor: '#FFFFFF', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: 8, fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light, borderWidth: 1, borderColor: Colors.neutral[200] },
  inputError: { borderColor: '#ef4444' },
  button: { backgroundColor: Colors.primary.main, paddingVertical: 20, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', fontFamily: Typography.fontFamily.semibold },
  arrow: { color: '#FFFFFF', fontSize: 24, fontFamily: Typography.fontFamily.regular },
  errorBanner: { backgroundColor: '#fee2e2', borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  errorBannerText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: '#b91c1c' },
});
