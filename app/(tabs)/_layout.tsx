import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { TabHeader } from '@/components/TabHeader';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { Typography } from '@/constants/typography';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Tab Layout
 * 
 * Configures the bottom tab navigation with 4 main sections:
 * - Home (Dashboard): Main overview with balance and quick actions
 * - Groups: List of user's savings groups
 * - Pay: Make contributions to groups
 * - Wallet: View balance and transaction history
 * 
 * Features:
 * - Active tab with blue pill background
 * - White icons and text for active tab
 * - Gray icons and text for inactive tabs
 * - Haptic feedback on tab press
 */

// Custom tab bar icon component with pill background for both active and inactive states
function TabBarIcon({ name, focused }: { name: any; focused: boolean }) {
  return (
    <View style={focused ? styles.activeTabContainer : styles.inactiveTabContainer}>
      <Ionicons 
        name={name} 
        size={24} 
        color={focused ? '#FFFFFF' : Colors.neutral[400]} 
      />
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/welcome');
    }
  }, [isAuthenticated, isLoading]);

  // Don't render tabs until auth state is known
  if (isLoading || !isAuthenticated) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: Colors.neutral[400],
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarStyle: {
          ...styles.tabBar,
          paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.sm,
          height: 60 + (insets.bottom > 0 ? insets.bottom : Spacing.lg),
        },
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          header: () => <TabHeader title="Home" showGreeting />,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? "home" : "home-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          header: () => <TabHeader title="Groups" />,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? "people" : "people-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="pay"
        options={{
          title: 'Pay',
          header: () => <TabHeader title="Pay" />,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? "card" : "card-outline"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          header: () => <TabHeader title="Wallet" />,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? "wallet" : "wallet-outline"} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    paddingTop: 8,
    height: 65,
  },
  tabBarLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.medium,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  activeTabContainer: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 56,
    minHeight: 40,
  },
  inactiveTabContainer: {
    backgroundColor: 'rgba(72, 137, 227, 0.15)', // Colors.primary.light with 15% opacity
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 56,
    minHeight: 40,
  },
});
