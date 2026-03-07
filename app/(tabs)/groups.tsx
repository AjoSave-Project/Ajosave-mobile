import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useGroups } from '@/contexts/GroupsContext';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency, formatDate } from '@/utils/formatting';

/**
 * Groups Screen
 * 
 * Displays user's savings groups with create/join actions
 */
export default function GroupsScreen() {
  const { groups, isLoading, error, fetchGroups, refreshGroups } = useGroups();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    fetchGroups();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshGroups();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const groupsArray = Array.isArray(groups) ? groups : [];

  const filteredGroups = groupsArray.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && group.status === 'active') ||
      (activeTab === 'completed' && group.status === 'completed');
    return matchesSearch && matchesTab;
  });

  const activeCount = groupsArray.filter(g => g.status === 'active').length;
  const completedCount = groupsArray.filter(g => g.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'completed': return Colors.primary.main;
      case 'pending': return '#f59e0b';
      default: return Colors.neutral[500];
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.neutral[500]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          placeholderTextColor={Colors.neutral[500]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabs}>
        {[
          { key: 'all', label: `All (${groupsArray.length})` },
          { key: 'active', label: `Active (${activeCount})` },
          { key: 'completed', label: `Completed (${completedCount})` },
        ].map(tab => (
          <Pressable
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Error Banner */}
      {error && !isLoading && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={fetchGroups} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Groups List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {isLoading && groupsArray.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary.main} />
          </View>
        ) : filteredGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color={Colors.neutral[400]} />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? 'No groups found' : 'No groups yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try a different search term' : 'Create or join a group to get started'}
            </Text>
            {!searchQuery && (
              <View style={styles.emptyActions}>
                <Pressable style={styles.emptyActionButton} onPress={() => router.push('/create-group')}>
                  <Text style={styles.emptyActionText}>Create Group</Text>
                </Pressable>
                <Pressable style={[styles.emptyActionButton, styles.emptyActionButtonSecondary]} onPress={() => router.push('/join-group')}>
                  <Text style={[styles.emptyActionText, styles.emptyActionTextSecondary]}>Join Group</Text>
                </Pressable>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.groupsList}>
            {filteredGroups.map((group) => (
              <Pressable
                key={group._id}
                style={styles.groupCard}
                onPress={() => router.push(`/group-details?id=${group._id}`)}
              >
                <View style={styles.groupHeader}>
                  <View style={styles.groupIcon}>
                    <Ionicons name="people" size={24} color={Colors.primary.main} />
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(group.status) + '20' }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(group.status) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(group.status) }]}>
                      {group.status.charAt(0).toUpperCase() + group.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.groupName}>{group.name}</Text>
                {group.description && (
                  <Text style={styles.groupDescription} numberOfLines={2}>{group.description}</Text>
                )}

                <View style={styles.groupStats}>
                  <View style={styles.groupStat}>
                    <Text style={styles.groupStatLabel}>Members</Text>
                    <Text style={styles.groupStatValue}>
                      {group.members?.length ?? 0}/{group.maxMembers}
                    </Text>
                  </View>
                  <View style={styles.groupStat}>
                    <Text style={styles.groupStatLabel}>Contribution</Text>
                    <Text style={styles.groupStatValue}>{formatCurrency(group.contributionAmount)}</Text>
                  </View>
                  <View style={styles.groupStat}>
                    <Text style={styles.groupStatLabel}>Frequency</Text>
                    <Text style={styles.groupStatValue}>{group.frequency}</Text>
                  </View>
                </View>

                {group.status === 'active' && group.nextContribution && (
                  <View style={styles.nextContribution}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.neutral[500]} />
                    <Text style={styles.nextContributionText}>
                      Next: {formatDate(group.nextContribution)}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <Pressable style={[styles.fab, styles.fabSecondary]} onPress={() => router.push('/join-group')}>
          <Ionicons name="search" size={22} color={Colors.primary.main} />
        </Pressable>
        <Pressable style={styles.fab} onPress={() => router.push('/create-group')}>
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background.light, paddingTop: 10},
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: { flex: 1, paddingVertical: Spacing.md, fontSize: 16, fontFamily: Typography.fontFamily.regular, color: Colors.text.primary.light },
  tabs: { flexDirection: 'row', paddingHorizontal: Spacing.lg, gap: Spacing.sm, marginBottom: Spacing.md },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  tabActive: { backgroundColor: Colors.primary.main, borderColor: Colors.primary.main },
  tabText: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: Colors.neutral[600] },
  tabTextActive: { color: '#FFFFFF' },
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
  scrollView: { flex: 1 },
  loadingContainer: { paddingVertical: Spacing.xl * 3, alignItems: 'center' },
  groupsList: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: 100 },
  groupCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontFamily: Typography.fontFamily.semibold },
  groupName: { fontSize: 18, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, marginBottom: Spacing.xs },
  groupDescription: { fontSize: 13, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600], marginBottom: Spacing.md },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  groupStat: { alignItems: 'center' },
  groupStatLabel: { fontSize: 11, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500], marginBottom: 2 },
  groupStatValue: { fontSize: 13, fontFamily: Typography.fontFamily.semibold, color: Colors.text.primary.light },
  nextContribution: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[100],
  },
  nextContributionText: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[500] },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xl * 2, paddingHorizontal: Spacing.lg },
  emptyStateTitle: { fontSize: 20, fontFamily: Typography.fontFamily.bold, color: Colors.text.primary.light, marginTop: Spacing.md, marginBottom: Spacing.sm },
  emptyStateText: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[600], textAlign: 'center', marginBottom: Spacing.xl },
  emptyActions: { flexDirection: 'row', gap: Spacing.md },
  emptyActionButton: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, borderRadius: 12, backgroundColor: Colors.primary.main },
  emptyActionButtonSecondary: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: Colors.primary.main },
  emptyActionText: { fontSize: 14, fontFamily: Typography.fontFamily.semibold, color: '#FFFFFF' },
  emptyActionTextSecondary: { color: Colors.primary.main },
  fabContainer: { position: 'absolute', bottom: Spacing.lg, right: Spacing.lg, gap: Spacing.sm },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabSecondary: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: Colors.primary.main },
});
