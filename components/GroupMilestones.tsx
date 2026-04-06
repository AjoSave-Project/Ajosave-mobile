import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

interface Milestone {
  title: string;
  description: string;
  completed: boolean;
  icon: any;
}

interface GroupMilestonesProps {
  currentTurn: number;
  maxMembers: number;
  membersJoined: number;
  status: string;
}

/**
 * Visual milestone tracker for group progress
 */
export default function GroupMilestones({
  currentTurn,
  maxMembers,
  membersJoined,
  status,
}: GroupMilestonesProps) {
  const milestones: Milestone[] = [
    {
      title: 'Group Created',
      description: 'Group has been set up',
      completed: true,
      icon: 'checkmark-circle',
    },
    {
      title: 'Members Joined',
      description: `${membersJoined}/${maxMembers} members`,
      completed: membersJoined >= maxMembers,
      icon: 'people',
    },
    {
      title: 'Group Started',
      description: 'First contribution made',
      completed: status === 'active' || status === 'completed',
      icon: 'play-circle',
    },
    {
      title: 'Halfway Point',
      description: `${Math.floor(maxMembers / 2)} turns completed`,
      completed: currentTurn >= Math.floor(maxMembers / 2),
      icon: 'trending-up',
    },
    {
      title: 'Group Completed',
      description: 'All members received payout',
      completed: status === 'completed',
      icon: 'trophy',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Milestones</Text>
      <View style={styles.timeline}>
        {milestones.map((milestone, index) => (
          <View key={index} style={styles.milestoneRow}>
            {/* Timeline Line */}
            <View style={styles.timelineColumn}>
              <View
                style={[
                  styles.milestoneIcon,
                  milestone.completed && styles.milestoneIconCompleted,
                ]}
              >
                <Ionicons
                  name={milestone.icon}
                  size={18}
                  color={milestone.completed ? '#fff' : Colors.neutral[400]}
                />
              </View>
              {index < milestones.length - 1 && (
                <View
                  style={[
                    styles.timelineLine,
                    milestone.completed && styles.timelineLineCompleted,
                  ]}
                />
              )}
            </View>

            {/* Content */}
            <View style={styles.milestoneContent}>
              <Text
                style={[
                  styles.milestoneTitle,
                  milestone.completed && styles.milestoneTitleCompleted,
                ]}
              >
                {milestone.title}
              </Text>
              <Text style={styles.milestoneDescription}>
                {milestone.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  title: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    marginBottom: Spacing.md,
  },
  timeline: {
    gap: 0,
  },
  milestoneRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 32,
  },
  milestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral[200],
  },
  milestoneIconCompleted: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.neutral[200],
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: Colors.primary.main,
  },
  milestoneContent: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  milestoneTitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.neutral[500],
    marginBottom: 2,
  },
  milestoneTitleCompleted: {
    color: Colors.text.primary.light,
  },
  milestoneDescription: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[400],
  },
});
