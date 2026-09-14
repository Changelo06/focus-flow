import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sample.app',
  appName: 'Study Track',
  webDir: 'dist',
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "ringtone.mp3",
    },
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#ffffff",
      showSpinner: false,
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
