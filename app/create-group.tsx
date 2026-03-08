import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ScrollView, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { useGroups } from '@/contexts/GroupsContext';
import { validateField } from '@/utils/validation';
import PillButton from '@/components/ui/PillButton';
import GradientButton from '@/components/ui/GradientButton';
import ProgressBar from '@/components/ui/ProgressBar';

const MAX_MEMBERS = ['3 Members', '5 Members', '10 Members', '15 Members', '20 Members', 'Custom'];
const FREQUENCIES = ['Daily', 'Weekly', 'Bi - Weekly', 'Monthly'];
const DURATIONS = ['3 Months', '6 Months', '12 Months', '18 Months', '24 Months', 'Custom'];
const PAYOUT_ORDERS = [
  { value: 'random', label: 'Random' },
  { value: 'firstCome', label: 'First come, First served' },
  { value: 'bidding', label: 'Bidding system' },
];

export default function CreateGroupScreen() {
  const { createGroup, isLoading } = useGroups();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxMembers: '',
    duration: '',
    contributionAmount: '',
    frequency: 'Monthly',
    payoutOrder: '',
    customMaxMembers: '',
    customDuration: '',
    inviteEmails: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCustomMaxMembers, setShowCustomMaxMembers] = useState(false);
  const [showCustomDuration, setShowCustomDuration] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    const nameError = validateField('groupName', formData.name);
    if (nameError) newErrors.name = nameError;
    const maxMembersError = validateField('maxMembers', formData.maxMembers);
    if (maxMembersError) newErrors.maxMembers = maxMembersError;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    const amountError = validateField('contributionAmount', formData.contributionAmount);
    if (amountError) newErrors.contributionAmount = amountError;
    
    if (showCustomDuration) {
      const customDur = parseInt(formData.customDuration);
      if (!formData.customDuration || customDur < 1 || customDur > 24) {
        newErrors.customDuration = 'Duration must be between 1 and 24 months';
      }
    } else if (!formData.duration) {
      newErrors.duration = 'Please select a duration';
    }
    
    if (!formData.payoutOrder) {
      newErrors.payoutOrder = 'Please select a payout order';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    try {
      const finalMaxMembers = showCustomMaxMembers 
        ? parseInt(formData.customMaxMembers) 
        : parseInt(formData.maxMembers);
      
      const finalDuration = showCustomDuration 
        ? parseInt(formData.customDuration) 
        : parseInt(formData.duration.split(' ')[0]);

      const result = await createGroup({
        name: formData.name,
        description: formData.description,
        maxMembers: finalMaxMembers,
        duration: finalDuration,
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
        <Pressable onPress={() => step > 1 ? setStep(step - 1) : router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary.main} />
        </Pressable>
        <View style={styles.flex} />
      </View>

      {/* Title and Progress */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>
          {step === 1 && 'Create New Group'}
          {step === 2 && 'Contribution Rules'}
          {step === 3 && 'Invite Members'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 1 && 'Step 1 of 3: Group details'}
          {step === 2 && 'Step 2 of 3: Define how much and when members contribute'}
          {step === 3 && 'Step 3 of 3: Send invitations to start your Savings group'}
        </Text>
        <View style={styles.progressContainer}>
          <ProgressBar steps={3} currentStep={step} />
        </View>
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
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Step 1: Group Details */}
          {step === 1 && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Group name</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Office Colleague"
                  placeholderTextColor={Colors.neutral[400]}
                  value={formData.name}
                  onChangeText={(v) => handleChange('name', v)}
                  editable={!isLoading}
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Description (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Savings towards december plans"
                  placeholderTextColor={Colors.neutral[400]}
                  value={formData.description}
                  onChangeText={(v) => handleChange('description', v)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Max Number of Members</Text>
                <View style={styles.pillGrid}>
                  {MAX_MEMBERS.map((member) => (
                    <PillButton
                      key={member}
                      label={member}
                      selected={member === 'Custom' ? showCustomMaxMembers : formData.maxMembers === member.split(' ')[0]}
                      onPress={() => {
                        if (member === 'Custom') {
                          setShowCustomMaxMembers(true);
                          handleChange('maxMembers', '');
                        } else {
                          setShowCustomMaxMembers(false);
                          handleChange('maxMembers', member.split(' ')[0]);
                        }
                      }}
                    />
                  ))}
                </View>
                {showCustomMaxMembers && (
                  <TextInput
                    style={[styles.input, styles.customInput, errors.customMaxMembers && styles.inputError]}
                    placeholder="Enter number of members"
                    placeholderTextColor={Colors.neutral[400]}
                    value={formData.customMaxMembers}
                    onChangeText={(v) => handleChange('customMaxMembers', v.replace(/\D/g, ''))}
                    keyboardType="number-pad"
                    editable={!isLoading}
                  />
                )}
                {errors.maxMembers ? <Text style={styles.errorText}>{errors.maxMembers}</Text> : null}
                {errors.customMaxMembers ? <Text style={styles.errorText}>{errors.customMaxMembers}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Contribution frequency</Text>
                <View style={styles.pillGrid}>
                  {FREQUENCIES.map((freq) => (
                    <PillButton
                      key={freq}
                      label={freq}
                      selected={formData.frequency === freq}
                      onPress={() => handleChange('frequency', freq)}
                    />
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Step 2: Contribution Rules */}
          {step === 2 && (
            <>
              <View style={styles.field}>
                <Text style={styles.label}>Contribution Amount (₦)</Text>
                <View style={styles.amountInputContainer}>
                  <Text style={styles.currencySymbol}>₦</Text>
                  <TextInput
                    style={[styles.amountInput, errors.contributionAmount && styles.inputError]}
                    placeholder="0"
                    placeholderTextColor={Colors.neutral[400]}
                    value={formData.contributionAmount}
                    onChangeText={(v) => handleChange('contributionAmount', v.replace(/[^0-9.]/g, ''))}
                    keyboardType="decimal-pad"
                    editable={!isLoading}
                  />
                </View>
                {errors.contributionAmount ? <Text style={styles.errorText}>{errors.contributionAmount}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Duration</Text>
                <View style={styles.pillGrid}>
                  {DURATIONS.map((duration) => (
                    <PillButton
                      key={duration}
                      label={duration}
                      selected={duration === 'Custom' ? showCustomDuration : formData.duration === duration}
                      onPress={() => {
                        if (duration === 'Custom') {
                          setShowCustomDuration(true);
                          handleChange('duration', '');
                        } else {
                          setShowCustomDuration(false);
                          handleChange('duration', duration);
                        }
                      }}
                    />
                  ))}
                </View>
                {showCustomDuration && (
                  <TextInput
                    style={[styles.input, styles.customInput, errors.customDuration && styles.inputError]}
                    placeholder="Enter duration in months (max 24)"
                    placeholderTextColor={Colors.neutral[400]}
                    value={formData.customDuration}
                    onChangeText={(v) => handleChange('customDuration', v.replace(/\D/g, ''))}
                    keyboardType="number-pad"
                    editable={!isLoading}
                  />
                )}
                {errors.duration ? <Text style={styles.errorText}>{errors.duration}</Text> : null}
                {errors.customDuration ? <Text style={styles.errorText}>{errors.customDuration}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Payout order</Text>
                <View style={styles.pillGrid}>
                  {PAYOUT_ORDERS.map((order) => (
                    <PillButton
                      key={order.value}
                      label={order.label}
                      selected={formData.payoutOrder === order.value}
                      onPress={() => handleChange('payoutOrder', order.value)}
                    />
                  ))}
                </View>
                {errors.payoutOrder ? <Text style={styles.errorText}>{errors.payoutOrder}</Text> : null}
              </View>
            </>
          )}

          {/* Step 3: Invite Members */}
          {step === 3 && (
            <View style={styles.field}>
              <View style={styles.inviteIllustration}>
                <Text style={styles.inviteEmoji}>📢</Text>
              </View>
              <Text style={styles.label}>Email Address or Phone Number</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter email addresses or phone numbers separated by commas"
                placeholderTextColor={Colors.neutral[400]}
                value={formData.inviteEmails}
                onChangeText={(v) => handleChange('inviteEmails', v)}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!isLoading}
              />
              <Text style={styles.inviteHint}>Send Invitations to start your Savings group</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        {step < 3 ? (
          <GradientButton
            label="Continue"
            onPress={handleNext}
            disabled={isLoading}
            icon="arrow-forward"
          />
        ) : (
          <View style={styles.finalButtonsContainer}>
            <Pressable
              style={styles.doneButton}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
            <GradientButton
              label={isLoading ? 'Sending...' : 'Invite'}
              onPress={handleSubmit}
              disabled={isLoading}
              icon="arrow-forward"
              style={styles.inviteButton}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background.light },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.background.light,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
    backgroundColor: Colors.background.light,
  },
  title: {
    fontSize: 28,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    marginTop: 8,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  field: { marginBottom: 24 },
  label: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.neutral[400],
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.primary.light,
    borderWidth: 0,
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  inputError: { borderColor: '#ef4444', borderWidth: 1 },
  errorText: { fontSize: 12, color: '#ef4444', marginTop: 6 },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 20,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    backgroundColor: 'transparent',
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  customInput: {
    marginTop: 12,
  },
  inviteIllustration: {
    alignItems: 'center',
    marginBottom: 24,
  },
  inviteEmoji: {
    fontSize: 80,
  },
  inviteHint: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.primary.main,
    textAlign: 'center',
    marginTop: 12,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: Colors.background.light,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  finalButtonsContainer: {
    gap: 12,
  },
  doneButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary.main,
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
  },
  inviteButton: {
    flex: 0,
  },
});
