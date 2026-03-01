/**
 * Spacing System Constants
 * 
 * Defines the spacing scale for consistent layout and component spacing
 * throughout the AjoSave mobile application. The scale follows a systematic
 * progression from 4px to 64px.
 * 
 * @module constants/spacing
 */

/**
 * Spacing scale values
 * Used for margins, padding, gaps, and other layout spacing
 * 
 * @example
 * // Using spacing in a component
 * <View style={{ padding: Spacing.base, marginBottom: Spacing.lg }}>
 *   <Text>Content</Text>
 * </View>
 */
export const Spacing = {
  /** Extra small spacing: 4px */
  xs: 4,
  
  /** Small spacing: 8px */
  sm: 8,
  
  /** Medium spacing: 12px */
  md: 12,
  
  /** Base spacing: 16px - Default spacing unit */
  base: 16,
  
  /** Large spacing: 24px */
  lg: 24,
  
  /** Extra large spacing: 32px */
  xl: 32,
  
  /** 2x extra large spacing: 48px */
  '2xl': 48,
  
  /** 3x extra large spacing: 64px */
  '3xl': 64,
  
  /** 5x extra, extra large spacing: 84px */
  '5xl': 84,
  
  /** 8x a little bit large spacing: 90px */
  '8xl': 95,

} as const;
