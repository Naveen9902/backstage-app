import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.backstage.app',
  appName: 'Backstage',
  webDir: 'out',
  server: {
    errorPath: 'index.html'
  }
};

export default config;
