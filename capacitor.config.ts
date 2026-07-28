import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'com.backstage.ops',
  appName: 'Backstage Ops',
  webDir: 'out',
  backgroundColor: '#111111',
  server: { url: 'https://back-stage-theta.vercel.app', cleartext: false },
  appendUserAgent: 'BackstageFlavor/Ops',
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "785362046928-cqn0aq549nljsk7d5hndlla62i81t090.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  }
};
export default config;
