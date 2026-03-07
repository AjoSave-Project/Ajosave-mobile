import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useWallet } from '@/contexts/WalletContext';
import { WalletService, BankAccount } from '@/services/walletService';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatDate, formatAccountNumber } from '@/utils/formatting';

/**
 * Wallet Screen
 * 
 * Displays wallet balance, transaction history, and bank accounts
 */
export default function WalletScreen() {
  const { wallet, transactions, isLoading, error, fetchWallet, fetchTransactions, refreshWallet } = useWallet();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'contribution' | 'payout' | 'withdrawal'>('all');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setLoadingBankAccounts(true);
      setBankError(null);
      const response = await WalletService.getBankAccounts();
      setBankAccounts(response.bankAccounts);
    } catch (err: any) {
      const msg = err?.message || 'Failed to load bank accounts';
      console.error('Failed to load bank accounts:', msg);
      setBankError(msg);
    } finally {
      setLoadingBankAccounts(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshWallet(), loadBankAccounts()]);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredTransactions = Array.isArray(transactions)
    ? [...transactions]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .filter(t => activeFilter === 'all' || t.type === activeFilter)
    : [];

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'contribution': return '#f59e0b';
      case 'payout': return '#22c55e';
      case 'withdrawal': return '#ef4444';
      default: return Colors.neutral[600];
    }
  };

  const getTransactionIcon = (type: string): any => {
    switch (type) {
      case 'contribution': return 'arrow-up-circle-outline';
      case 'payout': return 'arrow-down-circle-outline';
      case 'withdrawal': return 'cash-outline';
      default: return 'swap-horizontal-outline';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(wallet?.availableBalance ?? 0)}
          </Text>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Available</Text>
              <Text style={styles.balanceStatValue}>{formatCurrency(wallet?.availableBalance ?? 0)}</Text>
            </View>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Locked</Text>
              <Text style={styles.balanceStatValue}>{formatCurrency(wallet?.lockedBalance ?? 0)}</Text>
            </View>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Contributed</Text>
              <Text style={styles.balanceStatValue}>{formatCurrency(wallet?.totalContributions ?? 0)}</Text>
            </View>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatLabel}>Received</Text>
              <Text style={styles.balanceStatValue}>{formatCurrency(wallet?.totalPayouts ?? 0)}</Text>
            </View>
          </View>
        </View>

        {/* Error Banner */}
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => { fetchWallet(); fetchTransactions(); }} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Bank Accounts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bank Accounts</Text>
            <Pressable onPress={() => router.push('/add-bank-account')}>
              <Text style={styles.addText}>+ Add</Text>
            </Pressable>
          </View>

          {loadingBankAccounts ? (
            <ActivityIndicator color={Colors.primary.main} style={styles.loader} />
          ) : bankError ? (
            <View style={styles.bankErrorRow}>
              <Text style={styles.bankErrorText}>{bankError}</Text>
              <Pressable onPress={loadBankAccounts} style={styles.retryButton}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          ) : bankAccounts.length === 0 ? (
            <Pressable style={styles.addBankCard} onPress={() => router.push('/add-bank-account')}>
              <Ionicons name="add-circle-outline" size={24} color={Colors.primary.main} />
              <Text style={styles.addBankText}>Add a bank account</Text>
            </Pressable>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.bankAccountsList}>
                {bankAccounts.map((account) => (
                  <View key={account._id} style={styles.bankAccountCard}>
                    {account.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                    <Text style={styles.bankName}>{account.bankName}</Text>
                    <Text style={styles.accountNumber}>{formatAccountNumber(account.accountNumber)}</Text>
                    <Text style={styles.accountName}>{account.accountName}</Text>
                  </View>
                ))}
                <Pressable style={styles.addBankCardSmall} onPress={() => router.push('/add-bank-account')}>
                  <Ionicons name="add" size={28} color={Colors.primary.main} />
                  <Text style={styles.addBankSmallText}>Add</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Transaction Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filters}>
              {(['all', 'contribution', 'payout', 'withdrawal'] as const).map((filter) => (
                <Pressable
                  key={filter}
                  style={[styles.filter, activeFilter === filter && styles.filterActive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Transactions List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transactions</Text>

          {isLoading && filteredTransactions.length === 0 ? (
            <ActivityIndicator color={Colors.primary.main} style={styles.loader} />
          ) : filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color={Colors.neutral[400]} />
              <Text style={styles.emptyStateText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {filteredTransactions.map((transaction) => (
                <View key={transaction._id} style={styles.transactionCard}>
                  <View style={[styles.transactionIcon, { backgroundColor: getTransactionColor(transaction.type) + '20' }]}>
                    <Ionicons name={getTransactionIcon(transaction.type)} size={22} color={getTransactionColor(transaction.type)} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>
                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Text>
                    {transaction.description && (
                      <Text style={styles.transactionDesc} numberOfLines={1}>{transaction.description}</Text>
                    )}
                    <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[styles.transactionAmount, { color: getTransactionColor(transaction.type) }]}>
                      {transaction.type === 'payout' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      transaction.status === 'completed' && styles.statusCompleted,
                      transaction.status === 'pending' && styles.statusPending,
                      transaction.status === 'failed' && styles.statusFailed,
                    ]}>
                      <Text style={styles.statusText}>{transaction.status}</Text>
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
  safeArea: { flex: 1, backgroundColor: Colors.background.light, paddingTop: 10 },
  scrollView: { flex: 1 },
  balanceCard: {
    backgroundColor: Colors.primary.main,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 16,
  },
  balanceLabel: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.8)', marginBottom: Spacing.xs },
  balanceAmount: { fontSize: 32, fontFamily: Typography.fontFamily.bold, color: '#FFFFFF', marginBottom: Spacing.md },
  balanceStats: { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.sm },
  balanceStat: { width: '50%', paddingVertical: 4 },
  balanceStatLabel: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  balanceStatValue: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: '#FFFFFF' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef2f2',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: { flex: 1, fontSize: 13, color: '#ef4444', fontFamily: Typography.fontFamily.regular },
  retryButton: { marginLeft: Spacing.sm },
  retryText: { fontSize: 13, color: Colors.primary.main, fontFamily: Typography.fontFamily.semibold },
  bankErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fef2f2',
    padding: Spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  bankErrorText: { flex: 1, fontSize: 13, color: '#ef4444', fontFamily: Typography.fontFamily.regular },
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 18, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light },
  addText: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },
  loader: { paddingVertical: Spacing.lg },
  addBankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    borderStyle: 'dashed',
  },
  addBankText: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },
  bankAccountsList: { flexDirection: 'row', gap: Spacing.md },
  bankAccountCard: {
    width: 180,
    backgroundColor: Colors.primary.main,
    padding: Spacing.md,
    borderRadius: 12,
    position: 'relative',
  },
  primaryBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  primaryBadgeText: { fontSize: 10, fontFamily: Typography.fontFamily.semibold, color: '#FFFFFF' },
  bankName: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  accountNumber: { fontSize: 16, fontFamily: Typography.fontFamily.bold, color: '#FFFFFF', marginBottom: 4 },
  accountName: { fontSize: 12, fontFamily: Typography.fontFamily.medium, color: 'rgba(255,255,255,0.9)' },
  addBankCardSmall: {
    width: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  addBankSmallText: { fontSize: 12, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },
  filtersContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  filters: { flexDirection: 'row', gap: Spacing.sm },
  filter: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  filterActive: { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main },
  filterText: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: Colors.neutral[600] },
  filterTextActive: { color: '#FFFFFF' },
  transactionsList: { gap: Spacing.sm },
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
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  transactionInfo: { flex: 1 },
  transactionTitle: { fontSize: 15, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light, marginBottom: 2 },
  transactionDesc: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginBottom: 2 },
  transactionDate: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500] },
  transactionRight: { alignItems: 'flex-end' },
  transactionAmount: { fontSize: 15, fontFamily: Typography.fontFamily.bold, marginBottom: 4 },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: 8 },
  statusCompleted: { backgroundColor: '#dcfce7' },
  statusPending: { backgroundColor: '#fef9c3' },
  statusFailed: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 10, fontFamily: Typography.fontFamily.semibold, textTransform: 'capitalize', color: Colors.neutral[700] },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl * 2 },
  emptyStateText: { fontSize: 16, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginTop: Spacing.md },
});
