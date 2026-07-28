'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '@/lib/supabase';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [topNotification, setTopNotification] = useState<any | null>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
        if (data.length > 0) {
          setUserId(data[0].userId);
        } else {
          // If no notifications, try to fetch current user to get ID for realtime filtering
          const meRes = await fetch('/api/auth/me', { cache: 'no-store' });
          if (meRes.ok) {
            const meData = await meRes.json();
            if (meData.user?.id) setUserId(meData.user.id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Notification', filter: `userId=eq.${userId}` },
        (payload) => {
          // Add the new notification to the list and increment unread
          const newNotif = payload.new;
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
          setTopNotification(newNotif);

          if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try { navigator.vibrate([200, 100, 200]); } catch (e) {}
          }

          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('BackStage Alert ⚡', {
                body: newNotif.message || 'You have a new notification',
                icon: '/favicon.ico'
              });
            } catch (e) {}
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (!topNotification) return;
    const timer = setTimeout(() => {
      setTopNotification(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [topNotification]);

  const markAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: unreadIds })
      });
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      markAsRead();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="p-2 bg-[#CD7F32] text-white rounded-full hover:bg-[#a06227] transition-colors relative shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#CD7F32] text-[10px] font-bold shadow-sm ring-2 ring-[#CD7F32]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-800">Notifications</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-sm italic">
                  No notifications yet.
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`p-4 border-b border-gray-50 text-sm ${!n.isRead ? 'bg-blue-50/30 font-medium text-gray-900' : 'text-gray-600'}`}>
                    {n.message}
                    <div className="text-[10px] text-gray-400 mt-1 uppercase">
                      {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Mobile Notification Toast Popup */}
      <AnimatePresence>
        {topNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed top-4 left-4 right-4 z-[99999] md:left-auto md:right-6 md:w-96 bg-gradient-to-r from-[#242424] to-[#1a1a1a] text-white border-2 border-[#CD7F32] rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#CD7F32] to-yellow-500 flex items-center justify-center text-xl shrink-0 shadow-md">
              ⚡
            </div>
            <div 
              className="flex-1 min-w-0 cursor-pointer" 
              onClick={() => { 
                setTopNotification(null); 
                setIsOpen(true); 
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-black tracking-wider uppercase text-[#CD7F32] bg-[#CD7F32]/15 px-2 py-0.5 rounded border border-[#CD7F32]/40 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#CD7F32] animate-ping"></span> Live Alert
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Just now</span>
              </div>
              <p className="text-sm font-medium text-gray-100 leading-snug break-words">
                {topNotification.message}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setTopNotification(null);
              }}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 7, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#CD7F32] to-yellow-500 rounded-b-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

