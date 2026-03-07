import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/AuthContext';
import { SettingsSidebar } from './SettingsSidebar';

interface TabHeaderProps {
  title: string;
  showGreeting?: boolean;
}

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export function TabHeader({ title, showGreeting }: TabHeaderProps) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View>
          {showGreeting ? (
            <>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.name}>{user?.firstName ?? 'User'} 👋</Text>
            </>
          ) : (
            <Text style={styles.title}>{title}</Text>
          )}
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text.primary.light} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => setSidebarOpen(true)}>
            <Ionicons name="menu-outline" size={26} color={Colors.text.primary.light} />
          </Pressable>
        </View>
      </View>
      <SettingsSidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  greeting: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[500],
  },
  name: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
  },
  title: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
