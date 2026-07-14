import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.physis.notif',
  appName: 'physis-notif',
  webDir: 'dist',
  server: {
    allowNavigation: [
      'localhost'
    ],
    cleartext: true
  }
};

export default config;