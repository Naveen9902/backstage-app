'use client';

import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function GlobalNotificationListener({ currentUser }: { currentUser: any }) {
  const notificationCount = useRef(0);

  // Helper to trigger a local push notification
  const triggerNotification = async (title: string, body: string, id: number) => {
    try {
      if (typeof window !== 'undefined' && 
          (window as any).Capacitor && 
          typeof (window as any).Capacitor.isNativePlatform === 'function' && 
          (window as any).Capacitor.isNativePlatform()) {
        const packageName = '@capacitor/local-notifications';
        const { LocalNotifications } = await import(/* webpackIgnore: true */ packageName);
        const perm = await LocalNotifications.checkPermissions();
        if (perm.display !== 'granted') {
          await LocalNotifications.requestPermissions();
        }
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id,
              schedule: { at: new Date(Date.now() + 100) },
              smallIcon: 'ic_stat_icon_config_sample',
              iconColor: '#CD7F32'
            }
          ]
        });
      } else {
        // Fallback for Web/PWA
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body, icon: '/logo.jpg' });
        } else if ('Notification' in window && Notification.permission !== 'denied') {
          const p = await Notification.requestPermission();
          if (p === 'granted') {
            new Notification(title, { body, icon: '/logo.jpg' });
          }
        }
      }
    } catch (error) {
      console.error('Failed to trigger notification:', error);
    }
  };

  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    // 1. Check for Phone Verification immediately on mount
    if (currentUser.isPhoneVerified === false) {
      setTimeout(() => {
        triggerNotification(
          "Action Required",
          "Please verify your phone number to secure your account and access all features.",
          999999
        );
      }, 60000); // 5 seconds after load
    }

    // Prepare channels
    const channels: any[] = [];

    // 2. Listen to Notification table for explicit user notifications (Replies, etc.)
    const notificationChannel = supabase.channel(`global_push_notifications_${currentUser.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Notification', filter: `userId=eq.${currentUser.id}` },
        (payload: any) => {
          notificationCount.current += 1;
          triggerNotification("New Alert", payload.new.message, payload.new.id ? parseInt(payload.new.id.substring(0, 8), 16) || notificationCount.current : notificationCount.current);
        }
      ).subscribe();
    channels.push(notificationChannel);

    // 3. Listen to Event table (for Saved Events going live)
    const eventChannel = supabase.channel(`public:Event_status_changes`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'Event' },
        (payload: any) => {
          if (payload.new.status === 'ONGOING' && payload.old.status !== 'ONGOING') {
            // Check if this event is in the user's local saved IDs
            try {
              const savedKey = `backstage_saved_events_${currentUser.id}`;
              const saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
              if (saved.includes(payload.new.id)) {
                notificationCount.current += 1;
                triggerNotification(
                  "Event is LIVE! 🎉",
                  `${payload.new.title} has just started. Tap to enter the hub!`,
                  notificationCount.current
                );
              }
            } catch (e) {}
          }
        }
      ).subscribe();
    channels.push(eventChannel);

    // 4. Listen to EventChatMessage table (for Announcements in joined communities)
    const chatChannel = supabase.channel(`public:EventChatMessage_announcements`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'EventChatMessage', filter: `channel=eq.announcements` },
        (payload: any) => {
          // Check if user is in this community
          try {
            const joinedKey = `backstage_joined_communities_${currentUser.id}`;
            const joined = JSON.parse(localStorage.getItem(joinedKey) || '[]');
            if (joined.includes(payload.new.eventId)) {
              // Don't notify if the user themselves sent the announcement (Managers)
              if (payload.new.senderId !== currentUser.id) {
                notificationCount.current += 1;
                const snippet = payload.new.text.length > 50 ? payload.new.text.substring(0, 50) + '...' : payload.new.text;
                triggerNotification(
                  "📢 New Announcement",
                  snippet,
                  notificationCount.current
                );
              }
            }
          } catch (e) {}
        }
      ).subscribe();
    channels.push(chatChannel);

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [currentUser]);

  return null; // This is a purely background listener component
}
