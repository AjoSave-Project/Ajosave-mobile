import { View, Text, Pressable, StyleSheet, Modal, Animated, Alert, Image } from 'react-native';
import { useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsSidebarProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsSidebar({ visible, onClose }: SettingsSidebarProps) {
  const { user, logout } = useAuth();
  const slideAnim = useRef(new Animated.Value(-320)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -320,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive', onPress: async () => {
          onClose();
          await logout();
        }
      },
    ]);
  };

  const navItem = (icon: any, label: string, onPress: () => void, danger = false) => (
    <Pressable style={styles.navItem} onPress={() => { onClose(); onPress(); }}>
      <View style={[styles.navIcon, danger && styles.navIconDanger]}>
        <Ionicons name={icon} size={20} color={danger ? '#ef4444' : Colors.primary.main} />
      </View>
      <Text style={[styles.navLabel, danger && styles.navLabelDanger]}>{label}</Text>
      {!danger && <Ionicons name="chevron-forward" size={16} color={Colors.neutral[400]} />}
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}>
        {/* Profile */}
        <View style={styles.profile}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.profileEmail} numberOfLines={1}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Navigation */}
        <View style={styles.nav}>
          {navItem('person-outline', 'My Profile', () => {})}
          {navItem('wallet-outline', 'Wallet', () => router.push('/(tabs)/wallet'))}
          {navItem('people-outline', 'My Groups', () => router.push('/(tabs)/groups'))}
          {navItem('business-outline', 'Bank Accounts', () => router.push('/add-bank-account'))}
          {navItem('notifications-outline', 'Notifications', () => {})}
          {navItem('settings-outline', 'Settings', () => {})}
          {navItem('help-circle-outline', 'Help & Support', () => {})}
        </View>

        <View style={styles.divider} />

        {navItem('log-out-outline', 'Log Out', handleLogout, true)}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: Spacing.xl,
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
  },
  profileEmail: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[500],
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
  },
  nav: { paddingVertical: Spacing.sm },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconDanger: { backgroundColor: '#fef2f2' },
  navLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text.primary.light,
  },
  navLabelDanger: { color: '#ef4444' },
});
