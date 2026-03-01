/**
 * Card Component
 * 
 * A versatile card component for grouping content with rounded corners, shadows,
 * and optional header/footer sections. Supports pressable behavior when interactive.
 * 
 * @module components/ui/Card
 * 
 * @example
 * ```tsx
 * // Default card with shadow
 * <Card>
 *   <Text>Card content</Text>
 * </Card>
 * 
 * // Outlined card without shadow
 * <Card variant="outlined">
 *   <Text>Outlined card</Text>
 * </Card>
 * 
 * // Elevated card with larger shadow
 * <Card variant="elevated">
 *   <Text>Elevated card</Text>
 * </Card>
 * 
 * // Pressable card with header and footer
 * <Card
 *   variant="default"
 *   header={<Text>Header</Text>}
 *   footer={<Text>Footer</Text>}
 *   onPress={handlePress}
 * >
 *   <Text>Card content</Text>
 * </Card>
 * ```
 */

import React, { memo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { CardVariant } from '../../types/components';

/**
 * Card component props
 */
export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  
  /** Visual variant of the card */
  variant?: CardVariant;
  
  /** Optional press handler - makes the card interactive */
  onPress?: () => void;
  
  /** Optional header section */
  header?: React.ReactNode;
  
  /** Optional footer section */
  footer?: React.ReactNode;
  
  /** Custom style overrides */
  style?: StyleProp<ViewStyle>;
  
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
}

/**
 * Card Component
 * 
 * Renders a themeable card container with support for:
 * - Multiple variants (default, outlined, elevated)
 * - Optional header and footer sections
 * - Pressable behavior with opacity feedback
 * - Shadow styling for elevation
 * - Rounded corners using medium border radius
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export const Card = memo<CardProps>(({
  children,
  variant = 'default',
  onPress,
  header,
  footer,
  style,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();
  
  /**
   * Get variant-specific styles
   */
  const getVariantStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      borderRadius: theme.borderRadius.medium,
      backgroundColor: theme.colors.surface,
    };
    
    switch (variant) {
      case 'outlined':
        return {
          ...baseStyles,
          borderWidth: 1,
          borderColor: theme.colors.neutral[200],
        };
      case 'elevated':
        return {
          ...baseStyles,
          ...theme.shadows.large,
        };
      case 'default':
      default:
        return {
          ...baseStyles,
          ...theme.shadows.small,
        };
    }
  };
  
  const variantStyles = getVariantStyles();
  
  /**
   * Render card content with optional header and footer
   */
  const renderContent = () => (
    <>
      {header && (
        <View style={[styles.header, { borderBottomColor: theme.colors.neutral[200] }]}>
          {header}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
      {footer && (
        <View style={[styles.footer, { borderTopColor: theme.colors.neutral[200] }]}>
          {footer}
        </View>
      )}
    </>
  );
  
  /**
   * Render pressable card if onPress is provided
   */
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.card, variantStyles, style]}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }
  
  /**
   * Render non-pressable card
   */
  return (
    <View
      style={[styles.card, variantStyles, style]}
      accessibilityLabel={accessibilityLabel}
    >
      {renderContent()}
    </View>
  );
});

Card.displayName = 'Card';

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  content: {
    padding: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
});
