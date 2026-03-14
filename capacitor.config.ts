import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.arcanaengine.client',
  appName: 'Arcana Engine',
  webDir: 'dist',
  server: {
    url: "http://192.168.0.16:5173",
    cleartext: true
  }
};

export default config;