import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, ScrollView
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import PhoneInput from '@/components/PhoneInput';

export default function CreateAccountScreen() {
  const keyboardVisible = useKeyboardVisible();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.firstName.trim()) e.firstName = 'First name is required';
    if (!formData.lastName.trim()) e.lastName = 'Last name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    if (!formData.phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    if (formData.password.length < 8) e.password = 'Password must be at least 8 characters';
    return e;
  };

  const handleContinue = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    // Pass basic info to KYC screen to complete registration
    router.push({
      pathname: '/(auth)/kyc',
      params: formData,
    });
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
          <Text style={styles.title}>Hello!</Text>
          <Text style={styles.subtitle}>Welcome to AjoSave</Text>
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

                <Field label="First Name" error={errors.firstName}>
                  <TextInput style={[styles.input, errors.firstName && styles.inputError]} placeholder="Enter your first name" placeholderTextColor={Colors.neutral[500]} value={formData.firstName} onChangeText={v => update('firstName', v)} />
                </Field>

                <Field label="Last Name" error={errors.lastName}>
                  <TextInput style={[styles.input, errors.lastName && styles.inputError]} placeholder="Enter your last name" placeholderTextColor={Colors.neutral[500]} value={formData.lastName} onChangeText={v => update('lastName', v)} />
                </Field>

                <Field label="Email Address" error={errors.email}>
                  <TextInput style={[styles.input, errors.email && styles.inputError]} placeholder="Enter your email" placeholderTextColor={Colors.neutral[500]} value={formData.email} onChangeText={v => update('email', v)} keyboardType="email-address" autoCapitalize="none" />
                </Field>

                <PhoneInput
                  value={formData.phoneNumber}
                  onChangeText={v => update('phoneNumber', v)}
                  error={errors.phoneNumber}
                />

                <Field label="Password" error={errors.password}>
                  <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                    <TextInput style={styles.passwordInput} placeholder="Min 8 characters" placeholderTextColor={Colors.neutral[500]} value={formData.password} onChangeText={v => update('password', v)} secureTextEntry={!showPassword} />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={17} color={Colors.neutral[600]} />
                    </Pressable>
                  </View>
                </Field>

              </View>

              <View style={styles.buttonSection}>
                <Pressable style={styles.button} onPress={handleContinue}>
                  <Text style={styles.buttonText}>Continue</Text>
                  <Text style={styles.arrow}>→</Text>
                </Pressable>

                <View style={styles.signInContainer}>
                  <Text style={styles.signInText}>Already have an account? </Text>
                  <Pressable onPress={() => router.push('/(auth)/signin')}>
                    <Text style={styles.signInLink}>Sign In</Text>
                  </Pressable>
                </View>
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
  card: { backgroundColor: '#b3ceef', borderTopLeftRadius: 50, borderTopRightRadius: 50, paddingTop: AVATAR_SIZE / 2 + Spacing.xl, paddingHorizontal: Spacing.lg},
  formContainer: {},
  inputSection: { gap: Spacing.lg },
  buttonSection: { paddingTop: Spacing.lg },
  input: { backgroundColor: '#FFFFFF', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: 8, fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light, borderWidth: 1, borderColor: Colors.neutral[200] },
  inputError: { borderColor: '#ef4444' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: Colors.neutral[200], paddingRight: Spacing.md },
  passwordInput: { flex: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light },
  button: { backgroundColor: Colors.primary.main, paddingVertical: 20, paddingHorizontal: Spacing.lg, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', fontFamily: Typography.fontFamily.semibold },
  arrow: { color: '#FFFFFF', fontSize: 24, fontFamily: Typography.fontFamily.regular },
  signInContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signInText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600] },
  signInLink: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },
});
