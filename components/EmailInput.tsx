import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

interface Props {
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  editable?: boolean;
  placeholder?: string;
}

/**
 * Email input component with validation styling.
 * 
 * Features:
 * - Email keyboard type
 * - Automatic lowercase conversion
 * - Error state styling
 * - Consistent design with other inputs
 */
export default function EmailInput({ 
  value, 
  onChangeText, 
  error, 
  editable = true, 
  placeholder = "Enter your email address" 
}: Props) {
  const handleChange = (text: string) => {
    // Convert to lowercase and trim whitespace
    const cleanText = text.toLowerCase().trim();
    onChangeText(cleanText);
  };

  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>Email Address</Text>
      <View style={[styles.container, !!error && styles.containerError]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={Colors.neutral[500]}
          value={value}
          onChangeText={handleChange}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={editable}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { 
    fontSize: 14, 
    fontFamily: Typography.fontFamily.regular, 
    color: Colors.neutral[700], 
    marginLeft: Spacing.md 
  },
  container: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: Colors.neutral[200] 
  },
  containerError: { 
    borderColor: '#ef4444' 
  },
  input: { 
    flex: 1, 
    paddingVertical: Spacing.md, 
    paddingHorizontal: Spacing.md, 
    fontSize: 16, 
    fontFamily: Typography.fontFamily.medium, 
    color: Colors.text.primary.light 
  },
  error: { 
    fontSize: 12, 
    fontFamily: Typography.fontFamily.regular, 
    color: '#ef4444', 
    marginLeft: Spacing.xs 
  },
});