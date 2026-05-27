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
  const [localError, setLocalError] = React.useState<string>('');

  const validateDate = (dateStr: string): string | null => {
    // Only validate if we have a complete date
    if (dateStr.length !== 10) {
      return null;
    }

    const parts = dateStr.split('-');
    if (parts.length !== 3) {
      return 'Invalid date format';
    }

    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    // Check if values are numbers
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return 'Invalid date';
    }

    // Check month range
    if (month < 1 || month > 12) {
      return 'Month must be between 01 and 12';
    }

    // Check day range
    if (day < 1 || day > 31) {
      return 'Day must be between 01 and 31';
    }

    // Check if date is valid (e.g., not Feb 30)
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return 'Invalid date (e.g., Feb 30 doesn\'t exist)';
    }

    // Check if user is at least 18 years old
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );

    if (date > eighteenYearsAgo) {
      return 'You must be at least 18 years old';
    }

    // Check if date is not in the future
    if (date > today) {
      return 'Date cannot be in the future';
    }

    // Check if user is not older than 90 years
    const ninetyYearsAgo = new Date(
      today.getFullYear() - 90,
      today.getMonth(),
      today.getDate()
    );

    if (date < ninetyYearsAgo) {
      return 'Please enter a valid birth year';
    }

    // Check if date is reasonable (not too old, e.g., before 1900)
    if (year < 1900) {
      return 'Please enter a valid birth year';
    }

    return null;
  };

  const handleChange = (text: string) => {
    // Strip non-digits
    const digits = text.replace(/\D/g, '').slice(0, 8);

    // Format as YYYY-MM-DD
    let formatted = digits;
    if (digits.length > 4) formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length > 6) formatted = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;

    onChangeText(formatted);

    // Validate if complete
    if (formatted.length === 10) {
      const validationError = validateDate(formatted);
      setLocalError(validationError || '');
    } else {
      setLocalError('');
    }
  };

  // Show either the prop error or local validation error
  const displayError = error || localError;

  return (
    <View style={{ gap: 4 }}>
      <Text style={styles.label}>Date of Birth</Text>
      <TextInput
        style={[styles.input, !!displayError && styles.inputError]}
        placeholder="YYYY-MM-DD"
        placeholderTextColor={Colors.neutral[500]}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={10}
        editable={editable}
      />
      {displayError && <Text style={styles.error}>{displayError}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontFamily: Typography.fontFamily.regular, color: Colors.neutral[700], marginLeft: Spacing.md },
  input: { backgroundColor: '#FFFFFF', paddingVertical: Spacing.md, paddingHorizontal: Spacing.md, borderRadius: 8, fontSize: 16, fontFamily: Typography.fontFamily.medium, color: Colors.text.primary.light, borderWidth: 1, borderColor: Colors.neutral[200] },
  inputError: { borderColor: '#ef4444' },
  error: { fontSize: 12, fontFamily: Typography.fontFamily.regular, color: '#ef4444', marginLeft: Spacing.xs },
});
