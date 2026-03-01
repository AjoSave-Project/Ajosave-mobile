import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useWallet } from '@/contexts';
import { Ionicons } from '@expo/vector-icons';

/**
 * Wallet Screen
 * 
 * Displays wallet balance and transaction history with:
 * - Balance overview
 * - Quick actions (Add money, Withdraw)
 * - Transaction filters
 * - Transaction list
 */
export default function WalletScreen() {
  const { wallet, transactions, totalContributed, totalReceived, refreshWallet } = useWallet();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'contribution' | 'payout' | 'withdrawal'>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshWallet();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter transactions
  const filteredTransactions = Array.isArray(transactions) ? transactions.filter(transaction => {
    if (activeFilter === 'all') return true;
    return transaction.type === activeFilter;
  }) : [];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'contribution': return '💰';
      case 'payout': return '💵';
      case 'withdrawal': return '🏦';
      case 'deposit': return '➕';
      default: return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'contribution': return Colors.warning.main;
      case 'payout': return Colors.success.main;
      case 'withdrawal': return Colors.error.main;
      case 'deposit': return Colors.success.main;
      default: return Colors.neutral[600];
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            ₦{wallet?.balance?.toLocaleString() || '0.00'}
          </Text>
          
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Contributed</Text>
              <Text style={styles.balanceStatValue}>₦{totalContributed?.toLocaleString() || '0'}</Text>
            </View>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Received</Text>
              <Text style={styles.balanceStatValue}>₦{totalReceived?.toLocaleString() || '0'}</Text>
            </View>
          </View>

          <View style={styles.balanceActions}>
            <Pressable style={styles.actionButton}>
              <Ionicons name='add' style={styles.actionButtonIcon}></Ionicons>
              <Text style={styles.actionButtonText}>Add Money</Text>
            </Pressable>
            <Pressable style={styles.actionButton}>
              <Ionicons name='cash-outline' style={styles.actionButtonIcon}></Ionicons>
              <Text style={styles.actionButtonText}>Withdraw</Text>
            </Pressable>
          </View>
        </View>

        {/* Transaction Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filters}>
              <Pressable 
                style={[styles.filter, activeFilter === 'all' && styles.filterActive]}
                onPress={() => setActiveFilter('all')}
              >
                <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
                  All
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.filter, activeFilter === 'contribution' && styles.filterActive]}
                onPress={() => setActiveFilter('contribution')}
              >
                <Text style={[styles.filterText, activeFilter === 'contribution' && styles.filterTextActive]}>
                  Contributions
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.filter, activeFilter === 'payout' && styles.filterActive]}
                onPress={() => setActiveFilter('payout')}
              >
                <Text style={[styles.filterText, activeFilter === 'payout' && styles.filterTextActive]}>
                  Payouts
                </Text>
              </Pressable>
              <Pressable 
                style={[styles.filter, activeFilter === 'withdrawal' && styles.filterActive]}
                onPress={() => setActiveFilter('withdrawal')}
              >
                <Text style={[styles.filterText, activeFilter === 'withdrawal' && styles.filterTextActive]}>
                  Withdrawals
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsSection}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          
          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name='clipboard-outline' style={styles.emptyStateIcon}></Ionicons>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {filteredTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={[
                    styles.transactionIcon,
                    { backgroundColor: getTransactionColor(transaction.type) + '20' }
                  ]}>
                    <Text style={styles.transactionIconText}>
                      {getTransactionIcon(transaction.type)}
                    </Text>
                  </View>
                  
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.transactionRight}>
                    <Text style={[
                      styles.transactionAmount,
                      { color: getTransactionColor(transaction.type) }
                    ]}>
                      {transaction.type === 'contribution' || transaction.type === 'withdrawal' ? '-' : '+'}
                      ₦{transaction.amount.toLocaleString()}
                    </Text>
                    <View style={[
                      styles.transactionStatus,
                      transaction.status === 'completed' && styles.transactionStatusCompleted,
                      transaction.status === 'pending' && styles.transactionStatusPending,
                      transaction.status === 'failed' && styles.transactionStatusFailed,
                    ]}>
                      <Text style={styles.transactionStatusText}>
                        {transaction.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  balanceCard: {
    backgroundColor: Colors.primary.main,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
  },
  balanceLabel: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.xs,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.lg,
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  balanceStat: {
    flex: 1,
  },
  balanceStatLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  balanceStatValue: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: '#FFFFFF',
  },
  balanceStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: Spacing.md,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    gap: Spacing.xs,
  },
  actionButtonIcon: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
  },
  actionButtonText: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
  },
  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filters: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filter: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filterActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.neutral[600],
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  transactionsSection: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    marginBottom: Spacing.md,
  },
  transactionsList: {
    gap: Spacing.sm,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionIconText: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.regular,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 4,
  },
  transactionStatus: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  transactionStatusCompleted: {
    backgroundColor: Colors.success.light + '20',
  },
  transactionStatusPending: {
    backgroundColor: Colors.warning.light + '20',
  },
  transactionStatusFailed: {
    backgroundColor: Colors.error.light + '20',
  },
  transactionStatusText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateIcon: {
    fontSize: 64,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.md,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
});
