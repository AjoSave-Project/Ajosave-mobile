/**
 * Root Layout
 * 
 * The root layout component that wraps the entire application with necessary providers.
 * Sets up the navigation structure and provides global context to all screens.
 * 
 * Provider hierarchy (outer to inner):
 * - ThemeProvider: Provides theme configuration and mode management
 * - ErrorBoundary: Catches and handles runtime errors
 * - AuthProvider: Manages authentication state and user session
 * - WalletProvider: Manages wallet balance and transactions
 * - GroupsProvider: Manages savings groups data
 * - Slot: Expo Router navigation slot (renders active route)
 */

import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { ThemeProvider, AuthProvider, WalletProvider, GroupsProvider } from '@/contexts';
import { ErrorBoundary } from '@/components';
import { ApiService } from '@/services/apiService';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Set base URL immediately (synchronous) so it's ready before any provider mounts
const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
ApiService.setBaseUrl(apiUrl);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Gilroy-Regular': require('@/assets/fonts/Gilroy-Regular.ttf'),
    'Gilroy-Medium': require('@/assets/fonts/Gilroy-Medium.ttf'),
    'Gilroy-SemiBold': require('@/assets/fonts/Gilroy-SemiBold.ttf'),
    'Gilroy-Bold': require('@/assets/fonts/Gilroy-Bold.ttf'),
  });

  // Hide splash screen when fonts are loaded
  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <WalletProvider>
            <GroupsProvider>
              <Slot />
              <StatusBar style="auto" />
            </GroupsProvider>
          </WalletProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
