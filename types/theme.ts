/**
 * Theme type definitions for the AjoSave mobile app
 * Defines theme modes, color shades, and the complete theme interface
 */

export type ThemeMode = 'light' | 'dark';

export interface ColorShades {
  main: string;
  light: string;
  dark: string;
  contrast: string;
}

export interface NeutralShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface FontFamily {
  regular: string;
  medium: string;
  semibold: string;
  bold: string;
}

export interface FontSizes {
  xs: number;
  sm: number;
  base: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  '4xl': number;
}

export interface FontWeights {
  regular: '400';
  medium: '500';
  semibold: '600';
  bold: '700';
}

export interface LineHeights {
  tight: number;
  normal: number;
  relaxed: number;
}

export interface Spacing {
  xs: number;
  sm: number;
  md: number;
  base: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
}

export interface BorderRadius {
  small: number;
  medium: number;
  large: number;
  pill: number;
  full: number;
}

export interface Shadow {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Shadows {
  small: Shadow;
  medium: Shadow;
  large: Shadow;
}

export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: ColorShades;
    success: ColorShades;
    error: ColorShades;
    warning: ColorShades;
    info: ColorShades;
    neutral: NeutralShades;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
    };
  };
  typography: {
    fontFamily: FontFamily;
    fontSize: FontSizes;
    fontWeight: FontWeights;
    lineHeight: LineHeights;
  };
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
}
