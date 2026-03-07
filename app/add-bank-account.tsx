import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { WalletService } from '@/services/walletService';
import { useWallet } from '@/contexts/WalletContext';

// Nigerian banks list
const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '023', name: 'Citibank' },
  { code: '050', name: 'EcoBank' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: '030', name: 'Heritage Bank' },
  { code: '301', name: 'Jaiz Bank' },
  { code: '082', name: 'Keystone Bank' },
  { code: '526', name: 'Parallex Bank' },
  { code: '076', name: 'Polaris Bank' },
  { code: '101', name: 'ProvidusBank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '068', name: 'Standard Chartered Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '100', name: 'Suntrust Bank' },
  { code: '032', name: 'Union Bank' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

/**
 * Add Bank Account Screen
 * 
 * Allows users to verify and add a bank account for payouts
 */
export default function AddBankAccountScreen() {
  const { refreshWallet } = useWallet();

  const [accountNumber, setAccountNumber] = useState('');
  const [selectedBank, setSelectedBank] = useState<{ code: string; name: string } | null>(null);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [verifiedAccountName, setVerifiedAccountName] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleVerify = async () => {
    const newErrors: Record<string, string> = {};

    if (!accountNumber || accountNumber.length !== 10) {
      newErrors.accountNumber = 'Account number must be exactly 10 digits';
    }
    if (!selectedBank) {
      newErrors.bank = 'Please select a bank';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsVerifying(true);
      setErrors({});
      const result = await WalletService.verifyBankAccount(accountNumber, selectedBank!.code);
      setVerifiedAccountName(result.accountName);
      setIsVerified(true);
    } catch (err: any) {
      setErrors({ verify: err.message || 'Invalid account details. Please check and try again.' });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAdd = async () => {
    if (!isVerified || !selectedBank) return;

    try {
      setIsAdding(true);
      await WalletService.addBankAccount(accountNumber, verifiedAccountName, selectedBank.code, selectedBank.name);
      await refreshWallet();
      Alert.alert('Success', 'Bank account added successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to add bank account');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAccountNumberChange = (value: string) => {
    const numeric = value.replace(/\D/g, '');
    setAccountNumber(numeric);
    setIsVerified(false);
    setVerifiedAccountName('');
    if (errors.accountNumber) {
      setErrors(prev => { const e = { ...prev }; delete e.accountNumber; return e; });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary.light} />
          </Pressable>
          <Text style={styles.headerTitle}>Add Bank Account</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Account Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                style={[styles.input, errors.accountNumber && styles.inputError]}
                placeholder="Enter 10-digit account number"
                placeholderTextColor={Colors.neutral[500]}
                value={accountNumber}
                onChangeText={handleAccountNumberChange}
                keyboardType="number-pad"
                maxLength={10}
                editable={!isVerifying && !isAdding}
              />
              {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
            </View>

            {/* Bank Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bank</Text>
              <Pressable
                style={[styles.bankSelector, errors.bank && styles.inputError]}
                onPress={() => setShowBankPicker(!showBankPicker)}
              >
                <Text style={selectedBank ? styles.bankSelectorText : styles.bankSelectorPlaceholder}>
                  {selectedBank ? selectedBank.name : 'Select your bank'}
                </Text>
                <Ionicons name={showBankPicker ? "chevron-up" : "chevron-down"} size={20} color={Colors.neutral[500]} />
              </Pressable>
              {errors.bank && <Text style={styles.errorText}>{errors.bank}</Text>}

              {showBankPicker && (
                <View style={styles.bankList}>
                  <ScrollView style={styles.bankListScroll} nestedScrollEnabled>
                    {NIGERIAN_BANKS.map((bank) => (
                      <Pressable
                        key={bank.code}
                        style={[styles.bankItem, selectedBank?.code === bank.code && styles.bankItemSelected]}
                        onPress={() => {
                          setSelectedBank(bank);
                          setShowBankPicker(false);
                          setIsVerified(false);
                          setVerifiedAccountName('');
                          if (errors.bank) {
                            setErrors(prev => { const e = { ...prev }; delete e.bank; return e; });
                          }
                        }}
                      >
                        <Text style={[styles.bankItemText, selectedBank?.code === bank.code && styles.bankItemTextSelected]}>
                          {bank.name}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Verify Button */}
            {!isVerified && (
              <Pressable
                style={[styles.verifyButton, (isVerifying || !accountNumber || !selectedBank) && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={isVerifying || !accountNumber || !selectedBank}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verify Account</Text>
                )}
              </Pressable>
            )}

            {errors.verify && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errors.verify}</Text>
              </View>
            )}

            {/* Verified Account Details */}
            {isVerified && (
              <View style={styles.verifiedCard}>
                <View style={styles.verifiedHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                  <Text style={styles.verifiedTitle}>Account Verified</Text>
                </View>
                <View style={styles.verifiedDetails}>
                  <View style={styles.verifiedRow}>
                    <Text style={styles.verifiedLabel}>Account Name</Text>
                    <Text style={styles.verifiedValue}>{verifiedAccountName}</Text>
                  </View>
                  <View style={styles.verifiedRow}>
                    <Text style={styles.verifiedLabel}>Account Number</Text>
                    <Text style={styles.verifiedValue}>{accountNumber}</Text>
                  </View>
                  <View style={styles.verifiedRow}>
                    <Text style={styles.verifiedLabel}>Bank</Text>
                    <Text style={styles.verifiedValue}>{selectedBank?.name}</Text>
                  </View>
                </View>

                <View style={styles.verifiedActions}>
                  <Pressable style={styles.changeButton} onPress={() => { setIsVerified(false); setVerifiedAccountName(''); }}>
                    <Text style={styles.changeButtonText}>Change</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.addButton, isAdding && styles.buttonDisabled]}
                    onPress={handleAdd}
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.addButtonText}>Add Account</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background.light },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: '#FFFFFF',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light },
  scrollView: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  inputGroup: { gap: Spacing.xs },
  label: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600], marginLeft: Spacing.xs },
  input: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.text.primary.light,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  inputError: { borderColor: '#ef4444' },
  errorText: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: '#ef4444', marginLeft: Spacing.xs },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  bankSelectorText: { fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light },
  bankSelectorPlaceholder: { fontSize: 16, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500] },
  bankList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    marginTop: Spacing.xs,
    overflow: 'hidden',
  },
  bankListScroll: { maxHeight: 200 },
  bankItem: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  bankItemSelected: { backgroundColor: Colors.primary.main + '15' },
  bankItemText: { fontSize: 15, fontFamily: Typography.fontFamily.regular, color: Colors.text.primary.light },
  bankItemTextSelected: { fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },
  verifyButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  verifyButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: Typography.fontFamily.semibold },
  errorBanner: {
    backgroundColor: '#fef2f2',
    padding: Spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorBannerText: { fontSize: 13, fontFamily: Typography.fontFamily.regular, color: '#ef4444' },
  verifiedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22c55e',
    overflow: 'hidden',
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#dcfce7',
  },
  verifiedTitle: { fontSize: 16, fontFamily: Typography.fontFamily.semibold, color: '#16a34a' },
  verifiedDetails: { padding: Spacing.md, gap: Spacing.sm },
  verifiedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verifiedLabel: { fontSize: 13, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600] },
  verifiedValue: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light },
  verifiedActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  changeButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[300],
  },
  changeButtonText: { fontSize: 15, fontFamily: Typography.fontFamily.semibold, color: Colors.neutral[700] },
  addButton: {
    flex: 2,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.primary.main,
  },
  addButtonText: { fontSize: 15, fontFamily: Typography.fontFamily.semibold, color: '#FFFFFF' },
});
