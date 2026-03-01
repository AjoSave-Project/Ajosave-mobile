/**
 * Layout Components
 * 
 * Provides layout components for consistent screen structure and content organization.
 * Includes Container, ScreenWrapper, and SectionHeader components.
 * 
 * @module components/ui/Layout
 * 
 * @example
 * ```tsx
 * // Basic container with padding
 * <Container>
 *   <Text>Content with consistent padding</Text>
 * </Container>
 * 
 * // Centered container
 * <Container centered>
 *   <Text>Centered content</Text>
 * </Container>
 * 
 * // Screen wrapper with scroll
 * <ScreenWrapper scrollable>
 *   <Text>Scrollable content</Text>
 * </ScreenWrapper>
 * 
 * // Screen with header and footer
 * <ScreenWrapper
 *   header={<Text>Header</Text>}
 *   footer={<Button>Submit</Button>}
 * >
 *   <Text>Content</Text>
 * </ScreenWrapper>
 * 
 * // Section header
 * <SectionHeader
 *   title="Recent Transactions"
 *   subtitle="Last 30 days"
 *   action={<Button variant="text">View All</Button>}
 * />
 * ```
 */

import React, { memo } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../hooks/useTheme';
import { Heading, Text } from './Typography';

/**
 * Container component props
 */
export interface ContainerProps {
  /** Content to render inside the container */
  children: React.ReactNode;
  
  /** Whether to center the content horizontally */
  centered?: boolean;
  
  /** Custom style overrides */
  style?: StyleProp<ViewStyle>;
}

/**
 * Container Component
 * 
 * Provides consistent horizontal padding and optional content centering.
 * Used as a wrapper for content sections to maintain consistent spacing.
 * 
 * @example
 * ```tsx
 * <Container>
 *   <Text>Content with standard padding</Text>
 * </Container>
 * 
 * <Container centered>
 *   <Text>Centered content</Text>
 * </Container>
 * ```
 */
export const Container = memo<ContainerProps>(({
  children,
  centered = false,
  style,
}) => {
  const { theme } = useTheme();
  
  return (
    <View
      style={[
        {
          paddingHorizontal: theme.spacing.base,
        },
        centered && containerStyles.centered,
        style,
      ]}
    >
      {children}
    </View>
  );
});

Container.displayName = 'Container';

const containerStyles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * ScreenWrapper component props
 */
export interface ScreenWrapperProps {
  /** Content to render inside the screen wrapper */
  children: React.ReactNode;
  
  /** Whether the content should be scrollable */
  scrollable?: boolean;
  
  /** Optional header content */
  header?: React.ReactNode;
  
  /** Optional footer content */
  footer?: React.ReactNode;
  
  /** Custom style overrides */
  style?: StyleProp<ViewStyle>;
}

/**
 * ScreenWrapper Component
 * 
 * Provides a complete screen layout with:
 * - Safe area handling for notched devices
 * - Optional scroll behavior
 * - Optional header and footer sections
 * - Keyboard avoiding behavior
 * 
 * @example
 * ```tsx
 * // Basic screen wrapper
 * <ScreenWrapper>
 *   <Text>Screen content</Text>
 * </ScreenWrapper>
 * 
 * // Scrollable screen
 * <ScreenWrapper scrollable>
 *   <Text>Long content that scrolls</Text>
 * </ScreenWrapper>
 * 
 * // Screen with header and footer
 * <ScreenWrapper
 *   header={<Text>Header</Text>}
 *   footer={<Button>Submit</Button>}
 * >
 *   <Text>Content</Text>
 * </ScreenWrapper>
 * ```
 */
export const ScreenWrapper = memo<ScreenWrapperProps>(({
  children,
  scrollable = false,
  header,
  footer,
  style,
}) => {
  const { theme } = useTheme();
  
  /**
   * Render content with optional scroll behavior
   */
  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={screenWrapperStyles.scrollView}
          contentContainerStyle={[
            screenWrapperStyles.scrollContent,
            {
              backgroundColor: theme.colors.background,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      );
    }
    
    return (
      <View
        style={[
          screenWrapperStyles.content,
          {
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        {children}
      </View>
    );
  };
  
  return (
    <SafeAreaView
      style={[
        screenWrapperStyles.safeArea,
        {
          backgroundColor: theme.colors.background,
        },
        style,
      ]}
      edges={['top', 'left', 'right']}
    >
      <KeyboardAvoidingView
        style={screenWrapperStyles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {header && (
          <View
            style={[
              screenWrapperStyles.header,
              {
                backgroundColor: theme.colors.background,
                borderBottomColor: theme.colors.neutral[200],
              },
            ]}
          >
            {header}
          </View>
        )}
        
        {renderContent()}
        
        {footer && (
          <View
            style={[
              screenWrapperStyles.footer,
              {
                backgroundColor: theme.colors.background,
                borderTopColor: theme.colors.neutral[200],
              },
            ]}
          >
            {footer}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

ScreenWrapper.displayName = 'ScreenWrapper';

const screenWrapperStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
  },
  footer: {
    borderTopWidth: 1,
  },
});

/**
 * SectionHeader component props
 */
export interface SectionHeaderProps {
  /** Section title */
  title: string;
  
  /** Optional subtitle text */
  subtitle?: string;
  
  /** Optional action button or element */
  action?: React.ReactNode;
  
  /** Custom style overrides */
  style?: StyleProp<ViewStyle>;
}

/**
 * SectionHeader Component
 * 
 * Provides consistent section title styling with optional subtitle and action button.
 * Used to separate and label content sections within screens.
 * 
 * @example
 * ```tsx
 * // Basic section header
 * <SectionHeader title="Recent Transactions" />
 * 
 * // Section header with subtitle
 * <SectionHeader
 *   title="Recent Transactions"
 *   subtitle="Last 30 days"
 * />
 * 
 * // Section header with action
 * <SectionHeader
 *   title="Recent Transactions"
 *   subtitle="Last 30 days"
 *   action={<Button variant="text">View All</Button>}
 * />
 * ```
 */
export const SectionHeader = memo<SectionHeaderProps>(({
  title,
  subtitle,
  action,
  style,
}) => {
  const { theme } = useTheme();
  
  return (
    <View
      style={[
        sectionHeaderStyles.container,
        {
          marginBottom: theme.spacing.md,
        },
        style,
      ]}
    >
      <View style={sectionHeaderStyles.textContainer}>
        <Heading variant="h3" weight="semibold">
          {title}
        </Heading>
        {subtitle && (
          <Text
            variant="caption"
            color="secondary"
            style={{
              marginTop: theme.spacing.xs,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      
      {action && (
        <View style={sectionHeaderStyles.actionContainer}>
          {action}
        </View>
      )}
    </View>
  );
});

SectionHeader.displayName = 'SectionHeader';

const sectionHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  actionContainer: {
    marginLeft: 12,
  },
});
