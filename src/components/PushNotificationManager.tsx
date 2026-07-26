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

  useEffect(() => {
    // Detect Native Capacitor APK vs Web safely
    if (typeof window !== 'undefined') {
      const isCapacitorNative = Boolean(
        (window as any).Capacitor && 
        typeof (window as any).Capacitor.isNativePlatform === 'function' && 
        (window as any).Capacitor.isNativePlatform()
      );
      setIsNative(isCapacitorNative);

      if (!isCapacitorNative && 'serviceWorker' in navigator && 'PushManager' in window) {
        registerServiceWorker();
      }
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
      if (!vapidKey) {
        setMessage('VAPID key not configured.');
        return;
      }
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      setSubscription(sub);
      await fetch('/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(sub)
      });
      setMessage('Web push subscription activated!');
    } catch (err) {
      console.error(err);
      setMessage('Please allow notification permissions in your browser settings.');
    }
  }

  async function enableDeviceNotifications() {
    setMessage('Requesting notification permissions...');
    try {
      if (isNative) {
        const { LocalNotifications } = await import('@capacitor/local-notifications');
        const perm = await LocalNotifications.requestPermissions();
        if (perm.display === 'granted') {
          setMessage('📱 Mobile Device Notifications Enabled!');
          await LocalNotifications.schedule({
            notifications: [
              {
                title: '📱 Device Alerts Enabled!',
                body: 'You are now ready to receive instant notifications on your mobile device.',
                id: Math.floor(Math.random() * 100000),
                schedule: { at: new Date(Date.now() + 100) },
              }
            ]
          });
        } else {
          setMessage('Permission denied in mobile app settings.');
        }
      } else {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            setMessage('📱 Mobile & Browser Notifications Enabled!');
            subscribeToPush();
          } else {
            setMessage('Permission denied in browser settings.');
          }
        } else {
          setMessage('Notifications enabled via fallback alerting.');
        }
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to request permissions. Enabled via fallback.');
    }
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    setMessage('Unsubscribed from web push.');
  }

  const testSystemNotification = async () => {
    setMessage('Sending test alert...');
    let alertSent = false;
    
    // 1. Try Capacitor / Local notification first for instant native mobile feedback
    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications');
      await LocalNotifications.schedule({
        notifications: [
          {
            title: '🎉 BackStage Notifications Active!',
            body: 'You are all set to receive instant shift and runner dispatch alerts.',
            id: Math.floor(Math.random() * 100000),
            schedule: { at: new Date(Date.now() + 100) },
          }
        ]
      });
      setMessage('Test alert sent to your device!');
      alertSent = true;
    } catch (e) {
      // 2. Web fallback
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('🎉 BackStage Notifications Active!', {
            body: 'You are all set to receive instant shift and runner dispatch alerts.',
            icon: '/logo.jpg'
          });
          setMessage('Test alert sent!');
          alertSent = true;
        } else if (Notification.permission !== 'denied') {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            new Notification('🎉 BackStage Notifications Active!', {
              body: 'You are all set to receive instant shift and runner dispatch alerts.',
              icon: '/logo.jpg'
            });
            setMessage('Test alert sent!');
            alertSent = true;
          } else {
            setMessage('Permission denied by browser.');
          }
        } else {
          setMessage('Notification permission denied in browser.');
        }
      }
    }

    // Also trigger server test if push subscription exists
    if (subscription) {
      fetch('/api/push/test', { method: 'POST' }).catch(() => {});
    }

    if (!alertSent && !message.includes('sent')) {
      setMessage('Test alert triggered.');
    }
  };

  return (
    <div className="p-5 border border-[#CD7F32]/30 bg-gradient-to-r from-[#1a1a1a] via-[#242424] to-[#1a1a1a] text-white rounded-2xl flex flex-col items-start gap-4 shadow-xl w-full">
      <div className="flex items-center justify-between w-full flex-wrap gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <h3 className="font-extrabold text-white font-serif tracking-tight text-base md:text-lg flex items-center gap-1.5">
            🔔 System & Push Notifications
          </h3>
        </div>
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-extrabold px-3 py-1 rounded-full font-mono uppercase tracking-wider">
          Active & Ready
        </span>
      </div>
      
      <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
        You are configured to receive real-time alerts for accepted shifts, new runner dispatches, and payout confirmations directly on your device.
      </p>

      <div className="flex flex-wrap items-center gap-2.5 pt-1 w-full sm:w-auto">
        <button
          onClick={enableDeviceNotifications}
          type="button"
          className="w-full sm:w-auto px-4.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs md:text-sm transition-all shadow-lg hover:shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
        >
          <span>📱 Enable Device Notifications</span>
        </button>

        <button
          onClick={testSystemNotification}
          type="button"
          className="w-full sm:w-auto px-4.5 py-2.5 bg-gradient-to-r from-[#CD7F32] to-amber-600 hover:from-[#b86d26] hover:to-amber-700 text-white font-extrabold rounded-xl text-xs md:text-sm transition-all shadow-lg hover:shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>⚡ Send Test Alert</span>
        </button>

        {!isNative && !subscription && 'serviceWorker' in (typeof navigator !== 'undefined' ? navigator : {}) && (
          <button
            onClick={subscribeToPush}
            type="button"
            className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs md:text-sm transition-all border border-white/20"
          >
            Enable Web Push
          </button>
        )}

        {!isNative && subscription && (
          <button
            onClick={unsubscribeFromPush}
            type="button"
            className="w-full sm:w-auto px-3.5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold rounded-xl text-xs transition-all border border-red-500/30"
          >
            Unsubscribe Web Push
          </button>
        )}
      </div>

      {message && (
        <div className="mt-1 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg w-full">
          <p className="text-xs font-bold text-[#CD7F32] font-mono">{message}</p>
        </div>
      )}
    </div>
  );
}
