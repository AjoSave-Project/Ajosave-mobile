/**
 * ProgressIndicator Component
 * 
 * A visual progress indicator for multi-step flows (like onboarding, group creation, KYC).
 * Shows current step, completed steps, and upcoming steps with connecting lines.
 * 
 * @module components/ui/ProgressIndicator
 * 
 * @example
 * ```tsx
 * // Simple step indicator (e.g., "Step 1 of 3")
 * <ProgressIndicator 
 *   currentStep={1} 
 *   totalSteps={3} 
 * />
 * 
 * // With step labels
 * <ProgressIndicator 
 *   currentStep={2} 
 *   totalSteps={4}
 *   steps={[
 *     { label: 'Personal Info', description: 'Basic details' },
 *     { label: 'Verification', description: 'ID verification' },
 *     { label: 'Bank Details', description: 'Account info' },
 *     { label: 'Review', description: 'Confirm details' },
 *   ]}
 * />
 * 
 * // Vertical orientation
 * <ProgressIndicator 
 *   currentStep={1} 
 *   totalSteps={3}
 *   orientation="vertical"
 * />
 * ```
 */

import React, { memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';

/**
 * Step configuration for labeled progress indicators
 */
export interface StepConfig {
  /** Label text for the step */
  label: string;
  
  /** Optional description text */
  description?: string;
}

/**
 * ProgressIndicator component props
 */
export interface ProgressIndicatorProps {
  /** Current active step (1-indexed) */
  currentStep: number;
  
  /** Total number of steps */
  totalSteps: number;
  
  /** Optional step configurations with labels and descriptions */
  steps?: StepConfig[];
  
  /** Orientation of the progress indicator */
  orientation?: 'horizontal' | 'vertical';
  
  /** Whether to animate transitions between steps */
  animated?: boolean;
  
  /** Custom style overrides */
  style?: StyleProp<ViewStyle>;
}

/**
 * ProgressIndicator Component
 * 
 * Renders a multi-step progress indicator with:
 * - Visual distinction for completed, current, and upcoming steps
 * - Horizontal or vertical step display with connecting lines
 * - Optional step labels and descriptions
 * - Animated transitions using React Native Reanimated
 * - Pulse animation on current step
 * - Theme-aware colors
 * 
 * **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**
 */
export const ProgressIndicator = memo<ProgressIndicatorProps>(({
  currentStep,
  totalSteps,
  steps,
  orientation = 'horizontal',
  animated = true,
  style,
}) => {
  const { theme } = useTheme();
  
  // Validate props
  const validCurrentStep = Math.max(1, Math.min(currentStep, totalSteps));
  
  /**
   * Render a single step circle with animation
   */
  const renderStep = (stepNumber: number) => {
    const isCompleted = stepNumber < validCurrentStep;
    const isCurrent = stepNumber === validCurrentStep;
    const isUpcoming = stepNumber > validCurrentStep;
    
    // Animated scale for pulse effect on current step
    const scale = useSharedValue(1);
    
    useEffect(() => {
      if (isCurrent && animated) {
        // Pulse animation for current step
        scale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1, // Infinite repeat
          false
        );
      } else {
        scale.value = withTiming(1, { duration: 300 });
      }
    }, [isCurrent, animated]);
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));
    
    /**
     * Get step circle styles based on state
     */
    const getStepStyles = () => {
      if (isCompleted) {
        return {
          backgroundColor: theme.colors.primary.main,
          borderColor: theme.colors.primary.main,
        };
      }
      if (isCurrent) {
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.primary.main,
        };
      }
      // Upcoming
      return {
        backgroundColor: 'transparent',
        borderColor: theme.colors.neutral[300],
      };
    };
    
    /**
     * Get step number text color based on state
     */
    const getTextColor = () => {
      if (isCompleted) {
        return theme.colors.primary.contrast;
      }
      if (isCurrent) {
        return theme.colors.primary.main;
      }
      return theme.colors.neutral[400];
    };
    
    const stepStyles = getStepStyles();
    const textColor = getTextColor();
    
    return (
      <Animated.View
        key={stepNumber}
        style={[
          styles.stepCircle,
          stepStyles,
          animated && animatedStyle,
        ]}
      >
        <Text
          style={[
            styles.stepNumber,
            {
              color: textColor,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.semibold,
            },
          ]}
        >
          {stepNumber}
        </Text>
      </Animated.View>
    );
  };
  
  /**
   * Render connecting line between steps
   */
  const renderConnectingLine = (stepNumber: number) => {
    const isCompleted = stepNumber < validCurrentStep;
    
    const lineColor = isCompleted
      ? theme.colors.primary.main
      : theme.colors.neutral[300];
    
    if (orientation === 'vertical') {
      return (
        <View
          key={`line-${stepNumber}`}
          style={[
            styles.verticalLine,
            { backgroundColor: lineColor },
          ]}
        />
      );
    }
    
    return (
      <View
        key={`line-${stepNumber}`}
        style={[
          styles.horizontalLine,
          { backgroundColor: lineColor },
        ]}
      />
    );
  };
  
  /**
   * Render step with optional label
   */
  const renderStepWithLabel = (stepNumber: number) => {
    const stepConfig = steps?.[stepNumber - 1];
    const isCurrent = stepNumber === validCurrentStep;
    
    if (orientation === 'vertical') {
      return (
        <View key={stepNumber} style={styles.verticalStepContainer}>
          <View style={styles.verticalStepIndicator}>
            {renderStep(stepNumber)}
          </View>
          {stepConfig && (
            <View style={styles.verticalStepLabel}>
              <Text
                style={[
                  styles.stepLabelText,
                  {
                    color: isCurrent
                      ? theme.colors.text.primary
                      : theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.base,
                    fontWeight: isCurrent
                      ? theme.typography.fontWeight.semibold
                      : theme.typography.fontWeight.regular,
                  },
                ]}
              >
                {stepConfig.label}
              </Text>
              {stepConfig.description && (
                <Text
                  style={[
                    styles.stepDescriptionText,
                    {
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.fontSize.sm,
                    },
                  ]}
                >
                  {stepConfig.description}
                </Text>
              )}
            </View>
          )}
        </View>
      );
    }
    
    // Horizontal orientation
    return (
      <View key={stepNumber} style={styles.horizontalStepContainer}>
        {renderStep(stepNumber)}
        {stepConfig && (
          <Text
            style={[
              styles.stepLabelText,
              {
                color: isCurrent
                  ? theme.colors.text.primary
                  : theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.xs,
                fontWeight: isCurrent
                  ? theme.typography.fontWeight.medium
                  : theme.typography.fontWeight.regular,
                marginTop: theme.spacing.xs,
              },
            ]}
            numberOfLines={1}
          >
            {stepConfig.label}
          </Text>
        )}
      </View>
    );
  };
  
  /**
   * Render all steps with connecting lines
   */
  const renderSteps = () => {
    const stepElements: React.ReactNode[] = [];
    
    for (let i = 1; i <= totalSteps; i++) {
      stepElements.push(renderStepWithLabel(i));
      
      // Add connecting line between steps (except after last step)
      if (i < totalSteps) {
        stepElements.push(renderConnectingLine(i));
      }
    }
    
    return stepElements;
  };
  
  const containerStyle = orientation === 'vertical'
    ? styles.verticalContainer
    : styles.horizontalContainer;
  
  return (
    <View
      style={[containerStyle, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${validCurrentStep} of ${totalSteps}`}
      accessibilityValue={{
        min: 1,
        max: totalSteps,
        now: validCurrentStep,
      }}
    >
      {renderSteps()}
    </View>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';

const styles = StyleSheet.create({
  // Horizontal layout
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalStepContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalLine: {
    height: 2,
    flex: 1,
    minWidth: 24,
    marginHorizontal: 8,
  },
  
  // Vertical layout
  verticalContainer: {
    flexDirection: 'column',
  },
  verticalStepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  verticalStepIndicator: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  verticalStepLabel: {
    flex: 1,
    marginLeft: 16,
    paddingTop: 4,
  },
  verticalLine: {
    width: 2,
    height: 32,
    marginLeft: 15, // Center with step circle (32/2 - 2/2)
    marginVertical: 4,
  },
  
  // Step circle
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    textAlign: 'center',
  },
  
  // Labels
  stepLabelText: {
    textAlign: 'center',
  },
  stepDescriptionText: {
    marginTop: 2,
  },
});
