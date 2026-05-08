import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { Typography } from '@/constants/typography';
import { Spacing } from '@/constants/spacing';

interface FaceCaptureScreenProps {
  onCapture: (photoUri: string) => void;
  onCancel: () => void;
  title?: string;
  instructions?: string;
}

export default function FaceCaptureScreen({
  onCapture,
  onCancel,
  title = 'Capture Your Face',
  instructions = 'Position your face within the frame',
}: FaceCaptureScreenProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isCapturing, setIsCapturing] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    // Hide instructions after 5 seconds
    const timer = setTimeout(() => {
      setShowInstructions(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Request camera permission if not granted
  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={Colors.neutral[400]} />
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          We need access to your camera to capture your face for identity verification.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </Pressable>
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);

      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      if (photo?.uri) {
        // Basic validation
        const isValid = await validatePhoto(photo.uri);
        
        if (isValid) {
          onCapture(photo.uri);
        } else {
          Alert.alert(
            'Photo Quality Issue',
            'Please ensure your face is clearly visible and well-lit.',
            [{ text: 'Try Again', onPress: () => setIsCapturing(false) }]
          );
        }
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert(
        'Capture Failed',
        'Failed to capture photo. Please try again.',
        [{ text: 'OK', onPress: () => setIsCapturing(false) }]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const validatePhoto = async (uri: string): Promise<boolean> => {
    // TODO: Implement basic photo validation
    // - Check file size
    // - Check image dimensions
    // - Basic brightness check
    // For now, return true
    return true;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onCancel}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        >
          {/* Face Oval Overlay */}
          <View style={styles.overlay}>
            <View style={styles.overlayTop} />
            <View style={styles.overlayMiddle}>
              <View style={styles.overlaySide} />
              <View style={styles.faceOval}>
                <View style={styles.ovalBorder} />
              </View>
              <View style={styles.overlaySide} />
            </View>
            <View style={styles.overlayBottom} />
          </View>

          {/* Instructions */}
          {showInstructions && (
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionsBox}>
                <Text style={styles.instructionsText}>{instructions}</Text>
                <Text style={styles.instructionsSubtext}>
                  • Ensure good lighting{'\n'}
                  • Remove glasses if possible{'\n'}
                  • Look directly at the camera
                </Text>
              </View>
            </View>
          )}
        </CameraView>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlsInner}>
          <Pressable
            style={styles.cancelControlButton}
            onPress={onCancel}
            disabled={isCapturing}
          >
            <Text style={styles.cancelControlText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={[styles.captureButton, isCapturing && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isCapturing}
          >
            {isCapturing ? (
              <ActivityIndicator color="#FFFFFF" size="large" />
            ) : (
              <View style={styles.captureButtonInner} />
            )}
          </Pressable>

          <View style={{ width: 80 }} />
        </View>

        <Text style={styles.hint}>
          Tap the button to capture your photo
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Typography.fontFamily.semibold,
    color: '#FFFFFF',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayMiddle: {
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  faceOval: {
    width: 280,
    height: 360,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ovalBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 140,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderStyle: 'dashed',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
  },
  instructionsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: Spacing.md,
    borderRadius: 12,
  },
  instructionsText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semibold,
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  instructionsSubtext: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  controls: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    gap: Spacing.md,
  },
  controlsInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelControlButton: {
    width: 80,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelControlText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.medium,
    color: '#FFFFFF',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.primary.main,
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary.main,
  },
  hint: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: '#FFFFFF',
    gap: Spacing.lg,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.text.primary.light,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    marginTop: Spacing.md,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.semibold,
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.neutral[600],
  },
});
