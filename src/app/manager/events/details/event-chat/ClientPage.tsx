'use client';
import { apiFetch } from '@/lib/apiFetch';

import EventChat from '@/components/EventChat';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function ManagerEventChatSimpleContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id') || '';
  
  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#CD7F32] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!event || event.managerId !== user?.id) {
    return <div className="p-8 text-red-500">You do not have permission to view this chat.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/manager/my-events" className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to My Events
          </Link>
          <h1 className="text-3xl font-bold font-serif text-[#CD7F32]">{event.title} - Chat</h1>
        </div>
      </div>
      
      <EventChat eventId={eventId} currentUser={{ id: user.id, name: user.name, role: user.role, avatarUrl: user.avatarUrl }} />
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
