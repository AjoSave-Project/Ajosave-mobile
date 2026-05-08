# Face Verification - Frontend Usage

## Quick Integration

### 1. Import the utility
```typescript
import { verifyFaceWithBVN, verifyFaceWithNIN, checkFaceVerificationStatus } from '@/utils/faceVerification';
```

### 2. Use in your component

```typescript
import { verifyFaceWithBVN } from '@/utils/faceVerification';

// In your component
const handleVerifyFace = async () => {
  await verifyFaceWithBVN({
    userId: user._id,
    bvn: user.bvn,
    onSuccess: (result) => {
      console.log('Face verified!', result);
      // Update UI, navigate, etc.
    },
    onError: (error) => {
      console.error('Verification failed:', error);
    },
  });
};

// In your JSX
<Pressable onPress={handleVerifyFace}>
  <Text>Verify Face</Text>
</Pressable>
```

### 3. Check verification status

```typescript
import { checkFaceVerificationStatus } from '@/utils/faceVerification';

const status = await checkFaceVerificationStatus(userId);
if (status.isFaceVerified) {
  console.log('Face already verified at:', status.faceVerifiedAt);
}
```

## Biometric Login (Face ID/Touch ID)

### 1. Check if available
```typescript
import { BiometricService } from '@/services/biometricService';

const isAvailable = await BiometricService.isAvailable();
const supportedTypes = await BiometricService.getSupportedTypes();
// Returns: ['fingerprint', 'facial', 'iris']
```

### 2. Authenticate
```typescript
const result = await BiometricService.authenticate({
  promptMessage: 'Log in to Ajosave',
  cancelLabel: 'Cancel',
  fallbackLabel: 'Use PIN',
});

if (result.success) {
  // User authenticated
  console.log('Biometric authentication successful');
} else {
  console.error('Authentication failed:', result.error);
}
```

### 3. Enable/Disable biometric login
```typescript
// Enable
await BiometricService.enable();

// Disable
await BiometricService.disable();

// Check if enabled
const isEnabled = await BiometricService.isEnabled();
```

## Complete Example

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { verifyFaceWithBVN, checkFaceVerificationStatus } from '@/utils/faceVerification';
import { BiometricService } from '@/services/biometricService';
import { useAuth } from '@/contexts/AuthContext';

export default function SecurityScreen() {
  const { user } = useAuth();
  const [isFaceVerified, setIsFaceVerified] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    // Check face verification
    const faceStatus = await checkFaceVerificationStatus(user._id);
    setIsFaceVerified(faceStatus.isFaceVerified);

    // Check biometric availability
    const available = await BiometricService.isAvailable();
    setBiometricAvailable(available);

    if (available) {
      const enabled = await BiometricService.isEnabled();
      setBiometricEnabled(enabled);
    }
  };

  const handleVerifyFace = async () => {
    await verifyFaceWithBVN({
      userId: user._id,
      bvn: user.bvn,
      onSuccess: () => {
        setIsFaceVerified(true);
        Alert.alert('Success', 'Face verified successfully!');
      },
      onError: (error) => {
        Alert.alert('Error', error);
      },
    });
  };

  const handleToggleBiometric = async () => {
    if (biometricEnabled) {
      await BiometricService.disable();
      setBiometricEnabled(false);
    } else {
      // Authenticate first
      const result = await BiometricService.authenticate({
        promptMessage: 'Enable biometric login',
      });

      if (result.success) {
        await BiometricService.enable();
        setBiometricEnabled(true);
      }
    }
  };

  return (
    <View>
      {/* Face Verification */}
      <View>
        <Text>Face Verification</Text>
        {isFaceVerified ? (
          <Text>✓ Verified</Text>
        ) : (
          <Pressable onPress={handleVerifyFace}>
            <Text>Verify Face</Text>
          </Pressable>
        )}
      </View>

      {/* Biometric Login */}
      {biometricAvailable && (
        <View>
          <Text>Biometric Login</Text>
          <Pressable onPress={handleToggleBiometric}>
            <Text>{biometricEnabled ? 'Disable' : 'Enable'}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
```

## API Methods

### AuthService

```typescript
// Verify face with BVN
await AuthService.verifyFaceWithBVN(userId, bvn, faceImageUri);

// Verify face with NIN
await AuthService.verifyFaceWithNIN(userId, nin, faceImageUri);

// Get face verification status
await AuthService.getFaceVerificationStatus(userId);
```

### BiometricService

```typescript
// Check availability
await BiometricService.isAvailable();

// Get supported types
await BiometricService.getSupportedTypes();

// Authenticate
await BiometricService.authenticate(options);

// Check enrollment
await BiometricService.isEnrolled();

// Enable/disable
await BiometricService.enable();
await BiometricService.disable();
await BiometricService.isEnabled();
```

## Permissions

The app will automatically request camera permissions when needed. Make sure your `app.json` includes:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-camera",
        {
          "cameraPermission": "Allow Ajosave to access your camera for face verification."
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "Allow Ajosave to access your photos."
        }
      ]
    ]
  }
}
```

## Testing

1. Test on physical devices (biometrics don't work in simulators)
2. Test with different lighting conditions
3. Test with/without glasses
4. Test error handling (wrong face, poor quality, etc.)

## Notes

- Face images are never stored on the device or server
- Only verification status is saved
- Biometric data never leaves the device
- All verification happens through secure third-party APIs
