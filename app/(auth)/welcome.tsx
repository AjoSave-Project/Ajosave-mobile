import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';

/**
 * Welcome Screen
 * 
 * Entry point for authentication - Sign in or Sign up
 * Features a split design with blue top section and white bottom section
 */
export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Blue top section with semi-circles */}
      <View style={styles.topSection}>
        {/* Semi-circle 1 - solid */}
        <LinearGradient
          colors={['rgba(111, 142, 226, 0.2)', 'rgba(142, 219, 255, 0.4)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.semiCircle1}
        />
        {/* Semi-circle 2 - faded */}
        <LinearGradient
          colors={['#58b1ffff', Colors.primary.main]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.semiCircle2}
        />
        
        {/* AjoSave text */}
        <Text style={styles.brandName}>AjoSave</Text>
      </View>

      {/* White bottom section with buttons */}
      <View style={styles.bottomSection}>
        <Pressable 
          style={({ pressed }) => [styles.signInButton, pressed && styles.buttonPressed]}
          onPress={() => router.push('/(auth)/signin')}
        >
          <Text style={styles.buttonText}>Sign in</Text>
          <Ionicons name="arrow-forward" style={styles.arrow}></Ionicons>
        </Pressable>

        <Pressable 
          style={({ pressed }) => [styles.signUpButton, pressed && styles.buttonPressed]}
          onPress={() => router.push('/(auth)/create-account')}
        >
          <Text style={styles.buttonText}>Sign up</Text>
            <Ionicons name="arrow-forward" style={styles.arrow}></Ionicons>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  semiCircle1: {
    width: 510,
    height: 600,
    borderRadius: 255,
    position: 'absolute',
    top: -80,
  },
  semiCircle2: {
    width: 470,
    height: 550,
    borderRadius: 235,
    position: 'absolute',
    top: -80,
  },
  brandName: {
    fontSize: 26,
    color: '#FFFFFF',
    fontFamily: Typography.fontFamily.bold,
  },
  bottomSection: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  signInButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  signUpButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 20
  },
});
