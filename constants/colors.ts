/**
 * Color Palette Constants
 * 
 * Defines the comprehensive color system for the AjoSave mobile app including:
 * - Primary brand colors (Royal Blue)
 * - Semantic colors (success, error, warning, info)
 * - Neutral grayscale palette
 * - Theme-specific color mappings for light and dark modes
 */

/**
 * Primary color palette
 * Bright blue used for main actions and brand identity
 */
export const Primary = {
  main: '#3d71d9ff',      // Bright blue (from the design)
  light: '#7BA5F3',     // Lighter blue
  dark: '#2760d3ff',      // Darker blue
  contrast: '#FFFFFF',  // White text on primary
  background: '#EBF2FF', // Very light blue for backgrounds
};

/**
 * Success color palette
 * Green used for positive actions and confirmations
 */
export const Success = {
  main: '#10B981',      // Green
  light: '#34D399',
  dark: '#059669',
  contrast: '#FFFFFF',
};

/**
 * Error color palette
 * Red used for errors and destructive actions
 */
export const Error = {
  main: '#EF4444',      // Red
  light: '#F87171',
  dark: '#DC2626',
  contrast: '#FFFFFF',
};

/**
 * Warning color palette
 * Yellow/Orange used for warnings and cautions
 */
export const Warning = {
  main: '#F59E0B',      // Yellow/Orange
  light: '#FBBF24',
  dark: '#D97706',
  contrast: '#000000',
};

/**
 * Info color palette
 * Blue used for informational messages
 */
export const Info = {
  main: '#3B82F6',      // Blue
  light: '#60A5FA',
  dark: '#2563EB',
  contrast: '#FFFFFF',
};

/**
 * Neutral grayscale palette
 * Used for text, backgrounds, borders, and UI elements
 */
export const Neutral = {
  50: '#F9FAFB',
  100: '#F3F4F6',
  200: '#E5E7EB',
  300: '#D1D5DB',
  400: '#9CA3AF',
  500: '#6B7280',
  600: '#4B5563',
  700: '#374151',
  800: '#1F2937',
  900: '#111827',
};

/**
 * Background colors for the new design
 */
export const Background = {
  light: '#F5F7FA',     // Light gray-blue background
  dark: '#111827',
  card: '#FFFFFF',      // White cards
};

/**
 * Surface colors for pills and buttons
 */
export const Surface = {
  light: '#F5F7FA',
  dark: '#1F2937',
  pill: '#E8F0FE',      // Light blue for pill buttons
  pillActive: '#5B8DEF', // Active pill button
};

/**
 * Theme-specific text colors
 * Ensure proper contrast in both light and dark modes
 */
export const Text = {
  primary: {
    light: '#111827',
    dark: '#F9FAFB',
  },
  secondary: {
    light: '#6B7280',
    dark: '#9CA3AF',
  },
};

/**
 * Complete color system export
 * Provides all color definitions in a single object
 */
export const Colors = {
  primary: Primary,
  success: Success,
  error: Error,
  warning: Warning,
  info: Info,
  neutral: Neutral,
  background: Background,
  surface: Surface,
  text: Text,
};
