import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useRootNavigationState, useSegments } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useAuth } from '@/contexts';

/**
 * Splash Screen
 * 
 * Initial loading screen that checks authentication status
 * and navigates to the appropriate screen.
 * 
 * Fix: Added multiple navigation readiness checks to prevent "Attempted to navigate 
 * before mounting the Root Layout component" error.
 */
export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const rootNavigationState = useRootNavigationState();
  const segments = useSegments();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Multiple checks for navigation readiness
  const navigationReady = Boolean(
    rootNavigationState?.key && 
    rootNavigationState?.routeNames?.length > 0
  );

  // Timer to ensure splash screen displays for minimum 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[SplashScreen] Minimum display time (3s) elapsed');
      setMinTimeElapsed(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // console.log('[SplashScreen] Auth status:', { isAuthenticated, isLoading });
    // console.log('[SplashScreen] Navigation ready:', navigationReady);
    // console.log('[SplashScreen] Min time elapsed:', minTimeElapsed);
    // console.log('[SplashScreen] Root navigation key:', rootNavigationState?.key);
    // console.log('[SplashScreen] Route names:', rootNavigationState?.routeNames);
    // console.log('[SplashScreen] Segments:', segments);
    // console.log('[SplashScreen] Has navigated:', hasNavigated);
    
    // Only navigate once, when all conditions are met:
    // 1. Haven't navigated yet
    // 2. Minimum display time (3s) has elapsed
    // 3. Authentication loading is complete
    // 4. Navigation system is fully ready (has key AND route names)
    if (!hasNavigated && minTimeElapsed && !isLoading && navigationReady) {
      console.log('[SplashScreen] All conditions met, navigating...');
      setHasNavigated(true);
      
      // Use setTimeout to ensure navigation happens after current render cycle
      setTimeout(() => {
        if (isAuthenticated) {
          console.log('[SplashScreen] User authenticated, going to tabs');
          router.replace('/(tabs)/home');
        } else {
          console.log('[SplashScreen] User not authenticated, going to onboarding');
          router.replace('/(auth)/onboarding');
        }
      }, 100);
    }
  }, [isAuthenticated, isLoading, navigationReady, minTimeElapsed, segments, hasNavigated]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AjoSave</Text>
      <ActivityIndicator size="large" color={Colors.primary.main} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
  },
  title: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
    marginBottom: 24,
  },
  loader: {
    marginTop: 16,
  },
});
