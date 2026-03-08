import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/constants/typography';
import { Colors } from '@/constants/colors';

interface GradientButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function GradientButton({ 
  label, 
  onPress, 
  disabled = false, 
  icon,
  style, 
  textStyle 
}: GradientButtonProps) {
  return (
    <Pressable
      style={[styles.container, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={[ Colors.primary.main, Colors.primary.dark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={[styles.text, textStyle]}>{label}</Text>
        {icon && <Ionicons name={icon} size={24} color="#FFFFFF" style={styles.icon} />}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#5B8DEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  text: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  icon: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
