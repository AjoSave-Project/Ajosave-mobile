/**
 * Error Boundary Component
 * 
 * Catches React errors in the component tree and displays a fallback UI.
 * Logs errors using the error logging utility for debugging.
 * Provides a recovery mechanism to reset the error state.
 */

import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { logError } from '../utils/errors';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary Component
 * 
 * Wraps the app to catch and handle runtime errors gracefully.
 * Displays a user-friendly error screen with a restart option.
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * Update state when an error is caught
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Log error when caught
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to local storage
    logError({
      message: error.message,
      code: 'REACT_ERROR',
      type: 'runtime',
      stack: error.stack,
      details: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Log to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  /**
   * Reset error state to allow recovery
   */
  handleRestart = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  /**
   * Navigate to home/dashboard screen
   */
  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    
    // Navigate to dashboard (home tab)
    try {
      router.replace('/(tabs)');
    } catch (navError) {
      // If navigation fails, just reset the error state
      if (__DEV__) {
        console.error('Failed to navigate to home:', navError);
      }
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>😔</Text>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We encountered an unexpected error. Don't worry, your data is safe.
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View>
            )}
            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonPrimary,
                  pressed && styles.buttonPressed,
                ]}
                onPress={this.handleRestart}
              >
                <Text style={styles.buttonText}>Try Again</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.buttonSecondary,
                  pressed && styles.buttonSecondaryPressed,
                ]}
                onPress={this.handleGoHome}
              >
                <Text style={styles.buttonSecondaryText}>Go to Home</Text>
              </Pressable>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold as any,
    color: Colors.text.primary.light,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  message: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary.light,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: Typography.lineHeight.relaxed,
  },
  errorDetails: {
    backgroundColor: Colors.error[50],
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.lg,
    width: '100%',
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error[700],
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: Spacing.md,
    width: '100%',
    alignItems: 'stretch',
  },
  button: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: Colors.primary[600],
  },
  buttonPressed: {
    backgroundColor: Colors.primary[700],
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary[600],
  },
  buttonSecondaryPressed: {
    backgroundColor: Colors.primary[50],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold as any,
  },
  buttonSecondaryText: {
    color: Colors.primary[600],
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold as any,
  },
});
