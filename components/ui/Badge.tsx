/**
 * Badge Component
 * 
 * A badge component for displaying status indicators and labels.
 * Supports multiple variants (success, error, warning, info, neutral),
 * size variants (small, medium), optional icons, and a minimal dot variant.
 * 
 * @module components/ui/Badge
 * 
 * @example
 * ```tsx
 * // Success badge
 * <Badge variant="success">Active</Badge>
 * 
 * // Error badge with icon
 * <Badge variant="error" icon={<Icon name="alert" />}>
 *   Failed
 * </Badge>
 * 
 * // Small neutral badge
 * <Badge variant="neutral" size="small">Pending</Badge>
 * 
 * // Dot variant for minimal status indication
 * <Badge variant="success" dot />
 * 
 * // Badge with custom styling
 * <Badge variant="info" style={{ marginLeft: 8 }}>
 *   New
 * </Badge>
 * ```
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { BadgeVariant, BadgeSize } from '../../types/components';

/**
 * Badge component props
 */
export interface BadgeProps {
  /** Content to display in the badge (text or other elements) */
  children?: React.ReactNode;
  
  /** Visual variant determining color scheme */
  variant?: BadgeVariant;
  
  /** Size variant */
  size?: BadgeSize;
  
  /** Optional icon to display before text */
  icon?: React.ReactNode;
  
  /** If true, displays only a colored dot (minimal status indicator) */
  dot?: boolean;
  
  /** Custom style overrides */
  style?: StyleProp<ViewStyle>;
  
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
}

/**
 * Get background and text colors for each badge variant
 */
const getVariantColors = (variant: BadgeVariant) => {
  switch (variant) {
    case 'success':
      return {
        backgroundColor: '#D1FAE5', // Light green background
        textColor: '#065F46',       // Dark green text
        dotColor: '#10B981',        // Green dot
      };
    case 'error':
      return {
        backgroundColor: '#FEE2E2', // Light red background
        textColor: '#991B1B',       // Dark red text
        dotColor: '#EF4444',        // Red dot
      };
    case 'warning':
      return {
        backgroundColor: '#FEF3C7', // Light yellow background
        textColor: '#92400E',       // Dark yellow/brown text
        dotColor: '#F59E0B',        // Orange dot
      };
    case 'info':
      return {
        backgroundColor: '#DBEAFE', // Light blue background
        textColor: '#1E40AF',       // Dark blue text
        dotColor: '#3B82F6',        // Blue dot
      };
    case 'neutral':
    default:
      return {
        backgroundColor: '#F3F4F6', // Light gray background
        textColor: '#374151',       // Dark gray text
        dotColor: '#6B7280',        // Gray dot
      };
  }
};

/**
 * Badge Component
 * 
 * Renders a badge with:
 * - Variant-specific background and text colors (success, error, warning, info, neutral)
 * - Size variants (small, medium) with appropriate padding and font sizes
 * - Optional icon display before text
 * - Dot variant for minimal status indication (shows only colored circle)
 * - Rounded corners for pill-like appearance
 * - Theme-aware styling
 */
export const Badge = memo<BadgeProps>(({
  children,
  variant = 'neutral',
  size = 'medium',
  icon,
  dot = false,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const colors = getVariantColors(variant);
  
  /**
   * Get padding based on size
   */
  const getPadding = () => {
    if (dot) {
      return 0; // No padding for dot variant
    }
    
    return size === 'small'
      ? { paddingHorizontal: 8, paddingVertical: 2 }
      : { paddingHorizontal: 12, paddingVertical: 4 };
  };
  
  /**
   * Get font size based on size
   */
  const getFontSize = () => {
    return size === 'small'
      ? theme.typography.fontSize.xs
      : theme.typography.fontSize.sm;
  };
  
  /**
   * Get dot size based on size prop
   */
  const getDotSize = () => {
    return size === 'small' ? 8 : 10;
  };
  
  const padding = getPadding();
  const fontSize = getFontSize();
  const dotSize = getDotSize();
  
  /**
   * Render dot variant (minimal status indicator)
   */
  if (dot) {
    return (
      <View
        style={[
          styles.dotContainer,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: colors.dotColor,
          },
          style,
        ]}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel || `${variant} status indicator`}
      />
    );
  }
  
  /**
   * Render standard badge with text and optional icon
   */
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.backgroundColor,
          ...padding,
        },
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      {/* Icon */}
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      
      {/* Text content */}
      {children && (
        <Text
          style={[
            styles.text,
            {
              color: colors.textColor,
              fontSize,
              fontWeight: theme.typography.fontWeight.medium,
            },
          ]}
        >
          {children}
        </Text>
      )}
    </View>
  );
});

Badge.displayName = 'Badge';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12, // Rounded corners for pill-like appearance
    alignSelf: 'flex-start', // Don't stretch to full width
  },
  iconContainer: {
    marginRight: 4,
  },
  text: {
    textAlign: 'center',
  },
  dotContainer: {
    // Dot styles are applied inline for dynamic sizing
  },
});
