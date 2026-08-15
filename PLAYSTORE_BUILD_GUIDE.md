# Google Play Store AAB Build Guide

## Prerequisites

1. **Install EAS CLI** (if not already installed)
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure your project** (if first time)
   ```bash
   eas build:configure
   ```

## Step 1: Prepare Your App for Production

### Update Version Numbers
Before each Play Store submission, update the version in `app.json`:
- `version`: "3.2.1" (user-facing version like 1.0.0, 1.0.1, etc.)
- `android.versionCode`: Increment by 1 for each submission (current: 1)

Example:
```json
{
  "expo": {
    "version": "3.2.1",
    "android": {
      "versionCode": 1
    }
  }
}
```

### Environment Variables
Ensure your production environment variables are set in `eas.json` under the production build profile.

## Step 2: Create a Google Play Service Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Navigate to **Setup** → **API access**
3. Create a service account or use existing one
4. Download the JSON key file
5. Save it securely (e.g., `google-play-service-account.json`)

## Step 3: Build the AAB

### Option A: Build and Submit Automatically

```bash
cd c:\Users\dell\Projects\Ajosave\mobile
eas build --platform android --profile production --auto-submit
```

This will:
- Build the AAB file
- Upload it to Play Store automatically (requires service account setup)

### Option B: Build Only (Manual Upload)

```bash
cd c:\Users\dell\Projects\Ajosave\mobile
eas build --platform android --profile production
```

This will:
- Build the AAB file
- Provide a download link when complete
- You manually upload to Play Store Console

## Step 4: Configure Auto-Submit (Optional)

To enable automatic submission, update `eas.json`:

```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

Tracks available:
- `internal` - Internal testing
- `alpha` - Closed testing (alpha)
- `beta` - Closed testing (beta) or Open testing
- `production` - Production release

## Step 5: Manual Upload to Play Store (if not auto-submitting)

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app (or create a new app if first time)
3. Navigate to **Production** → **Create new release**
4. Upload the AAB file downloaded from EAS Build
5. Fill in release notes
6. Review and rollout

## Step 6: First Time Play Store Setup

If this is your first submission, you'll need to complete:

### 1. Store Listing
- App name: AjosaveMobile
- Short description (80 chars max)
- Full description (4000 chars max)
- Screenshots (at least 2 for phone, tablet optional)
- Feature graphic (1024 x 500)
- App icon (512 x 512)

### 2. Content Rating
- Complete the questionnaire
- Get your content rating

### 3. Target Audience
- Select target age groups
- Indicate if app is designed for children

### 4. Privacy Policy
- Provide URL to privacy policy

### 5. App Access
- Indicate if app requires login
- Provide test credentials if needed

### 6. Ads Declaration
- Declare if app contains ads

### 7. Data Safety
- Complete data safety form
- Declare what data you collect and share

## Common Commands

### Check build status
```bash
eas build:list
```

### View build details
```bash
eas build:view [BUILD_ID]
```

### Submit manually after build
```bash
eas submit --platform android
```

### Build for internal testing (APK)
```bash
eas build --platform android --profile preview
```

## Troubleshooting

### Issue: Build fails with "duplicate resources"
- Check for duplicate assets in assets folder
- Ensure no conflicting native modules

### Issue: "Version code must be greater"
- Increment `android.versionCode` in app.json

### Issue: "Invalid package name"
- Verify `android.package` matches Play Store listing
- Current: `com.ajosave.AjosaveMobile`

### Issue: Build takes too long
- EAS builds run on remote servers
- Typical build time: 10-20 minutes
- Check status: `eas build:list`

## Production Checklist

Before submitting to Play Store:

- [ ] Update version number in app.json
- [ ] Increment versionCode for Android
- [ ] Test the app thoroughly on physical devices
- [ ] Ensure all API endpoints point to production
- [ ] Verify payment integration (Paystack) works in production mode
- [ ] Check all permissions are necessary and declared
- [ ] Prepare release notes for this version
- [ ] Update screenshots if UI has changed
- [ ] Test on different Android versions (min API level 21+)
- [ ] Verify app signing is configured correctly
- [ ] Review Play Store listing for accuracy

## Important Notes

1. **First Build**: EAS will generate a keystore automatically. Keep this safe as you'll need it for all future updates.

2. **Keystore Backup**: After your first build, download and backup your keystore:
   ```bash
   eas credentials
   ```

3. **Package Name**: Cannot be changed after first upload. Current: `com.ajosave.AjosaveMobile`

4. **Version Management**:
   - `version` is user-facing (can be any string like "1.0.0")
   - `versionCode` must increase with each upload (integer)

5. **Build Profiles**:
   - `development`: For development with expo-dev-client
   - `preview`: Internal testing (APK format)
   - `production`: Play Store submission (AAB format)

## Quick Start Command

For most use cases, run this single command:

```bash
cd c:\Users\dell\Projects\Ajosave\mobile
eas build --platform android --profile production
```

Then download the AAB file when ready and upload manually to Play Store Console.

## Support

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
