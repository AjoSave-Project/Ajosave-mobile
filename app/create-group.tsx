import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useGroups } from '@/contexts/GroupsContext';
import { validateField } from '@/utils/validation';

const FREQUENCIES = ['Weekly', 'Bi-Weekly', 'Monthly'];
const PAYOUT_ORDERS = [
  { value: 'random', label: 'Random', description: 'Order is decided by a random draw when the group starts' },
  { value: 'firstCome', label: 'First Come', description: 'Members receive payouts in the order they joined the group' },
  { value: 'bidding', label: 'Bidding', description: 'Members bid to choose their preferred payout position' },
];

export default function CreateGroupScreen() {
  const { createGroup, isLoading } = useGroups();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: '',
    duration: '',
    contributionAmount: '',
    frequency: '',
    payoutOrder: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    const nameError = validateField('groupName', formData.name);
    if (nameError) newErrors.name = nameError;

    const maxMembersError = validateField('maxMembers', formData.maxMembers);
    if (maxMembersError) newErrors.maxMembers = maxMembersError;

    const durationError = validateField('duration', formData.duration);
    if (durationError) newErrors.duration = durationError;

    const amountError = validateField('contributionAmount', formData.contributionAmount);
    if (amountError) newErrors.contributionAmount = amountError;

    if (!formData.frequency) newErrors.frequency = 'Please select a frequency';
    if (!formData.payoutOrder) newErrors.payoutOrder = 'Please select a payout order';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await createGroup({
        name: formData.name,
        description: formData.description,
        maxMembers: parseInt(formData.maxMembers),
        duration: parseInt(formData.duration),
        contributionAmount: parseFloat(formData.contributionAmount),
        frequency: formData.frequency as any,
        payoutOrder: formData.payoutOrder as any,
      });

      Alert.alert(
        'Group Created!',
        `Your group has been created.\n\nInvitation Code: ${result.invitationCode}\n\nShare this code with others to join.`,
        [
          { text: 'View Group', onPress: () => router.replace(`/group-details?id=${result.group._id}`) },
          { text: 'Go to Groups', onPress: () => router.replace('/(tabs)/groups') },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create group');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary.light} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Scrollable Form */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          {/* Group Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Group Name *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Enter group name"
              placeholderTextColor={Colors.neutral[400]}
              value={formData.name}
              onChangeText={(v) => handleChange('name', v)}
              editable={!isLoading}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your group"
              placeholderTextColor={Colors.neutral[400]}
              value={formData.description}
              onChangeText={(v) => handleChange('description', v)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isLoading}
            />
          </View>

          {/* Max Members & Duration */}
          <View style={styles.row}>
            <View style={[styles.field, styles.flex]}>
              <Text style={styles.label}>Max Members *</Text>
              <TextInput
                style={[styles.input, errors.maxMembers && styles.inputError]}
                placeholder="e.g. 10"
                placeholderTextColor={Colors.neutral[400]}
                value={formData.maxMembers}
                onChangeText={(v) => handleChange('maxMembers', v.replace(/\D/g, ''))}
                keyboardType="number-pad"
                editable={!isLoading}
              />
              {errors.maxMembers ? <Text style={styles.errorText}>{errors.maxMembers}</Text> : null}
            </View>

            <View style={[styles.field, styles.flex]}>
              <Text style={styles.label}>Duration (months) *</Text>
              <TextInput
                style={[styles.input, errors.duration && styles.inputError]}
                placeholder="e.g. 6 (typically 3–12)"
                placeholderTextColor={Colors.neutral[400]}
                value={formData.duration}
                onChangeText={(v) => handleChange('duration', v.replace(/\D/g, ''))}
                keyboardType="number-pad"
                editable={!isLoading}
              />
              {errors.duration ? <Text style={styles.errorText}>{errors.duration}</Text> : null}
            </View>
          </View>

          {/* Contribution Amount */}
          <View style={styles.field}>
            <Text style={styles.label}>Contribution Amount (₦) *</Text>
            <TextInput
              style={[styles.input, errors.contributionAmount && styles.inputError]}
              placeholder="Enter amount"
              placeholderTextColor={Colors.neutral[400]}
              value={formData.contributionAmount}
              onChangeText={(v) => handleChange('contributionAmount', v.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              editable={!isLoading}
            />
            {errors.contributionAmount ? <Text style={styles.errorText}>{errors.contributionAmount}</Text> : null}
          </View>

          {/* Frequency */}
          <View style={styles.field}>
            <Text style={styles.label}>Contribution Frequency *</Text>
            <View style={styles.chipRow}>
              {FREQUENCIES.map((freq) => (
                <Pressable
                  key={freq}
                  style={[styles.chip, formData.frequency === freq && styles.chipSelected]}
                  onPress={() => handleChange('frequency', freq)}
                >
                  <Text style={[styles.chipText, formData.frequency === freq && styles.chipTextSelected]}>
                    {freq}
                  </Text>
                </Pressable>
              ))}
            </View>
            {errors.frequency ? <Text style={styles.errorText}>{errors.frequency}</Text> : null}
          </View>

          {/* Payout Order */}
          <View style={styles.field}>
            <Text style={styles.label}>Payout Order *</Text>
            {PAYOUT_ORDERS.map((order) => (
              <Pressable
                key={order.value}
                style={[styles.payoutCard, formData.payoutOrder === order.value && styles.payoutCardSelected]}
                onPress={() => handleChange('payoutOrder', order.value)}
              >
                <View style={[styles.radio, formData.payoutOrder === order.value && styles.radioSelected]}>
                  {formData.payoutOrder === order.value && <View style={styles.radioDot} />}
                </View>
                <View style={styles.flex}>
                  <Text style={[styles.chipText, formData.payoutOrder === order.value && styles.chipTextSelected]}>
                    {order.label}
                  </Text>
                  <Text style={[styles.payoutDesc, formData.payoutOrder === order.value && styles.payoutDescSelected]}>
                    {order.description}
                  </Text>
                </View>
              </Pressable>
            ))}
            {errors.payoutOrder ? <Text style={styles.errorText}>{errors.payoutOrder}</Text> : null}
          </View>

          {/* Submit */}
          <Pressable
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>Create Group</Text>
            }
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7fa' },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    backgroundColor: '#fff',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 60,
  },
  field: { marginBottom: Spacing.lg },
  row: { flexDirection: 'row', gap: Spacing.md },
  label: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.neutral[600],
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    fontSize: 15,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.primary.light,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: '#ef4444' },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: '#fff',
  },
  chipSelected: { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main },
  chipText: { fontSize: 14, fontFamily: Typography.fontFamily.medium, color: Colors.neutral[700] },
  chipTextSelected: { color: '#fff' },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  payoutCardSelected: { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main },
  payoutDesc: { fontSize: 12, color: Colors.neutral[500], marginTop: 2 },
  payoutDescSelected: { color: 'rgba(255,255,255,0.8)' },
  radio: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, borderColor: Colors.neutral[400],
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2, flexShrink: 0,
  },
  radioSelected: { borderColor: '#fff' },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  submitBtn: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#fff', fontSize: 16, fontFamily: Typography.fontFamily.semibold },
});
