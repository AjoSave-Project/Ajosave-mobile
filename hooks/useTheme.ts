/**
 * useTheme Hook
 * 
 * Custom hook for accessing theme context values.
 * Provides type-safe access to theme configuration and mode management functions.
 * 
 * @module hooks/useTheme
 * @throws {Error} When used outside of ThemeProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { theme, mode, toggleMode } = useTheme();
 *   
 *   return (
 *     <View style={{ backgroundColor: theme.colors.background }}>
 *       <Text style={{ color: theme.colors.text.primary }}>
 *         Current mode: {mode}
 *       </Text>
 *       <Button onPress={toggleMode}>Toggle Theme</Button>
 *     </View>
 *   );
 * }
 * ```
 */

import { useContext } from 'react';
import { ThemeContext, ThemeContextValue } from '../contexts/ThemeContext';

/**
 * Hook for accessing theme context
 * 
 * Provides access to the current theme configuration, theme mode,
 * and functions to toggle or set the theme mode.
 * 
 * @returns {ThemeContextValue} Theme context value containing theme, mode, and mode management functions
 * @throws {Error} If used outside of ThemeProvider
 * 
 * @example
 * ```tsx
 * const { theme, mode, toggleMode, setMode } = useTheme();
 * 
 * // Access theme values
 * const backgroundColor = theme.colors.background;
 * const primaryColor = theme.colors.primary.main;
 * 
 * // Toggle between light and dark mode
 * toggleMode();
 * 
 * // Set specific mode
 * setMode('dark');
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error(
      'useTheme must be used within a ThemeProvider. ' +
      'Wrap your component tree with <ThemeProvider> to use this hook.'
    );
  }
  
  return context;
}
