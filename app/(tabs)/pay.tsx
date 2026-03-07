import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PaystackProvider, usePaystack } from 'react-native-paystack-webview';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useGroups } from '@/contexts/GroupsContext';
import { useWallet } from '@/contexts/WalletContext';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionService } from '@/services/transactionService';
import { generatePaymentReference } from '@/utils/payment';
import { formatCurrency, formatDate } from '@/utils/formatting';
import type { Group } from '@/services/groupService';

const PAYSTACK_KEY = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY || '';

// Inner component that uses the usePaystack hook
function PayContent() {
  const { groups, fetchGroups } = useGroups();
  const { wallet, refreshWallet } = useWallet();
  const { user } = useAuth();
  const { popup } = usePaystack();

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups().catch((err) => {
      setFetchError(err?.message || 'Failed to load groups');
    });
  }, []);

  const activeGroups = Array.isArray(groups) ? groups.filter((g: Group) => g.status === 'active' || g.status === 'pending') : [];
  const selectedGroup = activeGroups.find((g: Group) => g._id === selectedGroupId) ?? null;
  const contributionAmount = selectedGroup?.contributionAmount ?? 0;

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchGroups();
    } finally {
      setRefreshing(false);
    }
  };

  const handleInitiatePayment = () => {
    if (!selectedGroup || !user?.email) return;
    const ref = generatePaymentReference();

    popup.checkout({
      email: user.email,
      amount: contributionAmount * 100, // Paystack expects kobo
      reference: ref,
      onSuccess: async (response) => {
        setIsProcessing(true);
        const txRef = response?.reference || response?.transaction || ref;
        try {
          await TransactionService.createContribution(selectedGroupId!, txRef, contributionAmount);
          await Promise.all([refreshWallet(), fetchGroups()]);
          Alert.alert(
            'Payment Successful',
            `Your contribution of ${formatCurrency(contributionAmount)} to ${selectedGroup.name} was recorded.\n\nRef: ${txRef}`,
            [{ text: 'OK', onPress: () => setSelectedGroupId(null) }]
          );
        } catch {
          Alert.alert(
            'Payment Received',
            `Payment was successful but we could not record your contribution automatically.\n\nSave your reference: ${txRef}\n\nContact support if this persists.`,
            [{ text: 'OK' }]
          );
        } finally {
          setIsProcessing(false);
        }
      },
      onCancel: () => {
        Alert.alert('Payment Cancelled', 'Your payment was cancelled. No charge was made.');
      },
      onError: (err) => {
        Alert.alert('Payment Failed', err?.message || 'An error occurred during payment. Please try again.');
      },
    });
  };

  const canPay = !!selectedGroupId && !!user?.email && !isProcessing;

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Wallet balance card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Wallet Balance</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(wallet?.availableBalance ?? 0)}
          </Text>
        </View>

        {/* Group selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Group to Pay</Text>
          {fetchError ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>⚠️</Text>
              <Text style={styles.emptyTitle}>Could not load groups</Text>
              <Text style={styles.emptySubtitle}>{fetchError}</Text>
              <Pressable onPress={() => { setFetchError(null); fetchGroups().catch(e => setFetchError(e?.message || 'Failed')); }} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </Pressable>
            </View>
          ) : activeGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyTitle}>No active groups</Text>
              <Text style={styles.emptySubtitle}>
                Join or create a group to start making contributions
              </Text>
            </View>
          ) : (
            <View style={styles.groupsList}>
              {activeGroups.map((group: Group) => {
                const isSelected = selectedGroupId === group._id;
                return (
                  <Pressable
                    key={group._id}
                    style={[styles.groupCard, isSelected && styles.groupCardSelected]}
                    onPress={() => setSelectedGroupId(group._id)}
                  >
                    <View style={styles.groupIcon}>
                      <Text style={styles.groupIconText}>👥</Text>
                    </View>
                    <View style={styles.groupInfo}>
                      <Text style={styles.groupName}>{group.name}</Text>
                      <Text style={styles.groupAmount}>
                        {formatCurrency(group.contributionAmount)}/{group.frequency}
                      </Text>
                      {group.nextContribution && (
                        <Text style={styles.nextDate}>
                          Next: {formatDate(group.nextContribution)}
                        </Text>
                      )}
                    </View>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Payment summary */}
        {selectedGroup && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Group</Text>
                <Text style={styles.summaryValue}>{selectedGroup.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={[styles.summaryValue, styles.summaryAmount]}>
                  {formatCurrency(contributionAmount)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment via</Text>
                <Text style={styles.summaryValue}>Paystack (Card / Bank)</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Pay button */}
      <View style={styles.footer}>
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator color={Colors.primary.main} />
            <Text style={styles.processingText}>Recording payment...</Text>
          </View>
        ) : (
          <Pressable
            style={[styles.payButton, !canPay && styles.payButtonDisabled]}
            onPress={handleInitiatePayment}
            disabled={!canPay}
          >
            <Text style={styles.payButtonText}>
              {selectedGroup
                ? `Pay ${formatCurrency(contributionAmount)}`
                : 'Select a group to pay'}
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

// Wrap with PaystackProvider
export default function PayScreen() {
  return (
    <PaystackProvider publicKey={PAYSTACK_KEY}>
      <PayContent />
    </PaystackProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.light,
    paddingTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  balanceCard: {
    backgroundColor: Colors.primary.main,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    marginBottom: Spacing.md,
  },
  groupsList: {
    gap: Spacing.sm,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  groupCardSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.light + '10',
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  groupIconText: {
    fontSize: 24,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
    marginBottom: 2,
  },
  groupAmount: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
  nextDate: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.primary.main,
    marginTop: 2,
  },
  checkmark: {
    fontSize: 22,
    color: Colors.primary.main,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
  },
  summaryAmount: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: Spacing.md,
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Typography.fontFamily.semibold,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    backgroundColor: '#FFFFFF',
  },
  payButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  processingText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.primary.main,
  },
});
