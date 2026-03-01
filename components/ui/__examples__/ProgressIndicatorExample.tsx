/**
 * ProgressIndicator Component Examples
 * 
 * Demonstrates various usage patterns for the ProgressIndicator component.
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ProgressIndicator } from '../ProgressIndicator';
import { Button } from '../Button';

/**
 * Example: Simple progress indicator without labels
 */
export const SimpleProgressExample = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  return (
    <View style={styles.exampleContainer}>
      <ProgressIndicator 
        currentStep={currentStep} 
        totalSteps={totalSteps} 
      />
      
      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          size="small"
          onPress={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          size="small"
          onPress={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
          disabled={currentStep === totalSteps}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

/**
 * Example: Progress indicator with step labels (horizontal)
 */
export const LabeledProgressExample = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const steps = [
    { label: 'Personal Info', description: 'Basic details' },
    { label: 'Verification', description: 'ID verification' },
    { label: 'Bank Details', description: 'Account info' },
    { label: 'Review', description: 'Confirm details' },
  ];
  
  return (
    <View style={styles.exampleContainer}>
      <ProgressIndicator 
        currentStep={currentStep} 
        totalSteps={steps.length}
        steps={steps}
      />
      
      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          size="small"
          onPress={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          size="small"
          onPress={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
          disabled={currentStep === steps.length}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

/**
 * Example: Vertical progress indicator
 */
export const VerticalProgressExample = () => {
  const [currentStep, setCurrentStep] = useState(2);
  
  const steps = [
    { label: 'Create Group', description: 'Set up group details' },
    { label: 'Add Members', description: 'Invite participants' },
    { label: 'Configure', description: 'Set contribution rules' },
    { label: 'Launch', description: 'Start the group' },
  ];
  
  return (
    <View style={styles.exampleContainer}>
      <ProgressIndicator 
        currentStep={currentStep} 
        totalSteps={steps.length}
        steps={steps}
        orientation="vertical"
      />
      
      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          size="small"
          onPress={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          size="small"
          onPress={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
          disabled={currentStep === steps.length}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

/**
 * Example: Progress indicator without animation
 */
export const NonAnimatedProgressExample = () => {
  const [currentStep, setCurrentStep] = useState(2);
  const totalSteps = 5;
  
  return (
    <View style={styles.exampleContainer}>
      <ProgressIndicator 
        currentStep={currentStep} 
        totalSteps={totalSteps}
        animated={false}
      />
      
      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          size="small"
          onPress={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        <Button
          variant="primary"
          size="small"
          onPress={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
          disabled={currentStep === totalSteps}
        >
          Next
        </Button>
      </View>
    </View>
  );
};

/**
 * All examples in a scrollable view
 */
export const ProgressIndicatorExamples = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <SimpleProgressExample />
      <LabeledProgressExample />
      <VerticalProgressExample />
      <NonAnimatedProgressExample />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 32,
  },
  exampleContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
});
