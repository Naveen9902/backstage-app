import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.backstage.app',
  appName: 'Backstage',
  webDir: 'out',
  server: {
    errorPath: 'index.html'
  },
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    CapacitorCookies: {
      enabled: true,
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: "785362046928-cqn0aq549nljsk7d5hndlla62i81t090.apps.googleusercontent.com"
    }
  }
};

export default config;
