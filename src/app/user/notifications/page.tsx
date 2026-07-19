'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getIcon = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-[#242424] font-sans">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">Notifications</h1>
          <p className="text-gray-600">Stay updated on your upcoming events and community alerts.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#EAE6DF]">
          <p className="text-gray-500">You have no new notifications.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-[#EAE6DF] overflow-hidden">
          {notifications.map((notif, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={notif.id}
              className={`p-6 border-b border-gray-100 last:border-0 flex gap-4 transition-colors ${!notif.isRead ? 'bg-[#CD7F32]/5' : 'hover:bg-gray-50'}`}
            >
              <div className="mt-1 flex-shrink-0">
                {getIcon()}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold text-sm ${!notif.isRead ? 'text-[#242424]' : 'text-gray-700'}`}>
                    System Notification
                  </h3>
                  <span className="text-xs text-gray-400 font-medium whitespace-nowrap ml-4">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {notif.message}
                </p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 bg-[#CD7F32] rounded-full mt-2 flex-shrink-0" />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
