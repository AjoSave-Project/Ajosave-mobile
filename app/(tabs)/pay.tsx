import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useGroups, useWallet } from '@/contexts';

/**
 * Pay Screen
 * 
 * Allows users to make contributions to their groups
 */
export default function PayScreen() {
  const { groups } = useGroups();
  const { wallet } = useWallet();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');

  const activeGroups = Array.isArray(groups) ? groups.filter(g => g.status === 'active') : [];
  const selectedGroupData = activeGroups.find(g => g.id === selectedGroup);

  const handlePay = () => {
    console.log('Processing payment:', { groupId: selectedGroup, amount, paymentMethod });
  };

  const canPay = selectedGroup && amount && parseFloat(amount) > 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Wallet Balance</Text>
          <Text style={styles.balanceAmount}>₦{wallet?.balance?.toLocaleString() || '0'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Group</Text>
          {activeGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No active groups</Text>
            </View>
          ) : (
            <View style={styles.groupsList}>
              {activeGroups.map((group) => (
                <Pressable 
                  key={group.id}
                  style={[styles.groupCard, selectedGroup === group.id && styles.groupCardSelected]}
                  onPress={() => setSelectedGroup(group.id)}
                >
                  <View style={styles.groupIcon}>
                    <Text style={styles.groupIconText}>👥</Text>
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupAmount}>
                      ₦{group.contributionAmount.toLocaleString()}/{group.contributionFrequency}
                    </Text>
                  </View>
                  {selectedGroup === group.id && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {selectedGroupData && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amount</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>₦</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
              </View>
              <Pressable 
                style={styles.quickAmountButton}
                onPress={() => setAmount(selectedGroupData.contributionAmount.toString())}
              >
                <Text style={styles.quickAmountText}>
                  Use suggested amount (₦{selectedGroupData.contributionAmount.toLocaleString()})
                </Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <Pressable 
                style={[styles.paymentMethod, paymentMethod === 'wallet' && styles.paymentMethodSelected]}
                onPress={() => setPaymentMethod('wallet')}
              >
                <Text style={styles.paymentMethodIcon}>💰</Text>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>Wallet</Text>
                  <Text style={styles.paymentMethodBalance}>
                    Balance: ₦{wallet?.balance.toLocaleString()}
                  </Text>
                </View>
                {paymentMethod === 'wallet' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>
              <Pressable 
                style={[styles.paymentMethod, paymentMethod === 'card' && styles.paymentMethodSelected]}
                onPress={() => setPaymentMethod('card')}
              >
                <Text style={styles.paymentMethodIcon}>💳</Text>
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodName}>Debit Card</Text>
                  <Text style={styles.paymentMethodBalance}>Pay with card</Text>
                </View>
                {paymentMethod === 'card' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable 
          style={[styles.payButton, !canPay && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={!canPay}
        >
          <Text style={styles.payButtonText}>
            Pay ₦{amount || '0'}
          </Text>
        </Pressable>
      </View>
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
    padding: Spacing.md,
    borderRadius: 12,
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  section: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
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
    fontFamily: Typography.fontFamily.regular,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
    marginBottom: 4,
  },
  groupAmount: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
  checkmark: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.primary.main,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginBottom: Spacing.sm,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    marginRight: Spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
  },
  quickAmountButton: {
    padding: Spacing.sm,
  },
  quickAmountText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary.main,
    fontWeight: '600',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.neutral[200],
    marginBottom: Spacing.sm,
  },
  paymentMethodSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.light + '10',
  },
  paymentMethodIcon: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.regular,
    marginRight: Spacing.md,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
    marginBottom: 4,
  },
  paymentMethodBalance: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
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
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
  },
});
