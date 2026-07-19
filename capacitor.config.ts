import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.backstage.app',
  appName: 'Back Stage',
  webDir: 'out',
  server: {
    url: 'http://10.186.52.53:3000',
    cleartext: true
  }

};

export default config;
