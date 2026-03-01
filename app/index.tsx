import { Redirect } from 'expo-router';

/**
 * Root Index - Redirects to splash screen
 */
export default function Index() {
  console.log('[Index] Redirecting to splash...');
  return <Redirect href="/(auth)/splash" />;
}
