import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bappamode.app',
  appName: 'Bappa Morya',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
