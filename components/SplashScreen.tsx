import { View, Text, StyleSheet } from 'react-native';
import { Typography } from '@/constants/typography';
import { Colors } from '@/constants/colors';

/**
 * Splash Screen
 * Blue background with gray text
 * Shows while app is initializing
 */
export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.brandName}>AjoSave</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 32,
    color: Colors.primary.background,
    fontFamily: Typography.fontFamily.bold,
    marginBottom: 80,
  },
});
