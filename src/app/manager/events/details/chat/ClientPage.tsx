'use client';
import { apiFetch } from '@/lib/apiFetch';

import { redirect } from 'next/navigation';
import CommunityChatLayout from '@/components/CommunityChatLayout';
import React, { useState, useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

function ManagerEventChatContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id') || '';
  const [initialChannel, setInitialChannel] = useState('announcements');
  const [event, setEvent] = useState<any>(null);
  const [otherEvents, setOtherEvents] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    
    // Client-side search params parsing
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      const ch = search.get('channel');
      if (ch) setInitialChannel(ch);
    }

    const fetchAll = async () => {
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

      try {
        const [eventRes, managerEventsRes] = await Promise.all([
          apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/events/${eventId}`),
          apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manager/events`, {
            headers: { 'Cookie': `managerUserId=${currentUser.id}; userId=${currentUser.id}` }
          })
        ]);

        if (eventRes.ok) {
          const eventData = await eventRes.json();
          if (!eventData.error) setEvent(eventData);
        }

        if (managerEventsRes.ok) {
          const allEvents = await managerEventsRes.json();
          if (Array.isArray(allEvents)) {
            setOtherEvents(allEvents.filter((e: any) => e.id !== eventId));
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [eventId]);

  if (loading) {
    return (
      <div className="w-[100vw] h-[calc(100dvh-128px)] -mx-4 -mt-4 bg-[#f3efe5] md:w-full md:h-full md:mx-0 md:mt-0 flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-[#CD7F32] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event || event.managerId !== user?.id) {
    return <div className="p-8 text-red-500">You do not have permission to view this chat.</div>;
  }

  const currentUserObj = {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role
  };

  return (
    <div className="w-[100vw] h-[calc(100dvh-128px)] -mx-4 -mt-4 bg-[#f3efe5] md:w-full md:h-full md:mx-0 md:mt-0 flex flex-col md:rounded-xl md:overflow-hidden">
      <CommunityChatLayout 
        eventId={eventId}
        event={event}
        currentUser={currentUserObj}
        otherEvents={otherEvents}
        returnHref="/manager/my-events"
        initialChannel={initialChannel}
      />
    </div>
  );
}

export default function ManagerEventChatPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading chat...</div>}>
      <ManagerEventChatContent />
    </React.Suspense>
  );
}
