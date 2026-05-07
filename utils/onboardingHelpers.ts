import { StorageService, STORAGE_KEYS } from '@/services/storageService';

/**
 * Onboarding Helper Utilities
 * 
 * Provides utility functions for managing onboarding state
 */

/**
 * Check if user has seen onboarding
 * @returns Promise<boolean> - true if user has seen onboarding, false otherwise
 */
export async function hasSeenOnboarding(): Promise<boolean> {
  try {
    const hasSeenIt = await StorageService.get<boolean>(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
    return hasSeenIt === true;
  } catch (error) {
    console.error('[OnboardingHelpers] Error checking onboarding status:', error);
    return false;
  }
}

/**
 * Mark onboarding as seen
 * @returns Promise<void>
 */
export async function markOnboardingAsSeen(): Promise<void> {
  try {
    await StorageService.set(STORAGE_KEYS.HAS_SEEN_ONBOARDING, true);
    console.log('[OnboardingHelpers] Marked onboarding as seen');
  } catch (error) {
    console.error('[OnboardingHelpers] Error marking onboarding as seen:', error);
    throw error;
  }
}

/**
 * Reset onboarding status (useful for testing)
 * This will cause the user to see onboarding again on next app launch
 * @returns Promise<void>
 */
export async function resetOnboardingStatus(): Promise<void> {
  try {
    await StorageService.remove(STORAGE_KEYS.HAS_SEEN_ONBOARDING);
    console.log('[OnboardingHelpers] Reset onboarding status');
  } catch (error) {
    console.error('[OnboardingHelpers] Error resetting onboarding status:', error);
    throw error;
  }
}

/**
 * Force set onboarding status (useful for testing)
 * @param seen - Whether onboarding should be marked as seen
 * @returns Promise<void>
 */
export async function setOnboardingStatus(seen: boolean): Promise<void> {
  try {
    await StorageService.set(STORAGE_KEYS.HAS_SEEN_ONBOARDING, seen);
    console.log(`[OnboardingHelpers] Set onboarding status to: ${seen}`);
  } catch (error) {
    console.error('[OnboardingHelpers] Error setting onboarding status:', error);
    throw error;
  }
}
