'use client';

import React, { useState, useEffect } from 'react';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [message, setMessage] = useState('');
  const [isNative, setIsNative] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const isCapacitorNative = Boolean(
        (window as any).Capacitor && 
        typeof (window as any).Capacitor.isNativePlatform === 'function' && 
        (window as any).Capacitor.isNativePlatform()
      );
      setIsNative(isCapacitorNative);

      const checkAndRequest = async () => {
        if (isCapacitorNative) {
          try {
            const { LocalNotifications } = await import('@capacitor/local-notifications');
            const perm = await LocalNotifications.checkPermissions();
            if (perm.display !== 'granted') {
              const req = await LocalNotifications.requestPermissions();
              if (req.display === 'granted') setHasPermission(true);
            } else {
              setHasPermission(true);
            }
          } catch(e) {}
        } else {
          if ('Notification' in window) {
            if (Notification.permission === 'granted') {
              setHasPermission(true);
              if ('serviceWorker' in navigator && 'PushManager' in window) {
                registerServiceWorker().then(() => subscribeToPush());
              }
            } else if (Notification.permission === 'default') {
              try {
                const req = await Notification.requestPermission();
                if (req === 'granted') {
                  setHasPermission(true);
                  if ('serviceWorker' in navigator && 'PushManager' in window) {
                    registerServiceWorker().then(() => subscribeToPush());
                  }
                }
              } catch (e) {}
            }
          }
        }
      };
      
      checkAndRequest();
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (e) {
      console.warn('SW registration fallback:', e);
    }
  }

  async function subscribeToPush() {
    try {
      if (!('serviceWorker' in navigator)) return;
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      setSubscription(sub);
      await fetch('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(sub)
      });
      setHasPermission(true);
    } catch (err) {
      console.error(err);
    }
  }

  return null;
}
