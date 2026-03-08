import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface ProgressBarProps {
  steps: number;
  currentStep: number;
}

export default function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: steps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.step,
            index < currentStep && styles.stepCompleted,
            index === currentStep - 1 && styles.stepCurrent,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 24,
  },
  step: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.neutral[200],
    borderRadius: 2,
  },
  stepCompleted: {
    backgroundColor: Colors.primary.main,
  },
  stepCurrent: {
    backgroundColor: Colors.primary.main,
  },
});
