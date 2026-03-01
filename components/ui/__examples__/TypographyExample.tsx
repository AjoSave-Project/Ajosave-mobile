/**
 * Typography Component Examples
 * 
 * Demonstrates usage of Heading and Text components with various props.
 * This file serves as both documentation and a visual test.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Heading, Text } from '../Typography';

export function TypographyExample() {
  return (
    <View style={styles.container}>
      {/* Heading Examples */}
      <View style={styles.section}>
        <Heading variant="h1">H1 Heading - Page Title</Heading>
        <Heading variant="h2" color="secondary">H2 Heading - Section</Heading>
        <Heading variant="h3" weight="semibold">H3 Heading - Subsection</Heading>
        <Heading variant="h4" align="center">H4 Heading - Minor</Heading>
      </View>

      {/* Text Examples */}
      <View style={styles.section}>
        <Text variant="body">Body text - Standard paragraph content</Text>
        <Text variant="caption" color="secondary">Caption text - Secondary information</Text>
        <Text variant="label" weight="bold">LABEL TEXT - Form labels</Text>
      </View>

      {/* Color Variants */}
      <View style={styles.section}>
        <Text variant="body" color="primary">Primary color text</Text>
        <Text variant="body" color="success">Success color text</Text>
        <Text variant="body" color="error">Error color text</Text>
        <Text variant="body" color="warning">Warning color text</Text>
      </View>

      {/* Weight Variants */}
      <View style={styles.section}>
        <Text variant="body" weight="regular">Regular weight</Text>
        <Text variant="body" weight="medium">Medium weight</Text>
        <Text variant="body" weight="semibold">Semibold weight</Text>
        <Text variant="body" weight="bold">Bold weight</Text>
      </View>

      {/* Alignment Options */}
      <View style={styles.section}>
        <Text variant="body" align="left">Left aligned text</Text>
        <Text variant="body" align="center">Center aligned text</Text>
        <Text variant="body" align="right">Right aligned text</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
});
