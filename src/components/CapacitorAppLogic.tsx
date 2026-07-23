'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CapacitorAppLogic() {
  const router = useRouter();

  useEffect(() => {
    // Only import Capacitor dynamically when in browser
    if (typeof window !== 'undefined') {
      import('@capacitor/app').then(({ App }) => {
        App.addListener('backButton', () => {
          const path = window.location.pathname;
          // If we are at a root screen, exit the app
          if (path === '/' || path === '/worker' || path === '/manager') {
            App.exitApp();
          } else {
            // Otherwise go back in browser history
            window.history.back();
          }
        });
      }).catch(err => {
        console.warn('Capacitor App module not found, likely running in pure web mode', err);
      });
    }
  }, [router]);

  return null;
}
