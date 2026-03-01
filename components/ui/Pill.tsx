/**
 * Pill Component
 * 
 * A selectable pill component for options and filters (like duration, member count, payout order).
 * Features rounded corners, color changes on selection, and haptic feedback.
 * 
 * @module components/ui/Pill
 * 
 * @example
 * ```tsx
 * // Single pill
 * <Pill 
 *   label="6 months" 
 *   selected={selectedDuration === '6'} 
 *   onPress={() => setSelectedDuration('6')}
 * />
 * 
 * // Pill with icon
 * <Pill 
 *   label="Premium" 
 *   selected={isPremium} 
 *   icon={<Icon name="star" />}
 *   onPress={() => setIsPremium(!isPremium)}
 * />
 * 
 * // Disabled pill
 * <Pill 
 *   label="Unavailable" 
 *   selected={false} 
 *   disabled={true}
 *   onPress={() => {}}
 * />
 * ```
 */

import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';

/**
 * Pill component props
 */
export interface PillProps {
  /** Text label to display in the pill */
  label: string;
  
  /** Whether the pill is currently selected */
  selected: boolean;
  
  /** Press handler for pill selection */
  onPress: () => void;
  
  /** Optional icon to display before the label */
  icon?: React.ReactNode;
  
  /** Whether the pill is disabled */
  disabled?: boolean;
  
  /** Custom style overrides */
  style?: StyleProp<ViewStyle>;
  
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  
  /** Accessibility hint for screen readers */
  accessibilityHint?: string;
}

/**
 * Pill Component
 * 
 * Renders a selectable pill with:
 * - Light blue background when unselected
 * - Primary blue background with white text when selected
 * - Haptic feedback on selection
 * - Optional icon support
 * - Disabled state with reduced opacity
 * - Rounded pill shape
 * - Minimum 44pt touch target for accessibility
 */
export const Pill = memo<PillProps>(({
  label,
  selected,
  onPress,
  icon,
  disabled = false,
  style,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();
  
  /**
   * Handle pill press with haptic feedback
   */
  const handlePress = () => {
    if (disabled) return;
    
    // Trigger haptic feedback on selection
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    onPress();
  };
  
  /**
   * Get background color based on selected state
   */
  const getBackgroundColor = () => {
    if (selected) {
      return theme.colors.primary.main; // Primary blue when selected
    }
    return theme.colors.primary.light; // Light blue when unselected
  };
  
  /**
   * Get text color based on selected state
   */
  const getTextColor = () => {
    if (disabled) {
      return theme.colors.neutral[400];
    }
    if (selected) {
      return theme.colors.primary.contrast; // White text when selected
    }
    return theme.colors.primary.main; // Primary blue text when unselected
  };
  
  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();
  
  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.pill,
        {
          backgroundColor,
          borderRadius: theme.borderRadius.pill,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.base,
          minHeight: 44, // Accessibility minimum touch target
        },
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint || (selected ? 'Selected' : 'Not selected')}
      accessibilityState={{
        disabled,
        selected,
      }}
    >
      <View style={styles.contentContainer}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text
          style={[
            styles.text,
            {
              color: textColor,
              fontSize: theme.typography.fontSize.sm,
              fontWeight: theme.typography.fontWeight.medium,
            },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

Pill.displayName = 'Pill';

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44, // Accessibility minimum touch target
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
  },
  icon: {
    marginRight: 6,
  },
  disabled: {
    opacity: 0.5,
  },
});

/**
 * PillGroup component props
 */
export interface PillGroupProps {
  /** Array of options to display as pills */
  options: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
  }>;
  
  /** Current selected value(s) - string for single-select, string[] for multi-select */
  value: string | string[];
  
  /** Change handler called when selection changes */
  onChange: (value: string | string[]) => void;
  
  /** Enable multi-select mode (default: false for single-select) */
  multiSelect?: boolean;
  
  /** Whether all pills are disabled */
  disabled?: boolean;
  
  /** Custom style overrides for the container */
  style?: StyleProp<ViewStyle>;
}

/**
 * PillGroup Component
 * 
 * Manages a collection of Pill components with selection state.
 * Features:
 * - Single-select mode: only one pill can be selected at a time
 * - Multi-select mode: multiple pills can be selected
 * - Horizontal ScrollView for overflow handling
 * - Consistent spacing between pills
 * 
 * @example
 * ```tsx
 * // Single-select mode (duration selection)
 * <PillGroup
 *   options={[
 *     { value: '3', label: '3 months' },
 *     { value: '6', label: '6 months' },
 *     { value: '12', label: '12 months' },
 *   ]}
 *   value={selectedDuration}
 *   onChange={setSelectedDuration}
 * />
 * 
 * // Multi-select mode (features selection)
 * <PillGroup
 *   options={[
 *     { value: 'sms', label: 'SMS Alerts' },
 *     { value: 'email', label: 'Email Alerts' },
 *     { value: 'push', label: 'Push Notifications' },
 *   ]}
 *   value={selectedFeatures}
 *   onChange={setSelectedFeatures}
 *   multiSelect={true}
 * />
 * ```
 */
export const PillGroup = memo<PillGroupProps>(({
  options,
  value,
  onChange,
  multiSelect = false,
  disabled = false,
  style,
}) => {
  const { theme } = useTheme();
  
  /**
   * Check if a specific option is selected
   */
  const isSelected = (optionValue: string): boolean => {
    if (multiSelect) {
      return Array.isArray(value) && value.includes(optionValue);
    }
    return value === optionValue;
  };
  
  /**
   * Handle pill press for single or multi-select
   */
  const handlePillPress = (optionValue: string) => {
    if (multiSelect) {
      // Multi-select mode: toggle selection
      const currentValues = Array.isArray(value) ? value : [];
      if (currentValues.includes(optionValue)) {
        // Remove from selection
        onChange(currentValues.filter(v => v !== optionValue));
      } else {
        // Add to selection
        onChange([...currentValues, optionValue]);
      }
    } else {
      // Single-select mode: set as only selection
      onChange(optionValue);
    }
  };
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[
        styles.pillGroupContainer,
        {
          gap: theme.spacing.sm,
        },
        style,
      ]}
      style={styles.pillGroupScrollView}
    >
      {options.map((option) => (
        <Pill
          key={option.value}
          label={option.label}
          selected={isSelected(option.value)}
          onPress={() => handlePillPress(option.value)}
          icon={option.icon}
          disabled={disabled}
        />
      ))}
    </ScrollView>
  );
});

PillGroup.displayName = 'PillGroup';

const pillGroupStyles = StyleSheet.create({
  pillGroupScrollView: {
    flexGrow: 0,
  },
  pillGroupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

// Merge styles
Object.assign(styles, pillGroupStyles);
