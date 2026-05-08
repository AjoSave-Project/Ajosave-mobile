import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator, Modal, Animated
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';

/**
 * Identity Field Verification Screen
 * 
 * Shows loading state while verifying BVN or NIN
 * Displays success/failure modal and auto-navigates back
 */
export default function VerifyIdentityFieldScreen() {
  const params = useLocalSearchParams<{
    fieldType: 'bvn' | 'nin';
    fieldValue: string;
    userId: string;
    email?: string;
    phoneNumber?: string;
    bvnVerified?: string;
    bvnValue?: string;
    ninVerified?: string;
    ninValue?: string;
  }>();

  const [verifying, setVerifying] = useState(true);
  const [verifyStep, setVerifyStep] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;

  const verifySteps = params.fieldType === 'bvn' 
    ? ['Connecting to NIBSS...', 'Validating BVN...', 'Verifying identity...']
    : ['Connecting to NIMC...', 'Validating NIN...', 'Verifying identity...'];

  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, { 
      toValue: 1, 
      duration: 300, 
      useNativeDriver: true 
    }).start();

    // Start verification process
    performVerification();
  }, []);

  useEffect(() => {
    if (verifying) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(fadeAnim, { toValue: 0.8, duration: 600, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [verifying]);

  const performVerification = async () => {
    try {
      // Simulate step-by-step verification
      for (let i = 0; i < verifySteps.length; i++) {
        setVerifyStep(i);
        await new Promise(res => setTimeout(res, 1200));
      }

      // Call real API
      const { AuthService } = await import('@/services/authService');
      
      console.log('Verifying with params:', {
        userId: params.userId,
        fieldType: params.fieldType,
        fieldValue: params.fieldValue,
      });
      
      let result;
      if (params.fieldType === 'bvn') {
        result = await AuthService.verifyBVN(params.userId, params.fieldValue);
      } else {
        result = await AuthService.verifyNIN(params.userId, params.fieldValue);
      }

      console.log('Verification result:', result);

      if (result.verified) {
        const successResult = {
          success: true,
          message: result.message || `${params.fieldType.toUpperCase()} verified successfully!`
        };
        setVerificationResult(successResult);
        
        setVerifying(false);
        setShowModal(true);

        // Animate modal in
        Animated.timing(modalFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();

        // Auto-dismiss after 2 seconds
        setTimeout(() => {
          handleDismiss(successResult);
        }, 2000);
      } else {
        const failureResult = {
          success: false,
          message: result.message || `Unable to verify ${params.fieldType.toUpperCase()}. Please check the number and try again.`
        };
        setVerificationResult(failureResult);
        
        setVerifying(false);
        setShowModal(true);

        Animated.timing(modalFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }).start();

        setTimeout(() => {
          handleDismiss(failureResult);
        }, 2000);
      }

    } catch (error: any) {
      console.error('Verification error:', error);
      const errorResult = {
        success: false,
        message: error.message || 'Verification failed. Please try again.'
      };
      setVerificationResult(errorResult);
      setVerifying(false);
      setShowModal(true);

      Animated.timing(modalFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();

      setTimeout(() => {
        handleDismiss(errorResult);
      }, 2500);
    }
  };

  const handleDismiss = (result: { success: boolean; message: string }) => {
    Animated.timing(modalFadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => {
      // Navigate back to kyc-verify with verification result
      console.log('handleDismiss - result:', result);
      const verifiedParam = result.success ? 'true' : 'false';
      console.log('handleDismiss - verifiedParam:', verifiedParam);
      
      // Preserve all existing params and add the new verification result
      const navigationParams = {
        email: params.email || '',
        phoneNumber: params.phoneNumber || '',
        userId: params.userId,
        [`${params.fieldType}Verified`]: verifiedParam,
        [`${params.fieldType}Value`]: params.fieldValue,
        verificationTimestamp: Date.now().toString(),
      };
      
      // If verifying NIN, preserve BVN params
      if (params.fieldType === 'nin' && params.bvnVerified) {
        navigationParams.bvnVerified = params.bvnVerified;
        navigationParams.bvnValue = params.bvnValue || '';
      }
      
      // If verifying BVN, preserve NIN params
      if (params.fieldType === 'bvn' && params.ninVerified) {
        navigationParams.ninVerified = params.ninVerified;
        navigationParams.ninValue = params.ninValue || '';
      }
      
      console.log('Navigating back with params:', navigationParams);
      
      router.replace({
        pathname: '/(auth)/kyc-verify',
        params: navigationParams,
      });
    });
  };

  return (
    <View style={styles.container}>
      {/* Loading State */}
      {verifying && (
        <Animated.View style={[styles.loadingContainer, { opacity: fadeAnim }]}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={params.fieldType === 'bvn' ? 'card' : 'shield-checkmark'} 
              size={64} 
              color={Colors.primary.main} 
            />
          </View>
          
          <ActivityIndicator 
            size="large" 
            color={Colors.primary.main} 
            style={{ marginTop: 32, marginBottom: 24 }} 
          />
          
          <Text style={styles.verifyTitle}>
            Verifying {params.fieldType.toUpperCase()}
          </Text>
          
          <Text style={styles.verifyStep}>{verifySteps[verifyStep]}</Text>
          
          <View style={styles.stepDots}>
            {verifySteps.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i <= verifyStep && styles.dotActive]}
              />
            ))}
          </View>
        </Animated.View>
      )}

      {/* Success/Failure Modal */}
      <Modal transparent visible={showModal} animationType="none">
        <Animated.View style={[styles.modalOverlay, { opacity: modalFadeAnim }]}>
          <View style={[
            styles.modalCard,
            verificationResult?.success ? styles.modalSuccess : styles.modalError
          ]}>
            <View style={[
              styles.modalIconContainer,
              verificationResult?.success ? styles.iconSuccess : styles.iconError
            ]}>
              <Ionicons
                name={verificationResult?.success ? 'checkmark-circle' : 'close-circle'}
                size={56}
                color="#FFFFFF"
              />
            </View>
            
            <Text style={styles.modalTitle}>
              {verificationResult?.success ? 'Verification Successful' : 'Verification Failed'}
            </Text>
            
            <Text style={styles.modalMessage}>
              {verificationResult?.message}
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  verifyTitle: {
    fontSize: 22,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary.main,
    marginBottom: 12,
    textAlign: 'center',
  },
  verifyStep: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    marginBottom: 32,
    textAlign: 'center',
  },
  stepDots: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.neutral[300],
  },
  dotActive: {
    backgroundColor: Colors.primary.main,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  modalSuccess: {
    borderTopWidth: 4,
    borderTopColor: '#10b981',
  },
  modalError: {
    borderTopWidth: 4,
    borderTopColor: '#ef4444',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconSuccess: {
    backgroundColor: '#10b981',
  },
  iconError: {
    backgroundColor: '#ef4444',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.neutral[900],
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 22,
  },
});
