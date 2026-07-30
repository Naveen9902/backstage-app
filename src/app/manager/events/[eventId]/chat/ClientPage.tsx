'use client';
import { redirect } from 'next/navigation';
import CommunityChatLayout from '@/components/CommunityChatLayout';
import React, { useState, useEffect } from 'react';

export default function ManagerEventChatPage({ 
  params
}: {
  params: Promise<{ eventId: string }>
}) {
  const { eventId } = React.use(params);
  const [initialChannel, setInitialChannel] = useState('announcements');
  const [event, setEvent] = useState<any>(null);
  const [otherEvents, setOtherEvents] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Client-side search params parsing
    if (typeof window !== 'undefined') {
      const search = new URLSearchParams(window.location.search);
      const ch = search.get('channel');
      if (ch) setInitialChannel(ch);
    }

    // Check local storage for session
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

    const fetchAll = async () => {
      try {
        const [eventRes, managerEventsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/events/${eventId}`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manager/events`, {
            headers: { 'Cookie': `managerUserId=${session.id}; userId=${session.id}` }
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



