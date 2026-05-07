import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ScrollView, ActivityIndicator, Modal, Animated
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/AuthContext';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import { extractFieldErrors, getErrorMessage } from '@/utils/errors';
import GradientButton from '@/components/ui/GradientButton';

/**
 * Complete Profile Screen - Final Step
 * 
 * Collects name and password, then submits complete registration
 */
export default function CompleteProfileScreen() {
  const { signup, isLoading } = useAuth();
  const keyboardVisible = useKeyboardVisible();
  
  const params = useLocalSearchParams<{
    email: string;
    phoneNumber: string;
    userId: string;
    bvn: string;
    nin: string;
    dateOfBirth: string;
  }>();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyStep, setVerifyStep] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const verifySteps = [
    'Validating BVN...',
    'Validating NIN...',
    'Cross-checking identity...',
    'Finalising verification...',
  ];

  useEffect(() => {
    if (verifying) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 0.8, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [verifying]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (password.length < 8) e.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      e.password = 'Must include uppercase, lowercase, and a number';
    }
    return e;
  };

  const handleComplete = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitError('');

    // Simulate step-by-step verification
    setVerifying(true);
    setVerifyStep(0);
    for (let i = 0; i < verifySteps.length; i++) {
      setVerifyStep(i);
      await new Promise(res => setTimeout(res, 900));
    }

    try {
      const result = await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: params.email,
        phoneNumber: params.phoneNumber,
        password,
        bvn: params.bvn,
        nin: params.nin,
        dateOfBirth: params.dateOfBirth,
      });

      if (result && (result as any).requiresOtp) {
        router.replace({
          pathname: '/(auth)/verify-otp',
          params: {
            userId: (result as any).userId,
            email: (result as any).email,
            phoneNumber: (result as any).phoneNumber,
            purpose: 'signup',
            devOtp: (result as any).devOtp ?? ''
          },
        });
      } else {
        router.replace('/(auth)/setup-biometric');
      }
    } catch (error: any) {
      setVerifying(false);
      const fieldErrors = extractFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      }
      setSubmitError(getErrorMessage(error));
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.topSection}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/verify-nin')}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Complete Profile</Text>
            <Text style={styles.subtitle}>Final Step: Personal Information</Text>
          </View>
        </View>

        <View style={[styles.cardWrapper, { paddingBottom: keyboardVisible ? 300 : 80 }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" color="#ffffff" style={styles.avatarIcon} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.formContainer}>
              <View style={styles.inputSection}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Almost done! Please provide your name and create a secure password.
                  </Text>
                </View>

                <Field label="First Name" error={errors.firstName}>
                  <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    placeholder="Enter your first name"
                    placeholderTextColor={Colors.neutral[500]}
                    value={firstName}
                    onChangeText={v => {
                      setFirstName(v);
                      if (errors.firstName) setErrors(p => { const e = { ...p }; delete e.firstName; return e; });
                    }}
                    autoCapitalize="words"
                  />
                </Field>

                <Field label="Last Name" error={errors.lastName}>
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    placeholder="Enter your last name"
                    placeholderTextColor={Colors.neutral[500]}
                    value={lastName}
                    onChangeText={v => {
                      setLastName(v);
                      if (errors.lastName) setErrors(p => { const e = { ...p }; delete e.lastName; return e; });
                    }}
                    autoCapitalize="words"
                  />
                </Field>

                <Field label="Password" error={errors.password} hint="Min 8 chars with uppercase, lowercase, and number">
                  <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Min 8 characters"
                      placeholderTextColor={Colors.neutral[500]}
                      value={password}
                      onChangeText={v => {
                        setPassword(v);
                        if (errors.password) setErrors(p => { const e = { ...p }; delete e.password; return e; });
                      }}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={17}
                        color={Colors.neutral[600]}
                      />
                    </Pressable>
                  </View>
                </Field>
              </View>

              <View style={styles.buttonSection}>
                {submitError ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{submitError}</Text>
                  </View>
                ) : null}

                <GradientButton
                  label={isLoading ? 'Creating Account...' : 'Create Account'}
                  onPress={handleComplete}
                  disabled={isLoading}
                  icon="checkmark-circle"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Verification overlay */}
      <Modal transparent visible={verifying} animationType="none">
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <View style={styles.verifyCard}>
            <ActivityIndicator size="large" color={Colors.primary.main} style={{ marginBottom: 20 }} />
            <Text style={styles.verifyTitle}>Verifying Identity</Text>
            <Text style={styles.verifyStep}>{verifySteps[verifyStep]}</Text>
            <View style={styles.stepDots}>
              {verifySteps.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i <= verifyStep && styles.dotActive]}
                />
              ))}
            </View>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
}

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
      {error ? <Text style={fieldStyles.error}>{error}</Text> : hint ? <Text style={fieldStyles.hint}>{hint}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[700], marginLeft: Spacing.md },
  error: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: '#ef4444', marginLeft: Spacing.xs },
  hint: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginLeft: Spacing.xs },
});

const AVATAR_SIZE = 90;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { flexGrow: 1, paddingTop: Spacing.xl },
  backButton: { margin: Spacing.xl },
  backArrow: { fontSize: 24, fontFamily: Typography.fontFamily.regular, color: Colors.primary.main },
  header: { alignItems: 'center', marginBottom: Spacing['3xl'], paddingHorizontal: Spacing.xl },
  title: { fontSize: 32, fontFamily: Typography.fontFamily.bold, color: Colors.primary.main, marginBottom: Spacing.xs },
  subtitle: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: Colors.primary.light },
  topSection: { backgroundColor: '#FFFFFF', paddingBottom: Spacing['3xl'] },
  cardWrapper: { position: 'relative', backgroundColor: '#b3ceef', paddingBottom: 80, borderTopLeftRadius: 50, borderTopRightRadius: 50 },
  avatarContainer: { position: 'absolute', top: -AVATAR_SIZE / 2, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  avatar: { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: Colors.primary.main, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  avatarIcon: { fontSize: 48, fontFamily: Typography.fontFamily.regular },
  card: { backgroundColor: '#b3ceef', borderTopLeftRadius: 50, borderTopRightRadius: 50, paddingTop: AVATAR_SIZE / 2 + Spacing.xl, paddingHorizontal: Spacing.lg },
  formContainer: {},
  inputSection: { gap: Spacing.lg },
  infoBox: { backgroundColor: 'rgba(255,255,255,0.7)', padding: Spacing.md, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: Colors.primary.main },
  infoText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[700], lineHeight: 20 },
  buttonSection: { paddingTop: Spacing.lg },
  input: { backgroundColor: '#FFFFFF', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: 8, fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light, borderWidth: 1, borderColor: Colors.neutral[200] },
  inputError: { borderColor: '#ef4444' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: Colors.neutral[200], paddingRight: Spacing.md },
  passwordInput: { flex: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light },
  errorBanner: { backgroundColor: '#fee2e2', borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  errorBannerText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: '#b91c1c' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  verifyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 36, alignItems: 'center', width: '78%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 12 },
  verifyTitle: { fontSize: 18, fontFamily: Typography.fontFamily.bold, color: Colors.primary.main, marginBottom: 8 },
  verifyStep: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600], marginBottom: 20, textAlign: 'center' },
  stepDots: { flexDirection: 'row', gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.neutral[300] },
  dotActive: { backgroundColor: Colors.primary.main },
});
