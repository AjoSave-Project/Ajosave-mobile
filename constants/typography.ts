/**
 * Typography System Constants
 * 
 * Defines the typography scale including font families, sizes, weights, and line heights
 * for the AjoSave mobile application. These constants ensure consistent text styling
 * across all components and screens.
 * 
 * @module constants/typography
 */

/**
 * Font family definitions
 * 
 * To use Gilroy fonts:
 * 1. Download Gilroy font family from font marketplaces (MyFonts, Creative Market, etc.)
 * 2. Place the following font files in Mobile/assets/fonts/:
 *    - Gilroy-Regular.ttf
 *    - Gilroy-Medium.ttf
 *    - Gilroy-SemiBold.ttf
 *    - Gilroy-Bold.ttf
 * 3. Load fonts in your app using expo-font or useFonts hook
 * 
 * For now, using System fonts as fallback until Gilroy fonts are installed
 */
export const Typography = {
  fontFamily: {
    regular: 'Gilroy-Regular',
    medium: 'Gilroy-Medium',
    semibold: 'Gilroy-SemiBold',
    bold: 'Gilroy-Bold',
  },
  
  /**
   * Font size scale
   * Ranges from 12px (xs) to 32px (4xl) for comprehensive text hierarchy
   */
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },
  
  /**
   * Font weight definitions
   * Provides regular, medium, semibold, and bold weights for text emphasis
   */
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  /**
   * Line height scale
   * Defines spacing between lines of text for optimal readability
   */
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;
