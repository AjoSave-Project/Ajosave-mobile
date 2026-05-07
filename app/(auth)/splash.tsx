import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { router, useRootNavigationState, useSegments } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useAuth } from '@/contexts';

/**
 * Splash Screen
 * 
 * Two-stage splash screen with smooth animations:
 * 1. First splash (1.5s): Primary background with white "AjoSave" text
 * 2. Second splash (1.5s+): White background with primary "AjoSave" text animating up and loading spinner fading in
 * 
 * Then navigates to the appropriate screen based on:
 * - Authentication status (authenticated users go to home, unauthenticated users see onboarding)
 */
export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const rootNavigationState = useRootNavigationState();
  const segments = useSegments();
  const [hasNavigated, setHasNavigated] = useState(false);
  const [showSecondSplash, setShowSecondSplash] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  
  // Animation values
  const backgroundColorAnim = useRef(new Animated.Value(0)).current;
  const textColorAnim = useRef(new Animated.Value(0)).current;
  const textPositionAnim = useRef(new Animated.Value(0)).current;
  const spinnerOpacityAnim = useRef(new Animated.Value(0)).current;

  // Multiple checks for navigation readiness
  const navigationReady = Boolean(
    rootNavigationState?.key && 
    rootNavigationState?.routeNames?.length > 0
  );

  // Timer for first splash screen (1.5 seconds)
  useEffect(() => {
    const firstSplashTimer = setTimeout(() => {
      console.log('[SplashScreen] First splash complete, showing second splash');
      setShowSecondSplash(true);
    }, 1500);
    
    return () => clearTimeout(firstSplashTimer);
  }, []);

  // Animate transition when second splash appears
  useEffect(() => {
    if (showSecondSplash) {
      // Parallel animations for smooth transition
      Animated.parallel([
        // Background color transition from primary to white
        Animated.timing(backgroundColorAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        // Text color transition from white to primary
        Animated.timing(textColorAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
        // Text moves up
        Animated.timing(textPositionAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // Spinner fades in with slight delay
        Animated.timing(spinnerOpacityAnim, {
          toValue: 1,
          duration: 400,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Timer for second splash screen (1.5 seconds after first)
      const secondSplashTimer = setTimeout(() => {
        console.log('[SplashScreen] Second splash complete, minimum display time elapsed');
        setMinTimeElapsed(true);
      }, 1500);
      
      return () => clearTimeout(secondSplashTimer);
    }
  }, [showSecondSplash]);

  useEffect(() => {
    // Only navigate once, when all conditions are met:
    // 1. Haven't navigated yet
    // 2. Both splash screens have been shown (minimum 3s total)
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
          // All unauthenticated users see onboarding
          console.log('[SplashScreen] Unauthenticated user, going to onboarding');
          router.replace('/(auth)/onboarding');
        }
      }, 100);
    }
  }, [isAuthenticated, isLoading, navigationReady, minTimeElapsed, segments, hasNavigated]);

  // Interpolate background color
  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.primary.main, '#FFFFFF'],
  });

  // Interpolate text color
  const textColor = textColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFFFFF', Colors.primary.main],
  });

  // Text moves up by 40 pixels
  const textTranslateY = textPositionAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Animated.Text 
        style={[
          styles.title, 
          { 
            color: textColor,
            transform: [{ translateY: textTranslateY }]
          }
        ]}
      >
        AjoSave
      </Animated.Text>
      
      {showSecondSplash && (
        <Animated.View style={{ opacity: spinnerOpacityAnim }}>
          <ActivityIndicator size="large" color={Colors.primary.main} style={styles.loader} />
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.bold,
  },
  loader: {
    marginTop: 24,
  },
});
