import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useAuth, useWallet, useGroups } from '@/contexts';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock transaction data
const mockTransactions = [
  { id: '1', name: 'John Doe', type: 'Group Contribution', amount: 5000, isCredit: false, time: '10:30 AM', avatar: 'JD' },
  { id: '2', name: 'Sarah Smith', type: 'Payout Received', amount: 15000, isCredit: true, time: '09:15 AM', avatar: 'SS' },
  { id: '3', name: 'Mike Johnson', type: 'Group Contribution', amount: 3000, isCredit: false, time: '08:45 AM', avatar: 'MJ' },
];

/**
 * Home/Dashboard Screen
 * 
 * Main overview screen showing:
 * - Header with back button, welcome message, and notifications
 * - Balance card with visibility toggle
 * - Action grid (6 buttons)
 * - Transactions list
 */
export default function HomeScreen() {
  const { user } = useAuth();
  const { wallet, refreshWallet } = useWallet();
  const { refreshGroups } = useGroups();
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshWallet(), refreshGroups()]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const userName = user?.email?.split('@')[0] || 'User';
  const displayName = userName.length > 15 ? userName.substring(0, 15) + '...' : userName;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary.light} />
          </Pressable>
          <Text style={styles.welcomeText}>Welcome, {displayName}</Text>
          <Pressable style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text.primary.light} />
          </Pressable>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Pressable 
            style={styles.eyeButton}
            onPress={() => setBalanceVisible(!balanceVisible)}
          >
            <Ionicons 
              name={balanceVisible ? "eye-outline" : "eye-off-outline"} 
              size={24} 
              color="#FFFFFF" 
            />
          </Pressable>
          <Text style={styles.balanceLabel}>Account Balance</Text>
          <Text style={styles.balanceAmount}>
            {balanceVisible 
              ? `₦${wallet?.balance?.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`
              : '****'
            }
          </Text>
          <Text style={styles.nextPayout}>Next Payout: 25th December 2025</Text>
        </View>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/groups')}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="people-outline" size={24} color={Colors.primary.main} />
            </View>
            <Text style={styles.actionButtonText}>Create Group</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/groups')}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="add-circle-outline" size={24} color={Colors.primary.main} />
            </View>
            <Text style={styles.actionButtonText}>Join Group</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/pay')}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="card-outline" size={24} color={Colors.primary.main} />
            </View>
            <Text style={styles.actionButtonText}>Make Payment</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/wallet')}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="list-outline" size={24} color={Colors.primary.main} />
            </View>
            <Text style={styles.actionButtonText}>View Transaction</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/groups')}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="add-circle-outline" size={24} color={Colors.primary.main} />
            </View>
            <Text style={styles.actionButtonText}>Join Group</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton} onPress={() => router.push('/(tabs)/groups')}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="add-circle-outline" size={24} color={Colors.primary.main} />
            </View>
            <Text style={styles.actionButtonText}>Join Group</Text>
          </Pressable>
        </View>

        {/* Transactions Section */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.transactionsTitle}>Transactions</Text>
            <Pressable onPress={() => router.push('/(tabs)/wallet')}>
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          </View>
          
          <Text style={styles.todayLabel}>Today</Text>
          
          <View style={styles.transactionsList}>
            {mockTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionAvatar}>
                  <Text style={styles.transactionAvatarText}>{transaction.avatar}</Text>
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionName}>{transaction.name}</Text>
                  <Text style={styles.transactionType}>{transaction.type}</Text>
                </View>
                <View style={styles.transactionAmountContainer}>
                  <Text style={[
                    styles.transactionAmount,
                    transaction.isCredit ? styles.creditAmount : styles.debitAmount
                  ]}>
                    {transaction.isCredit ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                  </Text>
                  <Text style={styles.transactionTime}>{transaction.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.light,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    backgroundColor: Colors.primary.main,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 20,
    marginBottom: Spacing.lg,
    position: 'relative',
    alignItems: "center",
    justifyContent: "center",
  },
  eyeButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  nextPayout: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.medium,
    textDecorationLine: "underline",
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  actionButton: {
    width: '31.5%',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.light + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
    textAlign: 'center',
  },
  transactionsSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary.main,
  },
  todayLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.neutral[600],
    marginBottom: Spacing.sm,
  },
  transactionsList: {
    gap: Spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  transactionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary.main,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 2,
  },
  creditAmount: {
    color: Colors.success.main,
  },
  debitAmount: {
    color: Colors.error.main,
  },
  transactionTime: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[500],
  },
});
