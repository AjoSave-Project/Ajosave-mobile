/**
 * Face Verification Utility
 * 
 * Helper functions for face verification with camera
 * Can be used in any screen that needs face verification
 */

import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthService } from '@/services/authService';

export interface FaceVerificationOptions {
  userId: string;
  bvn?: string;
  nin?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: string) => void;
}

/**
 * Request camera permissions
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to capture your face for verification.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};

/**
 * Capture face image using camera
 */
export const captureFaceImage = async (): Promise<string | null> => {
  try {
    // Request permission first
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return null;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
      base64: false,
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Error capturing face image:', error);
    Alert.alert('Error', 'Failed to capture image. Please try again.');
    return null;
  }
};

/**
 * Verify face with BVN
 */
export const verifyFaceWithBVN = async (
  options: FaceVerificationOptions
): Promise<void> => {
  try {
    if (!options.bvn) {
      throw new Error('BVN is required for face verification');
    }

    // Capture face image
    const faceImageUri = await captureFaceImage();
    if (!faceImageUri) {
      return; // User cancelled
    }

    // Show loading alert
    Alert.alert('Verifying', 'Please wait while we verify your face...');

    // Verify with backend
    const result = await AuthService.verifyFaceWithBVN(
      options.userId,
      options.bvn,
      faceImageUri
    );

    if (result.verified) {
      Alert.alert(
        'Verification Successful',
        `Your face has been verified with a confidence score of ${Math.round((result.confidence || 0) * 100)}%`,
        [
          {
            text: 'OK',
            onPress: () => options.onSuccess?.(result),
          },
        ]
      );
    } else {
      throw new Error(result.message || 'Face verification failed');
    }
  } catch (error: any) {
    console.error('Face verification error:', error);
    const errorMessage = error.message || 'Face verification failed. Please try again.';
    
    Alert.alert('Verification Failed', errorMessage, [
      {
        text: 'Try Again',
        onPress: () => verifyFaceWithBVN(options),
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => options.onError?.(errorMessage),
      },
    ]);
  }
};

/**
 * Verify face with NIN
 */
export const verifyFaceWithNIN = async (
  options: FaceVerificationOptions
): Promise<void> => {
  try {
    if (!options.nin) {
      throw new Error('NIN is required for face verification');
    }

    // Capture face image
    const faceImageUri = await captureFaceImage();
    if (!faceImageUri) {
      return; // User cancelled
    }

    // Show loading alert
    Alert.alert('Verifying', 'Please wait while we verify your face...');

    // Verify with backend
    const result = await AuthService.verifyFaceWithNIN(
      options.userId,
      options.nin,
      faceImageUri
    );

    if (result.verified) {
      Alert.alert(
        'Verification Successful',
        `Your face has been verified with a confidence score of ${Math.round((result.confidence || 0) * 100)}%`,
        [
          {
            text: 'OK',
            onPress: () => options.onSuccess?.(result),
          },
        ]
      );
    } else {
      throw new Error(result.message || 'Face verification failed');
    }
  } catch (error: any) {
    console.error('Face verification error:', error);
    const errorMessage = error.message || 'Face verification failed. Please try again.';
    
    Alert.alert('Verification Failed', errorMessage, [
      {
        text: 'Try Again',
        onPress: () => verifyFaceWithNIN(options),
      },
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: () => options.onError?.(errorMessage),
      },
    ]);
  }
};

/**
 * Check face verification status
 */
export const checkFaceVerificationStatus = async (
  userId: string
): Promise<{
  isFaceVerified: boolean;
  faceVerifiedAt?: string;
}> => {
  try {
    return await AuthService.getFaceVerificationStatus(userId);
  } catch (error) {
    console.error('Error checking face verification status:', error);
    return {
      isFaceVerified: false,
    };
  }
};
