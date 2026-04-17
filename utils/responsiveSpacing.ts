import { useWindowDimensions } from 'react-native';

/**
 * Hook to get responsive spacing values based on screen width
 * Scales spacing for small screens (< 360dp) to prevent cramped layouts
 */
export const useResponsiveSpacing = () => {
  const { width } = useWindowDimensions();

  // Small screens: < 360dp (e.g., iPhone SE, older Android phones)
  // Medium screens: 360-400dp (e.g., Pixel 4a, iPhone 12)
  // Large screens: > 400dp (e.g., Pixel 6, iPhone 14 Pro Max)

  if (width < 360) {
    return {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    };
  }

  if (width < 400) {
    return {
      xs: 6,
      sm: 10,
      md: 14,
      lg: 18,
      xl: 24,
    };
  }

  // Default for large screens
  return {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  };
};

/**
 * Hook to get responsive font sizes based on screen width
 */
export const useResponsiveFontSize = () => {
  const { width } = useWindowDimensions();

  if (width < 360) {
    return {
      xs: 10,
      sm: 11,
      md: 12,
      lg: 14,
      xl: 16,
      xxl: 20,
    };
  }

  if (width < 400) {
    return {
      xs: 11,
      sm: 12,
      md: 13,
      lg: 15,
      xl: 17,
      xxl: 22,
    };
  }

  // Default for large screens
  return {
    xs: 12,
    sm: 13,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
  };
};

/**
 * Hook to get responsive dimensions
 */
export const useResponsiveDimensions = () => {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isSmallScreen: width < 360,
    isMediumScreen: width >= 360 && width < 400,
    isLargeScreen: width >= 400,
    isTablet: width > 600,
  };
};
