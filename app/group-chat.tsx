import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageType = 'text' | 'system';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  senderName: string;
  messageType: MessageType;
  createdAt: string;
  readBy: { userId: string; readAt: string }[];
  reactions: { emoji: string; users: string[] }[];
  isEdited: boolean;
  isDeleted: boolean;
}

// ─── Mock data (replace with real API calls) ──────────────────────────────────

const MOCK_CURRENT_USER_ID = 'user_001';

const MOCK_MESSAGES: Message[] = [
  {
    _id: 'm1',
    content: 'Welcome to the group chat! 🎉',
    sender: { _id: 'system', firstName: 'System', lastName: '' },
    senderName: 'System',
    messageType: 'system',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    readBy: [],
    reactions: [],
    isEdited: false,
    isDeleted: false,
  },
  {
    _id: 'm2',
    content: 'Hey everyone! Excited to start saving together 💪',
    sender: { _id: 'user_002', firstName: 'Amaka', lastName: 'Obi' },
    senderName: 'Amaka Obi',
    messageType: 'text',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    readBy: [{ userId: MOCK_CURRENT_USER_ID, readAt: new Date().toISOString() }],
    reactions: [{ emoji: '🔥', users: [MOCK_CURRENT_USER_ID] }],
    isEdited: false,
    isDeleted: false,
  },
  {
    _id: 'm3',
    content: 'When is the first contribution due?',
    sender: { _id: 'user_003', firstName: 'Chidi', lastName: 'Nwosu' },
    senderName: 'Chidi Nwosu',
    messageType: 'text',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    readBy: [],
    reactions: [],
    isEdited: false,
    isDeleted: false,
  },
  {
    _id: 'm4',
    content: 'First contribution is due next Monday. Make sure your wallet is funded!',
    sender: { _id: MOCK_CURRENT_USER_ID, firstName: 'You', lastName: '' },
    senderName: 'You',
    messageType: 'text',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    readBy: [
      { userId: 'user_002', readAt: new Date().toISOString() },
      { userId: 'user_003', readAt: new Date().toISOString() },
    ],
    reactions: [{ emoji: '👍', users: ['user_002', 'user_003'] }],
    isEdited: false,
    isDeleted: false,
  },
  {
    _id: 'm5',
    content: 'Amaka Obi made a contribution of ₦25,000',
    sender: { _id: 'system', firstName: 'System', lastName: '' },
    senderName: 'System',
    messageType: 'system',
    createdAt: new Date(Date.now() - 600000).toISOString(),
    readBy: [],
    reactions: [],
    isEdited: false,
    isDeleted: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDateDivider(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function shouldShowDateDivider(messages: Message[], index: number): boolean {
  if (index === 0) return true;
  const curr = new Date(messages[index].createdAt).toDateString();
  const prev = new Date(messages[index - 1].createdAt).toDateString();
  return curr !== prev;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Deterministic avatar color from name
const AVATAR_COLORS = ['#3d71d9', '#7c3aed', '#059669', '#d97706', '#dc2626', '#0891b2'];
function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DateDivider({ label }: { label: string }) {
  return (
    <View style={styles.dateDivider}>
      <View style={styles.dateDividerLine} />
      <Text style={styles.dateDividerText}>{label}</Text>
      <View style={styles.dateDividerLine} />
    </View>
  );
}

function SystemMessage({ content }: { content: string }) {
  return (
    <View style={styles.systemMsgWrapper}>
      <View style={styles.systemMsgBubble}>
        <Ionicons name="information-circle-outline" size={13} color={Colors.primary.main} />
        <Text style={styles.systemMsgText}>{content}</Text>
      </View>
    </View>
  );
}

function ReactionPill({ emoji, count }: { emoji: string; count: number }) {
  return (
    <View style={styles.reactionPill}>
      <Text style={styles.reactionEmoji}>{emoji}</Text>
      <Text style={styles.reactionCount}>{count}</Text>
    </View>
  );
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}) {
  const totalReaders = message.readBy.length;

  return (
    <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
      {/* Avatar (other users only) */}
      {!isOwn && (
        <View style={styles.avatarSlot}>
          {showAvatar ? (
            <View style={[styles.avatar, { backgroundColor: getAvatarColor(message.senderName) }]}>
              <Text style={styles.avatarText}>{getInitials(message.senderName)}</Text>
            </View>
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
      )}

      <View style={[styles.bubbleContent, isOwn && styles.bubbleContentOwn]}>
        {/* Sender name (other users, only when avatar shown) */}
        {!isOwn && showAvatar && (
          <Text style={[styles.senderName, { color: getAvatarColor(message.senderName) }]}>
            {message.senderName}
          </Text>
        )}

        {/* Bubble */}
        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>
            {message.content}
          </Text>

          {/* Time + read receipt */}
          <View style={styles.bubbleMeta}>
            {message.isEdited && (
              <Text style={[styles.editedLabel, isOwn && { color: 'rgba(255,255,255,0.6)' }]}>
                edited
              </Text>
            )}
            <Text style={[styles.bubbleTime, isOwn && styles.bubbleTimeOwn]}>
              {formatTime(message.createdAt)}
            </Text>
            {isOwn && (
              <Ionicons
                name={totalReaders > 0 ? 'checkmark-done' : 'checkmark'}
                size={13}
                color={totalReaders > 0 ? '#93c5fd' : 'rgba(255,255,255,0.6)'}
                style={{ marginLeft: 2 }}
              />
            )}
          </View>
        </View>

        {/* Reactions */}
        {message.reactions.length > 0 && (
          <View style={[styles.reactionsRow, isOwn && styles.reactionsRowOwn]}>
            {message.reactions.map(r => (
              <ReactionPill key={r.emoji} emoji={r.emoji} count={r.users.length} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function GroupChatScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const groupName = name || 'Group Chat';
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [membersOnline] = useState(3); // placeholder

  const flatListRef = useRef<FlatList>(null);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    const newMsg: Message = {
      _id: `m_${Date.now()}`,
      content: text,
      sender: { _id: MOCK_CURRENT_USER_ID, firstName: 'You', lastName: '' },
      senderName: 'You',
      messageType: 'text',
      createdAt: new Date().toISOString(),
      readBy: [],
      reactions: [],
      isEdited: false,
      isDeleted: false,
    };

    setInputText('');
    setMessages(prev => [...prev, newMsg]);

    // Scroll to bottom
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    // TODO: replace with real API call
    // setIsSending(true);
    // try { await chatService.sendMessage(id, text); }
    // catch (e) { /* handle error */ }
    // finally { setIsSending(false); }
  }, [inputText, isSending, id]);

  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwn = item.sender._id === MOCK_CURRENT_USER_ID;
      const showDivider = shouldShowDateDivider(messages, index);
      const showAvatar =
        !isOwn &&
        (index === 0 ||
          messages[index - 1].sender._id !== item.sender._id ||
          messages[index - 1].messageType === 'system');

      return (
        <>
          {showDivider && <DateDivider label={formatDateDivider(item.createdAt)} />}
          {item.messageType === 'system' ? (
            <SystemMessage content={item.content} />
          ) : (
            <MessageBubble message={item} isOwn={isOwn} showAvatar={showAvatar} />
          )}
        </>
      );
    },
    [messages]
  );

  return (
    <KeyboardAvoidingView
      style={styles.safeArea}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : -(StatusBar.currentHeight || 0)}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary.light} />
        </Pressable>

        <Pressable
          style={styles.headerCenter}
          onPress={() => router.push(`/group-details?id=${id}` as any)}
        >
          <View style={styles.headerAvatar}>
            <Ionicons name="people" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {groupName}
            </Text>
            <Text style={styles.headerSubtitle}>{membersOnline} members online</Text>
          </View>
        </Pressable>

        <Pressable
          style={styles.iconBtn}
          onPress={() => router.push(`/group-details?id=${id}` as any)}
        >
          <Ionicons name="information-circle-outline" size={24} color={Colors.primary.main} />
        </Pressable>
      </View>

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={renderItem}
          contentContainerStyle={[styles.messageList, { flexGrow: 1 }]}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />

        {/* ── Input Bar ───────────────────────────────────────────────── */}
        <View style={styles.inputBar}>
          <Pressable style={styles.attachBtn}>
            <Ionicons name="add-circle-outline" size={26} color={Colors.neutral[400]} />
          </Pressable>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message…"
              placeholderTextColor={Colors.neutral[400]}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={5000}
              returnKeyType="default"
            />
          </View>

          <Pressable
            style={[
              styles.sendBtn,
              (!inputText.trim() || isSending) && styles.sendBtnDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={18} color="#fff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Safe area for bottom inset */}
      <SafeAreaView style={{ backgroundColor: '#fff' }} edges={['bottom']} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background.light },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral[200],
    gap: Spacing.xs,
  },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
  },
  headerSubtitle: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[500],
  },

  // Message list
  messageList: {
    paddingHorizontal: Spacing.sm,
    paddingTop: 0,
    paddingBottom: Spacing.md,
    gap: 2,
  },

  // Date divider
  dateDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
    gap: Spacing.sm,
  },
  dateDividerLine: { flex: 1, height: 1, backgroundColor: Colors.neutral[200] },
  dateDividerText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.neutral[400],
    paddingHorizontal: Spacing.xs,
  },

  // System message
  systemMsgWrapper: { alignItems: 'center', marginVertical: Spacing.xs },
  systemMsgBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary.main + '15',
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: 20,
  },
  systemMsgText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.primary.main,
  },

  // Bubble row
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 2,
    gap: Spacing.xs,
  },
  bubbleRowOwn: { flexDirection: 'row-reverse' },

  // Avatar
  avatarSlot: { width: 32, alignItems: 'center' },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.bold,
    color: '#fff',
  },
  avatarPlaceholder: { width: 30, height: 30 },

  // Bubble content
  bubbleContent: { maxWidth: '75%', gap: 3 },
  bubbleContentOwn: { alignItems: 'flex-end' },

  senderName: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.semibold,
    marginLeft: 4,
    marginBottom: 1,
  },

  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 3,
  },
  bubbleOwn: {
    backgroundColor: Colors.primary.main,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  bubbleText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.primary.light,
    lineHeight: 20,
  },
  bubbleTextOwn: { color: '#fff' },

  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 1,
  },
  editedLabel: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[400],
    fontStyle: 'italic',
  },
  bubbleTime: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[400],
  },
  bubbleTimeOwn: { color: 'rgba(255,255,255,0.7)' },

  // Reactions
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginLeft: 4,
  },
  reactionsRowOwn: { justifyContent: 'flex-end', marginLeft: 0, marginRight: 4 },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  reactionEmoji: { fontSize: 13 },
  reactionCount: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.neutral[600],
  },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: Colors.neutral[200],
    gap: Spacing.xs,
  },
  attachBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.background.light,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    minHeight: 42,
    maxHeight: 120,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.text.primary.light,
    padding: 0,
    margin: 0,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.neutral[300] },
});
