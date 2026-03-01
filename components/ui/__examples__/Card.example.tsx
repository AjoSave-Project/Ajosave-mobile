/**
 * Card Component Usage Examples
 * 
 * Demonstrates various use cases of the Card component
 */

import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Card } from '../Card';

/**
 * Example 1: Default Card with shadow
 */
export const DefaultCard = () => (
  <Card>
    <Text>This is a default card with subtle shadow elevation</Text>
  </Card>
);

/**
 * Example 2: Outlined Card without shadow
 */
export const OutlinedCard = () => (
  <Card variant="outlined">
    <Text>This is an outlined card with border and no shadow</Text>
  </Card>
);

/**
 * Example 3: Elevated Card with larger shadow
 */
export const ElevatedCard = () => (
  <Card variant="elevated">
    <Text>This is an elevated card with prominent shadow</Text>
  </Card>
);

/**
 * Example 4: Card with Header
 */
export const CardWithHeader = () => (
  <Card
    header={
      <View>
        <Text style={styles.headerTitle}>Card Title</Text>
        <Text style={styles.headerSubtitle}>Subtitle text</Text>
      </View>
    }
  >
    <Text>Card content goes here</Text>
  </Card>
);

/**
 * Example 5: Card with Footer
 */
export const CardWithFooter = () => (
  <Card
    footer={
      <View style={styles.footerActions}>
        <Text style={styles.footerAction}>Cancel</Text>
        <Text style={styles.footerAction}>Confirm</Text>
      </View>
    }
  >
    <Text>Card content with footer actions</Text>
  </Card>
);

/**
 * Example 6: Card with Header and Footer
 */
export const CardWithHeaderAndFooter = () => (
  <Card
    header={<Text style={styles.headerTitle}>Complete Card</Text>}
    footer={<Text style={styles.footerText}>Footer information</Text>}
  >
    <Text>This card has both header and footer sections</Text>
  </Card>
);

/**
 * Example 7: Pressable Card with opacity feedback
 */
export const PressableCard = () => (
  <Card
    variant="default"
    onPress={() => console.log('Card pressed!')}
  >
    <Text>Tap this card to see opacity feedback</Text>
  </Card>
);

/**
 * Example 8: Pressable Elevated Card
 */
export const PressableElevatedCard = () => (
  <Card
    variant="elevated"
    onPress={() => console.log('Elevated card pressed!')}
    header={<Text style={styles.headerTitle}>Interactive Card</Text>}
  >
    <Text>This elevated card is pressable</Text>
  </Card>
);

/**
 * Example 9: Card with custom styling
 */
export const CustomStyledCard = () => (
  <Card
    variant="outlined"
    style={styles.customCard}
  >
    <Text>Card with custom margin and width</Text>
  </Card>
);

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  footerAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4169E1',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  customCard: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
});
