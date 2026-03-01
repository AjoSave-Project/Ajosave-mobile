/**
 * Input Component
 * 
 * A comprehensive form input component with support for multiple input types,
 * validation states, icons, and accessibility features.
 * 
 * @module components/ui/Input
 * 
 * @example
 * ```tsx
 * // Basic text input
 * <Input
 *   label="Full Name"
 *   value={name}
 *   onChangeText={setName}
 *   placeholder="Enter your name"
 * />
 * 
 * // Email input with error
 * <Input
 *   type="email"
 *   label="Email Address"
 *   value={email}
 *   onChangeText={setEmail}
 *   error="Please enter a valid email"
 * />
 * 
 * // Password input with toggle
 * <Input
 *   type="password"
 *   label="Password"
 *   value={password}
 *   onChangeText={setPassword}
 *   showPasswordToggle={true}
 * />
 * 
 * // Input with icons
 * <Input
 *   label="Search"
 *   value={search}
 *   onChangeText={setSearch}
 *   leftIcon={<Icon name="search" />}
 * />
 * ```
 */

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { InputType } from '../../types/components';

/**
 * Input component props
 */
export interface InputProps {
  /** Current input value */
  value: string;
  
  /** Callback when text changes */
  onChangeText: (text: string) => void;
  
  /** Input type (affects keyboard and validation) */
  type?: InputType;
  
  /** Label text displayed above input */
  label?: string;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Helper text displayed below input */
  helperText?: string;
  
  /** Error message (displays error state when present) */
  error?: string;
  
  /** Icon displayed on the left side */
  leftIcon?: React.ReactNode;
  
  /** Icon displayed on the right side */
  rightIcon?: React.ReactNode;
  
  /** Whether the input is disabled */
  disabled?: boolean;
  
  /** Whether the input is read-only */
  readOnly?: boolean;
  
  /** Whether to hide text (for password fields) */
  secureTextEntry?: boolean;
  
  /** Whether to show password visibility toggle (for password type) */
  showPasswordToggle?: boolean;
  
  /** Custom style overrides */
  style?: StyleProp<ViewStyle>;
  
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
  
  /** Callback when input gains focus */
  onFocus?: () => void;
  
  /** Callback when input loses focus */
  onBlur?: () => void;
}

/**
 * Input Component
 * 
 * Renders an accessible, themeable input field with support for:
 * - Multiple input types (text, email, password, numeric)
 * - Label, placeholder, and helper text
 * - Error state with error message and styling
 * - Left and right icon support
 * - Disabled and readonly states
 * - Password visibility toggle
 * - Focus state styling
 * - Accessibility labels and associations
 */
export const Input = memo<InputProps>(({
  value,
  onChangeText,
  type = 'text',
  label,
  placeholder,
  helperText,
  error,
  leftIcon,
  rightIcon,
  disabled = false,
  readOnly = false,
  secureTextEntry,
  showPasswordToggle = false,
  style,
  accessibilityLabel,
  accessibilityHint,
  onFocus,
  onBlur,
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  /**
   * Determine if text should be hidden
   * For password type, use internal visibility state if toggle is enabled
   */
  const shouldHideText = type === 'password' 
    ? (showPasswordToggle ? !isPasswordVisible : (secureTextEntry ?? true))
    : secureTextEntry;
  
  /**
   * Get keyboard type based on input type
   */
  const getKeyboardType = (): TextInputProps['keyboardType'] => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'numeric':
        return 'numeric';
      case 'password':
      case 'text':
      default:
        return 'default';
    }
  };
  
  /**
   * Get autoComplete type based on input type
   */
  const getAutoComplete = (): TextInputProps['autoComplete'] => {
    switch (type) {
      case 'email':
        return 'email';
      case 'password':
        return 'password';
      default:
        return 'off';
    }
  };
  
  /**
   * Get text content type for iOS
   */
  const getTextContentType = (): TextInputProps['textContentType'] => {
    switch (type) {
      case 'email':
        return 'emailAddress';
      case 'password':
        return 'password';
      default:
        return 'none';
    }
  };
  
  /**
   * Handle focus event
   */
  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };
  
  /**
   * Handle blur event
   */
  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };
  
  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  /**
   * Get border color based on state
   */
  const getBorderColor = () => {
    if (error) {
      return theme.colors.error.main;
    }
    if (isFocused) {
      return theme.colors.primary.main;
    }
    return theme.colors.neutral[300];
  };
  
  /**
   * Get background color based on state
   */
  const getBackgroundColor = () => {
    if (disabled || readOnly) {
      return theme.colors.neutral[100];
    }
    return theme.colors.background;
  };
  
  const borderColor = getBorderColor();
  const backgroundColor = getBackgroundColor();
  
  /**
   * Render password toggle icon
   */
  const renderPasswordToggle = () => {
    if (type !== 'password' || !showPasswordToggle) {
      return null;
    }
    
    return (
      <TouchableOpacity
        onPress={togglePasswordVisibility}
        style={styles.iconContainer}
        accessibilityRole="button"
        accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
        accessibilityHint="Toggles password visibility"
      >
        <Text style={{ color: theme.colors.neutral[500], fontSize: 20 }}>
          {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
        </Text>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text
          style={[
            styles.label,
            {
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
              marginBottom: theme.spacing.xs,
            },
          ]}
        >
          {label}
        </Text>
      )}
      
      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor,
            borderColor,
            borderRadius: theme.borderRadius.medium,
            borderWidth: 1.5,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm,
            minHeight: 48, // Accessibility minimum
          },
          (disabled || readOnly) && styles.disabledContainer,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.iconContainer}>
            {leftIcon}
          </View>
        )}
        
        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.neutral[400]}
          editable={!disabled && !readOnly}
          secureTextEntry={shouldHideText}
          keyboardType={getKeyboardType()}
          autoComplete={getAutoComplete()}
          textContentType={getTextContentType()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            {
              color: theme.colors.text.primary,
              fontSize: theme.typography.fontSize.base,
            },
          ]}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint || helperText}
          accessibilityState={{
            disabled: disabled || readOnly,
          }}
        />
        
        {/* Password Toggle or Right Icon */}
        {showPasswordToggle && type === 'password' ? (
          renderPasswordToggle()
        ) : rightIcon ? (
          <View style={styles.iconContainer}>
            {rightIcon}
          </View>
        ) : null}
      </View>
      
      {/* Helper Text or Error Message */}
      {(error || helperText) && (
        <Text
          style={[
            styles.helperText,
            {
              color: error ? theme.colors.error.main : theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.xs,
              marginTop: theme.spacing.xs,
            },
          ]}
          accessibilityLiveRegion={error ? 'polite' : 'none'}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    // Dynamic styles applied inline
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabledContainer: {
    opacity: 0.6,
  },
  input: {
    flex: 1,
    paddingVertical: 0, // Remove default padding for consistent height
  },
  iconContainer: {
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    // Dynamic styles applied inline
  },
});
