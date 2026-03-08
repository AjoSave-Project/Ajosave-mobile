import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';

interface PillButtonProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function PillButton({ label, selected = false, onPress, style, textStyle }: PillButtonProps) {
  return (
    <Pressable
      style={[
        styles.pill,
        selected && styles.pillSelected,
        style
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.pillText,
        selected && styles.pillTextSelected,
        textStyle
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: Colors.surface.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSelected: {
    backgroundColor: Colors.primary.main,
  },
  pillText: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.primary.main,
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
});
