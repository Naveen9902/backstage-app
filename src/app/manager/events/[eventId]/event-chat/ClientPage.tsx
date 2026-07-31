'use client';
import { apiFetch } from '@/lib/apiFetch';

import EventChat from '@/components/EventChat';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

export default function ManagerEventChatSimplePage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = React.use(params);
  
  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionStr = localStorage.getItem('backstage_user_session');
    if (!sessionStr) {
      window.location.href = '/login';
      return;
    }
    
    let session;
    try {
      session = JSON.parse(sessionStr);
      if (session.role !== 'MANAGER') {
        window.location.href = '/login';
        return;
      }
      setUser(session);
    } catch (e) {
      window.location.href = '/login';
      return;
    }

    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/events/${eventId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setEvent(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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



