import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { setOnboardingComplete } from '@/utils/onboardingStorage';

/**
 * Onboarding Screen - Survey Style
 * 
 * Interactive onboarding with multiple screens and language toggle
 * to make users feel welcome and understand the app's value
 */

interface OnboardingStep {
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  iconColor?: string;
  title: string;
  subtitle: string;
  isWelcomeScreen?: boolean;
}

const getOnboardingSteps = (): OnboardingStep[] => {
  return [
    {
      emoji: '👋',
      title: 'Welcome!',
      subtitle: 'You know how you save money with your friends and family? Taking turns to collect? That\'s what we do here. Same thing. Just safer.',
      isWelcomeScreen: true,
    },
    {
      icon: 'people',
      iconColor: Colors.primary.main,
      title: 'Save With Your People',
      subtitle: 'Join a group with people you trust. Everyone puts money. One person collects. Next time, another person collects. Just like Ajo.',
    },
    {
      icon: 'eye',
      iconColor: '#10B981',
      title: 'See Everything',
      subtitle: 'Who paid? Who didn\'t pay? When is your turn? You can see it all. No secrets. No confusion.',
    },
    {
      icon: 'shield-checkmark',
      iconColor: '#8B5CF6',
      title: 'Nobody Can Steal',
      subtitle: 'The money is locked. Nobody can run away with it. Not even us. When it\'s your turn, you get your money. Guaranteed.',
    },
    {
      icon: 'notifications',
      iconColor: '#EF4444',
      title: 'We Remind You',
      subtitle: 'Forgot to pay? We send you a message. Your turn to collect? We tell you. No need to remember everything.',
    },
  ];
};

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconPopAnim = useRef(new Animated.Value(0)).current;
  const phoneBounceAnim = useRef(new Animated.Value(0)).current;

  const onboardingSteps = getOnboardingSteps();
  const isOnSurveySteps = currentStep < onboardingSteps.length;
  const step = isOnSurveySteps ? onboardingSteps[currentStep] : null;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === onboardingSteps.length;
  const isWelcomeScreen = step?.isWelcomeScreen;

  // Icon pop-in animation - triggers when step changes
  useEffect(() => {
    if (isOnSurveySteps) {
      // Reset and trigger pop animation
      iconPopAnim.setValue(0);
      Animated.spring(iconPopAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [currentStep, isOnSurveySteps]);

  // Phone bounce animation for final screen
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(phoneBounceAnim, {
          toValue: -15,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(phoneBounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const animateTransition = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      animateTransition(() => {
        setCurrentStep(currentStep + 1);
      });
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      animateTransition(() => {
        setCurrentStep(currentStep - 1);
      });
    }
  };

  const handleComplete = async () => {
    try {
      await setOnboardingComplete();
      console.log('[OnboardingScreen] Onboarding completed, flag set');
    } catch (error) {
      console.error('[OnboardingScreen] Error setting onboarding flag:', error);
    }
    router.push('/(auth)/welcome');
  };

  // Render final "Get Started" screen
  if (isLastStep) {
    return (
      <View style={styles.container}>
        {/* Image Illustration */}
        <View style={styles.illustrationContainer}>
          <Animated.Image 
            source={require('@/assets/images/Phone.png')}
            style={[
              styles.image,
              {
                transform: [{ translateY: phoneBounceAnim }],
              },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* Content */}
        <View style={styles.finalContent}>
          <Text style={styles.finalTitle}>Saving Together, Growing Together</Text>
          <Text style={styles.finalSubtitle}>Inspired by Ajo. Designed for you.</Text>
        </View>

        {/* Spacer to push button to bottom */}
        <View style={styles.spacer} />

        {/* Navigation */}
        <View style={styles.finalNavigation}>
          <Pressable style={styles.finalBackButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={Colors.neutral[700]} />
          </Pressable>

          <Pressable style={styles.finalButton} onPress={handleComplete}>
            <Text style={styles.finalButtonText}>Get Started</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Render welcome screen (first screen with blue background)
  if (isWelcomeScreen) {
    return (
      <View style={styles.welcomeContainer}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {[...onboardingSteps, {}].map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                styles.progressDotWhite,
                index === currentStep && styles.progressDotActiveWhite,
                index < currentStep && styles.progressDotCompletedWhite,
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Giant Emoji */}
          <Animated.Text
            style={[
              styles.giantEmoji,
              {
                opacity: iconPopAnim,
                transform: [
                  { 
                    scale: iconPopAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    })
                  }
                ],
              },
            ]}
          >
            {step.emoji}
          </Animated.Text>

          {/* Text */}
          <View style={styles.textContainer}>
            <Text style={styles.welcomeTitle}>{step.title}</Text>
            <Text style={styles.welcomeSubtitle}>{step.subtitle}</Text>
          </View>
        </Animated.View>

        {/* Navigation Buttons */}
        <View style={styles.welcomeNavigationContainer}>
          {/* Next Button */}
          <Pressable style={styles.welcomeNextButton} onPress={handleNext}>
            <Ionicons name="arrow-forward" size={24} color={Colors.primary.main} />
          </Pressable>
          
          {/* Skip Button */}
          <Pressable style={styles.welcomeSkipButton} onPress={handleComplete}>
            <Text style={styles.skipButtonTextWhite}>Skip</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Render survey steps
  return (
    <View style={styles.container}>
      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[...onboardingSteps, {}].map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: step!.iconColor! + '20',
              opacity: iconPopAnim,
              transform: [
                { 
                  scale: iconPopAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  })
                }
              ],
            },
          ]}
        >
          <Ionicons name={step!.icon!} size={80} color={step!.iconColor} />
        </Animated.View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{step!.title}</Text>
          <Text style={styles.subtitle}>{step!.subtitle}</Text>
        </View>
      </Animated.View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        {/* Back Button */}
        <Pressable
          style={[styles.backButton, isFirstStep && styles.backButtonDisabled]}
          onPress={handleBack}
          disabled={isFirstStep}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isFirstStep ? Colors.neutral[300] : Colors.neutral[700]}
          />
        </Pressable>

        {/* Next Button */}
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Skip Button */}
      <Pressable style={styles.skipButton} onPress={handleComplete}>
        <Text style={styles.skipButtonText}>Skip</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.neutral[300],
  },
  progressDotWhite: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    width: 24,
    backgroundColor: Colors.primary.main,
  },
  progressDotActiveWhite: {
    width: 24,
    backgroundColor: '#FFFFFF',
  },
  progressDotCompleted: {
    backgroundColor: Colors.primary.main,
  },
  progressDotCompletedWhite: {
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giantEmoji: {
    fontSize: 120,
    marginBottom: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  welcomeTitle: {
    fontSize: 28,
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },
  backButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  backButtonDisabled: {
    backgroundColor: Colors.neutral[100],
    borderColor: Colors.neutral[100],
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.main,
    paddingVertical: 18,
    borderRadius: 28,
    gap: 8,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeNextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
  },
  welcomeSkipButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  skipButtonText: {
    color: Colors.neutral[500],
    fontSize: 14,
    fontFamily: Typography.fontFamily.medium,
  },
  skipButtonTextWhite: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontFamily: Typography.fontFamily.medium,
  },
  // Final screen styles
  illustrationContainer: {
    marginTop: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 280,
    height: 280,
  },
  finalContent: {
    alignItems: 'center',
    marginTop: 24,
  },
  spacer: {
    flex: 1,
  },
  finalTitle: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  finalSubtitle: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  finalNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  finalBackButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  finalButton: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  finalButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
  },
});
