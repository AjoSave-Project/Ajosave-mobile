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

import { useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import 'react-native-reanimated';

import { ThemeProvider, AuthProvider, WalletProvider, GroupsProvider } from '@/contexts';
import { ErrorBoundary } from '@/components';
import SplashScreenComponent from '@/components/SplashScreen';
import { ApiService } from '@/services/apiService';

// Set base URL immediately (synchronous) so it's ready before any provider mounts
const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
const fallbackUrl = 'https://ajosave-backend.vercel.app/api';
ApiService.setBaseUrl(apiUrl);
ApiService.setFallbackUrl(fallbackUrl);

if (__DEV__) {
  console.log(`🌐 API URL: ${apiUrl} [${process.env.EXPO_PUBLIC_ENV || 'development'}]`);
  console.log(`🌐 Fallback URL: ${fallbackUrl}`);
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'Gilroy-Regular': require('@/assets/fonts/Gilroy-Regular.ttf'),
    'Gilroy-Medium': require('@/assets/fonts/Gilroy-Medium.ttf'),
    'Gilroy-SemiBold': require('@/assets/fonts/Gilroy-SemiBold.ttf'),
    'Gilroy-Bold': require('@/assets/fonts/Gilroy-Bold.ttf'),
  });

  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded) {
      // Keep splash screen visible for 3 seconds
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [fontsLoaded]);

  if (!fontsLoaded || showSplash) {
    return <SplashScreenComponent />;
  }
  
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <WalletProvider>
            <GroupsProvider>
              <StatusBar style="auto" />
              <Slot />
            </GroupsProvider>
          </WalletProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
