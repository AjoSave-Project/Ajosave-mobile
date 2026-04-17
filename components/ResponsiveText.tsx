import React from 'react';
import { Text, TextProps, useWindowDimensions } from 'react-native';

interface ResponsiveTextProps extends TextProps {
  variant?: 'title' | 'subtitle' | 'body' | 'caption' | 'label';
  responsive?: boolean;
}

/**
 * ResponsiveText component that automatically adjusts font size based on screen width
 * and handles text overflow gracefully
 */
export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  variant = 'body',
  responsive = true,
  style,
  numberOfLines = 1,
  ...props
}) => {
  const { width } = useWindowDimensions();

  const getFontSize = () => {
    if (!responsive) return undefined;

    const isSmallScreen = width < 360;
    const isMediumScreen = width >= 360 && width < 400;

    switch (variant) {
      case 'title':
        return isSmallScreen ? 18 : isMediumScreen ? 20 : 24;
      case 'subtitle':
        return isSmallScreen ? 14 : isMediumScreen ? 15 : 16;
      case 'body':
        return isSmallScreen ? 12 : isMediumScreen ? 13 : 14;
      case 'caption':
        return isSmallScreen ? 10 : isMediumScreen ? 11 : 12;
      case 'label':
        return isSmallScreen ? 11 : isMediumScreen ? 12 : 13;
      default:
        return undefined;
    }
  };

  const fontSize = getFontSize();
  const computedStyle = fontSize ? [{ fontSize }, style] : style;

  return (
    <Text
      numberOfLines={numberOfLines}
      ellipsizeMode="tail"
      {...props}
      style={computedStyle}
    />
  );
};
