# Onboarding Flow Diagram

## Visual Flow Chart

```
┌─────────────────────────────────────────────────────────────────┐
│                         APP LAUNCH                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │  Splash Screen │
                    │   (3 seconds)  │
                    └────────┬───────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Check Storage: │
                    │ @has_seen_     │
                    │  onboarding    │
                    └────────┬───────┘
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │Authenticated│ │Not Auth  │ │Not Auth  │
         │   User     │ │+ Seen    │ │+ Not Seen│
         └──────┬─────┘ └────┬─────┘ └────┬─────┘
                │            │            │
                ▼            ▼            ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │   Home   │  │ Welcome  │  │Onboarding│
         │  Screen  │  │  Screen  │  │  Screen  │
         └──────────┘  └────┬─────┘  └────┬─────┘
                            │            │
                            │            ▼
                            │      ┌──────────┐
                            │      │User taps │
                            │      │"Get      │
                            │      │Started"  │
                            │      └────┬─────┘
                            │           │
                            │           ▼
                            │      ┌──────────┐
                            │      │   Set    │
                            │      │@has_seen_│
                            │      │onboarding│
                            │      │= true    │
                            │      └────┬─────┘
                            │           │
                            └───────────┼───────┐
                                        │       │
                                        ▼       ▼
                                   ┌──────────────┐
                                   │   Welcome    │
                                   │   Screen     │
                                   └──────┬───────┘
                                          │
                                ┌─────────┴─────────┐
                                │                   │
                                ▼                   ▼
                         ┌──────────┐        ┌──────────┐
                         │ Sign In  │        │ Sign Up  │
                         └──────────┘        └──────────┘
```

## State Transitions

### Storage State

```
┌─────────────────────────────────────────────────────────┐
│                    Storage States                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Initial State (New User):                              │
│  @has_seen_onboarding = null                            │
│                                                          │
│  After Onboarding:                                      │
│  @has_seen_onboarding = true                            │
│                                                          │
│  After Reset (Testing):                                 │
│  @has_seen_onboarding = null                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Decision Tree

```
                    Is User Authenticated?
                            │
                ┌───────────┴───────────┐
                │                       │
               YES                     NO
                │                       │
                ▼                       ▼
           Go to Home          Has Seen Onboarding?
                                       │
                           ┌───────────┴───────────┐
                           │                       │
                          YES                     NO
                           │                       │
                           ▼                       ▼
                    Go to Welcome          Go to Onboarding
```

## Component Interaction

```
┌──────────────────────────────────────────────────────────────┐
│                     Component Flow                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  SplashScreen                                                │
│      │                                                        │
│      ├─► hasSeenOnboarding() ──► StorageService.get()       │
│      │                                                        │
│      └─► router.replace()                                    │
│                                                               │
│  OnboardingScreen                                            │
│      │                                                        │
│      └─► markOnboardingAsSeen() ──► StorageService.set()    │
│                                                               │
│  WelcomeScreen                                               │
│      │                                                        │
│      └─► markOnboardingAsSeen() ──► StorageService.set()    │
│          (safety check)                                      │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Timeline View

### First-Time User Journey

```
Time    Screen              Storage State           Action
────────────────────────────────────────────────────────────
0s      Splash              null                    Loading
3s      Onboarding          null                    Viewing
5s      Onboarding          null                    Tap "Get Started"
5s      Onboarding          true (set)              Navigating
5s      Welcome             true                    Viewing
```

### Returning User Journey

```
Time    Screen              Storage State           Action
────────────────────────────────────────────────────────────
0s      Splash              true                    Loading
3s      Welcome             true                    Viewing (direct)
```

### Authenticated User Journey

```
Time    Screen              Storage State           Action
────────────────────────────────────────────────────────────
0s      Splash              true/null               Loading
3s      Home                true/null               Viewing (direct)
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────┐
│                  Error Scenarios                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Storage Read Error:                                    │
│  hasSeenOnboarding() → false (default)                  │
│  Result: Show onboarding (safe default)                 │
│                                                          │
│  Storage Write Error:                                   │
│  markOnboardingAsSeen() → log error, continue           │
│  Result: Navigation proceeds normally                   │
│                                                          │
│  Navigation Error:                                      │
│  Wait for navigationReady flag                          │
│  Result: Delayed navigation when ready                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Testing Scenarios

```
┌─────────────────────────────────────────────────────────┐
│                  Test Scenarios                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Fresh Install:                                      │
│     Storage: null → Show onboarding                     │
│                                                          │
│  2. After Onboarding:                                   │
│     Storage: true → Skip to welcome                     │
│                                                          │
│  3. Reset Onboarding:                                   │
│     resetOnboardingStatus() → null → Show onboarding    │
│                                                          │
│  4. Force Seen:                                         │
│     setOnboardingStatus(true) → Skip to welcome         │
│                                                          │
│  5. Authenticated:                                      │
│     Any storage state → Go to home                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Key Functions

```typescript
// Check onboarding status
const hasSeen = await hasSeenOnboarding();
// Returns: true | false

// Mark as seen
await markOnboardingAsSeen();
// Sets: @has_seen_onboarding = true

// Reset for testing
await resetOnboardingStatus();
// Removes: @has_seen_onboarding

// Force set status
await setOnboardingStatus(true);
// Sets: @has_seen_onboarding = true
```

---

This diagram provides a visual representation of the onboarding flow implementation.
