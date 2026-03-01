import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

/**
 * Verify OTP Screen
 * 
 * Allows users to enter a 6-digit OTP code sent to their phone number
 */
export default function VerifyOTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow digits
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (canResend) {
      // TODO: Implement resend OTP logic
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleVerify = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      // TODO: Implement OTP verification
      router.push('/(tabs)/home');
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Back Button */}
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
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>We've sent a 6-digit code to your phone number</Text>
        </View>

        {/* Card Wrapper with Overlapping Avatar */}
        <View style={styles.cardWrapper}>
          {/* Avatar - Positioned absolutely to overlap card */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="lock-closed" color={"#ffffff"} style={styles.avatarIcon}></Ionicons>
            </View>
          </View>

          {/* Blue Card */}
          <View style={styles.card}>
            {/* Form Container with space-between layout */}
            <View style={styles.formContainer}>
              {/* OTP Input Section */}
              <View style={styles.inputSection}>
                <Text style={styles.otpLabel}>Enter Code</Text>
                
                {/* OTP Input Boxes */}
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        inputRefs.current[index] = ref;
                      }}
                      style={[
                        styles.otpBox,
                        digit && styles.otpBoxFilled
                      ]}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      autoFocus={index === 0}
                    />
                  ))}
                </View>

                {/* Resend Code Section */}
                <View style={styles.resendContainer}>
                  {!canResend ? (
                    <Text style={styles.timerText}>
                      Resend code in {formatTime(timer)}
                    </Text>
                  ) : (
                    <Pressable onPress={handleResend}>
                      <Text style={styles.resendText}>Resend Code</Text>
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Button Section at Bottom */}
              <View style={styles.buttonSection}>
                <Pressable 
                  style={[styles.button, !isOtpComplete && styles.buttonDisabled]} 
                  onPress={handleVerify}
                  disabled={!isOtpComplete}
                >
                  <Text style={styles.buttonText}>Verify</Text>
                  <Text style={styles.arrow}>→</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: 25,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  cardWrapper: {
    position: 'relative',
    flex: 1,
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
    flex: 1,
    backgroundColor: "#b3ceefaf",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    paddingTop: AVATAR_SIZE / 2 + Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  formContainer: {
    flex: 1,
  },
  inputSection: {
    gap: Spacing.lg,
    alignItems: 'center',
  },
  buttonSection: {
    marginTop: 'auto',
  },
  otpLabel: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.neutral[700],
    marginBottom: Spacing.sm,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    width: '100%',
    paddingHorizontal: Spacing.sm,
  },
  otpBox: {
    width: 50,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    fontSize: 24,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  otpBoxFilled: {
    borderColor: Colors.primary.main,
    borderWidth: 2,
  },
  resendContainer: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
  resendText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary.main,
    textDecorationLine: 'underline',
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
    opacity: 0.5,
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
});
