'use client';
import { apiFetch } from '@/lib/apiFetch';


import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import CommunityChatLayout from '@/components/CommunityChatLayout';

export default function UserCommunityChatPage() {
  const params = useParams();
  const eventId = (params?.eventId as string) || 'default';

  const [eventData, setEventData] = useState<any>({
    id: eventId,
    title: "Community Chat",
    description: "Official event community chat room. Connect with attendees and organizers.",
    coverImageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop",
    date: new Date().toISOString(),
    location: "Main Event Area",
    managerId: null,
    manager: null
  });

  const [currentUser, setCurrentUser] = useState<any>({
    id: 'community_member',
    name: 'Member',
    avatarUrl: null,
    role: 'USER'
  });

  const [otherEvents, setOtherEvents] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch current logged-in user profile
    const loadProfile = async () => {
      try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/profile`);
        if (res.ok) {
          const data = await res.json();
          if (data && !data.error && data.id) {
            setCurrentUser({
              id: data.id,
              name: data.name || 'Member',
              avatarUrl: data.avatarUrl || null,
              role: data.role || 'USER'
            });
          }
        }
      } catch (err) {
        console.warn('Profile fetch warning:', err);
      }
    };

    // 2. Fetch event details for this eventId and all communities for switcher
    const loadEvent = async () => {
      try {
        const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/events`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const found = data.find((e: any) => String(e.id) === String(eventId));
            if (found) {
              setEventData(found);
            }
          }
        }
      } catch (err) {
        console.warn('Events fetch warning:', err);
      }

      try {
        const resComm = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/community`);
        if (resComm.ok) {
          const dataComm = await resComm.json();
          if (Array.isArray(dataComm)) {
            const filtered = dataComm.filter((e: any) => String(e.id) !== String(eventId));
            setOtherEvents(filtered);
          }
        }
      } catch (err) {
        console.warn('Communities fetch warning:', err);
      }
    };

    loadProfile();
    loadEvent();
  }, [eventId]);

  return (
    <div className="w-full h-full bg-[#f3efe5] flex flex-col">
      <CommunityChatLayout 
        eventId={eventId}
        event={eventData}
        currentUser={currentUser}
        otherEvents={otherEvents}
        returnHref="/user/community"
      />
    </div>
  );
}



