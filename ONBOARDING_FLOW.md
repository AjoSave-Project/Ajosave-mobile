# AjoSave Mobile - Onboarding Flow

## Complete Authentication Flow

### Navigation Structure

```
app/
├── index.tsx                    → Redirects to (auth)/splash
├── _layout.tsx                  → Root layout with Slot (fixed mounting issue)
├── (auth)/
│   ├── _layout.tsx             → Auth stack navigator
│   ├── index.tsx               → Redirects to splash
│   ├── splash.tsx              → Initial loading screen
│   ├── onboarding.tsx          → App introduction
│   ├── welcome.tsx             → Sign in/Sign up entry
│   ├── login.tsx               → Existing user login
│   ├── signup.tsx              → New user registration
│   ├── verify-otp.tsx          → KYC verification (BVN/NIN)
│   └── setup-biometric.tsx     → Face ID/Touch ID setup
└── (tabs)/
    └── ...                      → Main app screens
```

### User Journey

#### First-Time User Flow
1. **Splash Screen** (`splash.tsx`)
   - Shows AjoSave logo and loading indicator
   - Checks authentication status
   - Waits for navigation to be ready
   - Routes to onboarding if not authenticated

2. **Onboarding** (`onboarding.tsx`)
   - Shows app value proposition
   - "Saving Together, Growing Together"
   - CTA: "Get Started" → Welcome screen

3. **Welcome** (`welcome.tsx`)
   - AjoSave branding
   - Two options:
     - "Sign in" → Login screen
     - "Sign up" → Signup screen

4. **Sign Up** (`signup.tsx`)
   - Phone number input (with validation checkmark)
   - Password input (with show/hide toggle)
   - "Forgot Password?" link
   - CTA: "Sign in" → Verify OTP screen

5. **KYC Verification** (`verify-otp.tsx`)
   - BVN (Bank Verification Number) input
   - NIN (National Identification Number) input
   - Terms and Conditions checkbox
   - CTA: "Submit" → Biometric setup

6. **Biometric Setup** (`setup-biometric.tsx`)
   - Face ID/Touch ID enrollment
   - Face scanning interface
   - CTA: "Scan my Face" → Main app
   - Option: "Skip for now" → Main app

#### Returning User Flow
1. **Splash Screen** (`splash.tsx`)
   - Checks authentication
   - If authenticated → Main app (tabs)
   - If not authenticated → Onboarding

2. **Welcome** (`welcome.tsx`)
   - User selects "Sign in"

3. **Login** (`login.tsx`)
   - Phone number input
   - Password input (with show/hide toggle)
   - "Forgot Password?" link
   - CTA: "Sign in" → Main app

### Key Features

#### Navigation Fix
- Root layout now uses `Slot` instead of `Stack`
- Prevents "Attempted to navigate before mounting" error
- Navigation readiness checks:
  - `rootNavigationState?.key` is truthy
  - `rootNavigationState?.routeNames` has items
  - Auth loading is complete
  - Uses `hasNavigated` flag to prevent duplicate navigation

#### UI Components
- Consistent blue gradient buttons with arrow icons
- Phone number inputs with validation indicators
- Password fields with show/hide toggle
- Avatar placeholders for user profile
- Back navigation on all screens
- Checkbox for terms acceptance

#### Design System
- Colors: Royal blue primary (#4169E1)
- Spacing: Consistent 4-64px scale
- Typography: System fonts with proper hierarchy
- Rounded corners: 8-12px border radius
- White backgrounds with blue accents

### Screen Specifications

| Screen | Route | Key Elements |
|--------|-------|--------------|
| Splash | `/(auth)/splash` | Logo, loading spinner |
| Onboarding | `/(auth)/onboarding` | Illustration, tagline, CTA |
| Welcome | `/(auth)/welcome` | Logo, Sign in/up buttons |
| Login | `/(auth)/login` | Phone, password, forgot link |
| Sign Up | `/(auth)/signup` | Phone, password, validation |
| KYC | `/(auth)/verify-otp` | BVN, NIN, terms checkbox |
| Biometric | `/(auth)/setup-biometric` | Face scan, skip option |

### Implementation Status

✅ All screens created
✅ Navigation flow implemented
✅ Root layout fixed (Slot instead of Stack)
✅ Splash screen with proper ready checks
✅ Auth layout with all routes
✅ Consistent styling with design system

### Next Steps

- [ ] Implement actual authentication logic
- [ ] Connect to backend API
- [ ] Add form validation
- [ ] Implement biometric authentication
- [ ] Add error handling and loading states
- [ ] Implement "Forgot Password" flow
- [ ] Add proper illustrations/images
- [ ] Test on physical devices
