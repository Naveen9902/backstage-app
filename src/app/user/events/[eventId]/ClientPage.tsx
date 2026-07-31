'use client';
import { apiFetch } from '@/lib/apiFetch';


import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import UserEventDetailView from '@/components/UserEventDetailView';

export default function UserEventDetails({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // 1. Fetch user profile to scope saved events to the current logged-in account
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/profile`)
      .then(res => res.json())
      .then(profile => {
        if (profile && profile.id) {
          setCurrentUser(profile);
          const savedKey = `backstage_saved_events_${profile.id}`;
          const joinedKey = `backstage_joined_communities_${profile.id}`;
          if (typeof window !== 'undefined') {
            try {
              const saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
              const joined = JSON.parse(localStorage.getItem(joinedKey) || '[]');
              if (Array.isArray(saved) && saved.includes(eventId)) setIsSaved(true);
              if (Array.isArray(joined) && joined.includes(eventId)) setHasJoined(true);
            } catch (e) {}
          }
        } else {
          if (typeof window !== 'undefined') {
            try {
              const saved = JSON.parse(localStorage.getItem('backstage_saved_events_guest') || '[]');
              const joined = JSON.parse(localStorage.getItem('backstage_joined_communities_guest') || '[]');
              if (Array.isArray(saved) && saved.includes(eventId)) setIsSaved(true);
              if (Array.isArray(joined) && joined.includes(eventId)) setHasJoined(true);
            } catch (e) {}
          }
        }
      })
      .catch(console.error);

    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/events/${eventId}`)
      .then(res => res.json())
      .then(eventData => {
        if (!eventData.error) {
          setEvent(eventData);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleSaveEvent = () => {
    setIsSaved(prev => {
      const nextVal = !prev;
      if (typeof window !== 'undefined') {
        try {
          const savedKey = currentUser ? `backstage_saved_events_${currentUser.id}` : 'backstage_saved_events_guest';
          const saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
          let nextArr: string[];
          if (nextVal) {
            nextArr = saved.includes(eventId) ? saved : [...saved, eventId];
          } else {
            nextArr = saved.filter((id: string) => id !== eventId);
          }
          localStorage.setItem(savedKey, JSON.stringify(nextArr));
        } catch (e) {}
      }
      return nextVal;
    });
  };

  const handleJoinCommunity = async () => {
    if (hasJoined) {
      router.push(`/user/community/${eventId}`);
      return;
    }
    setIsJoining(true);
    try {
      await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/events/${eventId}/join`, { method: 'POST' });
      setHasJoined(true);
      setIsSaved(true);
      if (typeof window !== 'undefined') {
        try {
          const joinedKey = currentUser ? `backstage_joined_communities_${currentUser.id}` : 'backstage_joined_communities_guest';
          const savedKey = currentUser ? `backstage_saved_events_${currentUser.id}` : 'backstage_saved_events_guest';
          const joined = JSON.parse(localStorage.getItem(joinedKey) || '[]');
          const saved = JSON.parse(localStorage.getItem(savedKey) || '[]');
          if (!joined.includes(eventId)) localStorage.setItem(joinedKey, JSON.stringify([...joined, eventId]));
          if (!saved.includes(eventId)) localStorage.setItem(savedKey, JSON.stringify([...saved, eventId]));
        } catch (e) {}
      }
      router.push(`/user/community/${eventId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a20] flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#1a1a20] flex flex-col justify-center items-center text-white p-6">
        <h2 className="text-xl font-bold mb-4">Event Not Found</h2>
        <button onClick={() => router.back()} className="px-6 py-2.5 bg-[#CD7F32] rounded-xl font-bold">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101014]">
      <UserEventDetailView
        event={event}
        onClose={() => router.back()}
        isSaved={isSaved}
        hasJoined={hasJoined}
        onToggleSave={handleSaveEvent}
        onJoinCommunity={handleJoinCommunity}
        isJoining={isJoining}
      />
    </div>
  );
}



