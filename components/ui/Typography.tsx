/**
 * Typography Components
 * 
 * Provides semantic typography components with consistent styling and theme support.
 * Includes Heading and Text components with multiple variants, colors, weights, and alignment options.
 * 
 * @module components/ui/Typography
 * 
 * @example
 * ```tsx
 * // Heading variants
 * <Heading variant="h1" color="primary">Welcome to AjoSave</Heading>
 * <Heading variant="h2" weight="semibold" align="center">Dashboard</Heading>
 * 
 * // Text variants
 * <Text variant="body" color="secondary">This is body text</Text>
 * <Text variant="caption" color="error">Error message</Text>
 * <Text variant="label" weight="bold">Form Label</Text>
 * ```
 */

import React, { memo } from 'react';
import { Text as RNText, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { HeadingVariant, TextVariant, ColorVariant, FontWeight, TextAlign } from '../../types/components';

/**
 * Heading component props
 */
export interface HeadingProps {
  /** Heading content */
  children: React.ReactNode;
  
  /** Heading variant (h1, h2, h3, h4) */
  variant?: HeadingVariant;
  
  /** Color variant */
  color?: ColorVariant;
  
  /** Font weight */
  weight?: FontWeight;
  
  /** Text alignment */
  align?: TextAlign;
  
  /** Custom style overrides */
  style?: StyleProp<TextStyle>;
  
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  
  /** Number of lines before truncating */
  numberOfLines?: number;
}

/**
 * Heading Component
 * 
 * Renders semantic heading text with appropriate sizing and styling.
 * Supports theme-aware colors that adapt to light and dark modes.
 * Supports dynamic text sizing for accessibility.
 * 
 * Variants:
 * - h1: 32px - Page titles and main headings
 * - h2: 28px - Section headings
 * - h3: 24px - Subsection headings
 * - h4: 20px - Minor headings
 */
export const Heading = memo<HeadingProps>(({
  children,
  variant = 'h1',
  color = 'primary',
  weight = 'bold',
  align = 'left',
  style,
  accessibilityLabel,
  numberOfLines,
}) => {
  const { theme } = useTheme();
  
  /**
   * Get font size based on heading variant
   */
  const getFontSize = () => {
    switch (variant) {
      case 'h1':
        return theme.typography.fontSize['4xl']; // 32px
      case 'h2':
        return theme.typography.fontSize['3xl']; // 28px
      case 'h3':
        return theme.typography.fontSize['2xl']; // 24px
      case 'h4':
        return theme.typography.fontSize.xl; // 20px
      default:
        return theme.typography.fontSize['4xl'];
    }
  };
  
  /**
   * Get text color based on color variant
   * Returns theme-aware colors that adapt to light/dark mode
   */
  const getTextColor = () => {
    switch (color) {
      case 'primary':
        return theme.colors.text.primary;
      case 'secondary':
        return theme.colors.text.secondary;
      case 'success':
        return theme.colors.success.main;
      case 'error':
        return theme.colors.error.main;
      case 'warning':
        return theme.colors.warning.main;
      default:
        return theme.colors.text.primary;
    }
  };
  
  /**
   * Get font weight value
   */
  const getFontWeight = () => {
    return theme.typography.fontWeight[weight];
  };
  
  /**
   * Get line height based on variant
   * Larger headings use tighter line height
   */
  const getLineHeight = () => {
    const fontSize = getFontSize();
    return fontSize * theme.typography.lineHeight.tight;
  };
  
  return (
    <RNText
      style={[
        styles.heading,
        {
          fontSize: getFontSize(),
          color: getTextColor(),
          fontWeight: getFontWeight(),
          textAlign: align,
          lineHeight: getLineHeight(),
        },
        style,
      ]}
      accessibilityRole="header"
      accessibilityLabel={accessibilityLabel}
      numberOfLines={numberOfLines}
      allowFontScaling={true} // Support dynamic text sizing
      maxFontSizeMultiplier={2} // Limit scaling to 2x for layout stability
    >
      {children}
    </RNText>
  );
});

Heading.displayName = 'Heading';

/**
 * Text component props
 */
export interface TextProps {
  /** Text content */
  children: React.ReactNode;
  
  /** Text variant (body, caption, label) */
  variant?: TextVariant;
  
  /** Color variant */
  color?: ColorVariant;
  
  /** Font weight */
  weight?: FontWeight;
  
  /** Text alignment */
  align?: TextAlign;
  
  /** Custom style overrides */
  style?: StyleProp<TextStyle>;
  
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  
  /** Number of lines before truncating */
  numberOfLines?: number;
}

/**
 * Text Component
 * 
 * Renders body text with appropriate sizing and styling.
 * Supports theme-aware colors that adapt to light and dark modes.
 * Supports dynamic text sizing for accessibility.
 * 
 * Variants:
 * - body: 16px - Standard body text
 * - caption: 14px - Secondary or helper text
 * - label: 12px - Form labels and small text
 */
export const Text = memo<TextProps>(({
  children,
  variant = 'body',
  color = 'primary',
  weight = 'regular',
  align = 'left',
  style,
  accessibilityLabel,
  numberOfLines,
}) => {
  const { theme } = useTheme();
  
  /**
   * Get font size based on text variant
   */
  const getFontSize = () => {
    switch (variant) {
      case 'body':
        return theme.typography.fontSize.base; // 16px
      case 'caption':
        return theme.typography.fontSize.sm; // 14px
      case 'label':
        return theme.typography.fontSize.xs; // 12px
      default:
        return theme.typography.fontSize.base;
    }
  };
  
  /**
   * Get text color based on color variant
   * Returns theme-aware colors that adapt to light/dark mode
   */
  const getTextColor = () => {
    switch (color) {
      case 'primary':
        return theme.colors.text.primary;
      case 'secondary':
        return theme.colors.text.secondary;
      case 'success':
        return theme.colors.success.main;
      case 'error':
        return theme.colors.error.main;
      case 'warning':
        return theme.colors.warning.main;
      default:
        return theme.colors.text.primary;
    }
  };
  
  /**
   * Get font weight value
   */
  const getFontWeight = () => {
    return theme.typography.fontWeight[weight];
  };
  
  /**
   * Get line height based on variant
   * Body text uses normal line height for readability
   */
  const getLineHeight = () => {
    const fontSize = getFontSize();
    return fontSize * theme.typography.lineHeight.normal;
  };
  
  return (
    <RNText
      style={[
        styles.text,
        {
          fontSize: getFontSize(),
          color: getTextColor(),
          fontWeight: getFontWeight(),
          textAlign: align,
          lineHeight: getLineHeight(),
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel}
      numberOfLines={numberOfLines}
      allowFontScaling={true} // Support dynamic text sizing
      maxFontSizeMultiplier={2} // Limit scaling to 2x for layout stability
    >
      {children}
    </RNText>
  );
});

Text.displayName = 'Text';

const styles = StyleSheet.create({
  heading: {
    // Base styles for all headings
  },
  text: {
    // Base styles for all text
  },
});
