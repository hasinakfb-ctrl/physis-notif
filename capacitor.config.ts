import type { CapacitorConfig } from '@capacitor/cli';
// On importe le package.json pour récupérer dynamiquement la version de l'app
import pkg from './package.json';

const config: CapacitorConfig = {
  appId: 'com.physis.notif',
  appName: 'physis-notif',
  webDir: 'dist',
  server: {
    allowNavigation: [
      'localhost'
    ],
    cleartext: true
  },
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true,
      // Indique à Capgo la version de base de l'application native (ex: "1.0.0")
      version: pkg.version,
      // Force l'application à écouter le canal où tu as uploadé ton bundle
      defaultChannel: 'production',
      delay: 2000 
    }
  }
};

export default config;