'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CapacitorAppLogic() {
  const router = useRouter();

  useEffect(() => {
    // Only import Capacitor dynamically when in browser
    if (typeof window !== 'undefined') {
      import('@capacitor/app').then(({ App }) => {
        App.addListener('backButton', ({ canGoBack }) => {
          if (canGoBack) {
            router.back();
          } else {
            App.exitApp();
          }
        });
      }).catch(err => {
        console.warn('Capacitor App module not found, likely running in pure web mode', err);
      });
    }
  }, [router]);

  return null;
}
