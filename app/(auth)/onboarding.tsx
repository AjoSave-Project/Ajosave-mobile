import { View, Text, StyleSheet, Image, Pressable, Animated } from 'react-native';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { setOnboardingComplete } from '@/utils/onboardingStorage';

/**
 * Onboarding Screen
 * 
 * Shows app introduction and value proposition with Phone.png illustration
 */
export default function OnboardingScreen() {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create a slow, continuous bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim]);

  const handleGetStarted = async () => {
    try {
      // Mark that user has seen onboarding
      await setOnboardingComplete();
      console.log('[OnboardingScreen] Onboarding completed, flag set');
    } catch (error) {
      console.error('[OnboardingScreen] Error setting onboarding flag:', error);
    }
    
    router.push('/(auth)/welcome');
  };

  return (
    <View style={styles.container}>
      {/* Image Illustration */}
      <View style={styles.illustrationContainer}>
        <Animated.Image 
          source={require('@/assets/images/Phone.png')}
          style={[
            styles.image,
            {
              transform: [{ translateY: bounceAnim }],
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Saving Together, Growing Together</Text>
        <Text style={styles.subtitle}>Inspired by Ajo. Designed for you.</Text>
      </View>

      {/* Spacer to push button to bottom */}
      <View style={styles.spacer} />

      {/* CTA Button */}
      <Pressable 
        style={styles.button}
        onPress={handleGetStarted}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  illustrationContainer: {
    marginTop: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 280,
    height: 280,
  },
  content: {
    alignItems: 'center',
    marginTop: 24,
  },
  spacer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
  },
});
