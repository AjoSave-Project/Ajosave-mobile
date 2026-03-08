import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useWallet } from '@/contexts/WalletContext';
import { useGroups } from '@/contexts/GroupsContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatCurrency, formatDate } from '@/utils/formatting';

export default function HomeScreen() {
  const { wallet, transactions, isLoading, error, fetchWallet, fetchTransactions, refreshWallet } = useWallet();
  const { groups, fetchGroups, refreshGroups } = useGroups();
  const [refreshing, setRefreshing] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);

  useEffect(() => {
    fetchWallet();
    fetchTransactions({ limit: 5 });
    fetchGroups();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([refreshWallet(), refreshGroups()]);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const recentTransactions = Array.isArray(transactions) ? transactions.slice(0, 5) : [];
  const groupsArray = Array.isArray(groups) ? groups : [];
  const activeGroups = groupsArray.filter(g => g.status === 'active');
  const pendingGroups = groupsArray.filter(g => g.status === 'pending');

  // Upcoming contributions: active groups with nextContribution within 7 days
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingGroups = activeGroups
    .filter(g => g.nextContribution && new Date(g.nextContribution) <= sevenDaysFromNow)
    .sort((a, b) => new Date(a.nextContribution!).getTime() - new Date(b.nextContribution!).getTime())
    .slice(0, 3);

  const nextPayout = activeGroups
    .filter(g => g.nextPayout)
    .sort((a, b) => new Date(a.nextPayout!).getTime() - new Date(b.nextPayout!).getTime())[0];

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payout': return Colors.success?.main || '#22c55e';
      case 'contribution': return Colors.error?.main || '#ef4444';
      default: return Colors.neutral[600];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'completed': return Colors.primary.main;
      default: return Colors.neutral[500];
    }
  };

  const quickActions = [
    { icon: 'people-outline', label: 'Create Group', onPress: () => router.push('/create-group') },
    { icon: 'enter-outline', label: 'Join Group', onPress: () => router.push('/join-group') },
    { icon: 'card-outline', label: 'Make Payment', onPress: () => router.push('/(tabs)/pay') },
    { icon: 'wallet-outline', label: 'Wallet', onPress: () => router.push('/(tabs)/wallet') },
    { icon: 'business-outline', label: 'Add Bank', onPress: () => router.push('/add-bank-account') },
    { icon: 'grid-outline', label: 'My Groups', onPress: () => router.push('/(tabs)/groups') },
    { icon: 'list-outline', label: 'Transactions', onPress: () => router.push('/(tabs)/wallet') },
    { icon: 'trending-up-outline', label: 'Analytics', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceCardTop}>
            <View style={styles.balanceCardLeft}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <View style={styles.balanceRow}>
                {isLoading && !wallet ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.balanceAmount}>
                    {balanceVisible ? formatCurrency(wallet?.totalBalance ?? 0) : '₦ *****'}
                  </Text>
                )}
                <Pressable onPress={() => setBalanceVisible(!balanceVisible)} style={styles.eyeButton}>
                  <Ionicons name={balanceVisible ? 'eye-outline' : 'eye-off-outline'} size={20} color="rgba(255,255,255,0.8)" />
                </Pressable>
              </View>
            </View>
            <View style={styles.balanceCardRight}>
              <Text style={styles.activeGroupsLabel}>Active Groups</Text>
              <Text style={styles.activeGroupsCount}>{activeGroups.length}</Text>
              {pendingGroups.length > 0 && (
                <Text style={styles.pendingGroupsText}>{pendingGroups.length} pending</Text>
              )}
            </View>
          </View>

          {/* 4-stat grid */}
          <View style={styles.balanceStats}>
            {[
              { label: 'Available', value: wallet?.availableBalance ?? 0 },
              { label: 'Locked', value: wallet?.lockedBalance ?? 0 },
              { label: 'Contributed', value: wallet?.totalContributions ?? 0 },
              { label: 'Received', value: wallet?.totalPayouts ?? 0 },
            ].map((stat, i) => (
              <View key={stat.label} style={[styles.balanceStat, i % 2 === 0 && styles.balanceStatLeft]}>
                <Text style={styles.balanceStatLabel}>{stat.label}</Text>
                <Text style={styles.balanceStatValue}>
                  {balanceVisible ? formatCurrency(stat.value) : '*****'}
                </Text>
              </View>
            ))}
          </View>

          {/* Next payout row */}
          {nextPayout && (
            <View style={styles.nextPayoutRow}>
              <View>
                <Text style={styles.nextPayoutLabel}>Next Payout</Text>
                <Text style={styles.nextPayoutDate}>{formatDate(nextPayout.nextPayout!)}</Text>
                <Text style={styles.nextPayoutGroup}>{nextPayout.name}</Text>
              </View>
              <View style={styles.nextPayoutRight}>
                <Text style={styles.nextPayoutLabel}>Amount</Text>
                <Text style={styles.nextPayoutAmount}>
                  {formatCurrency(nextPayout.contributionAmount * nextPayout.maxMembers)}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Upcoming Contributions Alert */}
        {upcomingGroups.length > 0 && (
          <View style={styles.upcomingAlert}>
            <View style={styles.upcomingAlertHeader}>
              <Ionicons name="alarm-outline" size={18} color="#92400e" />
              <Text style={styles.upcomingAlertTitle}>Upcoming Contributions</Text>
            </View>
            {upcomingGroups.map(g => (
              <View key={g._id} style={styles.upcomingAlertRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upcomingGroupName}>{g.name}</Text>
                  <Text style={styles.upcomingGroupMeta}>
                    {formatCurrency(g.contributionAmount)} · Due {formatDate(g.nextContribution!)}
                  </Text>
                </View>
                <Pressable onPress={() => router.push('/(tabs)/pay')} style={styles.upcomingPayBtn}>
                  <Text style={styles.upcomingPayBtnText}>Pay</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Error Banner */}
        {error && !isLoading && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => { fetchWallet(); fetchTransactions({ limit: 5 }); }} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((action) => (
              <Pressable key={action.label} style={styles.actionButton} onPress={action.onPress}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name={action.icon as any} size={22} color={Colors.primary.main} />
                </View>
                <Text style={styles.actionButtonText}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* My Groups */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Groups</Text>
            <Pressable onPress={() => router.push('/(tabs)/groups')}>
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          </View>

          {groupsArray.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="people-outline" size={36} color={Colors.neutral[400]} />
              <Text style={styles.emptyText}>No groups yet</Text>
              <View style={styles.emptyActions}>
                <Pressable style={styles.emptyBtn} onPress={() => router.push('/create-group')}>
                  <Text style={styles.emptyBtnText}>Create</Text>
                </Pressable>
                <Pressable style={[styles.emptyBtn, styles.emptyBtnOutline]} onPress={() => router.push('/join-group')}>
                  <Text style={[styles.emptyBtnText, styles.emptyBtnOutlineText]}>Join</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.list}>
              {groupsArray.slice(0, 3).map((group) => (
                <Pressable
                  key={group._id}
                  style={styles.groupCard}
                  onPress={() => router.push(`/group-details?id=${group._id}`)}
                >
                  <View style={styles.groupIconWrap}>
                    <Ionicons name="people" size={22} color={Colors.primary.main} />
                  </View>
                  <View style={styles.groupInfo}>
                    <Text style={styles.groupName}>{group.name}</Text>
                    <Text style={styles.groupMeta}>
                      {group.members?.length ?? 0}/{group.maxMembers} members · {formatCurrency(group.contributionAmount)}/{group.frequency}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(group.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(group.status) }]}>
                      {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <Pressable onPress={() => router.push('/(tabs)/wallet')}>
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          </View>

          {isLoading && recentTransactions.length === 0 ? (
            <ActivityIndicator color={Colors.primary.main} style={{ paddingVertical: Spacing.xl }} />
          ) : recentTransactions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={36} color={Colors.neutral[400]} />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {recentTransactions.map((tx) => (
                <View key={tx._id} style={styles.txItem}>
                  <View style={[styles.txIcon, { backgroundColor: getTransactionColor(tx.type) + '20' }]}>
                    <Ionicons
                      name={tx.type === 'payout' ? 'arrow-down' : 'arrow-up'}
                      size={18}
                      color={getTransactionColor(tx.type)}
                    />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txType}>{tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}</Text>
                    <Text style={styles.txDate}>{formatDate(tx.createdAt)}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: getTransactionColor(tx.type) }]}>
                    {tx.type === 'payout' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </Text>
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
  safeArea: { flex: 1, backgroundColor: Colors.background.light },
  scrollView: { flex: 1 },

  // Balance Card
  balanceCard: {
    backgroundColor: Colors.primary.main,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: 20,
  },
  balanceCardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.md },
  balanceCardLeft: { flex: 1 },
  balanceCardRight: { alignItems: 'flex-end' },
  balanceLabel: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  balanceAmount: { fontSize: 28, fontFamily: Typography.fontFamily.bold, color: '#FFFFFF' },
  eyeButton: { padding: 4 },
  activeGroupsLabel: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  activeGroupsCount: { fontSize: 28, fontFamily: Typography.fontFamily.bold, color: '#FFFFFF', textAlign: 'right' },
  pendingGroupsText: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.6)', textAlign: 'right' },
  balanceStats: { flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: Spacing.md, gap: 0 },
  balanceStat: { width: '50%', paddingVertical: 4, paddingRight: Spacing.sm },
  balanceStatLeft: { paddingRight: Spacing.md },
  balanceStatLabel: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  balanceStatValue: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: '#FFFFFF' },
  nextPayoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  nextPayoutLabel: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.7)', marginBottom: 2 },
  nextPayoutDate: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: '#FFFFFF' },
  nextPayoutGroup: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: 'rgba(255,255,255,0.7)' },
  nextPayoutRight: { alignItems: 'flex-end' },
  nextPayoutAmount: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: '#FFFFFF' },

  // Upcoming alert
  upcomingAlert: {
    backgroundColor: '#fffbeb',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  upcomingAlertHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.sm },
  upcomingAlertTitle: { fontSize: 14, fontFamily: Typography.fontFamily.bold, color: '#92400e' },
  upcomingAlertRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#fde68a',
  },
  upcomingGroupName: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: '#78350f' },
  upcomingGroupMeta: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: '#92400e', marginTop: 2 },
  upcomingPayBtn: {
    backgroundColor: '#f59e0b', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8,
  },
  upcomingPayBtnText: { fontSize: 12, fontFamily: Typography.fontFamily.semibold, color: '#fff' },

  // Error
  errorBanner: {
    backgroundColor: '#fef2f2', marginHorizontal: Spacing.lg, marginBottom: Spacing.md,
    padding: Spacing.md, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#ef4444',
  },
  errorText: { flex: 1, fontSize: 13, color: '#ef4444', fontFamily: Typography.fontFamily.regular },
  retryButton: { marginLeft: Spacing.sm },
  retryText: { fontSize: 13, color: Colors.primary.main, fontFamily: Typography.fontFamily.semibold },

  // Sections
  section: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: 17, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, marginBottom: Spacing.md },
  viewAllText: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: Colors.primary.main },

  // Quick Actions
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  actionButton: {
    width: '23%',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.md,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  actionButtonText: { fontSize: 10, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light, textAlign: 'center' },

  // Groups
  list: { gap: Spacing.sm },
  groupCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    padding: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.neutral[200],
  },
  groupIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary.main + '15',
    justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md,
  },
  groupInfo: { flex: 1 },
  groupName: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light },
  groupMeta: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginTop: 2 },
  statusBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: Typography.fontFamily.semibold },

  // Transactions
  txItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    padding: Spacing.md, borderRadius: 12, borderWidth: 1, borderColor: Colors.neutral[200],
  },
  txIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
  txInfo: { flex: 1 },
  txType: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light },
  txDate: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500] },
  txAmount: { fontSize: 14, fontFamily: Typography.fontFamily.bold },

  // Empty states
  emptyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: Colors.neutral[200],
    padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm,
  },
  emptyText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500] },
  emptyActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  emptyBtn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: 8, backgroundColor: Colors.primary.main },
  emptyBtnOutline: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.primary.main },
  emptyBtnText: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: '#FFFFFF' },
  emptyBtnOutlineText: { color: Colors.primary.main },
});
