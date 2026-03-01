import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

/**
 * Sign In Screen
 * 
 * User login
 */
export default function SignInScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    // TODO: Implement signin logic
    router.push('/(auth)/verify-otp');
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
          <Text style={styles.title}>Welcome Back</Text>
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
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    placeholderTextColor={Colors.neutral[500]}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Enter Password"
                      placeholderTextColor={Colors.neutral[500]}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)}>
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={17} 
                        color={Colors.neutral[600]} 
                      />
                    </Pressable>
                  </View>
                </View>

                <Pressable>
                  <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </Pressable>
              </View>

              {/* Button Section at Bottom */}
              <View style={styles.buttonSection}>
                <Pressable style={styles.button} onPress={handleSignIn}>
                  <Text style={styles.buttonText}>Sign in</Text>
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
    marginBottom: Spacing['8xl'],
  },
  title: {
    fontSize: 30,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
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
