import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, Animated } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import PhoneInput from '@/components/PhoneInput';
import GradientButton from '@/components/ui/GradientButton';
import { AuthService } from '@/services/authService';
import { getErrorMessage } from '@/utils/errors';

/**
 * Create Account Screen - Step 1 of 4
 * 
 * Collects email and phone number for initial verification
 */
export default function CreateAccountScreen() {
  const keyboardVisible = useKeyboardVisible();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isChecking, setIsChecking] = useState(false);
  
  // Bounce animation
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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

  const update = (field: string, value: string) => {
    if (field === 'email') setEmail(value);
    else setPhoneNumber(value);
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      e.email = 'Please enter a valid email address';
    }
    if (!phoneNumber.trim()) e.phoneNumber = 'Phone number is required';
    return e;
  };

  const handleContinue = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) { 
      setErrors(newErrors); 
      return; 
    }

    setIsChecking(true);
    try {
      // Check if user has incomplete registration
      const status = await AuthService.checkRegistrationStatus(email, phoneNumber);
      
      if (status.exists && !status.canContinue) {
        // Complete registration exists
        Alert.alert(
          'Account Exists',
          status.message || 'An account with this email or phone number already exists. Please sign in.',
          [
            { text: 'Sign In', onPress: () => router.push('/(auth)/signin') },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      if (status.canContinue && status.isIncomplete) {
        // Incomplete registration - ask if they want to continue
        Alert.alert(
          'Continue Registration?',
          'You have an incomplete registration. Would you like to continue where you left off?',
          [
            {
              text: 'Continue',
              onPress: () => {
                // Route to appropriate step
                if (status.currentStep === 'email-verification') {
                  router.push({
                    pathname: '/(auth)/verify-contact',
                    params: { email: status.email!, phoneNumber: status.phoneNumber! },
                  });
                } else if (status.currentStep === 'bvn-verification') {
                  router.push({
                    pathname: '/(auth)/verify-bvn',
                    params: { 
                      email: status.email!, 
                      phoneNumber: status.phoneNumber!,
                      userId: status.userId!,
                    },
                  });
                }
              }
            },
            { text: 'Start Over', style: 'cancel' }
          ]
        );
        return;
      }

      // No existing registration - proceed normally
      router.push({
        pathname: '/(auth)/verify-contact',
        params: { email, phoneNumber },
      });
    } catch (error: any) {
      Alert.alert('Error', getErrorMessage(error));
    } finally {
      setIsChecking(false);
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
        <Pressable 
          style={styles.backButton} 
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/welcome')}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Hello!</Text>
          <Text style={styles.subtitle}>Step 1 of 3: Contact Information</Text>
        </View>
      </View>

      <View style={[styles.cardWrapper, { paddingBottom: keyboardVisible ? 300 : 80 }]}>
        <Animated.View style={[styles.avatarContainer, { transform: [{ translateY: bounceAnim }] }]}>
          <View style={styles.avatar}>
            <Ionicons name="mail" color="#ffffff" style={styles.avatarIcon} />
          </View>
        </Animated.View>

        <View style={styles.card}>
          <View style={styles.formContainer}>
            <View style={styles.inputSection}>
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Let's start with your contact information. We'll send a verification code to your email.
                </Text>
              </View>

              <Field label="Email Address" error={errors.email} hint="e.g. yourname@example.com">
                <TextInput 
                  style={[styles.input, errors.email && styles.inputError]} 
                  placeholder="Enter your email" 
                  placeholderTextColor={Colors.neutral[500]} 
                  value={email} 
                  onChangeText={v => update('email', v)} 
                  keyboardType="email-address" 
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </Field>

              <PhoneInput
                value={phoneNumber}
                onChangeText={v => update('phoneNumber', v)}
                error={errors.phoneNumber}
              />

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '25%' }]} />
              </View>
            </View>

            <View style={styles.buttonSection}>
              <GradientButton
                label={isChecking ? "Checking..." : "Continue"}
                onPress={handleContinue}
                disabled={isChecking}
                icon="arrow-forward"
              />

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
  progressBar: { height: 4, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden', marginTop: Spacing.md },
  progressFill: { height: '100%', backgroundColor: Colors.primary.main, borderRadius: 2 },
  buttonSection: { paddingTop: Spacing.lg },
  input: { backgroundColor: '#FFFFFF', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: 8, fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light, borderWidth: 1, borderColor: Colors.neutral[200] },
  inputError: { borderColor: '#ef4444' },
  signInContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.md },
  signInText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600] },
  signInLink: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },
});
