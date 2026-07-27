import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.backstage.app',
  appName: 'Back Stage',
  webDir: 'out',
  backgroundColor: '#111111',
  server: { url: 'https://back-stage-theta.vercel.app', cleartext: false },
  appendUserAgent: 'BackstageFlavor/User'
};
export default config;
