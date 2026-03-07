import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useGroups } from '@/contexts/GroupsContext';
import { Group } from '@/services/groupService';
import { formatCurrency } from '@/utils/formatting';

/**
 * Join Group Screen
 */
export default function JoinGroupScreen() {
  const { findGroupByCode, joinGroup, isLoading } = useGroups();

  const [invitationCode, setInvitationCode] = useState('');
  const [foundGroup, setFoundGroup] = useState<Group | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCodeChange = (value: string) => {
    const upper = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setInvitationCode(upper);
    setFoundGroup(null);
    setError('');
  };

  const handleSearch = async () => {
    if (!invitationCode.trim()) {
      setError('Please enter an invitation code');
      return;
    }
    if (invitationCode.length !== 6) {
      setError('Invitation code must be exactly 6 characters');
      return;
    }

    try {
      setIsSearching(true);
      setError('');
      const group = await findGroupByCode(invitationCode);
      setFoundGroup(group);
    } catch (err: any) {
      setError(err.message || 'Group not found. Please check the code and try again.');
      setFoundGroup(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleJoin = async () => {
    if (!foundGroup) return;

    try {
      setIsJoining(true);
      await joinGroup(foundGroup._id || foundGroup.id);
      Alert.alert('Success', `You have joined ${foundGroup.name}!`, [
        { text: 'View Group', onPress: () => router.replace(`/group-details?id=${foundGroup._id || foundGroup.id}`) }
      ]);
    } catch (err: any) {
      const msg = err.message || 'Failed to join group';
      if (msg.toLowerCase().includes('full')) {
        Alert.alert('Group Full', 'This group has reached its maximum number of members.');
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setIsJoining(false);
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
          <Text style={styles.headerTitle}>Join Group</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <Text style={styles.subtitle}>Enter the 6-character invitation code to find and join a group.</Text>

            {/* Code Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Invitation Code</Text>
              <View style={styles.codeInputRow}>
                <TextInput
                  style={[styles.codeInput, error && styles.inputError]}
                  placeholder="e.g., ABC123"
                  placeholderTextColor={Colors.neutral[500]}
                  value={invitationCode}
                  onChangeText={handleCodeChange}
                  maxLength={6}
                  autoCapitalize="characters"
                  editable={!isSearching && !isJoining}
                />
                <Pressable
                  style={[styles.searchButton, (isSearching || invitationCode.length !== 6) && styles.buttonDisabled]}
                  onPress={handleSearch}
                  disabled={isSearching || invitationCode.length !== 6}
                >
                  {isSearching ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Ionicons name="search" size={20} color="#FFFFFF" />
                  )}
                </Pressable>
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
            </View>

            {/* Found Group Preview */}
            {foundGroup && (
              <View style={styles.groupPreview}>
                <View style={styles.groupPreviewHeader}>
                  <View style={styles.groupIcon}>
                    <Ionicons name="people" size={28} color={Colors.primary.main} />
                  </View>
                  <View style={styles.groupPreviewInfo}>
                    <Text style={styles.groupName}>{foundGroup.name}</Text>
                    <Text style={styles.groupStatus}>
                      {foundGroup.status.charAt(0).toUpperCase() + foundGroup.status.slice(1)}
                    </Text>
                  </View>
                </View>

                {foundGroup.description && (
                  <Text style={styles.groupDescription}>{foundGroup.description}</Text>
                )}

                <View style={styles.groupStats}>
                  <View style={styles.groupStat}>
                    <Text style={styles.groupStatLabel}>Contribution</Text>
                    <Text style={styles.groupStatValue}>{formatCurrency(foundGroup.contributionAmount)}</Text>
                  </View>
                  <View style={styles.groupStat}>
                    <Text style={styles.groupStatLabel}>Frequency</Text>
                    <Text style={styles.groupStatValue}>{foundGroup.contributionFrequency || foundGroup.frequency}</Text>
                  </View>
                  <View style={styles.groupStat}>
                    <Text style={styles.groupStatLabel}>Members</Text>
                    <Text style={styles.groupStatValue}>
                      {foundGroup.currentMembers ?? foundGroup.members?.length ?? 0}/{foundGroup.maxMembers}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={[styles.joinButton, isJoining && styles.buttonDisabled]}
                  onPress={handleJoin}
                  disabled={isJoining}
                >
                  {isJoining ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.joinButtonText}>Join This Group</Text>
                  )}
                </Pressable>
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
  content: { padding: Spacing.lg, gap: Spacing.xl },
  subtitle: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600], lineHeight: 20 },
  inputGroup: { gap: Spacing.xs },
  label: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600], marginLeft: Spacing.xs },
  codeInputRow: { flexDirection: 'row', gap: Spacing.sm },
  codeInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    fontSize: 20,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    letterSpacing: 4,
    textAlign: 'center',
  },
  inputError: { borderColor: '#ef4444' },
  searchButton: {
    width: 52,
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  errorText: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: '#ef4444', marginLeft: Spacing.xs },
  groupPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary.main,
    overflow: 'hidden',
  },
  groupPreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.primary.main + '10',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary.main + '30',
  },
  groupIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupPreviewInfo: { flex: 1 },
  groupName: { fontSize: 18, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light },
  groupStatus: { fontSize: 13, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600] },
  groupDescription: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[100],
  },
  groupStat: { alignItems: 'center' },
  groupStatLabel: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginBottom: 2 },
  groupStatValue: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light },
  joinButton: {
    margin: Spacing.md,
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: { color: '#FFFFFF', fontSize: 16, fontFamily: Typography.fontFamily.semibold },
});
