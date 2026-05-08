import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ScrollView, Animated
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import DateOfBirthInput from '@/components/DateOfBirthInput';

export default function KYCVerifyScreen() {
  const keyboardVisible = useKeyboardVisible();

  // Contact info and userId passed from verify-contact screen
  const params = useLocalSearchParams<{
    email: string;
    phoneNumber: string;
    userId: string;
    bvnVerified?: string;
    ninVerified?: string;
    verificationTimestamp?: string;
  }>();

  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [bvnVerified, setBvnVerified] = useState(false);
  const [ninVerified, setNinVerified] = useState(false);

  // Bounce animation
  const bounceAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Start bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Listen for screen focus to check verification results
  useFocusEffect(
    React.useCallback(() => {
      // Check if BVN was verified
      if (params.bvnVerified === 'true') {
        setBvnVerified(true);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.bvn;
          return newErrors;
        });
      } else if (params.bvnVerified === 'false') {
        setBvnVerified(false);
        setErrors(prev => ({ ...prev, bvn: 'BVN verification failed. Please try again.' }));
      }

      // Check if NIN was verified
      if (params.ninVerified === 'true') {
        setNinVerified(true);
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.nin;
          return newErrors;
        });
      } else if (params.ninVerified === 'false') {
        setNinVerified(false);
        setErrors(prev => ({ ...prev, nin: 'NIN verification failed. Please try again.' }));
      }
      
      return () => {
        // Cleanup if needed
      };
    }, [params.bvnVerified, params.ninVerified, params.verificationTimestamp])
  );

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (bvn.length !== 11) e.bvn = 'BVN must be 11 digits';
    if (!bvnVerified) e.bvn = 'Please verify your BVN';
    if (nin.length !== 11) e.nin = 'NIN must be 11 digits';
    if (!ninVerified) e.nin = 'Please verify your NIN';
    if (!dateOfBirth.trim()) e.dateOfBirth = 'Date of birth is required';
    return e;
  };

  const handleVerifyBVN = () => {
    if (bvn.length !== 11) {
      setErrors(prev => ({ ...prev, bvn: 'BVN must be 11 digits' }));
      return;
    }
    
    // Navigate to verification screen
    router.push({
      pathname: '/(auth)/verify-identity-field',
      params: {
        fieldType: 'bvn',
        fieldValue: bvn,
        userId: params.userId,
      },
    });
  };

  const handleVerifyNIN = () => {
    if (nin.length !== 11) {
      setErrors(prev => ({ ...prev, nin: 'NIN must be 11 digits' }));
      return;
    }
    
    // Navigate to verification screen
    router.push({
      pathname: '/(auth)/verify-identity-field',
      params: {
        fieldType: 'nin',
        fieldValue: nin,
        userId: params.userId,
      },
    });
  };

  const handleVerifyIdentity = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setSubmitError('');

    // Navigate to complete-profile with all collected data
    router.push({
      pathname: '/(auth)/complete-profile',
      params: { 
        email: params.email, 
        phoneNumber: params.phoneNumber,
        userId: params.userId,
        bvn,
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
        <Pressable style={styles.backButton} onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/welcome')}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.subtitle}>Step 3 of 3: Identity Verification</Text>
        </View>
        </View>

        <View style={[styles.cardWrapper, { paddingBottom: keyboardVisible ? 300 : 80 }]}>
          <Animated.View style={[styles.avatarContainer, { transform: [{ translateY: bounceAnim }] }]}>
            <View style={styles.avatar}>
              <Ionicons name="shield-checkmark" color="#ffffff" style={styles.avatarIcon} />
            </View>
          </Animated.View>

          <View style={styles.card}>
            <View style={styles.formContainer}>
              {/* SINGLE STEP: BVN, NIN & DOB */}
              <View style={styles.inputSection}>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    Please provide your BVN, NIN, and date of birth to verify your identity.
                  </Text>
                </View>

                <Field label="BVN (11 digits)" error={errors.bvn}>
                  <View style={styles.inputWithButton}>
                    <TextInput
                      style={[styles.inputFlex, errors.bvn && styles.inputError]}
                      placeholder="Enter your BVN"
                      placeholderTextColor={Colors.neutral[500]}
                      value={bvn}
                      onChangeText={v => { 
                        setBvn(v.replace(/\D/g, '')); 
                        setBvnVerified(false);
                        if (errors.bvn) setErrors(p => { const e = { ...p }; delete e.bvn; return e; }); 
                      }}
                      keyboardType="number-pad"
                      maxLength={11}
                    />
                    <Pressable 
                      style={[
                        styles.verifyButton, 
                        bvn.length === 11 && styles.verifyButtonActive,
                        bvnVerified && styles.verifyButtonVerified
                      ]}
                      onPress={handleVerifyBVN}
                      disabled={bvn.length !== 11 || bvnVerified}
                    >
                      {bvnVerified ? (
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                      ) : (
                        <Ionicons 
                          name="arrow-forward" 
                          size={20} 
                          color={bvn.length === 11 ? Colors.primary.main : Colors.neutral[400]} 
                        />
                      )}
                    </Pressable>
                  </View>
                  {bvnVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </Field>

                <Field label="NIN (11 digits)" error={errors.nin}>
                  <View style={styles.inputWithButton}>
                    <TextInput
                      style={[styles.inputFlex, errors.nin && styles.inputError]}
                      placeholder="Enter your NIN"
                      placeholderTextColor={Colors.neutral[500]}
                      value={nin}
                      onChangeText={v => { 
                        setNin(v.replace(/\D/g, '')); 
                        setNinVerified(false);
                        if (errors.nin) setErrors(p => { const e = { ...p }; delete e.nin; return e; }); 
                      }}
                      keyboardType="number-pad"
                      maxLength={11}
                    />
                    <Pressable 
                      style={[
                        styles.verifyButton, 
                        nin.length === 11 && styles.verifyButtonActive,
                        ninVerified && styles.verifyButtonVerified
                      ]}
                      onPress={handleVerifyNIN}
                      disabled={nin.length !== 11 || ninVerified}
                    >
                      {ninVerified ? (
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                      ) : (
                        <Ionicons 
                          name="arrow-forward" 
                          size={20} 
                          color={nin.length === 11 ? Colors.primary.main : Colors.neutral[400]} 
                        />
                      )}
                    </Pressable>
                  </View>
                  {ninVerified && (
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                </Field>

                <DateOfBirthInput
                  value={dateOfBirth}
                  onChangeText={v => { setDateOfBirth(v); if (errors.dateOfBirth) setErrors(p => { const e = { ...p }; delete e.dateOfBirth; return e; }); }}
                  error={errors.dateOfBirth}
                />

                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: '66%' }]} />
                </View>
              </View>

              <View style={styles.buttonSection}>
                {submitError ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{submitError}</Text>
                  </View>
                ) : null}

                <Pressable 
                  style={[
                    styles.button,
                    (!bvnVerified || !ninVerified || !dateOfBirth.trim()) && styles.buttonDisabled
                  ]} 
                  onPress={handleVerifyIdentity}
                  disabled={!bvnVerified || !ninVerified || !dateOfBirth.trim()}
                >
                  <Text style={styles.buttonText}>Continue</Text>
                  <Text style={styles.arrow}>→</Text>
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
      <View>
        {children}
      </View>
      {error && <Text style={fieldStyles.error}>{error}</Text>}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  label: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[800], marginLeft: Spacing.md },
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
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden', marginTop: Spacing.md },
  progressFill: { height: '100%', backgroundColor: Colors.primary.main, borderRadius: 2 },
  buttonSection: { paddingTop: Spacing.lg },
  input: { backgroundColor: '#FFFFFF', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: 8, fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light, borderWidth: 1, borderColor: Colors.neutral[200] },
  inputError: { borderColor: '#ef4444' },
  inputWithButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8,
  },
  inputFlex: { 
    flex: 1,
    backgroundColor: '#FFFFFF', 
    paddingVertical: Spacing.md, 
    paddingHorizontal: Spacing.md, 
    borderRadius: 8, 
    fontSize: 16, 
    fontFamily: Typography.fontFamily.medium, 
    color: Colors.text.primary.light, 
    borderWidth: 1, 
    borderColor: Colors.neutral[200] 
  },
  verifyButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  verifyButtonActive: {
    backgroundColor: Colors.primary.light + '20',
    borderColor: Colors.primary.main,
  },
  verifyButtonVerified: {
    backgroundColor: '#10b981' + '20',
    borderColor: '#10b981',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginLeft: Spacing.xs,
  },
  verifiedText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    color: '#10b981',
  },
  buttonRow: { flexDirection: 'row', gap: Spacing.md },
  button: { flex: 1, backgroundColor: Colors.primary.main, paddingVertical: 20, paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600', fontFamily: Typography.fontFamily.semibold },
  arrow: { color: '#FFFFFF', fontSize: 24, fontFamily: Typography.fontFamily.regular },
  errorBanner: { backgroundColor: '#fee2e2', borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.md, borderLeftWidth: 4, borderLeftColor: '#ef4444' },
  errorBannerText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: '#b91c1c' },
});
