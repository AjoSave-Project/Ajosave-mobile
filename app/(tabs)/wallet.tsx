import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator, TextInput, Modal, Alert } from 'react-native';
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
import { useAuth } from '@/contexts/AuthContext';
import { PaystackProvider, usePaystack } from 'react-native-paystack-webview';

const PAYSTACK_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

function WalletContent() {
  const { wallet, transactions, isLoading, error, fetchWallet, fetchTransactions, refreshWallet } = useWallet();
  const { user } = useAuth();
  const { popup } = usePaystack();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'contribution' | 'payout' | 'withdrawal'>('all');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundAmount, setFundAmount] = useState('');
  const [isFunding, setIsFunding] = useState(false);

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
      setBankError(err?.message || 'Failed to load bank accounts');
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

  const handleFundWallet = () => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount < 100) {
      Alert.alert('Invalid Amount', 'Minimum funding amount is ₦100');
      return;
    }
    if (!user?.email) {
      Alert.alert('Error', 'User email not found');
      return;
    }
    setShowFundModal(false);
    setIsFunding(true);
    const ref = `FUND-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    popup.checkout({
      email: user.email,
      amount: amount * 100,
      reference: ref,
      onSuccess: async (response: any) => {
        try {
          const reference = response?.transactionRef?.reference || response?.reference || ref;
          await WalletService.verifyFunding(reference);
          await refreshWallet();
          await fetchTransactions();
          setFundAmount('');
          Alert.alert('Success', 'Wallet funded successfully!');
        } catch (err: any) {
          Alert.alert('Error', err.message || 'Failed to verify payment');
        } finally {
          setIsFunding(false);
        }
      },
      onCancel: () => {
        setIsFunding(false);
        setFundAmount('');
      },
    });
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
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(wallet?.availableBalance ?? 0)}</Text>
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
          <Pressable
            style={[styles.fundButton, isFunding ? styles.fundButtonDisabled : undefined]}
            onPress={() => setShowFundModal(true)}
            disabled={isFunding}
          >
            {isFunding ? (
              <ActivityIndicator color={Colors.primary.main} size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={18} color={Colors.primary.main} />
                <Text style={styles.fundButtonText}>Fund Wallet</Text>
              </>
            )}
          </Pressable>
        </View>

        <Modal visible={showFundModal} transparent animationType="slide" onRequestClose={() => setShowFundModal(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowFundModal(false)}>
            <Pressable style={styles.modalSheet} onPress={() => {}}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Fund Wallet</Text>
              <Text style={styles.modalSubtitle}>Enter the amount you want to add to your wallet</Text>
              <View style={styles.amountInputWrapper}>
                <Text style={styles.currencySymbol}>₦</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={Colors.neutral[400]}
                  value={fundAmount}
                  onChangeText={setFundAmount}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
              <View style={styles.quickAmounts}>
                {[1000, 2000, 5000, 10000].map(amt => (
                  <Pressable key={amt} style={styles.quickAmountChip} onPress={() => setFundAmount(String(amt))}>
                    <Text style={styles.quickAmountText}>₦{amt.toLocaleString()}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable
                style={[styles.proceedButton, (!fundAmount || parseFloat(fundAmount) < 100) ? styles.buttonDisabled : undefined]}
                onPress={handleFundWallet}
                disabled={!fundAmount || parseFloat(fundAmount) < 100}
              >
                <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => { fetchWallet(); fetchTransactions(); }} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

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
                    {account.isPrimary ? (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    ) : null}
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

        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filters}>
              {(['all', 'contribution', 'payout', 'withdrawal'] as const).map((filter) => (
                <Pressable
                  key={filter}
                  style={[styles.filter, activeFilter === filter ? styles.filterActive : undefined]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterText, activeFilter === filter ? styles.filterTextActive : undefined]}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>

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
                      {transaction.type === 'fund_wallet' ? 'Fund Wallet' : transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                    </Text>
                    {transaction.description ? (
                      <Text style={styles.transactionDesc} numberOfLines={1}>{transaction.description}</Text>
                    ) : null}
                    <Text style={styles.transactionDate}>{formatDate(transaction.createdAt)}</Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[styles.transactionAmount, { color: getTransactionColor(transaction.type) }]}>
                      {transaction.type === 'payout' || transaction.type === 'fund_wallet' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      transaction.status === 'completed' ? styles.statusCompleted : undefined,
                      transaction.status === 'pending' ? styles.statusPending : undefined,
                      transaction.status === 'failed' ? styles.statusFailed : undefined,
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
  fundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.sm,
    borderRadius: 10,
  },
  fundButtonDisabled: { opacity: 0.6 },
  fundButtonText: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },
  buttonDisabled: { opacity: 0.5 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: 20, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, marginBottom: Spacing.xs },
  modalSubtitle: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginBottom: Spacing.lg },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral[100],
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  currencySymbol: { fontSize: 22, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, marginRight: Spacing.xs },
  amountInput: {
    flex: 1,
    fontSize: 28,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    paddingVertical: Spacing.md,
  },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  quickAmountChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    backgroundColor: Colors.primary.main + '15',
    borderWidth: 1,
    borderColor: Colors.primary.main + '40',
  },
  quickAmountText: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },
  proceedButton: { backgroundColor: Colors.primary.main, paddingVertical: Spacing.md, borderRadius: 12, alignItems: 'center' },
  proceedButtonText: { fontSize: 16, fontFamily: Typography.fontFamily.semibold, color: '#FFFFFF' },
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
  bankAccountCard: { width: 180, backgroundColor: Colors.primary.main, padding: Spacing.md, borderRadius: 12, position: 'relative' },
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
  transactionIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
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

export default function WalletScreen() {
  return (
    <PaystackProvider publicKey={PAYSTACK_KEY}>
      <WalletContent />
    </PaystackProvider>
  );
}
