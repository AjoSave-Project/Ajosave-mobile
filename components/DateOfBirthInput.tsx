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
}

/**
 * Date of birth input with auto-formatting: YYYY-MM-DD
 * Automatically inserts dashes as the user types.
 */
export default function DateOfBirthInput({ value, onChangeText, error, editable = true }: Props) {
  const handleChange = (text: string) => {
    // Strip non-digits
    const digits = text.replace(/\D/g, '').slice(0, 8);

    // Format as YYYY-MM-DD
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length > 6) formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;

    onChangeText(formatted);
  };

  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        style={[styles.input, !!error && styles.inputError]}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={Colors.neutral[500]}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={10}
        editable={editable}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[400], marginLeft: Spacing.md },
  input: { backgroundColor: '#FFFFFF', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: 8, fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light, borderWidth: 1, borderColor: Colors.neutral[200] },
  inputError: { borderColor: '#ef4444' },
  error: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: '#ef4444', marginLeft: Spacing.xs },
});
