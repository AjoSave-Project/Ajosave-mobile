# Onboarding Flow Documentation

## Overview

The mobile app implements a smart onboarding flow that shows the onboarding screen only to first-time users. Returning users are taken directly to the welcome screen (sign in/sign up) to streamline their experience.

## How It Works

### Storage Key

The app uses AsyncStorage to persist whether a user has seen the onboarding screen:

- **Key**: `@has_seen_onboarding`
- **Value**: `true` (boolean) when user has seen onboarding, `null` or `false` otherwise

### Flow Logic

1. **First-Time User (New Install)**
   - Splash screen → Onboarding screen → Welcome screen → Sign in/Sign up
   - Flag is set to `true` when user taps "Get Started" on onboarding

2. **Returning User (Has Seen Onboarding)**
   - Splash screen → Welcome screen → Sign in/Sign up
   - Onboarding is skipped entirely

3. **Authenticated User**
   - Splash screen → Home screen (tabs)
   - Both onboarding and welcome are skipped

## Implementation Files

### Core Files

1. **`mobile/services/storageService.ts`**
   - Added `HAS_SEEN_ONBOARDING: '@has_seen_onboarding'` to `STORAGE_KEYS`

2. **`mobile/utils/onboardingHelpers.ts`**
   - Utility functions for managing onboarding state:
     - `hasSeenOnboarding()` - Check if user has seen onboarding
     - `markOnboardingAsSeen()` - Mark onboarding as seen
     - `resetOnboardingStatus()` - Reset for testing
     - `setOnboardingStatus(seen: boolean)` - Force set status

3. **`mobile/app/(auth)/splash.tsx`**
   - Checks onboarding status on mount
   - Routes to appropriate screen based on auth + onboarding status

4. **`mobile/app/(auth)/onboarding.tsx`**
   - Sets onboarding flag when user taps "Get Started"

5. **`mobile/app/(auth)/welcome.tsx`**
   - Ensures onboarding flag is set (safety check)

## Testing

### Test as First-Time User

To test the first-time user experience:

```typescript
import { resetOnboardingStatus } from '@/utils/onboardingHelpers';

// In your test or dev menu
await resetOnboardingStatus();
// Then restart the app
```

### Test as Returning User

To test the returning user experience:

```typescript
import { markOnboardingAsSeen } from '@/utils/onboardingHelpers';

// In your test or dev menu
await markOnboardingAsSeen();
// Then restart the app
```

### Manual Testing via React Native Debugger

```javascript
// In console
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check current status
AsyncStorage.getItem('@has_seen_onboarding').then(console.log);

// Reset to first-time user
AsyncStorage.removeItem('@has_seen_onboarding');

// Set as returning user
AsyncStorage.setItem('@has_seen_onboarding', 'true');
```

## User Experience

### First-Time User Journey

1. **Splash Screen** (3 seconds)
   - Animated AjoSave logo
   - Loading spinner

2. **Onboarding Screen**
   - Phone illustration
   - "Saving Together, Growing Together"
   - "Get Started" button

3. **Welcome Screen**
   - AjoSave branding
   - "Sign in" button
   - "Sign up" button

### Returning User Journey

1. **Splash Screen** (3 seconds)
   - Animated AjoSave logo
   - Loading spinner

2. **Welcome Screen** (directly)
   - AjoSave branding
   - "Sign in" button
   - "Sign up" button

## Edge Cases Handled

1. **Storage Failure**: If AsyncStorage fails, defaults to showing onboarding (safer UX)
2. **Concurrent Navigation**: Uses `hasNavigated` flag to prevent multiple navigation attempts
3. **Navigation Timing**: Waits for navigation system to be fully ready before routing
4. **Authentication Priority**: Authenticated users always go to home, regardless of onboarding status

## Future Enhancements

Potential improvements for the onboarding system:

1. **Multi-Step Onboarding**: Track which onboarding steps have been completed
2. **Version-Based Onboarding**: Show new onboarding for major app updates
3. **Feature Tours**: Show contextual onboarding for new features
4. **Skip Button**: Allow users to skip onboarding
5. **Analytics**: Track onboarding completion rates

## Debugging

Enable detailed logging by checking console output:

```
[SplashScreen] Onboarding status: Seen | Not seen
[SplashScreen] New user, going to onboarding
[SplashScreen] Returning user, going to welcome
[OnboardingScreen] Marked onboarding as seen
[WelcomeScreen] Marked onboarding as seen
```

## Related Documentation

- [Session Management Guide](../SESSION_MANAGEMENT_GUIDE.md)
- [Authentication Flow](./AUTH_FLOW.md)
- [Storage Service](../services/storageService.ts)
