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
 * - login: User login with phone/password
 * - signup: New user registration
 * - verify-otp: KYC verification (BVN/NIN)
 * - setup-biometric: Face ID/Touch ID setup
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
      <Stack.Screen name="signup" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="setup-biometric" />
      <Stack.Screen name="index" />
    </Stack>
  );
}
