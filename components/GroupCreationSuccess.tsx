import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { formatCurrency } from '@/utils/formatting';

interface GroupCreationSuccessProps {
  groupName: string;
  invitationCode: string;
  contributionAmount: number;
  maxMembers: number;
  frequency: string;
  onViewGroup: () => void;
  onGoToGroups: () => void;
}

/**
 * Success modal shown after group creation with key information and next steps
 */
export default function GroupCreationSuccess({
  groupName,
  invitationCode,
  contributionAmount,
  maxMembers,
  frequency,
  onViewGroup,
  onGoToGroups,
}: GroupCreationSuccessProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎉 Join my AjoSave group "${groupName}"!\n\n💰 Contribution: ${formatCurrency(contributionAmount)}\n📅 Frequency: ${frequency}\n👥 Max Members: ${maxMembers}\n\n🔑 Invitation Code: ${invitationCode}\n\nDownload AjoSave and use this code to join!`,
      });
    } catch (err) {
      console.error('Share error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark" size={48} color="#fff" />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Group Created!</Text>
        <Text style={styles.subtitle}>Your savings group is ready</Text>

        {/* Group Info */}
        <View style={styles.infoCard}>
          <Text style={styles.groupName}>{groupName}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{formatCurrency(contributionAmount)}</Text>
              <Text style={styles.statLabel}>Per {frequency}</Text>
            </View>
            <View style={[styles.stat, styles.statBorder]}>
              <Text style={styles.statValue}>{maxMembers}</Text>
              <Text style={styles.statLabel}>Max Members</Text>
            </View>
          </View>
        </View>

        {/* Invitation Code */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Share this code to invite members</Text>
          <Text style={styles.code}>{invitationCode}</Text>
          <Pressable style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-social" size={18} color="#fff" />
            <Text style={styles.shareButtonText}>Share Invitation</Text>
          </Pressable>
        </View>

        {/* Next Steps */}
        <View style={styles.nextSteps}>
          <Text style={styles.nextStepsTitle}>Next Steps:</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>Share the invitation code with members</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>Wait for members to join</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>Group starts when all members join</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={styles.primaryButton} onPress={onViewGroup}>
            <Text style={styles.primaryButtonText}>View Group</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onGoToGroups}>
            <Text style={styles.secondaryButtonText}>Go to Groups</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[500],
    marginBottom: Spacing.lg,
  },
  infoCard: {
    width: '100%',
    backgroundColor: Colors.primary.main + '10',
    borderRadius: 16,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary.main + '30',
  },
  groupName: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.primary.main + '30',
  },
  statValue: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
  codeCard: {
    width: '100%',
    backgroundColor: Colors.primary.main,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  codeLabel: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  code: {
    fontSize: 32,
    fontFamily: Typography.fontFamily.bold,
    color: '#fff',
    letterSpacing: 6,
    marginBottom: Spacing.md,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  shareButtonText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.semibold,
    color: '#fff',
  },
  nextSteps: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  nextStepsTitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    marginBottom: Spacing.sm,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary.main + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
  actions: {
    width: '100%',
    gap: Spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: '#fff',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary.main,
  },
});
