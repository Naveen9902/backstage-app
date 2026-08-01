'use client';
import { apiFetch } from '@/lib/apiFetch';

import EventChat from '@/components/EventChat';
import Link from 'next/link';
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function WorkerEventChatContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  
  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      let currentUser = user;
      
      if (!currentUser) {
        const sessionStr = localStorage.getItem('backstage_user_session');
        if (sessionStr) {
          try {
            const session = JSON.parse(sessionStr);
            if (session.role === 'WORKER') {
              currentUser = session;
              setUser(session);
            }
          } catch (e) {}
        }
      }

      if (!currentUser) {
        // Fallback: fetch from API if session not in local storage
        try {
          const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/profile`);
          if (res.ok) {
            const data = await res.json();
            if (data && !data.error && data.role === 'WORKER') {
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
        const [eventRes, applicationsRes, runnersRes] = await Promise.all([
          apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/events/${eventId}`),
          apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/applications`),
          apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/runners`)
        ]);

        if (eventRes.ok) {
          const data = await eventRes.json();
          if (!data.error) setEvent(data);
        }

        let hasAccess = false;
        if (applicationsRes.ok) {
          const apps = await applicationsRes.json();
          if (Array.isArray(apps)) {
            const isAccepted = apps.some((app: any) => app.staffingRequest?.eventId === eventId && ['ACCEPTED', 'PAID', 'HIRED'].includes(app.status));
            if (isAccepted) hasAccess = true;
          }
        }

        if (runnersRes.ok) {
          const runners = await runnersRes.json();
          if (Array.isArray(runners)) {
            const isRunner = runners.some((r: any) => r.eventId === eventId && String(r.runnerId) === String(currentUser.id));
            if (isRunner) hasAccess = true;
          }
        }
        
        setHasPermission(hasAccess);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [eventId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#CD7F32] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!eventId) return <div className="p-8 text-red-500">Event ID missing.</div>;
  if (!event) return <div className="p-8 text-red-500">Event not found.</div>;
  
  if (!hasPermission) {
    return <div className="p-8 text-red-500">You do not have permission to view this chat. You must have an accepted job for this event.</div>;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link href="/worker/schedule" className="text-sm font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 mb-2 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            Back to Schedule
          </Link>
          <h1 className="text-3xl font-bold font-serif text-[#CD7F32]">{event.title} - Chat</h1>
        </div>
      </div>
      
      <EventChat eventId={eventId} currentUser={{ id: user.id, name: user.name, role: user.role, avatarUrl: user.avatarUrl }} />
    </div>
  );
}

export default function WorkerEventChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <WorkerEventChatContent />
    </Suspense>
  );
}
