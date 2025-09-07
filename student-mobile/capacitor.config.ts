import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.campus.events',
  appName: 'Campus Events',
  webDir: '.next',
  server: {
    url: 'http://localhost:3001',
    cleartext: true
  }
};

export default config;
