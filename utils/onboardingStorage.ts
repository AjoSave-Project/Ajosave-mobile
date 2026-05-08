import AsyncStorage from '@react-native-async-storage/async-storage';

const HAS_SEEN_ONBOARDING_KEY = '@ajosave_has_seen_onboarding';

/**
 * Onboarding Storage Utilities
 * 
 * Manages the onboarding status in AsyncStorage to ensure
 * returning users skip the onboarding screen.
 */

/**
 * Check if user has seen the onboarding screen
 * @returns Promise<boolean> - true if user has seen onboarding, false otherwise
 */
export const hasSeenOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY);
    return value === 'true';
  } catch (error) {
    console.error('[OnboardingStorage] Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Mark that user has completed the onboarding
 * @returns Promise<void>
 */
export const setOnboardingComplete = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
    console.log('[OnboardingStorage] Onboarding marked as complete');
  } catch (error) {
    console.error('[OnboardingStorage] Error setting onboarding status:', error);
    throw error;
  }
};

/**
 * Reset onboarding status (useful for testing or user logout)
 * @returns Promise<void>
 */
export const resetOnboardingStatus = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HAS_SEEN_ONBOARDING_KEY);
    console.log('[OnboardingStorage] Onboarding status reset');
  } catch (error) {
    console.error('[OnboardingStorage] Error resetting onboarding status:', error);
    throw error;
  }
};
