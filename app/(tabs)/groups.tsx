import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl, TextInput } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useGroups } from '@/contexts';
import { Ionicons } from '@expo/vector-icons';

/**
 * Groups Screen
 * 
 * Displays user's savings groups with:
 * - Search functionality
 * - Filter tabs (All, Active, Completed)
 * - Create/Join group actions
 * - Group cards with details
 */
export default function GroupsScreen() {
  const { groups, refreshGroups } = useGroups();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshGroups();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Filter groups based on tab and search
  const filteredGroups = Array.isArray(groups) ? groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'active' && group.status === 'active') ||
      (activeTab === 'completed' && group.status === 'completed');
    return matchesSearch && matchesTab;
  }) : [];

  const groupsArray = Array.isArray(groups) ? groups : [];
  const activeCount = groupsArray.filter(g => g.status === 'active').length;
  const completedCount = groupsArray.filter(g => g.status === 'completed').length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name='search' style={styles.searchIcon}></Ionicons>
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabs}>
        <Pressable 
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All ({groupsArray.length})
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active ({activeCount})
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.tab, activeTab === 'completed' && styles.tabActive]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}>
            Completed ({completedCount})
          </Text>
        </Pressable>
      </View>

      {/* Groups List */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people" style={styles.emptyStateIcon}></Ionicons>
            <Text style={styles.emptyStateTitle}>No groups found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try a different search term' : 'Create or join a group to get started'}
            </Text>
          </View>
        ) : (
          <View style={styles.groupsList}>
            {filteredGroups.map((group) => (
              <Pressable 
                key={group.id}
                style={styles.groupCard}
                onPress={() => router.push(`/groups/${group.id}`)}
              >
                <View style={styles.groupHeader}>
                  <View style={styles.groupIcon}>
                    <Ionicons name='people' style={styles.groupIconText}></Ionicons>
                  </View>
                  <View style={styles.groupBadge}>
                    <Text style={styles.groupBadgeText}>
                      {group.status === 'active' ? '🟢 Active' : '✅ Completed'}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.groupDescription} numberOfLines={2}>
                  {group.description}
                </Text>
                
                <View style={styles.groupStats}>
                  <View style={styles.groupStat}>
                    <Text style={styles.groupStatLabel}>Members</Text>
                    <Text style={styles.groupStatValue}>
                      {group.currentMembers}/{group.maxMembers}
                    </Text>
                  </View>
                  <View style={styles.groupStat}>
                    <Text style={styles.groupStatLabel}>Contribution</Text>
                    <Text style={styles.groupStatValue}>
                      ₦{group.contributionAmount.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.groupStat}>
                    <Text style={styles.groupStatLabel}>Frequency</Text>
                    <Text style={styles.groupStatValue}>
                      {group.contributionFrequency}
                    </Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <Pressable 
          style={[styles.fab, styles.fabSecondary]}
          onPress={() => {/* TODO: Open join group modal */}}
        >
          <Ionicons name='search' style={styles.fabIcon}></Ionicons>
        </Pressable>
        <Pressable 
          style={styles.fab}
          onPress={() => {/* TODO: Open create group modal */}}
        >
          <Ionicons name='add' style={styles.fabIcon}></Ionicons>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  searchIcon: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.regular,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  tabActive: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.neutral[600],
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  groupsList: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  groupCard: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupIconText: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.regular,
  },
  groupBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: Colors.success.light + '20',
  },
  groupBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.success.dark,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    marginBottom: Spacing.xs,
  },
  groupDescription: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    marginBottom: Spacing.md,
  },
  groupStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
  },
  groupStat: {
    alignItems: 'center',
  },
  groupStatLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    marginBottom: 4,
  },
  groupStatValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  emptyStateIcon: {
    fontSize: 64,
    fontFamily: Typography.fontFamily.regular,
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: Spacing.lg,
    right: Spacing.lg,
    gap: Spacing.sm,
  },
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
  fabSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  fabIcon: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.regular,
  },
});
