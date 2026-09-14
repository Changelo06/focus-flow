# 🔔 Notification & Background Timer Features

## ✅ What's Been Added

Your Focus Flow app now has powerful notification and background features:

### 🎯 Core Features

1. **⏰ Timer Alarms**
   - Custom notification sound plays when timer completes
   - Ringtone plays 2 times (stops early if user responds)
   - Sound files: `NOTIFICATION.mp3` and `RINGTONE.mp3`

2. **📱 Persistent Notification**
   - Timer notification stays in notification bar
   - **Cannot be dismissed** while timer is running
   - Shows current time remaining
   - Updates automatically

3. **🎮 Notification Controls**
   - **Pause** - Pause timer from notification
   - **Resume** - Resume timer from notification
   - **Break** - Take a break from notification
   - **Stop** - Stop timer completely from notification
   
4. **🔄 Background Execution**
   - Timer continues running even when app is closed
   - Works while using other apps
   - Notifications persist until timer stops

5. **🔊 Sound Management**
   - Alarm sound plays when timer completes
   - Sound stops when user taps notification or responds
   - Plays 2 times by default (configurable)

6. **📳 Haptic Feedback**
   - Vibration on timer completion
   - Haptic feedback on button presses

7. **🔐 Permission Handling**
   - Automatically requests notification permissions
   - Graceful fallback for denied permissions

---

## 🚀 Testing Your App

### Option 1: Test on Web (PWA)

```powershell
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```

Open http://localhost:8080 in your browser and:
1. Click "Allow" when notification permission is requested
2. Start a timer
3. Switch to another tab - timer continues!
4. Browser notification shows when timer completes
5. Sound plays from `public/RINGTONE.mp3`

### Option 2: Test on Android

```powershell
# Build and sync if not done already
powershell -ExecutionPolicy Bypass -Command "npm run build; npx cap sync"

# Open in Android Studio
powershell -ExecutionPolicy Bypass -Command "npx cap open android"
```

Then in Android Studio:
1. Connect Android device (USB debugging enabled) OR start emulator
2. Click Run ▶️
3. App installs on device
4. Test the notification features!

**What to test on Android:**
- ✅ Start timer
- ✅ Press home button → notification stays visible
- ✅ Tap notification controls (Pause, Resume, Break, Stop)
- ✅ Let timer complete → alarm sound plays
- ✅ Notification persists (can't swipe away during timer)
- ✅ Stop timer → notification disappears

---

## 📋 App Behavior

### When Timer is Running:

| User Action | App Behavior |
|-------------|--------------|
| **Start Focus** | Requests notification permission, shows persistent notification |
| **Close App** | Timer continues, notification shows time remaining |
| **Use Other Apps** | Timer keeps running in background |
| **Phone Sleeps** | Timer still counts down, notification visible on wake |
| **Tap Notification** | Opens app |
| **Tap Pause (notification)** | Timer pauses, notification updates |
| **Tap Stop (notification)** | Timer stops, notification removed |

### When Timer Completes:

1. **Ringtone plays** (2 times)
2. **Completion notification** appears
3. **Vibration** (on Android)
4. **User can tap notification** to stop sound early

### Notification Updates:

- **Every 5 seconds** - Time remaining updates
- **Status changes** - Notification reflects focus/break/paused state
- **Background** - Updates even when app is closed

---

## 🎨 Customization

### Change Alarm Sound

Replace the files in `public/`:
- `NOTIFICATION.mp3` - Short notification sound
- `RINGTONE.mp3` - Alarm sound (plays 2x)

Or edit [src/utils/soundPlayer.ts](src/utils/soundPlayer.ts):
```typescript
private maxPlays: number = 2; // Change repeat count
```

### Modify Notification Update Frequency

Edit [src/hooks/useTimer.ts](src/hooks/useTimer.ts):
```typescript
const notificationInterval = setInterval(updateNotification, 5000); // Change 5000ms
```

### Customize Notification Text

Edit [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts):
```typescript
const statusEmoji = status === 'focus' ? '🎯' : status === 'break' ? '☕' : '⏸️';
// Change emojis or text as desired
```

### Change Haptic Patterns

Edit [src/hooks/useNotifications.ts](src/hooks/useNotifications.ts):
```typescript
await Haptics.impact({ style: ImpactStyle.Medium }); // Options: Light, Medium, Heavy
```

---

## 🔧 Files Modified/Created

### New Files:
- ✅ `src/hooks/useNotifications.ts` - Notification service
- ✅ `src/utils/soundPlayer.ts` - Sound/alarm player
- ✅ `public/NOTIFICATION.mp3` - Notification sound
- ✅ `public/RINGTONE.mp3` - Alarm sound

### Modified Files:
- ✅ `src/hooks/useTimer.ts` - Added notification support
- ✅ `src/components/TimerControls.tsx` - Added pause/resume/stop buttons
- ✅ `src/components/TimerView.tsx` - Updated props
- ✅ `src/pages/Index.tsx` - Connected new functions
- ✅ `capacitor.config.ts` - Added notification config

### Dependencies Added:
- ✅ `@capacitor/local-notifications` - Push notifications
- ✅ `@capacitor/haptics` - Vibration
- ✅ `@capacitor/app` - App lifecycle

---

## ⚙️ Android Permissions (Auto-configured)

The following permissions are automatically added for Android:

```xml
<!-- Auto-added by Capacitor plugins -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
```

No manual configuration needed! ✨

---

## 🐛 Troubleshooting

### Notifications Not Showing?

**On Web:**
1. Check browser notification permission (Settings → Permissions)
2. Try in Chrome/Edge (best support)
3. Check browser console for errors

**On Android:**
1. Go to App Settings → Notifications → Enable
2. Ensure "Do Not Disturb" is off
3. Check Android notification settings

### Sound Not Playing?

**On Web:**
1. Check audio files exist in `public/` folder
2. Browser must have audio permission
3. Check browser console for audio errors

**On Android:**
1. Check device volume
2. Ensure silent mode is off
3. Try different audio format if needed

### Timer Not Running in Background?

**On Web:**
- PWA may not keep timer, PWA currently running in active when browser tab is active or minimized (works best as installed PWA)
- Solution: Install as PWA or use native Android app

**On Android:**
- Should work perfectly with persistent notification
- If issues, check battery optimization settings

### Notification Can't Be Dismissed?

This is **intentional**!
- Persistent notifications ensure timer isn't accidentally stopped
- Use "Stop" button in notification or app to dismiss

---

## 📱 Next Steps

### For Web/PWA Testing:
```powershell
powershell -ExecutionPolicy Bypass -Command "npm run dev"
```
Then open http://localhost:8080

### For Android Testing:
```powershell
powershell -ExecutionPolicy Bypass -Command "npx cap open android"
```
Then click Run in Android Studio

### For Production Build:
```powershell
powershell -ExecutionPolicy Bypass -Command "npm run build; npx cap sync"
```

---

## 📚 Documentation

- **Capacitor Notifications**: https://capacitorjs.com/docs/apis/local-notifications
- **Capacitor Haptics**: https://capacitorjs.com/docs/apis/haptics
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

---

## ✨ Summary

Your app now has:
- ✅ Background timer execution
- ✅ Persistent notifications with controls
- ✅ Alarm sounds (2x ringtone)
- ✅ Pause/Resume/Stop from notifications
- ✅ Works even when app is closed
- ✅ Permission handling
- ✅ Haptic feedback
- ✅ Cross-platform (PWA + Android)

**Ready to test!** 🎉
