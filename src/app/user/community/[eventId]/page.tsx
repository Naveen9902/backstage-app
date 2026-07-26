'use client';

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

  useEffect(() => {
    // 1. Fetch current logged-in user profile
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error && data.id) {
          setCurrentUser({
            id: data.id,
            name: data.name || 'Member',
            avatarUrl: data.avatarUrl || null,
            role: data.role || 'USER'
          });
        }
      })
      .catch(console.error);

    // 2. Fetch event details for this eventId
    fetch('/api/user/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const found = data.find((e: any) => String(e.id) === String(eventId));
          if (found) {
            setEventData(found);
          }
        }
      })
      .catch(console.error);
  }, [eventId]);

  return (
    <div className="w-full h-full bg-[#f3efe5] flex flex-col">
      <CommunityChatLayout 
        eventId={eventId}
        event={eventData}
        currentUser={currentUser}
        otherEvents={[]}
        returnHref="/user/community"
      />
    </div>
  );
}
