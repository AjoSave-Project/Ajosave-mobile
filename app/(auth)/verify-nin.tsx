import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import DateOfBirthInput from '@/components/DateOfBirthInput';
import GradientButton from '@/components/ui/GradientButton';

/**
 * Verify NIN Screen - Step 4 of 4
 * 
 * Collects NIN and Date of Birth for identity verification
 */
export default function VerifyNINScreen() {
  const keyboardVisible = useKeyboardVisible();
  const params = useLocalSearchParams<{ 
    email: string; 
    phoneNumber: string; 
    userId: string;
    bvn: string;
  }>();
  
  const [nin, setNin] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleContinue = () => {
    const newErrors: Record<string, string> = {};
    
    if (nin.length !== 11) {
      newErrors.nin = 'NIN must be 11 digits';
    }
    if (!dateOfBirth.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Navigate to profile completion
    router.push({
      pathname: '/(auth)/complete-profile',
      params: { 
        email: params.email, 
        phoneNumber: params.phoneNumber,
        userId: params.userId,
        bvn: params.bvn,
        nin,
        dateOfBirth
      },
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
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/verify-bvn')}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Verify Identity</Text>
          <Text style={styles.subtitle}>Step 4 of 4: NIN Verification</Text>
        </View>
      </View>

      <View style={[styles.cardWrapper, { paddingBottom: keyboardVisible ? 300 : 80 }]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="shield-checkmark" color="#ffffff" style={styles.avatarIcon} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.formContainer}>
            <View style={styles.inputSection}>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Please provide your National Identification Number (NIN) and date of birth.
                </Text>
              </View>

              <Field label="NIN (11 digits)" error={errors.nin}>
                <TextInput
                  style={[styles.input, errors.nin && styles.inputError]}
                  placeholder="Enter your NIN"
                  placeholderTextColor={Colors.neutral[500]}
                  value={nin}
                  onChangeText={v => { 
                    setNin(v.replace(/\D/g, '')); 
                    if (errors.nin) setErrors(p => { const e = { ...p }; delete e.nin; return e; });
                  }}
                  keyboardType="number-pad"
                  maxLength={11}
                />
              </Field>

              <DateOfBirthInput
                value={dateOfBirth}
                onChangeText={v => { 
                  setDateOfBirth(v); 
                  if (errors.dateOfBirth) setErrors(p => { const e = { ...p }; delete e.dateOfBirth; return e; });
                }}
                error={errors.dateOfBirth}
              />

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '100%' }]} />
              </View>
            </View>

            <View style={styles.buttonSection}>
              <GradientButton
                label="Continue"
                onPress={handleContinue}
                icon="arrow-forward"
              />
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
  label: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[700], marginLeft: Spacing.md },
  error: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: '#ef4444', marginLeft: Spacing.xs },
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
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden', marginTop: Spacing.md },
  progressFill: { height: '100%', backgroundColor: Colors.primary.main, borderRadius: 2 },
  buttonSection: { paddingTop: Spacing.lg },
  input: { backgroundColor: '#FFFFFF', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: 8, fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light, borderWidth: 1, borderColor: Colors.neutral[200] },
  inputError: { borderColor: '#ef4444' },
});
