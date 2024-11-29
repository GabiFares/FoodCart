import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'frontend',
  webDir: 'dist/frontend/browser',
  server: {
    allowNavigation: ['192.168.1.11'],
  },
};

export default config;
