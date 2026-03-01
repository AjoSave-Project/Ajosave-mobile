import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Linking } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

/**
 * KYC (Know Your Customer) Screen
 * 
 * Allows users to complete their identity verification with BVN, date of birth, address, and state
 */
export default function KYCScreen() {
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleContinue = () => {
    // TODO: Implement KYC verification logic
    router.push('/setup-biometric');
  };

  const handleOpenTerms = async () => {
    const termsUrl = 'https://example.com/terms-and-conditions'; // TODO: Replace with actual terms URL
    try {
      const supported = await Linking.canOpenURL(termsUrl);
      if (supported) {
        await Linking.openURL(termsUrl);
      } else {
        console.error('Cannot open URL:', termsUrl);
      }
    } catch (error) {
      console.error('Error opening terms:', error);
    }
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
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.subtitle}>Complete your KYC verification</Text>
        </View>

        {/* Card Wrapper with Overlapping Avatar */}
        <View style={styles.cardWrapper}>
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
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>BVN (Bank Verification Number)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your 11-digit BVN"
                    placeholderTextColor={Colors.neutral[500]}
                    value={bvn}
                    onChangeText={setBvn}
                    keyboardType="number-pad"
                    maxLength={11}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NIN (National Identification Number)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your 11-digit NIN"
                    placeholderTextColor={Colors.neutral[500]}
                    value={nin}
                    onChangeText={setNin}
                    keyboardType="number-pad"
                    maxLength={11}
                  />
                </View>

                <View style={styles.checkboxContainer}>
                  <Pressable 
                    onPress={() => setAgreedToTerms(!agreedToTerms)}
                    hitSlop={8}
                  >
                    <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                      {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                  </Pressable>
                  <View style={styles.checkboxLabelContainer}>
                    <Text style={styles.checkboxLabel}>I agree to the </Text>
                    <Pressable onPress={handleOpenTerms} hitSlop={8}>
                      <Text style={styles.link}>Terms and Conditions</Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Button Section at Bottom */}
              <View style={styles.buttonSection}>
                <Pressable 
                  style={[styles.button, !agreedToTerms && styles.buttonDisabled]} 
                  onPress={handleContinue}
                  disabled={!agreedToTerms}
                >
                  <Text style={styles.buttonText}>Continue</Text>
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
  },
  title: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.light,
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
  },
  buttonSection: {
    marginTop: 'auto',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: Spacing.md,
    flexWrap: 'wrap',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
    alignSelf: "center",
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
  },
  checkboxLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  checkboxLabel: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
  link: {
    fontSize: 14,
    color: Colors.primary.main,
    fontFamily: Typography.fontFamily.medium,
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: Colors.primary.main,
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
