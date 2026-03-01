/**
 * Avatar Component
 * 
 * A circular avatar component for displaying user profile images with fallback to initials.
 * Supports multiple sizes, optional badge overlay, and border styling.
 * Uses Expo Image for optimized loading and caching.
 * 
 * @module components/ui/Avatar
 * 
 * @example
 * ```tsx
 * // Avatar with image
 * <Avatar 
 *   imageUri="https://example.com/avatar.jpg"
 *   size="medium"
 * />
 * 
 * // Avatar with initials fallback
 * <Avatar 
 *   initials="JD"
 *   size="large"
 * />
 * 
 * // Avatar with badge and border
 * <Avatar 
 *   imageUri="https://example.com/avatar.jpg"
 *   size="medium"
 *   badge={<Badge variant="success" dot />}
 *   borderColor="#4169E1"
 *   borderWidth={2}
 * />
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
import { Image } from 'expo-image';
import { useTheme } from '../../hooks/useTheme';
import type { AvatarSize } from '../../types/components';

/**
 * Avatar component props
 */
export interface AvatarProps {
  /** URI of the image to display */
  imageUri?: string;
  
  /** Initials to display when no image is provided */
  initials?: string;
  
  /** Size variant or custom size in pixels */
  size?: AvatarSize | number;
  
  /** Optional badge overlay (positioned in top-right corner) */
  badge?: React.ReactNode;
  
  /** Border color */
  borderColor?: string;
  
  /** Border width in pixels */
  borderWidth?: number;
  
  /** Custom style overrides */
  style?: StyleProp<ViewStyle>;
  
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
}

/**
 * Generate a consistent color from a string using hash function
 * Used to create unique background colors for initials
 */
const generateColorFromString = (str: string): string => {
  if (!str) return '#4169E1'; // Default to primary blue
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert hash to color (using predefined palette for better aesthetics)
  const colors = [
    '#4169E1', // Royal blue
    '#10B981', // Green
    '#F59E0B', // Orange
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Avatar Component
 * 
 * Renders a circular avatar with:
 * - Image display using Expo Image for optimized loading and caching
 * - Fallback to initials on colored background when no image provided
 * - Size variants (small: 32px, medium: 48px, large: 64px) or custom size
 * - Optional badge overlay positioned in top-right corner
 * - Optional border styling
 * - Hash-based color generation for consistent initials backgrounds
 */
export const Avatar = memo<AvatarProps>(({
  imageUri,
  initials,
  size = 'medium',
  badge,
  borderColor,
  borderWidth = 0,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  
  /**
   * Get avatar size in pixels
   */
  const getSize = (): number => {
    if (typeof size === 'number') {
      return size;
    }
    
    switch (size) {
      case 'small':
        return 32;
      case 'large':
        return 64;
      case 'medium':
      default:
        return 48;
    }
  };
  
  /**
   * Get font size for initials based on avatar size
   */
  const getFontSize = (): number => {
    const avatarSize = getSize();
    // Font size is approximately 40% of avatar size
    return Math.round(avatarSize * 0.4);
  };
  
  const avatarSize = getSize();
  const fontSize = getFontSize();
  const backgroundColor = generateColorFromString(initials || '');
  
  /**
   * Render initials fallback
   */
  const renderInitials = () => {
    if (!initials) return null;
    
    // Take first two characters and uppercase them
    const displayInitials = initials.substring(0, 2).toUpperCase();
    
    return (
      <View
        style={[
          styles.initialsContainer,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            backgroundColor,
          },
        ]}
      >
        <Text
          style={[
            styles.initialsText,
            {
              fontSize,
              fontWeight: theme.typography.fontWeight.semibold,
            },
          ]}
        >
          {displayInitials}
        </Text>
      </View>
    );
  };
  
  /**
   * Render avatar image
   */
  const renderImage = () => {
    if (!imageUri) return null;
    
    return (
      <Image
        source={{ uri: imageUri }}
        style={[
          styles.image,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
        ]}
        contentFit="cover"
        transition={200}
        placeholder={undefined}
        cachePolicy="memory-disk"
      />
    );
  };
  
  return (
    <View
      style={[
        styles.container,
        {
          width: avatarSize,
          height: avatarSize,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || (initials ? `Avatar for ${initials}` : 'Avatar')}
    >
      {/* Border wrapper */}
      <View
        style={[
          styles.borderWrapper,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
            borderColor: borderColor || 'transparent',
            borderWidth,
          },
        ]}
      >
        {/* Image or initials */}
        {imageUri ? renderImage() : renderInitials()}
      </View>
      
      {/* Badge overlay */}
      {badge && (
        <View
          style={[
            styles.badgeContainer,
            {
              // Position badge in top-right corner
              top: 0,
              right: 0,
            },
          ]}
        >
          {badge}
        </View>
      )}
    </View>
  );
});

Avatar.displayName = 'Avatar';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  borderWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    // Image styles are applied inline for dynamic sizing
  },
  initialsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  badgeContainer: {
    position: 'absolute',
  },
});
