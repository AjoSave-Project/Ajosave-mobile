import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

/**
 * Onboarding Screen
 * 
 * Shows app introduction and value proposition with Phone.png illustration
 */
export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      {/* Image Illustration */}
      <View style={styles.illustrationContainer}>
        <Image 
          source={require('@/assets/images/Phone.png')}
          style={styles.image}
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
        onPress={() => router.push('/(auth)/welcome')}
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
    paddingVertical: 26,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
  },
});
