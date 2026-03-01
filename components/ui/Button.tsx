/**
 * Button Component
 * 
 * A versatile button component with multiple variants, sizes, and states.
 * Supports loading states, icons, haptic feedback, and gradient styling.
 * 
 * @module components/ui/Button
 * 
 * @example
 * ```tsx
 * // Primary button with gradient
 * <Button variant="primary" onPress={handleSubmit}>
 *   Submit
 * </Button>
 * 
 * // Button with loading state
 * <Button variant="secondary" loading={true} onPress={handleSave}>
 *   Save
 * </Button>
 * 
 * // Button with icons
 * <Button 
 *   variant="outline" 
 *   leftIcon={<Icon name="plus" />}
 *   onPress={handleAdd}
 * >
 *   Add Item
 * </Button>
 * ```
 */

import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import type { ButtonVariant, ButtonSize } from '../../types/components';

/**
 * Button component props
 */
export interface ButtonProps {
  /** Button content (text or elements) */
  children: React.ReactNode;
  
  /** Visual variant of the button */
  variant?: ButtonVariant;
  
  /** Size variant of the button */
  size?: ButtonSize;
  
  /** Whether the button is disabled */
  disabled?: boolean;
  
  /** Whether the button is in loading state */
  loading?: boolean;
  
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode;
  
  /** Press handler */
  onPress: () => void;
  
  /** Whether to trigger haptic feedback on press */
  hapticFeedback?: boolean;
  
  /** Whether the button should take full width */
  fullWidth?: boolean;
  
  /** Custom style overrides */
  style?: StyleProp<ViewStyle>;
  
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
}

/**
 * Button Component
 * 
 * Renders an accessible, themeable button with support for:
 * - Multiple variants (primary, secondary, outline, text)
 * - Size variants (small, medium, large)
 * - Loading and disabled states
 * - Icon placement (left and right)
 * - Haptic feedback
 * - Gradient styling for primary variant
 * - Minimum 44pt touch targets for accessibility
 */
export const Button = memo<ButtonProps>(({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onPress,
  hapticFeedback = true,
  fullWidth = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();
  
  /**
   * Handle button press with optional haptic feedback
   */
  const handlePress = () => {
    if (disabled || loading) return;
    
    // Trigger haptic feedback if enabled
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPress();
  };
  
  /**
   * Get button size styles
   */
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.base,
          minHeight: 44, // Accessibility minimum
        };
      case 'large':
        return {
          paddingVertical: theme.spacing.base,
          paddingHorizontal: theme.spacing.xl,
          minHeight: 56,
        };
      case 'medium':
      default:
        return {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          minHeight: 48,
        };
    }
  };
  
  /**
   * Get text size based on button size
   */
  const getTextSize = () => {
    switch (size) {
      case 'small':
        return theme.typography.fontSize.sm;
      case 'large':
        return theme.typography.fontSize.lg;
      case 'medium':
      default:
        return theme.typography.fontSize.base;
    }
  };
  
  /**
   * Get variant-specific styles
   */
  const getVariantStyles = () => {
    const baseStyles = {
      borderRadius: theme.borderRadius.medium,
      ...getSizeStyles(),
    };
    
    switch (variant) {
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.neutral[100],
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.colors.primary.main,
        };
      case 'text':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          paddingHorizontal: theme.spacing.md,
        };
      case 'primary':
      default:
        // Primary uses gradient, so we only return base styles
        return baseStyles;
    }
  };
  
  /**
   * Get text color based on variant and state
   */
  const getTextColor = () => {
    if (disabled) {
      return theme.colors.neutral[400];
    }
    
    switch (variant) {
      case 'primary':
        return theme.colors.primary.contrast;
      case 'secondary':
        return theme.colors.text.primary;
      case 'outline':
        return theme.colors.primary.main;
      case 'text':
        return theme.colors.primary.main;
      default:
        return theme.colors.primary.contrast;
    }
  };
  
  /**
   * Get loading indicator color based on variant
   */
  const getLoadingColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary.contrast;
      case 'secondary':
        return theme.colors.text.primary;
      case 'outline':
      case 'text':
        return theme.colors.primary.main;
      default:
        return theme.colors.primary.contrast;
    }
  };
  
  const variantStyles = getVariantStyles();
  const textColor = getTextColor();
  const textSize = getTextSize();
  const loadingColor = getLoadingColor();
  
  /**
   * Render button content (text and icons)
   */
  const renderContent = () => (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator color={loadingColor} size="small" />
      ) : (
        <>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                fontSize: textSize,
                fontWeight: theme.typography.fontWeight.semibold,
              },
            ]}
          >
            {children}
          </Text>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </>
      )}
    </View>
  );
  
  /**
   * Render primary button with gradient
   */
  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        style={[
          styles.button,
          fullWidth && styles.fullWidth,
          style,
        ]}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
        accessibilityHint={accessibilityHint}
        accessibilityState={{
          disabled: disabled || loading,
          busy: loading,
        }}
      >
        <LinearGradient
          colors={[theme.colors.primary.light, theme.colors.primary.main, theme.colors.primary.dark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[variantStyles, styles.gradient]}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  /**
   * Render non-gradient button variants
   */
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        variantStyles,
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      {renderContent()}
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44, // Accessibility minimum touch target
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  fullWidth: {
    width: '100%',
  },
});
