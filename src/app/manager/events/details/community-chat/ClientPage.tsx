'use client';
import { apiFetch } from '@/lib/apiFetch';

import CommunityChatLayout from '@/components/CommunityChatLayout';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CommunitySplash from '@/components/CommunitySplash';

function ManagerEventChatSimpleContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id') || '';
  
  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [otherEvents, setOtherEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    const fetchUserAndEvent = async () => {
      let currentUser = user;
      
      if (!currentUser) {
        const sessionStr = localStorage.getItem('backstage_user_session');
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            if (session.role === 'MANAGER') {
              currentUser = session;
              setUser(session);
            }
          } catch (e) {}
        }
      }

      if (!currentUser) {
        // Fallback: fetch from API if session not in local storage
        try {
          const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manager/profile`);
          if (res.ok) {
            const data = await res.json();
            if (data && !data.error && data.role === 'MANAGER') {
              currentUser = data;
              setUser(data);
              // Save it for next time
              localStorage.setItem('backstage_user_session', JSON.stringify(data));
            } else {
              window.location.href = '/login';
              return;
            }
          } else {
            window.location.href = '/login';
            return;
          }
        } catch (err) {
          window.location.href = '/login';
          return;
        }
      }

      // Now fetch event
      try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/events/${eventId}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.error) setEvent(data);
        }
      } catch (err) {
        console.error(err);
      }
      
      // Fetch other events for sidebar
      try {
        const resComm = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manager/events`);
        if (resComm.ok) {
          const dataComm = await resComm.json();
          if (Array.isArray(dataComm)) {
            const filtered = dataComm.filter((e: any) => String(e.id) !== String(eventId) && e.status !== 'CANCELLED');
            setOtherEvents(filtered);
          }
        }
      } catch (err) {
        console.warn('Communities fetch warning:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndEvent();
  }, [eventId]);

  if (showSplash) {
    return <CommunitySplash onComplete={() => setShowSplash(false)} appFlavor="OPS" />;
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-[#f3efe5]">
        <div className="w-8 h-8 border-4 border-[#CD7F32] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event || event.managerId !== user?.id) {
    return <div className="p-8 text-red-500">You do not have permission to view this chat.</div>;
  }

  return (
    <div className="w-full h-full bg-[#f3efe5] flex flex-col">
      <CommunityChatLayout 
        eventId={eventId}
        event={event}
        currentUser={{ id: user.id, name: user.name, role: user.role, avatarUrl: user.avatarUrl }}
        otherEvents={otherEvents}
        returnHref="/manager/my-events"
      />
    </div>
  );
}

export default function ManagerEventChatSimplePage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex justify-center items-center">Loading...</div>}>
      <ManagerEventChatSimpleContent />
    </React.Suspense>
  );
}
