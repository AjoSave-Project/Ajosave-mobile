/**
 * Theme Context and Provider
 * 
 * Provides theme configuration to all child components via React Context.
 * Supports light and dark mode with theme persistence using AsyncStorage.
 * Memoizes theme values to prevent unnecessary re-renders.
 * 
 * @module contexts/ThemeContext
 */

import React, { createContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { BorderRadius, Shadows } from '../constants/theme';
import type { Theme, ThemeMode } from '../types/theme';

const THEME_STORAGE_KEY = '@ajosave_theme_mode';

/**
 * Theme context value interface
 * Provides theme configuration and mode management functions
 */
export interface ThemeContextValue {
  /** Current theme mode (light or dark) */
  mode: ThemeMode;
  
  /** Complete theme object with all design tokens */
  theme: Theme;
  
  /** Toggle between light and dark mode */
  toggleMode: () => void;
  
  /** Set specific theme mode */
  setMode: (mode: ThemeMode) => void;
}

/**
 * Theme context
 * Provides theme values to all child components
 */
export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Theme provider props
 */
interface ThemeProviderProps {
  children: ReactNode;
  /** Initial theme mode (defaults to 'light') */
  initialMode?: ThemeMode;
}

/**
 * Theme Provider Component
 * 
 * Manages theme state and provides theme configuration to child components.
 * Persists theme preference to AsyncStorage and loads it on mount.
 * 
 * @example
 * ```tsx
 * <ThemeProvider>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({ children, initialMode = 'light' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Load theme preference from AsyncStorage on mount
   */
  useEffect(() => {
    loadThemePreference();
  }, []);

  /**
   * Persist theme preference to AsyncStorage when mode changes
   */
  useEffect(() => {
    if (!isLoading) {
      saveThemePreference(mode);
    }
  }, [mode, isLoading]);

  /**
   * Load stored theme preference from AsyncStorage
   */
  const loadThemePreference = async () => {
    try {
      const storedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedMode === 'light' || storedMode === 'dark') {
        setModeState(storedMode);
      }
    } catch (error) {
      console.warn('Failed to load theme preference:', error);
      // Fall back to initial mode on error
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save theme preference to AsyncStorage
   */
  const saveThemePreference = async (themeMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, themeMode);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  };

  /**
   * Toggle between light and dark mode
   */
  const toggleMode = () => {
    setModeState((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  /**
   * Set specific theme mode
   */
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  /**
   * Memoized theme object
   * Prevents unnecessary re-renders by only updating when mode changes
   */
  const theme = useMemo<Theme>(() => {
    return {
      mode,
      colors: {
        primary: Colors.primary,
        success: Colors.success,
        error: Colors.error,
        warning: Colors.warning,
        info: Colors.info,
        neutral: Colors.neutral,
        background: mode === 'light' ? Colors.background.light : Colors.background.dark,
        surface: mode === 'light' ? Colors.surface.light : Colors.surface.dark,
        text: {
          primary: mode === 'light' ? Colors.text.primary.light : Colors.text.primary.dark,
          secondary: mode === 'light' ? Colors.text.secondary.light : Colors.text.secondary.dark,
        },
      },
      typography: {
        fontFamily: Typography.fontFamily,
        fontSize: Typography.fontSize,
        fontWeight: Typography.fontWeight,
        lineHeight: Typography.lineHeight,
      },
      spacing: Spacing,
      borderRadius: BorderRadius,
      shadows: Shadows,
    };
  }, [mode]);

  /**
   * Memoized context value
   * Prevents unnecessary re-renders of consumers
   */
  const contextValue = useMemo<ThemeContextValue>(() => {
    return {
      mode,
      theme,
      toggleMode,
      setMode,
    };
  }, [mode, theme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
