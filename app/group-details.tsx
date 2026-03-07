import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  RefreshControl, ActivityIndicator, Share,
  Alert, Clipboard,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useGroups } from '@/contexts/GroupsContext';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionService, Transaction } from '@/services/transactionService';
import { formatCurrency, formatDate } from '@/utils/formatting';

type Tab = 'overview' | 'members' | 'history';

export default function GroupDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedGroup, isLoading, error, fetchGroupDetails } = useGroups();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [groupTransactions, setGroupTransactions] = useState<Transaction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchGroupDetails(id);
  }, [id]);

  const loadHistory = useCallback(async () => {
    if (!id) return;
    try {
      setLoadingHistory(true);
      setHistoryError(null);
      const response = await TransactionService.getTransactions({ groupId: id });
      setGroupTransactions(response.transactions);
    } catch (err: any) {
      setHistoryError(err?.message || 'Failed to load history');
    } finally {
      setLoadingHistory(false);
    }
  }, [id]);

  // Load history when tab becomes active
  useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, loadHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    try { if (id) await fetchGroupDetails(id); }
    catch (err) { console.error('Refresh error:', err); }
    finally { setRefreshing(false); }
  };

  const group = selectedGroup;
  const isAdmin = group?.admin === user?._id;

  const handleShare = async () => {
    if (!group?.invitationCode) return;
    try {
      await Share.share({
        message: `Join my AjoSave group "${group.name}"!\n\nUse invitation code: ${group.invitationCode}`,
      });
    } catch (err) { console.error('Share error:', err); }
  };

  const handleCopyCode = () => {
    if (!group?.invitationCode) return;
    Clipboard.setString(group.invitationCode);
    Alert.alert('Copied', 'Invitation code copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'completed': return Colors.primary.main;
      case 'pending': return '#f59e0b';
      default: return Colors.neutral[500];
    }
  };

  const getMemberStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return { bg: '#dcfce7', text: '#16a34a' };
      case 'current': return { bg: '#dbeafe', text: '#2563eb' };
      case 'missed': return { bg: '#fee2e2', text: '#dc2626' };
      default: return { bg: '#fef9c3', text: '#ca8a04' };
    }
  };

  // ── Loading / Error states ──────────────────────────────────────────────────
  if (isLoading && !group) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary.light} />
          </Pressable>
          <Text style={styles.headerTitle}>Group Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !group) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary.light} />
          </Pressable>
          <Text style={styles.headerTitle}>Group Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => id && fetchGroupDetails(id)}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const progress = group ? Math.round(((group.currentTurn ?? 0) / group.maxMembers) * 100) : 0;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary.light} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{group?.name || 'Group Details'}</Text>
        <Pressable onPress={handleShare} style={styles.iconBtn}>
          <Ionicons name="share-outline" size={22} color={Colors.primary.main} />
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {group && (
          <>
            {/* ── Hero Card ─────────────────────────────────────────────── */}
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.groupAvatar}>
                  <Ionicons name="people" size={28} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.badge, { backgroundColor: getStatusColor(group.status) + '20' }]}>
                      <View style={[styles.dot, { backgroundColor: getStatusColor(group.status) }]} />
                      <Text style={[styles.badgeText, { color: getStatusColor(group.status) }]}>
                        {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                      </Text>
                    </View>
                    {group.credibilityScore !== undefined && (
                      <View style={[styles.badge, { backgroundColor: '#dcfce7' }]}>
                        <Text style={[styles.badgeText, { color: '#16a34a' }]}>
                          {group.credibilityScore}% Credible
                        </Text>
                      </View>
                    )}
                    {isAdmin && (
                      <View style={[styles.badge, { backgroundColor: '#dbeafe' }]}>
                        <Text style={[styles.badgeText, { color: '#2563eb' }]}>Admin</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {group.description ? (
                <Text style={styles.description}>{group.description}</Text>
              ) : null}

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{formatCurrency(group.contributionAmount)}</Text>
                  <Text style={styles.statLbl}>Contribution</Text>
                </View>
                <View style={[styles.statBox, styles.statBorder]}>
                  <Text style={styles.statVal}>{group.frequency}</Text>
                  <Text style={styles.statLbl}>Frequency</Text>
                </View>
                <View style={[styles.statBox, styles.statBorder]}>
                  <Text style={styles.statVal}>
                    {(group.members?.length ?? 0)}/{group.maxMembers}
                  </Text>
                  <Text style={styles.statLbl}>Members</Text>
                </View>
                <View style={[styles.statBox, styles.statBorder]}>
                  <Text style={styles.statVal}>{formatCurrency(group.totalPool ?? 0)}</Text>
                  <Text style={styles.statLbl}>Total Pool</Text>
                </View>
              </View>
            </View>

            {/* ── Invitation Code ───────────────────────────────────────── */}
            <View style={styles.inviteCard}>
              <Text style={styles.inviteLabel}>Invitation Code</Text>
              <View style={styles.inviteRow}>
                <Text style={styles.inviteCode}>{group.invitationCode}</Text>
                <View style={styles.inviteActions}>
                  <Pressable style={styles.inviteBtn} onPress={handleCopyCode}>
                    <Ionicons name="copy-outline" size={16} color={Colors.primary.main} />
                  </Pressable>
                  <Pressable style={[styles.inviteBtn, styles.inviteBtnFill]} onPress={handleShare}>
                    <Ionicons name="share-social-outline" size={16} color="#fff" />
                    <Text style={styles.inviteBtnText}>Share</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* ── Tabs ──────────────────────────────────────────────────── */}
            <View style={styles.tabBar}>
              {(['overview', 'members', 'history'] as Tab[]).map(tab => (
                <Pressable
                  key={tab}
                  style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
                  onPress={() => setActiveTab(tab)}
                >
                  <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* ── Overview Tab ──────────────────────────────────────────── */}
            {activeTab === 'overview' && (
              <View style={styles.tabContent}>
                {/* Group Details */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Group Details</Text>
                  {[
                    { label: 'Admin', value: typeof group.admin === 'object' ? `${(group.admin as any).firstName} ${(group.admin as any).lastName}` : 'N/A' },
                    { label: 'Start Date', value: group.startDate ? formatDate(group.startDate) : 'Not started' },
                    { label: 'Duration', value: `${group.duration} months` },
                    { label: 'Payout Order', value: group.payoutOrder ? group.payoutOrder.charAt(0).toUpperCase() + group.payoutOrder.slice(1) : 'N/A' },
                    { label: 'Current Turn', value: `${group.currentTurn ?? 0} of ${group.maxMembers}` },
                    ...(group.nextContribution ? [{ label: 'Next Contribution', value: formatDate(group.nextContribution) }] : []),
                    ...(group.nextPayout ? [{ label: 'Next Payout', value: formatDate(group.nextPayout) }] : []),
                  ].map((row, i, arr) => (
                    <View key={row.label} style={[styles.detailRow, i < arr.length - 1 && styles.detailRowBorder]}>
                      <Text style={styles.detailLabel}>{row.label}</Text>
                      <Text style={styles.detailValue}>{row.value}</Text>
                    </View>
                  ))}
                </View>

                {/* Cycle Progress */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Cycle Progress</Text>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Completed Turns</Text>
                    <Text style={styles.progressLabel}>{group.currentTurn ?? 0} of {group.maxMembers}</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progress}%` as any }]} />
                  </View>
                  <Text style={styles.progressSub}>
                    {group.maxMembers - (group.currentTurn ?? 0)} turns remaining
                  </Text>
                </View>

                {/* Quick Actions */}
                {group.status === 'active' && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Quick Actions</Text>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => router.push('/pay' as any)}
                    >
                      <Ionicons name="cash-outline" size={18} color="#fff" />
                      <Text style={styles.actionBtnText}>Make Contribution</Text>
                    </Pressable>
                    {isAdmin && (
                      <Pressable style={[styles.actionBtn, styles.actionBtnOutline]}>
                        <Ionicons name="arrow-forward-circle-outline" size={18} color={Colors.primary.main} />
                        <Text style={[styles.actionBtnText, { color: Colors.primary.main }]}>Process Payout</Text>
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            )}

            {/* ── Members Tab ───────────────────────────────────────────── */}
            {activeTab === 'members' && (
              <View style={styles.tabContent}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>
                    Members ({group.membersList?.length ?? group.members?.length ?? 0})
                  </Text>
                  {(group.membersList && group.membersList.length > 0
                    ? group.membersList
                    : (group.members ?? []).map((m: any) => ({
                        userId: m._id || m,
                        name: m.firstName ? `${m.firstName} ${m.lastName}` : m.name || 'Unknown',
                        role: m.role || 'Member',
                        status: m.status || 'pending',
                        turns: m.turns ?? 0,
                        contributionsMade: m.contributionsMade ?? 0,
                        missedContributions: m.missedContributions ?? 0,
                        joinDate: m.joinDate || m.createdAt,
                      }))
                  ).map((member: any, index: number) => {
                    const sc = getMemberStatusColor(member.status);
                    return (
                      <View key={member.userId || index} style={[styles.memberRow, index > 0 && styles.memberRowBorder]}>
                        <View style={styles.memberAvatar}>
                          <Text style={styles.memberAvatarText}>
                            {(member.name || 'U').charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.memberNameRow}>
                            <Text style={styles.memberName}>{member.name}</Text>
                            {member.role === 'Admin' || member.role === 'admin' ? (
                              <View style={[styles.badge, { backgroundColor: '#dbeafe' }]}>
                                <Text style={[styles.badgeText, { color: '#2563eb' }]}>👑 Admin</Text>
                              </View>
                            ) : null}
                          </View>
                          {member.joinDate ? (
                            <Text style={styles.memberSub}>Joined {formatDate(member.joinDate)}</Text>
                          ) : null}
                          <View style={styles.memberStats}>
                            <Text style={styles.memberStatText}>Turns: {member.turns ?? 0}</Text>
                            <Text style={styles.memberStatDot}>·</Text>
                            <Text style={styles.memberStatText}>Contributions: {member.contributionsMade ?? 0}</Text>
                            {(member.missedContributions ?? 0) > 0 && (
                              <>
                                <Text style={styles.memberStatDot}>·</Text>
                                <Text style={[styles.memberStatText, { color: '#dc2626' }]}>
                                  Missed: {member.missedContributions}
                                </Text>
                              </>
                            )}
                          </View>
                        </View>
                        <View style={[styles.memberStatusBadge, { backgroundColor: sc.bg }]}>
                          <Text style={[styles.memberStatusText, { color: sc.text }]}>
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── History Tab ───────────────────────────────────────────── */}
            {activeTab === 'history' && (
              <View style={styles.tabContent}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Transaction History</Text>

                  {loadingHistory ? (
                    <ActivityIndicator color={Colors.primary.main} style={{ paddingVertical: Spacing.xl }} />
                  ) : historyError ? (
                    <View style={styles.historyEmpty}>
                      <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                      <Text style={[styles.historyEmptyTitle, { color: '#ef4444' }]}>Failed to load</Text>
                      <Text style={styles.historyEmptyText}>{historyError}</Text>
                      <Pressable style={styles.retryBtn} onPress={loadHistory}>
                        <Text style={styles.retryText}>Retry</Text>
                      </Pressable>
                    </View>
                  ) : groupTransactions.length === 0 ? (
                    <View style={styles.historyEmpty}>
                      <Ionicons name="calendar-outline" size={48} color={Colors.neutral[300]} />
                      <Text style={styles.historyEmptyTitle}>No transactions yet</Text>
                      <Text style={styles.historyEmptyText}>
                        Contributions and payouts for this group will appear here
                      </Text>
                    </View>
                  ) : (
                    <View style={{ gap: 0 }}>
                      {groupTransactions.map((tx, index) => {
                        const isCredit = tx.type === 'payout';
                        const color = tx.type === 'contribution' ? '#f59e0b'
                          : tx.type === 'payout' ? '#22c55e'
                          : '#ef4444';
                        const icon: any = tx.type === 'contribution' ? 'arrow-up-circle-outline'
                          : tx.type === 'payout' ? 'arrow-down-circle-outline'
                          : 'cash-outline';
                        return (
                          <View
                            key={tx._id}
                            style={[styles.historyRow, index > 0 && styles.historyRowBorder]}
                          >
                            <View style={[styles.historyIcon, { backgroundColor: color + '20' }]}>
                              <Ionicons name={icon} size={20} color={color} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.historyType}>
                                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                              </Text>
                              {tx.description ? (
                                <Text style={styles.historyDesc} numberOfLines={1}>{tx.description}</Text>
                              ) : null}
                              <Text style={styles.historyDate}>{formatDate(tx.createdAt)}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                              <Text style={[styles.historyAmount, { color }]}>
                                {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                              </Text>
                              <View style={[
                                styles.statusBadge,
                                tx.status === 'completed' && { backgroundColor: '#dcfce7' },
                                tx.status === 'pending' && { backgroundColor: '#fef9c3' },
                                tx.status === 'failed' && { backgroundColor: '#fee2e2' },
                              ]}>
                                <Text style={styles.statusBadgeText}>{tx.status}</Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background.light },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md, padding: Spacing.xl },
  errorText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: '#ef4444', textAlign: 'center' },
  retryBtn: { backgroundColor: Colors.primary.main, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xl, borderRadius: 8 },
  retryText: { color: '#fff', fontSize: 14, fontFamily: Typography.fontFamily.semibold },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.base, paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.neutral[200], backgroundColor: '#fff',
  },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    flex: 1, fontSize: 17, fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light, textAlign: 'center',
  },

  // Hero card
  heroCard: {
    backgroundColor: '#fff', margin: Spacing.base, borderRadius: 16,
    padding: Spacing.base, borderWidth: 1, borderColor: Colors.neutral[200],
  },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.sm },
  groupAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primary.main, justifyContent: 'center', alignItems: 'center',
  },
  groupName: { fontSize: 18, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, marginBottom: 4 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontFamily: Typography.fontFamily.semibold },
  description: { fontSize: 13, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600], marginBottom: Spacing.md, lineHeight: 18 },

  // Stats row
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: Colors.neutral[100], marginTop: Spacing.sm, paddingTop: Spacing.sm },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: Spacing.xs },
  statBorder: { borderLeftWidth: 1, borderLeftColor: Colors.neutral[100] },
  statVal: { fontSize: 13, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, marginBottom: 2 },
  statLbl: { fontSize: 10, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500] },

  // Invite card
  inviteCard: {
    backgroundColor: Colors.primary.main + '10', marginHorizontal: Spacing.base,
    marginBottom: Spacing.base, borderRadius: 12, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.primary.main + '30',
  },
  inviteLabel: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: Colors.primary.main, marginBottom: 6 },
  inviteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inviteCode: { fontSize: 26, fontFamily: Typography.fontFamily.bold, color: Colors.primary.main, letterSpacing: 4 },
  inviteActions: { flexDirection: 'row', gap: 8 },
  inviteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.primary.main,
    paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8,
  },
  inviteBtnFill: { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main },
  inviteBtnText: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: '#fff' },

  // Tabs
  tabBar: {
    flexDirection: 'row', marginHorizontal: Spacing.base, marginBottom: Spacing.sm,
    backgroundColor: '#fff', borderRadius: 10, padding: 4,
    borderWidth: 1, borderColor: Colors.neutral[200],
  },
  tabItem: { flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  tabItemActive: { backgroundColor: Colors.primary.main },
  tabText: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.neutral[500] },
  tabTextActive: { color: '#fff' },
  tabContent: { paddingHorizontal: Spacing.base, gap: Spacing.md },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: Spacing.base,
    borderWidth: 1, borderColor: Colors.neutral[200], gap: 0,
  },
  cardTitle: { fontSize: 15, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, marginBottom: Spacing.sm },

  // Detail rows
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.neutral[100] },
  detailLabel: { fontSize: 13, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500] },
  detailValue: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light },

  // Progress
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500] },
  progressTrack: { height: 10, backgroundColor: Colors.neutral[200], borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: 10, backgroundColor: Colors.primary.main, borderRadius: 5 },
  progressSub: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500] },

  // Action buttons
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: Colors.primary.main, paddingVertical: 12, borderRadius: 12, marginTop: 8,
  },
  actionBtnOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary.main },
  actionBtnText: { fontSize: 15, fontFamily: Typography.fontFamily.semibold, color: '#fff' },

  // Members
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10 },
  memberRowBorder: { borderTopWidth: 1, borderTopColor: Colors.neutral[100] },
  memberAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary.main + '20', justifyContent: 'center', alignItems: 'center',
  },
  memberAvatarText: { fontSize: 16, fontFamily: Typography.fontFamily.bold, color: Colors.primary.main },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  memberName: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light },
  memberSub: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginBottom: 2 },
  memberStats: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  memberStatText: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500] },
  memberStatDot: { fontSize: 11, color: Colors.neutral[400] },
  memberStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  memberStatusText: { fontSize: 11, fontFamily: Typography.fontFamily.semibold },

  // History empty state
  historyEmpty: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  historyEmptyTitle: { fontSize: 15, fontFamily: Typography.fontFamily.semibold, color: Colors.neutral[500] },
  historyEmptyText: { fontSize: 13, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[400], textAlign: 'center', lineHeight: 18 },

  // History transaction rows
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 10 },
  historyRowBorder: { borderTopWidth: 1, borderTopColor: Colors.neutral[100] },
  historyIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  historyType: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light, marginBottom: 1 },
  historyDesc: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginBottom: 1 },
  historyDate: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[400] },
  historyAmount: { fontSize: 14, fontFamily: Typography.fontFamily.bold, marginBottom: 3 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontFamily: Typography.fontFamily.semibold, textTransform: 'capitalize', color: Colors.neutral[700] },
});
