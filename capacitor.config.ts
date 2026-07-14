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
  },
  plugins: {
    CapacitorUpdater: {
      autoUpdate: true,
      // Optionnel mais recommandé : permet de ne pas bloquer le démarrage de l'app 
      // si le réseau est trop lent pour chercher une mise à jour.
      delay: 2000 
    }
  }
};

export default config;