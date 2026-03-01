/**
 * Badge Component Usage Examples
 * 
 * Demonstrates various use cases of the Badge component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Badge } from '../Badge';

/**
 * Example 1: Success badge
 */
export const SuccessBadge = () => (
  <Badge variant="success">Active</Badge>
);

/**
 * Example 2: Error badge
 */
export const ErrorBadge = () => (
  <Badge variant="error">Failed</Badge>
);

/**
 * Example 3: Warning badge
 */
export const WarningBadge = () => (
  <Badge variant="warning">Pending</Badge>
);

/**
 * Example 4: Info badge
 */
export const InfoBadge = () => (
  <Badge variant="info">New</Badge>
);

/**
 * Example 5: Neutral badge (default)
 */
export const NeutralBadge = () => (
  <Badge variant="neutral">Draft</Badge>
);

/**
 * Example 6: Small success badge
 */
export const SmallSuccessBadge = () => (
  <Badge variant="success" size="small">Paid</Badge>
);

/**
 * Example 7: Small error badge
 */
export const SmallErrorBadge = () => (
  <Badge variant="error" size="small">Unpaid</Badge>
);

/**
 * Example 8: Medium badges (default size)
 */
export const MediumBadges = () => (
  <View style={styles.row}>
    <Badge variant="success" style={styles.badge}>Completed</Badge>
    <Badge variant="error" style={styles.badge}>Cancelled</Badge>
    <Badge variant="warning" style={styles.badge}>In Progress</Badge>
  </View>
);

/**
 * Example 9: Dot variant for minimal status indication
 */
export const DotBadges = () => (
  <View style={styles.row}>
    <Badge variant="success" dot style={styles.badge} />
    <Badge variant="error" dot style={styles.badge} />
    <Badge variant="warning" dot style={styles.badge} />
    <Badge variant="info" dot style={styles.badge} />
    <Badge variant="neutral" dot style={styles.badge} />
  </View>
);

/**
 * Example 10: Small dot badges
 */
export const SmallDotBadges = () => (
  <View style={styles.row}>
    <Badge variant="success" dot size="small" style={styles.badge} />
    <Badge variant="error" dot size="small" style={styles.badge} />
    <Badge variant="warning" dot size="small" style={styles.badge} />
    <Badge variant="info" dot size="small" style={styles.badge} />
    <Badge variant="neutral" dot size="small" style={styles.badge} />
  </View>
);

/**
 * Example 11: All badge variants comparison
 */
export const AllVariants = () => (
  <View style={styles.column}>
    <Badge variant="success" style={styles.badge}>Success</Badge>
    <Badge variant="error" style={styles.badge}>Error</Badge>
    <Badge variant="warning" style={styles.badge}>Warning</Badge>
    <Badge variant="info" style={styles.badge}>Info</Badge>
    <Badge variant="neutral" style={styles.badge}>Neutral</Badge>
  </View>
);

/**
 * Example 12: Size comparison
 */
export const SizeComparison = () => (
  <View style={styles.row}>
    <Badge variant="success" size="small" style={styles.badge}>Small</Badge>
    <Badge variant="success" size="medium" style={styles.badge}>Medium</Badge>
  </View>
);

/**
 * Example 13: Group status badges (use case)
 */
export const GroupStatusBadges = () => (
  <View style={styles.row}>
    <Badge variant="success" style={styles.badge}>Active</Badge>
    <Badge variant="neutral" style={styles.badge}>Completed</Badge>
    <Badge variant="error" style={styles.badge}>Cancelled</Badge>
  </View>
);

/**
 * Example 14: Transaction status badges (use case)
 */
export const TransactionStatusBadges = () => (
  <View style={styles.row}>
    <Badge variant="success" size="small" style={styles.badge}>Paid</Badge>
    <Badge variant="error" size="small" style={styles.badge}>Unpaid</Badge>
    <Badge variant="warning" size="small" style={styles.badge}>Pending</Badge>
  </View>
);

/**
 * Example 15: Badge with custom styling
 */
export const BadgeWithCustomStyle = () => (
  <Badge 
    variant="info" 
    style={styles.customBadge}
  >
    Custom
  </Badge>
);

/**
 * Example 16: Badges in a list context
 */
export const BadgesInList = () => (
  <View style={styles.column}>
    <View style={styles.listItem}>
      <Badge variant="success" size="small">Active</Badge>
    </View>
    <View style={styles.listItem}>
      <Badge variant="warning" size="small">Pending</Badge>
    </View>
    <View style={styles.listItem}>
      <Badge variant="error" size="small">Failed</Badge>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  column: {
    flexDirection: 'column',
  },
  badge: {
    marginRight: 8,
    marginBottom: 8,
  },
  customBadge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
});
