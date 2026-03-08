import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator, TextInput, Modal, Alert, Share } from 'react-native';
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
import { ApiService } from '@/services/apiService';

const PAYSTACK_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

function WalletContent() {
  const { wallet, transactions, locks, isLoading, error, fetchWallet, fetchTransactions, refreshWallet, fetchLocks } = useWallet();
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
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockForm, setLockForm] = useState({ amount: '', label: '', releaseType: 'manual' as 'manual' | 'date', releaseDate: '' });
  const [lockError, setLockError] = useState<string | null>(null);
  const [locking, setLocking] = useState(false);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ bankAccountId: '', amount: '' });
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showAutoWithdrawalModal, setShowAutoWithdrawalModal] = useState(false);
  const [autoSettings, setAutoSettings] = useState({ enabled: false, bankAccount: '', percentage: 100, minAmount: 1000 });
  const [savingAuto, setSavingAuto] = useState(false);
  const [autoError, setAutoError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    loadBankAccounts();
    fetchLocks();
  }, []);

  useEffect(() => {
    if (wallet?.autoWithdrawal) {
      setAutoSettings({
        enabled: wallet.autoWithdrawal.enabled,
        bankAccount: wallet.autoWithdrawal.bankAccount || '',
        percentage: wallet.autoWithdrawal.percentage,
        minAmount: wallet.autoWithdrawal.minAmount,
      });
    }
  }, [wallet]);

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
    try { await Promise.all([refreshWallet(), loadBankAccounts()]); }
    catch (err) { console.error('Refresh error:', err); }
    finally { setRefreshing(false); }
  };

  const handleCreateLock = async () => {
    setLockError(null);
    const amount = parseFloat(lockForm.amount);
    if (!amount || amount <= 0) { setLockError('Enter a valid amount'); return; }
    if (lockForm.releaseType === 'date' && !lockForm.releaseDate) { setLockError('Select a release date'); return; }
    try {
      setLocking(true);
      await WalletService.createLock(amount, lockForm.label || undefined, lockForm.releaseType, lockForm.releaseDate || undefined);
      setShowLockModal(false);
      setLockForm({ amount: '', label: '', releaseType: 'manual', releaseDate: '' });
      await Promise.all([refreshWallet(), fetchLocks()]);
    } catch (err: any) {
      setLockError(err?.message || 'Failed to lock funds');
    } finally {
      setLocking(false);
    }
  };

  const handleUnlock = async (lockId: string) => {
    try {
      setUnlockingId(lockId);
      await WalletService.unlock(lockId);
      await Promise.all([refreshWallet(), fetchLocks()]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to unlock');
    } finally {
      setUnlockingId(null);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawError(null);
    const amount = parseFloat(withdrawForm.amount);
    if (!withdrawForm.bankAccountId) { setWithdrawError('Select a bank account'); return; }
    if (!amount || amount <= 0) { setWithdrawError('Enter a valid amount'); return; }
    if (wallet && amount > wallet.availableBalance) {
      setWithdrawError(`Exceeds available balance (${formatCurrency(wallet.availableBalance)})`);
      return;
    }
    try {
      setWithdrawing(true);
      await WalletService.withdraw(withdrawForm.bankAccountId, amount);
      setShowWithdrawModal(false);
      setWithdrawForm({ bankAccountId: '', amount: '' });
      await refreshWallet();
      await fetchTransactions();
      Alert.alert('Success', 'Withdrawal initiated successfully');
    } catch (err: any) {
      setWithdrawError(err?.message || 'Withdrawal failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await ApiService.get<{ transactions: any[] }>('/transactions');
      if (response.success && response.data) {
        const txs: any[] = (response.data as any).transactions || [];
        if (txs.length === 0) { Alert.alert('No Data', 'No transactions to export'); return; }
        const headers = 'Date,Type,Amount,Status,Description';
        const rows = txs.map(t =>
          `${new Date(t.createdAt).toLocaleDateString()},${t.type},${t.amount},${t.status},"${t.description || ''}"`
        );
        const csv = [headers, ...rows].join('\n');
        await Share.share({ message: csv, title: 'Transactions Export' });
      }
    } catch (err: any) {
      Alert.alert('Export Failed', err?.message || 'Could not export transactions');
    } finally {
      setExporting(false);
    }
  };

  const handleSaveAutoWithdrawal = async () => {
    setAutoError(null);
    try {
      setSavingAuto(true);
      await WalletService.saveAutoWithdrawal(autoSettings);
      setShowAutoWithdrawalModal(false);
      Alert.alert('Saved', 'Auto-withdrawal settings saved');
    } catch (err: any) {
      setAutoError(err?.message || 'Failed to save settings');
    } finally {
      setSavingAuto(false);
    }
  };

  const handleLongPressAccount = (account: BankAccount) => {
    if (account.isPrimary) {
      Alert.alert('Already Primary', `${account.bankName} is already your primary account.`);
      return;
    }
    Alert.alert(
      'Set as Primary',
      `Make ${account.bankName} your primary account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Primary',
          onPress: async () => {
            try {
              setSettingPrimaryId(account._id);
              await WalletService.setPrimaryBankAccount(account._id);
              await loadBankAccounts();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to update primary account');
            } finally {
              setSettingPrimaryId(null);
            }
          },
        },
      ]
    );
  };

  const handleFundWallet = () => {
    const amount = parseFloat(fundAmount);
    if (!amount || amount < 100) { Alert.alert('Invalid Amount', 'Minimum funding amount is ₦100'); return; }
    if (!user?.email) { Alert.alert('Error', 'User email not found'); return; }
    setShowFundModal(false);
    setTimeout(() => {
      setIsFunding(true);
      const ref = `FUND-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      popup.checkout({
        email: user.email,
        amount,
        reference: ref,
        onSuccess: async (response: any) => {
          try {
            const reference = response?.reference || response?.transaction || ref;
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
        onCancel: () => { setIsFunding(false); setFundAmount(''); },
        onError: (err: any) => {
          setIsFunding(false);
          setFundAmount('');
          Alert.alert('Payment Error', err?.message || 'An error occurred. Please try again.');
        },
      });
    }, 400);
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
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card ─────────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Available Balance</Text>
          <Text style={styles.heroAmount}>{formatCurrency(wallet?.availableBalance ?? 0)}</Text>

          <View style={styles.statsRow}>
            {[
              { label: 'Locked', value: wallet?.lockedBalance ?? 0 },
              { label: 'Contributed', value: wallet?.totalContributions ?? 0 },
              { label: 'Received', value: wallet?.totalPayouts ?? 0 },
            ].map((stat, i) => (
              <View key={stat.label} style={[styles.statItem, i > 0 && styles.statItemBorder]}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{formatCurrency(stat.value)}</Text>
              </View>
            ))}
          </View>

          <Pressable
            style={[styles.fundBtn, isFunding && { opacity: 0.6 }]}
            onPress={() => setShowFundModal(true)}
            disabled={isFunding}
          >
            {isFunding
              ? <ActivityIndicator color={Colors.primary.main} size="small" />
              : <><Ionicons name="add-circle-outline" size={18} color={Colors.primary.main} /><Text style={styles.fundBtnText}>Fund Wallet</Text></>
            }
          </Pressable>

          <View style={styles.actionRow}>
            <Pressable style={styles.actionBtn} onPress={() => setShowWithdrawModal(true)}>
              <Ionicons name="arrow-up-outline" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Withdraw</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleExport} disabled={exporting}>
              {exporting
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="download-outline" size={16} color="#fff" />}
              <Text style={styles.actionBtnText}>Export</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => setShowAutoWithdrawalModal(true)}>
              <Ionicons name="repeat-outline" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Auto</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={() => setShowLockModal(true)}>
              <Ionicons name="lock-closed-outline" size={16} color="#fff" />
              <Text style={styles.actionBtnText}>Lock</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Error Banner ──────────────────────────────────────────── */}
        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => { fetchWallet(); fetchTransactions(); }} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        {/* ── Active Locks ──────────────────────────────────────────── */}
        {locks && locks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Locked Funds</Text>
            <View style={styles.cardList}>
              {locks.map(lock => (
                <View key={lock._id} style={styles.lockCard}>
                  <View style={styles.lockIconWrap}>
                    <Ionicons name="lock-closed" size={20} color={Colors.primary.main} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lockLabel}>{lock.label || 'Locked Funds'}</Text>
                    <Text style={styles.lockMeta}>
                      {lock.releaseType === 'date' && lock.releaseDate
                        ? `Releases ${new Date(lock.releaseDate).toLocaleDateString()}`
                        : 'Manual release'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.lockAmount}>{formatCurrency(lock.amount)}</Text>
                    {lock.releaseType === 'manual' && (
                      <Pressable onPress={() => handleUnlock(lock._id)} disabled={unlockingId === lock._id} style={{ marginTop: 4 }}>
                        {unlockingId === lock._id
                          ? <ActivityIndicator size="small" color={Colors.primary.main} />
                          : <Text style={styles.unlockText}>Unlock</Text>}
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ── Bank Accounts ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bank Accounts</Text>
            <Pressable onPress={() => router.push('/add-bank-account')}>
              <Text style={styles.addText}>+ Add</Text>
            </Pressable>
          </View>
          {loadingBankAccounts ? (
            <ActivityIndicator color={Colors.primary.main} style={{ paddingVertical: Spacing.lg }} />
          ) : bankError ? (
            <View style={styles.inlineError}>
              <Text style={styles.inlineErrorText}>{bankError}</Text>
              <Pressable onPress={loadBankAccounts} style={styles.retryBtn}>
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
              <View style={styles.bankList}>
                {bankAccounts.map(account => (
                  <Pressable
                    key={account._id}
                    style={styles.bankCard}
                    onLongPress={() => handleLongPressAccount(account)}
                    delayLongPress={400}
                  >
                    {settingPrimaryId === account._id && (
                      <ActivityIndicator color="#fff" style={StyleSheet.absoluteFillObject} />
                    )}
                    {account.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                    <Text style={styles.bankName}>{account.bankName}</Text>
                    <Text style={styles.bankNumber}>{formatAccountNumber(account.accountNumber)}</Text>
                    <Text style={styles.bankHolder}>{account.accountName}</Text>
                  </Pressable>
                ))}
                <Pressable style={styles.addBankSmall} onPress={() => router.push('/add-bank-account')}>
                  <Ionicons name="add" size={28} color={Colors.primary.main} />
                  <Text style={styles.addBankSmallText}>Add</Text>
                </Pressable>
              </View>
            </ScrollView>
          )}
        </View>

        {/* ── Auto-Withdrawal ───────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Auto-Withdrawal</Text>
            <Pressable onPress={() => setShowAutoWithdrawalModal(true)}>
              <Text style={styles.addText}>Edit</Text>
            </Pressable>
          </View>
          <Pressable style={styles.autoCard} onPress={() => setShowAutoWithdrawalModal(true)}>
            <View style={styles.autoIconWrap}>
              <Ionicons
                name={wallet?.autoWithdrawal?.enabled ? 'repeat' : 'repeat-outline'}
                size={22}
                color={wallet?.autoWithdrawal?.enabled ? Colors.primary.main : Colors.neutral[400]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.autoStatus}>
                {wallet?.autoWithdrawal?.enabled ? 'Active' : 'Inactive'}
              </Text>
              {wallet?.autoWithdrawal?.enabled && wallet.autoWithdrawal.bankAccount ? (
                <Text style={styles.autoMeta}>
                  {wallet.autoWithdrawal.percentage}% of payouts
                  {bankAccounts.find(a => a._id === wallet.autoWithdrawal?.bankAccount)
                    ? ` → ${bankAccounts.find(a => a._id === wallet.autoWithdrawal?.bankAccount)?.bankName} ****${bankAccounts.find(a => a._id === wallet.autoWithdrawal?.bankAccount)?.accountNumber.slice(-4)}`
                    : ''}
                </Text>
              ) : (
                <Text style={styles.autoMeta}>Tap to configure</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.neutral[400]} />
          </Pressable>
        </View>

        {/* ── Transaction Filters ───────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
            <View style={styles.filters}>
              {(['all', 'contribution', 'payout', 'withdrawal'] as const).map(f => (
                <Pressable
                  key={f}
                  style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
                  onPress={() => setActiveFilter(f)}
                >
                  <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {isLoading && filteredTransactions.length === 0 ? (
            <ActivityIndicator color={Colors.primary.main} style={{ paddingVertical: Spacing.xl }} />
          ) : filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={48} color={Colors.neutral[300]} />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={styles.cardList}>
              {filteredTransactions.map(tx => (
                <View key={tx._id} style={styles.txCard}>
                  <View style={[styles.txIcon, { backgroundColor: getTransactionColor(tx.type) + '20' }]}>
                    <Ionicons name={getTransactionIcon(tx.type)} size={22} color={getTransactionColor(tx.type)} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>
                      {tx.type === 'fund_wallet' ? 'Fund Wallet' : tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </Text>
                    {tx.description ? <Text style={styles.txDesc} numberOfLines={1}>{tx.description}</Text> : null}
                    <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[styles.txAmount, { color: getTransactionColor(tx.type) }]}>
                      {tx.type === 'payout' || tx.type === 'fund_wallet' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </Text>
                    <View style={[
                      styles.statusBadge,
                      tx.status === 'completed' && styles.statusCompleted,
                      tx.status === 'pending' && styles.statusPending,
                      tx.status === 'failed' && styles.statusFailed,
                    ]}>
                      <Text style={styles.statusText}>{tx.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ── Fund Modal ────────────────────────────────────────────── */}
      <Modal visible={showFundModal} transparent animationType="slide" onRequestClose={() => setShowFundModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowFundModal(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Fund Wallet</Text>
            <Text style={styles.sheetSubtitle}>Enter the amount you want to add</Text>
            <View style={styles.amountRow}>
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
                <Pressable key={amt} style={styles.quickChip} onPress={() => setFundAmount(String(amt))}>
                  <Text style={styles.quickChipText}>₦{amt.toLocaleString()}</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[styles.primaryBtn, (!fundAmount || parseFloat(fundAmount) < 100) && styles.primaryBtnDisabled]}
              onPress={handleFundWallet}
              disabled={!fundAmount || parseFloat(fundAmount) < 100}
            >
              <Text style={styles.primaryBtnText}>Proceed to Payment</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Withdraw Modal ────────────────────────────────────────── */}
      <Modal visible={showWithdrawModal} transparent animationType="slide" onRequestClose={() => setShowWithdrawModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowWithdrawModal(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Withdraw Funds</Text>
            {withdrawError ? <Text style={styles.formError}>{withdrawError}</Text> : null}
            <Text style={styles.fieldLabel}>Select bank account</Text>
            {bankAccounts.length === 0 ? (
              <Text style={styles.emptyHint}>No bank accounts linked. Add one first.</Text>
            ) : (
              <View style={styles.bankSelectList}>
                {bankAccounts.map(acc => (
                  <Pressable
                    key={acc._id}
                    style={[styles.bankSelectRow, withdrawForm.bankAccountId === acc._id && styles.bankSelectRowActive]}
                    onPress={() => setWithdrawForm(p => ({ ...p, bankAccountId: acc._id }))}
                  >
                    <View style={styles.bankSelectLeft}>
                      <Ionicons
                        name={withdrawForm.bankAccountId === acc._id ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={withdrawForm.bankAccountId === acc._id ? Colors.primary.main : Colors.neutral[400]}
                      />
                      <Text style={[styles.bankSelectText, withdrawForm.bankAccountId === acc._id && { color: Colors.primary.main }]}>
                        {acc.bankName} ****{acc.accountNumber.slice(-4)}{acc.isPrimary ? ' (Primary)' : ''}
                      </Text>
                    </View>
                    {withdrawForm.bankAccountId === acc._id && (
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary.main} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.neutral[400]}
                value={withdrawForm.amount}
                onChangeText={v => setWithdrawForm(p => ({ ...p, amount: v }))}
                keyboardType="decimal-pad"
              />
            </View>
            {wallet && <Text style={styles.balanceHint}>Available: {formatCurrency(wallet.availableBalance)}</Text>}
            <Pressable
              style={[styles.primaryBtn, withdrawing && { opacity: 0.6 }]}
              onPress={handleWithdraw}
              disabled={withdrawing}
            >
              <Text style={styles.primaryBtnText}>{withdrawing ? 'Processing...' : 'Withdraw'}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Auto-Withdrawal Modal ─────────────────────────────────── */}
      <Modal visible={showAutoWithdrawalModal} transparent animationType="slide" onRequestClose={() => setShowAutoWithdrawalModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowAutoWithdrawalModal(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Auto-Withdrawal</Text>
            <Text style={styles.sheetSubtitle}>Automatically withdraw payouts to your bank</Text>
            {autoError ? <Text style={styles.formError}>{autoError}</Text> : null}
            <Text style={styles.fieldLabel}>Bank Account</Text>
            {bankAccounts.length === 0 ? (
              <Text style={styles.emptyHint}>No bank accounts linked.</Text>
            ) : (
              <View style={styles.bankSelectList}>
                {bankAccounts.map(acc => (
                  <Pressable
                    key={acc._id}
                    style={[styles.bankSelectRow, autoSettings.bankAccount === acc._id && styles.bankSelectRowActive]}
                    onPress={() => setAutoSettings(p => ({ ...p, bankAccount: acc._id }))}
                  >
                    <View style={styles.bankSelectLeft}>
                      <Ionicons
                        name={autoSettings.bankAccount === acc._id ? 'radio-button-on' : 'radio-button-off'}
                        size={18}
                        color={autoSettings.bankAccount === acc._id ? Colors.primary.main : Colors.neutral[400]}
                      />
                      <Text style={[styles.bankSelectText, autoSettings.bankAccount === acc._id && { color: Colors.primary.main }]}>
                        {acc.bankName} ****{acc.accountNumber.slice(-4)}
                      </Text>
                    </View>
                    {autoSettings.bankAccount === acc._id && (
                      <Ionicons name="checkmark-circle" size={18} color={Colors.primary.main} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
            <Text style={styles.fieldLabel}>Percentage: {autoSettings.percentage}%</Text>
            <View style={styles.quickAmounts}>
              {[25, 50, 75, 100].map(p => (
                <Pressable
                  key={p}
                  style={[styles.quickChip, autoSettings.percentage === p && styles.quickChipActive]}
                  onPress={() => setAutoSettings(prev => ({ ...prev, percentage: p }))}
                >
                  <Text style={[styles.quickChipText, autoSettings.percentage === p && styles.quickChipTextActive]}>{p}%</Text>
                </Pressable>
              ))}
            </View>
            <Pressable
              style={[styles.toggleRow]}
              onPress={() => setAutoSettings(p => ({ ...p, enabled: !p.enabled }))}
            >
              <Ionicons name={autoSettings.enabled ? 'checkbox' : 'square-outline'} size={22} color={Colors.primary.main} />
              <Text style={styles.toggleText}>Enable Auto-Withdrawal</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryBtn, savingAuto && { opacity: 0.6 }]}
              onPress={handleSaveAutoWithdrawal}
              disabled={savingAuto}
            >
              <Text style={styles.primaryBtnText}>{savingAuto ? 'Saving...' : 'Save Settings'}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Lock Funds Modal ──────────────────────────────────────── */}
      <Modal visible={showLockModal} transparent animationType="slide" onRequestClose={() => setShowLockModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowLockModal(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Lock Funds</Text>
            <Text style={styles.sheetSubtitle}>Protect savings from being spent</Text>
            {lockError ? <Text style={styles.formError}>{lockError}</Text> : null}
            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>₦</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={Colors.neutral[400]}
                value={lockForm.amount}
                onChangeText={v => setLockForm(p => ({ ...p, amount: v }))}
                keyboardType="decimal-pad"
              />
            </View>
            <TextInput
              style={styles.textField}
              placeholder="Label (optional)"
              placeholderTextColor={Colors.neutral[400]}
              value={lockForm.label}
              onChangeText={v => setLockForm(p => ({ ...p, label: v }))}
            />
            <View style={styles.quickAmounts}>
              {(['manual', 'date'] as const).map(rt => (
                <Pressable
                  key={rt}
                  style={[styles.quickChip, lockForm.releaseType === rt && styles.quickChipActive]}
                  onPress={() => setLockForm(p => ({ ...p, releaseType: rt }))}
                >
                  <Text style={[styles.quickChipText, lockForm.releaseType === rt && styles.quickChipTextActive]}>
                    {rt === 'manual' ? 'Manual unlock' : 'Set date'}
                  </Text>
                </Pressable>
              ))}
            </View>
            {lockForm.releaseType === 'date' && (
              <TextInput
                style={styles.textField}
                placeholder="Release date (YYYY-MM-DD)"
                placeholderTextColor={Colors.neutral[400]}
                value={lockForm.releaseDate}
                onChangeText={v => setLockForm(p => ({ ...p, releaseDate: v }))}
              />
            )}
            <Pressable
              style={[styles.primaryBtn, locking && { opacity: 0.6 }]}
              onPress={handleCreateLock}
              disabled={locking}
            >
              <Text style={styles.primaryBtnText}>{locking ? 'Locking...' : 'Lock Funds'}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f6fa' },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },

  // Hero card
  heroCard: {
    backgroundColor: Colors.primary.main,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 24,
    borderRadius: 20,
  },
  heroLabel: { fontSize: 13, fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.75)', marginBottom: 6 },
  heroAmount: { fontSize: 36, fontFamily: Typography.fontFamily.bold, color: '#fff', marginBottom: 20 },

  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 16, marginBottom: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statItemBorder: { borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.2)' },
  statLabel: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  statValue: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: '#fff' },

  fundBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#fff', paddingVertical: 12, borderRadius: 12, marginBottom: 12,
  },
  fundBtnText: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },

  // FIX: use flexWrap so text never overflows, and ensure minimum height
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    minHeight: 52,
  },
  actionBtnText: { fontSize: 11, fontFamily: Typography.fontFamily.semibold, color: '#fff', textAlign: 'center' },

  // Sections
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light },
  addText: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },

  cardList: { gap: 10 },

  // Lock cards
  lockCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.neutral[200],
  },
  lockIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.primary.main + '15', justifyContent: 'center', alignItems: 'center',
  },
  lockLabel: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light },
  lockMeta: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginTop: 2 },
  lockAmount: { fontSize: 15, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light },
  unlockText: { fontSize: 12, color: Colors.primary.main, fontFamily: Typography.fontFamily.semibold },

  // Bank accounts — FIX: more padding inside cards
  bankList: { flexDirection: 'row', gap: 12, paddingRight: 16 },
  bankCard: {
    width: 200,
    backgroundColor: Colors.primary.main,
    padding: 20,          // increased from 16
    paddingTop: 36,       // extra top room for the Primary badge
    borderRadius: 16,
    position: 'relative',
    justifyContent: 'flex-end',
    minHeight: 120,
  },
  primaryBadge: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
  },
  primaryBadgeText: { fontSize: 10, fontFamily: Typography.fontFamily.semibold, color: '#fff' },
  bankName: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  bankNumber: { fontSize: 17, fontFamily: Typography.fontFamily.bold, color: '#fff', marginBottom: 6, letterSpacing: 0.5 },
  bankHolder: { fontSize: 11, fontFamily: Typography.fontFamily.medium, color: 'rgba(255,255,255,0.9)', textTransform: 'uppercase' },
  addBankCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'transparent', padding: 16, borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.primary.main, borderStyle: 'dashed',
  },
  addBankText: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },
  addBankSmall: {
    width: 80, backgroundColor: 'transparent', borderRadius: 14,
    borderWidth: 1.5, borderColor: Colors.primary.main, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 4, paddingVertical: 12,
  },
  addBankSmallText: { fontSize: 12, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },

  // Auto-withdrawal card
  autoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.neutral[200],
  },
  autoIconWrap: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.primary.main + '15', justifyContent: 'center', alignItems: 'center',
  },
  autoStatus: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light },
  autoMeta: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginTop: 2 },

  // Filters
  filters: { flexDirection: 'row', gap: 8 },
  filterChip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.neutral[200],
  },
  filterChipActive: { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main },
  filterText: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: Colors.neutral[600] },
  filterTextActive: { color: '#fff' },

  // Transaction cards
  txCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 14, borderRadius: 14,
    borderWidth: 1, borderColor: Colors.neutral[200],
  },
  txIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txInfo: { flex: 1 },
  txTitle: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light, marginBottom: 2 },
  txDesc: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginBottom: 2 },
  txDate: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[400] },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 14, fontFamily: Typography.fontFamily.bold, marginBottom: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: Colors.neutral[100] },
  statusCompleted: { backgroundColor: '#dcfce7' },
  statusPending: { backgroundColor: '#fef9c3' },
  statusFailed: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 10, fontFamily: Typography.fontFamily.semibold, textTransform: 'capitalize', color: Colors.neutral[700] },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[400], marginTop: 12 },

  // Error
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fef2f2', marginHorizontal: 16, marginBottom: 16,
    padding: 14, borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#ef4444',
  },
  errorText: { flex: 1, fontSize: 13, color: '#ef4444', fontFamily: Typography.fontFamily.regular },
  inlineError: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fef2f2', padding: 12, borderRadius: 10,
    borderLeftWidth: 4, borderLeftColor: '#ef4444',
  },
  inlineErrorText: { flex: 1, fontSize: 13, color: '#ef4444', fontFamily: Typography.fontFamily.regular },
  retryBtn: { marginLeft: 8 },
  retryText: { fontSize: 13, color: Colors.primary.main, fontFamily: Typography.fontFamily.semibold },

  // Modals
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
  },
  sheetHandle: {
    width: 40, height: 4, backgroundColor: Colors.neutral[300],
    borderRadius: 2, alignSelf: 'center', marginBottom: 20,
  },
  sheetTitle: { fontSize: 20, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, marginBottom: 4 },
  sheetSubtitle: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginBottom: 20 },
  formError: { fontSize: 13, color: '#ef4444', marginBottom: 12, fontFamily: Typography.fontFamily.regular },
  fieldLabel: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light, marginBottom: 8 },
  emptyHint: { fontSize: 13, color: Colors.neutral[500], marginBottom: 16, fontFamily: Typography.fontFamily.regular },
  balanceHint: { fontSize: 12, color: Colors.neutral[500], marginBottom: 16, fontFamily: Typography.fontFamily.regular },

  amountRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.neutral[100], borderRadius: 12,
    paddingHorizontal: 16, marginBottom: 16,
  },
  currencySymbol: { fontSize: 22, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, marginRight: 6 },
  amountInput: {
    flex: 1, fontSize: 28, fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light, paddingVertical: 14,
  },
  textField: {
    backgroundColor: Colors.neutral[100], borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, fontFamily: Typography.fontFamily.regular,
    color: Colors.text.primary.light, marginBottom: 16,
  },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  quickChip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    backgroundColor: Colors.primary.main + '15',
    borderWidth: 1, borderColor: Colors.primary.main + '40',
  },
  quickChipActive: { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main },
  quickChipText: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },
  quickChipTextActive: { color: '#fff' },

  bankSelectList: { gap: 8, marginBottom: 16 },
  bankSelectRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12,
    backgroundColor: Colors.neutral[50], borderWidth: 1.5, borderColor: Colors.neutral[200],
  },
  bankSelectRowActive: { backgroundColor: Colors.primary.main + '10', borderColor: Colors.primary.main },
  bankSelectLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  bankSelectText: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: Colors.neutral[600] },

  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  toggleText: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light },

  primaryBtn: { backgroundColor: Colors.primary.main, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 16, fontFamily: Typography.fontFamily.semibold, color: '#fff' },
});

export default function WalletScreen() {
  return (
    <PaystackProvider publicKey={PAYSTACK_KEY}>
      <WalletContent />
    </PaystackProvider>
  );
}
