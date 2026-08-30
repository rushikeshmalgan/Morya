import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bappamode.app',
  appName: 'Bappa Morya',
  webDir: 'public',
  server: {
    url: 'http://localhost:3000',
    cleartext: true,
  },
};

export default config;
