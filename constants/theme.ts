/**
 * Theme Configuration Constants
 * 
 * Defines border radius, shadow, and animation constants for the AjoSave mobile app.
 * These constants work together with colors, typography, and spacing to create
 * a cohesive design system.
 * 
 * @module constants/theme
 */

import { Platform } from 'react-native';

/**
 * Border radius values
 * Used for rounded corners on cards, buttons, inputs, and other UI elements
 * 
 * @example
 * // Using border radius in a component
 * <View style={{ borderRadius: BorderRadius.medium }}>
 *   <Text>Rounded content</Text>
 * </View>
 */
export const BorderRadius = {
  /** Small radius: 8px - For subtle rounding */
  small: 8,
  
  /** Medium radius: 12px - Default for most components */
  medium: 12,
  
  /** Large radius: 16px - For prominent elements */
  large: 16,
  
  /** Pill radius: 24px - For pill-shaped elements */
  pill: 24,
  
  /** Full radius: 9999px - For circular elements */
  full: 9999,
} as const;

/**
 * Shadow configurations for card elevation
 * Provides small, medium, and large shadow styles for depth and hierarchy
 * 
 * Note: Shadow properties work differently on iOS and Android.
 * - iOS uses shadowColor, shadowOffset, shadowOpacity, shadowRadius
 * - Android uses elevation
 * 
 * @example
 * // Using shadows in a component
 * <View style={[styles.card, Shadows.medium]}>
 *   <Text>Elevated card</Text>
 * </View>
 */
export const Shadows = {
  /** Small shadow: Subtle elevation for minimal depth */
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  /** Medium shadow: Standard elevation for cards and modals */
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  /** Large shadow: Prominent elevation for floating elements */
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

/**
 * Animation duration constants
 * Defines consistent timing for animations and transitions throughout the app
 * 
 * @example
 * // Using animation durations with React Native Animated
 * Animated.timing(fadeAnim, {
 *   toValue: 1,
 *   duration: Animations.duration.normal,
 *   useNativeDriver: true,
 * }).start();
 */
export const Animations = {
  /** Animation duration values in milliseconds */
  duration: {
    /** Fast animation: 150ms - For quick feedback */
    fast: 150,
    
    /** Normal animation: 300ms - Default for most transitions */
    normal: 300,
    
    /** Slow animation: 500ms - For deliberate, emphasized transitions */
    slow: 500,
  },
  
  /** Easing function names for animation curves */
  easing: {
    /** Ease in: Starts slow, ends fast */
    easeIn: 'ease-in',
    
    /** Ease out: Starts fast, ends slow */
    easeOut: 'ease-out',
    
    /** Ease in-out: Starts slow, fast in middle, ends slow */
    easeInOut: 'ease-in-out',
  },
} as const;

/**
 * Legacy theme colors (for backward compatibility)
 * These are maintained for existing components that may reference them
 * New components should use the colors from constants/colors.ts
 */
const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

/**
 * Platform-specific font definitions
 * Provides system fonts optimized for each platform
 */
export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
