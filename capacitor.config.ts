import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.backstage.app',
  appName: 'Back Stage',
  webDir: 'out',
  server: {
    url: 'https://back-stage-theta.vercel.app',
    cleartext: false
  }

};

export default config;
