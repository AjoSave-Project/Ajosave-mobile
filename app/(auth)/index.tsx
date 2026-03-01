import { Redirect } from 'expo-router';

/**
 * Auth Index - Redirects to splash screen
 */
export default function AuthIndex() {
  return <Redirect href="/(auth)/splash" />;
}
