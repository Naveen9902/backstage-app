import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: process.env.NEXT_PUBLIC_APP_FLAVOR === 'OPS' ? 'com.backstage.ops' : 'com.backstage.fan',
  appName: process.env.NEXT_PUBLIC_APP_FLAVOR === 'OPS' ? 'Backstage Ops' : 'Backstage Fan',
  webDir: 'out',
  backgroundColor: '#111111',
  server: { url: 'https://back-stage-theta.vercel.app', cleartext: false },
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "785362046928-cqn0aq549nljsk7d5hndlla62i81t090.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  }
};
export default config;
