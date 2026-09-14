# 📱 Mobile App Deployment Guide - Focus Flow

This guide covers both **PWA (Progressive Web App)** and **Native App (Capacitor)** deployment.

---

## ✨ Phase 1: PWA Setup (COMPLETED)

Your app is now configured as a PWA! Users can install it directly from their mobile browser.

### What's Been Configured:

1. ✅ **PWA Plugin Installed** - vite-plugin-pwa with workbox
2. ✅ **Service Worker** - Automatic caching and offline support
3. ✅ **Manifest** - App metadata for installation
4. ✅ **Icons** - Template SVG provided (see ICON-GENERATION-GUIDE.md)
5. ✅ **Mobile Meta Tags** - Optimized for iOS and Android

### Testing Your PWA:

#### Development (Local):
```bash
npm run dev
```
Visit http://localhost:8080 on your mobile device (ensure same network).
You'll see an "Install" prompt in supported browsers.

#### Production Build:
```bash
npm run build
npm run preview
```

### Deploy Your PWA:

Choose any static hosting provider:

#### Netlify (Recommended):
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

#### Vercel:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

#### GitHub Pages:
Add to package.json scripts:
```json
"deploy": "npm run build && npx gh-pages -d dist"
```

Then run:
```bash
npm install -D gh-pages
npm run deploy
```

### How Users Install:

**iOS Safari:**
1. Open your website
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Your app appears on their home screen!

**Android Chrome:**
1. Open your website
2. Tap the "Install" banner or
3. Menu → "Add to Home Screen" or "Install App"

---

## 🚀 Phase 2: Native App with Capacitor (iOS & Android)

Convert your PWA to a native app for App Store and Google Play distribution.

### Prerequisites:

- **For iOS**: macOS with Xcode installed
- **For Android**: Android Studio installed
- **For Both**: Node.js and npm

### Step 1: Install Capacitor

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
npx cap init
```

When prompted:
- **App name**: Focus Flow
- **App ID**: com.yourcompany.focusflow (use reverse domain notation)

### Step 2: Update vite.config.ts

Add base path for Capacitor (already set up) - no changes needed!

### Step 3: Build and Add Platforms

```bash
# Build your app
npm run build

# Add iOS (macOS only)
npx cap add ios

# Add Android
npx cap add android

# Copy web assets
npx cap copy

# Sync changes
npx cap sync
```

### Step 4: Configure Capacitor

Create `capacitor.config.ts` in project root:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourcompany.focusflow',
  appName: 'Focus Flow',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
  },
};

export default config;
```

### Step 5: Open Native IDEs

```bash
# Open iOS in Xcode (macOS only)
npx cap open ios

# Open Android in Android Studio
npx cap open android
```

### Step 6: Setup Native Projects

#### iOS (Xcode):
1. **Signing**: Select your Team in "Signing & Capabilities"
2. **Icons**: Add app icons in Assets.xcassets
3. **Splash Screen**: Configure in LaunchScreen.storyboard
4. **Permissions**: Add to Info.plist if needed:
   ```xml
   <key>NSUserNotificationsUsageDescription</key>
   <string>Focus Flow uses notifications for Pomodoro timers</string>
   ```
5. **Build**: Product → Archive → Distribute

#### Android (Android Studio):
1. **Icons**: Replace icons in res/mipmap folders
2. **Splash Screen**: Configure in res/drawable
3. **Permissions**: Add to AndroidManifest.xml if needed:
   ```xml
   <uses-permission android:name="android.permission.VIBRATE" />
   ```
4. **Build**: Build → Generate Signed Bundle/APK
5. **Sign**: Create/use keystore for release

### Step 7: Add Native Features (Optional)

Install Capacitor plugins for native functionality:

```bash
# Local Notifications
npm install @capacitor/local-notifications
npx cap sync

# Haptics (vibration)
npm install @capacitor/haptics
npx cap sync

# App Badge
npm install @capawesome/capacitor-badge
npx cap sync

# Background Tasks
npm install @capacitor/background-runner
npx cap sync
```

Example usage in your components:

```typescript
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

// Schedule notification when timer completes
await LocalNotifications.schedule({
  notifications: [{
    title: "Pomodoro Complete!",
    body: "Time for a break 🎉",
    id: 1,
    schedule: { at: new Date(Date.now() + 25 * 60 * 1000) }
  }]
});

// Haptic feedback on button press
await Haptics.impact({ style: ImpactStyle.Medium });
```

### Step 8: Testing on Device

#### iOS:
1. Connect iPhone via USB
2. Select device in Xcode
3. Click Run (▶️)
4. App installs and launches

#### Android:
1. Enable Developer Mode on device
2. Enable USB Debugging
3. Connect via USB
4. Click Run in Android Studio

### Step 9: Publish to Stores

#### iOS App Store:
1. Create App in App Store Connect
2. Archive in Xcode
3. Upload via Xcode or Application Loader
4. Submit for review
5. Wait for approval (1-3 days typically)

#### Google Play Store:
1. Create app in Google Play Console
2. Generate signed APK/AAB
3. Upload to Play Console
4. Complete store listing
5. Submit for review
6. Publish (review takes hours to days)

### Development Workflow:

```bash
# After making changes to web code:
npm run build
npx cap copy     # Copy web assets
npx cap sync     # Sync plugins

# Then test in native IDE
npx cap open ios
npx cap open android
```

### Live Reload (Development):

Update capacitor.config.ts:

```typescript
server: {
  url: 'http://192.168.1.XXX:8080', // Your local IP
  cleartext: true
}
```

Run:
```bash
npm run dev
npx cap copy
```

Now changes appear instantly in the native app!

---

## 🎯 Comparison: PWA vs Native App

| Feature | PWA | Native (Capacitor) |  
|---------|-----|-------------------|
| **Distribution** | Direct URL | App Stores |
| **Installation** | Browser prompt | Store download |
| **Updates** | Instant | Manual/auto-update |
| **Offline** | ✅ Yes | ✅ Yes |
| **Push Notifications** | ⚠️ Limited iOS | ✅ Full support |
| **Native Features** | ⚠️ Limited | ✅ Full access |
| **Development Time** | ⏱️ Quick | ⏱️⏱️ Longer |
| **Maintenance** | 🔧 Single codebase | 🔧 Single codebase |
| **App Store Presence** | ❌ No | ✅ Yes |
| **Cost** | 💰 Free | 💰💰 Store fees ($99/yr iOS, $25 one-time Android) |

---

## 📋 Next Steps

### For PWA:
1. ✅ Setup complete!
2. 🎨 Generate proper icons (see ICON-GENERATION-GUIDE.md)
3. 🚀 Deploy to hosting service
4. 📱 Test on real devices
5. 📊 Add analytics if needed

### For Native App:
1. 📖 Review Capacitor docs: https://capacitorjs.com/docs
2. 🛠️ Install Xcode (iOS) or Android Studio
3. 📱 Follow Step 1-9 above
4. 🧪 Test thoroughly on real devices
5. 📤 Submit to app stores

---

## 🆘 Troubleshooting

### PWA not installing?
- Check HTTPS (required for PWA)
- Ensure all icons exist
- Check browser console for errors
- Verify manifest.json is served correctly

### Capacitor build errors?
- Run `npx cap doctor` to diagnose
- Ensure native IDEs are installed
- Check platform-specific requirements
- Update Capacitor: `npm update @capacitor/core @capacitor/cli`

### Icons not showing?
- Verify file paths in manifest
- Check file sizes match requirements
- Clear browser cache
- Rebuild: `npm run build && npx cap sync`

---

## 📚 Resources

- **PWA**: https://web.dev/progressive-web-apps/
- **Capacitor**: https://capacitorjs.com/
- **iOS Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Android Guidelines**: https://play.google.com/console/about/guides/
- **App Store Connect**: https://appstoreconnect.apple.com/
- **Google Play Console**: https://play.google.com/console/

---

## ✅ Current Status

- ✅ PWA configured and ready to deploy
- ⏳ Native app setup pending (follow Phase 2 when ready)
- 🎨 Icons need generation (see ICON-GENERATION-GUIDE.md)

**Your app is ready for mobile deployment!** 🎉
