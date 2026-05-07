import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import GradientButton from '@/components/ui/GradientButton';

/**
 * Verify BVN Screen - Step 3 of 4
 * 
 * Collects BVN for identity verification
 */
export default function VerifyBVNScreen() {
  const keyboardVisible = useKeyboardVisible();
  const params = useLocalSearchParams<{ email: string; phoneNumber: string; userId: string }>();
  
  const [bvn, setBvn] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    if (bvn.length !== 11) {
      setError('BVN must be 11 digits');
      return;
    }

    // Navigate to NIN verification
    router.push({
      pathname: '/(auth)/verify-nin',
      params: { 
        email: params.email, 
        phoneNumber: params.phoneNumber,
        userId: params.userId,
        bvn 
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
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/verify-contact')}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Verify Identity</Text>
          <Text style={styles.subtitle}>Step 3 of 4: BVN Verification</Text>
        </View>
      </View>

      <View style={[styles.cardWrapper, { paddingBottom: keyboardVisible ? 300 : 80 }]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="card" color="#ffffff" style={styles.avatarIcon} />
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.formContainer}>
            <View style={styles.inputSection}>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Please provide your Bank Verification Number (BVN) to verify your identity.
                </Text>
              </View>

              <Field label="BVN (11 digits)" error={error}>
                <TextInput
                  style={[styles.input, error && styles.inputError]}
                  placeholder="Enter your BVN"
                  placeholderTextColor={Colors.neutral[500]}
                  value={bvn}
                  onChangeText={v => { 
                    setBvn(v.replace(/\D/g, '')); 
                    setError(''); 
                  }}
                  keyboardType="number-pad"
                  maxLength={11}
                />
              </Field>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
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
