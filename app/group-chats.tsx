import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { useGroups } from '@/contexts/GroupsContext';
import { Group } from '@/services/groupService';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Deterministic avatar color from name
const AVATAR_COLORS = ['#3d71d9', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

// Placeholder last-message preview (will come from API later)
const PREVIEW_MESSAGES: Record<string, { text: string; time: string; unread: number }> = {};

function getPreview(group: Group) {
  if (PREVIEW_MESSAGES[group._id]) return PREVIEW_MESSAGES[group._id];
  // Fallback placeholder based on group status
  const statusText: Record<string, string> = {
    active: 'Group is active — tap to chat',
    pending: 'Waiting for members to join…',
    completed: 'This group has completed its cycle',
    cancelled: 'This group was cancelled',
  };
  return {
    text: statusText[group.status] ?? 'No messages yet',
    time: '',
    unread: 0,
  };
}

function getStatusDot(status: string): string {
  switch (status) {
    case 'active': return '#22c55e';
    case 'pending': return '#f59e0b';
    case 'completed': return Colors.primary.main;
    default: return Colors.neutral[400];
  }
}

// ─── Row component ────────────────────────────────────────────────────────────

function GroupChatRow({ group }: { group: Group }) {
  const preview = getPreview(group);
  const avatarColor = getAvatarColor(group.name);

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() =>
        router.push(
          `/group-chat?id=${group._id}&name=${encodeURIComponent(group.name)}` as any
        )
      }
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.avatarText}>{getInitials(group.name)}</Text>
        {/* Status dot */}
        <View style={[styles.statusDot, { backgroundColor: getStatusDot(group.status) }]} />
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <View style={styles.rowTop}>
          <Text style={styles.groupName} numberOfLines={1}>
            {group.name}
          </Text>
          <View style={styles.rowMeta}>
            {preview.time ? (
              <Text style={styles.timeText}>{preview.time}</Text>
            ) : null}
            {preview.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {preview.unread > 99 ? '99+' : preview.unread}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.rowBottom}>
          <Text style={styles.previewText} numberOfLines={1}>
            {preview.text}
          </Text>
          <View style={styles.memberPill}>
            <Ionicons name="people-outline" size={11} color={Colors.neutral[500]} />
            <Text style={styles.memberCount}>
              {group.members?.length ?? 0}/{group.maxMembers}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={Colors.neutral[300]} />
    </Pressable>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function GroupChatsScreen() {
  const { groups, isLoading, fetchGroups, refreshGroups } = useGroups();
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshGroups();
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = (Array.isArray(groups) ? groups : []).filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  // Sort: active first, then pending, then others
  const sorted = [...filtered].sort((a, b) => {
    const order = { active: 0, pending: 1, completed: 2, cancelled: 3 };
    return (order[a.status] ?? 9) - (order[b.status] ?? 9);
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary.light} />
        </Pressable>
        <Text style={styles.headerTitle}>Group Chats</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.neutral[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search groups…"
          placeholderTextColor={Colors.neutral[400]}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.neutral[400]} />
          </Pressable>
        )}
      </View>

      {/* List */}
      {isLoading && groups.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary.main} />
        </View>
      ) : sorted.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="chatbubbles-outline" size={56} color={Colors.neutral[300]} />
          <Text style={styles.emptyTitle}>
            {search ? 'No groups match your search' : 'No group chats yet'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {search
              ? 'Try a different name'
              : 'Create or join a group to start chatting'}
          </Text>
          {!search && (
            <View style={styles.emptyActions}>
              <Pressable
                style={styles.emptyBtn}
                onPress={() => router.push('/create-group')}
              >
                <Ionicons name="add-outline" size={16} color="#fff" />
                <Text style={styles.emptyBtnText}>Create Group</Text>
              </Pressable>
              <Pressable
                style={[styles.emptyBtn, styles.emptyBtnOutline]}
                onPress={() => router.push('/join-group')}
              >
                <Ionicons name="enter-outline" size={16} color={Colors.primary.main} />
                <Text style={[styles.emptyBtnText, { color: Colors.primary.main }]}>
                  Join Group
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={item => item._id}
          renderItem={({ item }) => <GroupChatRow group={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.primary.main}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
  },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    fontSize: 17,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.sm,
    backgroundColor: Colors.background.light,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.primary.light,
    padding: 0,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[500],
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 10,
  },
  emptyBtnOutline: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: Colors.primary.main,
  },
  emptyBtnText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.semibold,
    color: '#fff',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: '#fff',
    gap: Spacing.md,
  },
  rowPressed: { backgroundColor: Colors.background.light },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: '#fff',
  },
  statusDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },

  rowContent: { flex: 1, gap: 3 },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupName: {
    flex: 1,
    fontSize: 15,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
    marginRight: Spacing.sm,
  },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[400],
  },
  unreadBadge: {
    backgroundColor: Colors.primary.main,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
    color: '#fff',
  },

  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  previewText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[500],
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.background.light,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  memberCount: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[500],
  },

  separator: {
    height: 1,
    backgroundColor: Colors.neutral[100],
    marginLeft: 50 + Spacing.base + Spacing.md, // align with text, skip avatar
  },
});
