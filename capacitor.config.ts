import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: process.env.NEXT_PUBLIC_APP_FLAVOR === 'USER' ? 'com.backstage.fan' : 'com.backstage.ops',
  appName: process.env.NEXT_PUBLIC_APP_FLAVOR === 'USER' ? 'Backstage Fan' : 'Backstage Ops',
  webDir: 'out',
  backgroundColor: '#111111',
  server: { url: 'https://back-stage-theta.vercel.app', cleartext: false },
  appendUserAgent: process.env.NEXT_PUBLIC_APP_FLAVOR === 'USER' ? 'BackstageFlavor/User' : 'BackstageFlavor/Ops',
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "785362046928-cqn0aq549nljsk7d5hndlla62i81t090.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  }
};
export default config;
