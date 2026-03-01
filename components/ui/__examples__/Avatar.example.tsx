/**
 * Avatar Component Usage Examples
 * 
 * Demonstrates various use cases of the Avatar component
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar } from '../Avatar';

/**
 * Example 1: Small Avatar with initials
 */
export const SmallAvatarWithInitials = () => (
  <Avatar 
    initials="JD"
    size="small"
  />
);

/**
 * Example 2: Medium Avatar with initials (default size)
 */
export const MediumAvatarWithInitials = () => (
  <Avatar 
    initials="AS"
    size="medium"
  />
);

/**
 * Example 3: Large Avatar with initials
 */
export const LargeAvatarWithInitials = () => (
  <Avatar 
    initials="MK"
    size="large"
  />
);

/**
 * Example 4: Avatar with image URI
 */
export const AvatarWithImage = () => (
  <Avatar 
    imageUri="https://i.pravatar.cc/150?img=1"
    size="medium"
  />
);

/**
 * Example 5: Avatar with custom size (80px)
 */
export const AvatarWithCustomSize = () => (
  <Avatar 
    initials="XY"
    size={80}
  />
);

/**
 * Example 6: Avatar with border
 */
export const AvatarWithBorder = () => (
  <Avatar 
    initials="AB"
    size="large"
    borderColor="#4169E1"
    borderWidth={3}
  />
);

/**
 * Example 7: Avatar with image and border
 */
export const AvatarWithImageAndBorder = () => (
  <Avatar 
    imageUri="https://i.pravatar.cc/150?img=2"
    size="large"
    borderColor="#10B981"
    borderWidth={2}
  />
);

/**
 * Example 8: Multiple avatars with different initials (showing color variation)
 */
export const MultipleAvatarsWithInitials = () => (
  <View style={styles.row}>
    <Avatar initials="JD" size="medium" style={styles.avatar} />
    <Avatar initials="AS" size="medium" style={styles.avatar} />
    <Avatar initials="MK" size="medium" style={styles.avatar} />
    <Avatar initials="LB" size="medium" style={styles.avatar} />
    <Avatar initials="TC" size="medium" style={styles.avatar} />
  </View>
);

/**
 * Example 9: Avatar sizes comparison
 */
export const AvatarSizesComparison = () => (
  <View style={styles.row}>
    <Avatar initials="SM" size="small" style={styles.avatar} />
    <Avatar initials="MD" size="medium" style={styles.avatar} />
    <Avatar initials="LG" size="large" style={styles.avatar} />
    <Avatar initials="XL" size={96} style={styles.avatar} />
  </View>
);

/**
 * Example 10: Avatar with fallback (image fails, shows initials)
 */
export const AvatarWithFallback = () => (
  <Avatar 
    imageUri="https://invalid-url.com/image.jpg"
    initials="FB"
    size="large"
  />
);

/**
 * Example 11: Avatar with custom styling
 */
export const AvatarWithCustomStyle = () => (
  <Avatar 
    initials="CS"
    size="large"
    style={styles.customAvatar}
  />
);

/**
 * Example 12: Avatar group (transaction list use case)
 */
export const AvatarGroup = () => (
  <View style={styles.row}>
    <Avatar 
      imageUri="https://i.pravatar.cc/150?img=3"
      size="small"
      style={styles.avatarGroupItem}
    />
    <Avatar 
      initials="JD"
      size="small"
      style={styles.avatarGroupItem}
    />
    <Avatar 
      imageUri="https://i.pravatar.cc/150?img=4"
      size="small"
      style={styles.avatarGroupItem}
    />
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  avatar: {
    marginRight: 12,
    marginBottom: 12,
  },
  avatarGroupItem: {
    marginRight: -8, // Overlap avatars slightly
  },
  customAvatar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
});
