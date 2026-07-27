import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.backstage.ops',
  appName: 'Backstage Ops',
  webDir: 'out',
  backgroundColor: '#111111',
  server: { url: 'https://back-stage-theta.vercel.app', cleartext: false },
  appendUserAgent: 'BackstageFlavor/Ops'
};
export default config;
