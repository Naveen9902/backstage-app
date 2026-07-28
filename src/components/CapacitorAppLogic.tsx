'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CapacitorAppLogic() {
  const router = useRouter();

  useEffect(() => {
    // Only import Capacitor dynamically when in browser
    if (typeof window !== 'undefined') {
      import('@capacitor/core').then(({ Capacitor }) => {
        if (Capacitor.isNativePlatform()) {
          // App Plugin
          import('@capacitor/app').then(({ App }) => {
            App.addListener('backButton', () => {
              const path = window.location.pathname;
              if (path === '/' || path === '/worker' || path === '/manager') {
                App.exitApp();
              } else {
                window.history.back();
              }
            });
          }).catch(err => {
            console.warn('Capacitor App module not found', err);
          });

          // Configure StatusBar
          import('@capacitor/status-bar').then(({ StatusBar, Style }) => {
            StatusBar.setStyle({ style: Style.Light }).catch(() => {});
            StatusBar.setBackgroundColor({ color: '#F5F5DC' }).catch(() => {});
          }).catch(err => {
            console.warn('Capacitor StatusBar module not found', err);
          });
        }
      }).catch(err => {
        console.warn('Capacitor Core module not found', err);
      });
    }
  }, [router]);

  return null;
}
