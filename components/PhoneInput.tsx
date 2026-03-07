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
 * Nigerian phone input with +234 prefix.
 * Stores and emits the full number (e.g. +2348012345678).
 * Displays only the local part after the prefix.
 */
export default function PhoneInput({ value, onChangeText, error, editable = true }: Props) {
  // Strip +234 or leading 0 to get the local digits shown in the input
  const localPart = value.startsWith('+234')
    ? value.slice(4)
    : value.startsWith('0')
    ? value.slice(1)
    : value;

  const handleChange = (text: string) => {
    // Only digits, max 10
    const digits = text.replace(/\D/g, '').slice(0, 10);
    onChangeText(digits ? `+234${digits}` : '');
  };

  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>Phone Number</Text>
      <View style={[styles.container, !!error && styles.containerError]}>
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>🇳🇬 +234</Text>
        </View>
        <View style={styles.divider} />
        <TextInput
          style={styles.input}
          placeholder="8012345678"
          placeholderTextColor={Colors.neutral[500]}
          value={localPart}
          onChangeText={handleChange}
          keyboardType="number-pad"
          maxLength={10}
          editable={editable}
        />
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[400], marginLeft: Spacing.md },
  container: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: Colors.neutral[200] },
  containerError: { borderColor: '#ef4444' },
  prefix: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  prefixText: { fontSize: 15, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light },
  divider: { width: 1, height: '60%', backgroundColor: Colors.neutral[200] },
  input: { flex: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light },
  error: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: '#ef4444', marginLeft: Spacing.xs },
});
