import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { formatCurrency } from '@/utils/formatting';

interface GroupPreviewCardProps {
  name: string;
  contributionAmount: string;
  frequency: string;
  maxMembers: string;
  duration: string;
  payoutOrder: string;
}

/**
 * Preview card showing group summary during creation
 */
export default function GroupPreviewCard({
  name,
  contributionAmount,
  frequency,
  maxMembers,
  duration,
  payoutOrder,
}: GroupPreviewCardProps) {
  const amount = parseFloat(contributionAmount) || 0;
  const members = parseInt(maxMembers) || 0;
  const totalPayout = amount * members;
  const durationMonths = parseInt(duration) || 0;

  const getPayoutOrderLabel = (order: string) => {
    switch (order) {
      case 'random': return 'Random Selection';
      case 'firstCome': return 'First Come, First Served';
      case 'bidding': return 'Bidding System';
      default: return 'Not set';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="eye-outline" size={18} color={Colors.primary.main} />
        <Text style={styles.headerText}>Group Preview</Text>
      </View>

      <View style={styles.content}>
        {/* Group Name */}
        {name && (
          <View style={styles.section}>
            <Text style={styles.groupName}>{name}</Text>
          </View>
        )}

        {/* Key Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <View style={styles.statIcon}>
              <Ionicons name="cash-outline" size={20} color={Colors.primary.main} />
            </View>
            <Text style={styles.statValue}>{formatCurrency(amount)}</Text>
            <Text style={styles.statLabel}>Per {frequency || 'contribution'}</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statIcon}>
              <Ionicons name="people-outline" size={20} color={Colors.primary.main} />
            </View>
            <Text style={styles.statValue}>{members || '0'}</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>

          <View style={styles.statBox}>
            <View style={styles.statIcon}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary.main} />
            </View>
            <Text style={styles.statValue}>{durationMonths || '0'}</Text>
            <Text style={styles.statLabel}>Months</Text>
          </View>
        </View>

        {/* Payout Info */}
        {totalPayout > 0 && (
          <View style={styles.payoutCard}>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Total Payout</Text>
              <Text style={styles.payoutValue}>{formatCurrency(totalPayout)}</Text>
            </View>
            {payoutOrder && (
              <View style={styles.payoutRow}>
                <Text style={styles.payoutLabel}>Payout Order</Text>
                <Text style={styles.payoutMethod}>{getPayoutOrderLabel(payoutOrder)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={16} color={Colors.primary.main} />
          <Text style={styles.infoText}>
            Each member contributes {formatCurrency(amount)} {frequency.toLowerCase()} and receives {formatCurrency(totalPayout)} when it's their turn
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary.main + '30',
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary.main + '10',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary.main + '20',
  },
  headerText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary.main,
  },
  content: {
    padding: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  groupName: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.neutral[100],
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[500],
    textAlign: 'center',
  },
  payoutCard: {
    backgroundColor: Colors.primary.main + '08',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutLabel: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
  payoutValue: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
  },
  payoutMethod: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.primary.main + '08',
    padding: Spacing.sm,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.main,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    lineHeight: 16,
  },
});
