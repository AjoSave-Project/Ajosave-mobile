import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/AuthContext';
import { useKeyboardVisible } from '@/hooks/useKeyboardVisible';
import PhoneInput from '@/components/PhoneInput';
import { extractFieldErrors, getErrorMessage } from '@/utils/errors';
import { useLocalSearchParams } from 'expo-router';
import GradientButton from '@/components/ui/GradientButton';

/**
 * Sign In Screen
 * 
 * User login with phone number and password
 */
export default function SignInScreen() {
  const { login, isLoading: loading } = useAuth();
  const keyboardVisible = useKeyboardVisible();
  const params = useLocalSearchParams<{ resetSuccess?: string }>();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'phoneNumber') {
      setPhoneNumber(value);
    } else {
      setPassword(value);
    }
    setSubmitError('');
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSignIn = async () => {
    // Validate fields
    const newErrors: Record<string, string> = {};
    
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await login(phoneNumber, password);
      if (result && (result as any).requiresOtp) {
        router.push({
          pathname: '/(auth)/verify-otp',
          params: { userId: (result as any).userId, phoneNumber: (result as any).phoneNumber, purpose: 'login', devOtp: (result as any).devOtp ?? '' },
        });
      } else {
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      const fieldErrors = extractFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...fieldErrors }));
      }
      setSubmitError(getErrorMessage(error));
      setPassword('');
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
        {/* Back Button */}
        <View style={styles.topSection}>
        <Pressable style={styles.backButton} onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(auth)/welcome');
          }
        }}>
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
        </View>
        </View>

        {/* Card Wrapper with Overlapping Avatar */}
        <View style={[styles.cardWrapper, { paddingBottom: keyboardVisible ? 300 : 80 }]}>
          {/* Avatar - Positioned absolutely to overlap card */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" color={"#ffffff"} style={styles.avatarIcon}></Ionicons>
            </View>
          </View>

          {/* Grey Card */}
          <View style={styles.card}>
            {/* Form Container with space-between layout */}
            <View style={styles.formContainer}>
              {/* Input Fields Section */}
              <View style={styles.inputSection}>
                {params.resetSuccess === '1' ? (
                  <View style={styles.successBanner}>
                    <Text style={styles.successBannerText}>Password reset successfully. Please sign in.</Text>
                  </View>
                ) : null}
                <PhoneInput
                  value={phoneNumber}
                  onChangeText={v => handleFieldChange('phoneNumber', v)}
                  error={errors.phoneNumber}
                  editable={!loading}
                />

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter Password"
                      placeholderTextColor={Colors.neutral[500]}
                      value={password}
                      onChangeText={(value) => handleFieldChange('password', value)}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={17} 
                        color={Colors.neutral[600]} 
                      />
                    </Pressable>
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </Pressable>
              </View>

              {/* Button Section at Bottom */}
              <View style={styles.buttonSection}>
                {submitError ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>{submitError}</Text>
                  </View>
                ) : null}
                
                <GradientButton
                  label={loading ? 'Signing in...' : 'Sign in'}
                  onPress={handleSignIn}
                  disabled={loading}
                  icon="arrow-forward"
                />

                {/* Sign Up Link */}
                <View style={styles.signUpContainer}>
                  <Text style={styles.signUpText}>Don't have an account? </Text>
                  <Pressable onPress={() => router.push('/(auth)/create-account')}>
                    <Text style={styles.signUpLink}>Sign Up</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Spacing.xl,
  },
  backButton: {
    margin: Spacing.xl,
  },
  backArrow: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.primary.main,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['8xl'],
  },
  title: {
    fontSize: 30,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
  },
  topSection: { backgroundColor: '#FFFFFF', paddingBottom: Spacing['8xl'] },
  cardWrapper: {
    position: 'relative',
    backgroundColor: '#b3ceef',
    paddingBottom: 80,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  avatarContainer: {
    position: 'absolute',
    top: -AVATAR_SIZE / 2,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  avatarIcon: {
    fontSize: 48,
    fontFamily: Typography.fontFamily.regular,
  },
  card: {
    backgroundColor: "#b3ceef",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: AVATAR_SIZE / 2 + Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  formContainer: {},
  inputSection: {
    gap: Spacing.lg,
  },
  buttonSection: {
    paddingTop: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[400],
    marginLeft: Spacing.md,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text.primary.light,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  inputError: {
    borderColor: '#ef4444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    paddingRight: Spacing.md,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text.primary.light,
  },
  errorText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: '#ef4444',
    marginLeft: Spacing.xs,
  },
  forgotPassword: {
    color: Colors.primary.dark,
    fontSize: 14,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: Spacing.md
  },
  button: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 20,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: Typography.fontFamily.regular,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  signUpText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
  signUpLink: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary.main,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorBannerText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: '#b91c1c',
  },
  successBanner: {
    backgroundColor: '#dcfce7',
    borderRadius: 8,
    padding: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: '#16a34a',
  },
  successBannerText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: '#15803d',
  },
});
