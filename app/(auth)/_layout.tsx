import { Stack } from 'expo-router';

/**
 * Auth Layout Component
 * 
 * Provides stack navigation for authentication-related screens.
 * All screens in this group are displayed without headers, allowing
 * each screen to implement its own custom header if needed.
 * 
 * Screens:
 * - splash: Initial splash screen with app logo
 * - onboarding: First-time user onboarding experience
 * - welcome: Entry point for sign in/sign up
 * - signin: User login with phone/password
 * - create-account: New user registration (Step 1) - Email & Phone
 * - verify-contact: Email OTP verification (Step 2)
 * - verify-bvn: BVN verification (Step 3)
 * - verify-nin: NIN verification (Step 4)
 * - complete-profile: Name & Password (Final Step)
 * - verify-otp: OTP verification after registration
 * - setup-biometric: Face ID/Touch ID setup
 * - forgot-password: Password reset request
 * - reset-password: Password reset with OTP
 * - index: Redirect to splash
 * 
 * @returns Stack navigator configured for auth flow
 */
export default function AuthLayout() {
  return (
    <Stack
      initialRouteName="splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="splash" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="welcome" />
      <Stack.Screen name="signin" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="verify-contact" />
      <Stack.Screen name="verify-bvn" />
      <Stack.Screen name="verify-nin" />
      <Stack.Screen name="complete-profile" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="setup-biometric" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="index" />
    </Stack>
  );
}
