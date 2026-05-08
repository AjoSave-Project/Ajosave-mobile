import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';
import FaceCaptureScreen from '@/components/FaceCaptureScreen';
import { verifyFaceWithBVN } from '@/services/faceVerificationService';

export default function FaceVerifyScreen() {
  const params = useLocalSearchParams<{
    userId: string;
    bvn: string;
    email: string;
    phoneNumber: string;
  }>();

  const [showCamera, setShowCamera] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const handleStartCapture = () => {
    setShowCamera(true);
  };

  const handlePhotoCapture = async (photoUri: string) => {
    setCapturedPhoto(photoUri);
    setShowCamera(false);
    
    // Automatically start verification
    await handleVerifyFace(photoUri);
  };

  const handleVerifyFace = async (photoUri: string) => {
    try {
      setIsVerifying(true);

      // Get auth token (you'll need to implement this based on your auth system)
      // const token = await getAuthToken();
      const token = 'dummy-token'; // Replace with actual token

      // Verify face with BVN
      const result = await verifyFaceWithBVN(
        params.userId,
        params.bvn,
        photoUri,
        token
      );

      if (result.verified) {
        Alert.alert(
          'Verification Successful',
          `Your face has been verified with a confidence score of ${Math.round((result.confidence || 0) * 100)}%`,
          [
            {
              text: 'Continue',
              onPress: () => {
                // Navigate to next step or dashboard
                router.replace('/(tabs)');
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Verification Failed',
          result.message || 'Face verification failed. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => {
                setCapturedPhoto(null);
                setShowCamera(true);
              },
            },
            {
              text: 'Skip for Now',
              style: 'cancel',
              onPress: () => router.replace('/(tabs)'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.error('Face verification error:', error);
      Alert.alert(
        'Verification Error',
        error.message || 'An error occurred during face verification.',
        [
          {
            text: 'Try Again',
            onPress: () => {
              setCapturedPhoto(null);
              setShowCamera(true);
            },
          },
          {
            text: 'Skip for Now',
            style: 'cancel',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Face Verification?',
      'Face verification adds an extra layer of security to your account. You can complete this later in Settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Skip',
          style: 'destructive',
          onPress: () => router.replace('/(tabs)'),
        },
      ]
    );
  };

  if (isVerifying) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
        <Text style={styles.loadingText}>Verifying your face...</Text>
        <Text style={styles.loadingSubtext}>This may take a few moments</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <FaceCaptureScreen
          onCapture={handlePhotoCapture}
          onCancel={() => setShowCamera(false)}
          title="Capture Your Face"
          instructions="Position your face within the oval frame"
        />
      </Modal>

      {/* Main Content */}
      <View style={styles.content}>
        <Pressable
          style={styles.backButton}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/welcome')}
        >
          <Text style={styles.backArrow}>←</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="scan" size={64} color={Colors.primary.main} />
          </View>
          <Text style={styles.title}>Face Verification</Text>
          <Text style={styles.subtitle}>
            Final step: Verify your identity with a selfie
          </Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.primary.main} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Enhanced Security</Text>
              <Text style={styles.infoText}>
                Face verification adds an extra layer of protection to your account
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="lock-closed" size={24} color={Colors.primary.main} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Privacy Protected</Text>
              <Text style={styles.infoText}>
                Your face data is encrypted and never stored on our servers
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Ionicons name="flash" size={24} color={Colors.primary.main} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Quick & Easy</Text>
              <Text style={styles.infoText}>
                Takes less than 30 seconds to complete
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>Tips for best results:</Text>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.tipText}>Ensure good lighting</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.tipText}>Remove glasses if possible</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.tipText}>Look directly at the camera</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.tipText}>Keep a neutral expression</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonSection}>
          <Pressable
            style={styles.primaryButton}
            onPress={handleStartCapture}
          >
            <Text style={styles.primaryButtonText}>Start Face Verification</Text>
            <Ionicons name="camera" size={20} color="#FFFFFF" />
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={handleSkip}
          >
            <Text style={styles.secondaryButtonText}>Skip for Now</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  backButton: {
    marginBottom: Spacing.lg,
  },
  backArrow: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.primary.main,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary.light + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  infoSection: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.neutral[50],
    padding: Spacing.md,
    borderRadius: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    lineHeight: 20,
  },
  tipsSection: {
    backgroundColor: Colors.primary.light + '10',
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.xl,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
    marginBottom: Spacing.md,
  },
  tipsList: {
    gap: Spacing.sm,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  tipText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[700],
  },
  buttonSection: {
    gap: Spacing.md,
    marginTop: 'auto',
    paddingBottom: Spacing.xl,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.lg,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.semibold,
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.neutral[600],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    gap: Spacing.lg,
  },
  loadingText: {
    fontSize: 20,
    fontFamily: Typography.fontFamily.semibold,
    color: Colors.text.primary.light,
  },
  loadingSubtext: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
  },
});
