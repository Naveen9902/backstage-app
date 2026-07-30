'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Calendar, MapPin } from 'lucide-react';
import UserEventDetailView from '@/components/UserEventDetailView';

export default function UserEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // 1. Fetch user profile to scope saved events to the current logged-in account
    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/profile`)
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
              if (Array.isArray(saved)) setSavedIds(saved);
              if (Array.isArray(joined)) setJoinedIds(joined);
            } catch (e) {}
          }
        } else {
          if (typeof window !== 'undefined') {
            try {
              const saved = JSON.parse(localStorage.getItem('backstage_saved_events_guest') || '[]');
              const joined = JSON.parse(localStorage.getItem('backstage_joined_communities_guest') || '[]');
              if (Array.isArray(saved)) setSavedIds(saved);
              if (Array.isArray(joined)) setJoinedIds(joined);
            } catch (e) {}
          }
        }
      })
      .catch(console.error);

    fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/events`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleSaveEvent = (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedIds(prev => {
      const isSaved = prev.includes(eventId);
      const nextArr = isSaved ? prev.filter(id => id !== eventId) : [...prev, eventId];
      if (typeof window !== 'undefined') {
        try {
          const savedKey = currentUser ? `backstage_saved_events_${currentUser.id}` : 'backstage_saved_events_guest';
          localStorage.setItem(savedKey, JSON.stringify(nextArr));
        } catch (err) {}
      }
      return nextArr;
    });
  };

  const handleJoinCommunity = async (eventId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setJoinedIds(prev => {
      if (prev.includes(eventId)) return prev;
      const next = [...prev, eventId];
      if (typeof window !== 'undefined') {
        try {
          const joinedKey = currentUser ? `backstage_joined_communities_${currentUser.id}` : 'backstage_joined_communities_guest';
          localStorage.setItem(joinedKey, JSON.stringify(next));
        } catch (err) {}
      }
      return next;
    });

    setSavedIds(prev => {
      if (prev.includes(eventId)) return prev;
      const next = [...prev, eventId];
      if (typeof window !== 'undefined') {
        try {
          const savedKey = currentUser ? `backstage_saved_events_${currentUser.id}` : 'backstage_saved_events_guest';
          localStorage.setItem(savedKey, JSON.stringify(next));
        } catch (err) {}
      }
      return next;
    });

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/events/${eventId}/join`, { method: 'POST' });
    } catch (err) {}
  };

  const [activeTab, setActiveTab] = useState<'liked' | 'all'>('liked');

  const displayedEvents = events.filter(event => {
    if (activeTab === 'liked') {
      return savedIds.includes(event.id) || joinedIds.includes(event.id);
    }
    return true;
  });

  return (
    <div className="space-y-8 text-[#242424] font-sans pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif mb-2">Favorite &amp; Liked Events</h1>
          <p className="text-gray-600">Your curated saved events and joined communities for instant access.</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-gray-100 p-1.5 rounded-full w-max border border-gray-200 shadow-inner">
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeTab === 'liked' ? 'bg-[#CD7F32] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${activeTab === 'liked' ? 'fill-white' : ''}`} />
            <span>Liked &amp; Favorites ({savedIds.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
              activeTab === 'all' ? 'bg-[#242424] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Browse All ({events.length})</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin" />
        </div>
      ) : displayedEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-200 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <Heart className="w-8 h-8 fill-red-500" />
          </div>
          <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">No Favorite Events Added Yet</h3>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Click the ❤️ heart icon on any event card to add it to your personal favorites list!
          </p>
          <button 
            onClick={() => setActiveTab('all')}
            className="bg-[#242424] hover:bg-black text-white text-xs font-bold px-6 py-3 rounded-full transition-all shadow-md"
          >
            Explore All Available Events
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.map((event, i) => {
            const isSaved = savedIds.includes(event.id);
            const isJoined = joinedIds.includes(event.id);

            return (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#CD7F32]/40 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between h-full hover:-translate-y-1"
              >
                <div>
                  {/* Event Poster Area */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                    <img 
                      src={event.coverImageUrl || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1000&auto=format&fit=crop"} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-90" />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap z-10">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm ${
                        event.status === 'ONGOING' ? 'bg-emerald-500 text-black font-black animate-pulse' : 'bg-white text-gray-900'
                      }`}>
                        {event.status || 'UPCOMING'}
                      </span>
                      {isJoined && (
                        <span className="bg-blue-600 text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-sm">
                          👥 Joined
                        </span>
                      )}
                    </div>

                    {/* Save Heart Button */}
                    <button
                      onClick={(e) => toggleSaveEvent(event.id, e)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-md z-10 ${
                        isSaved ? 'bg-red-500 text-white' : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/70'
                      }`}
                      title={isSaved ? "Remove from Saved" : "Save Event"}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
                    </button>

                    {/* Date overlay on image bottom */}
                    <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                      <span className="text-xs font-bold font-mono bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#CD7F32]" />
                        {new Date(event.date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {event.startTime && ` • ${event.startTime}`}
                      </span>
                    </div>
                  </div>

                  {/* Details Area */}
                  <div className="p-5">
                    <h3 className="font-extrabold text-gray-900 text-base mb-1.5 leading-snug line-clamp-2 group-hover:text-[#CD7F32] transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#CD7F32] shrink-0" />
                      {event.location}
                    </p>
                    <p className="text-xs text-gray-400 font-medium line-clamp-2 leading-relaxed">
                      {event.description || "Join this exciting experience. Click to view full lineup, timings, and community access."}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-600 truncate max-w-[140px]">
                    {event.attendeeCategory || event.tags || "General Event"}
                  </span>
                  <span className="text-[#CD7F32] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    View Details &amp; Join →
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedEvent && (
          <UserEventDetailView
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            isSaved={savedIds.includes(selectedEvent.id)}
            hasJoined={joinedIds.includes(selectedEvent.id)}
            onToggleSave={() => toggleSaveEvent(selectedEvent.id)}
            onJoinCommunity={() => handleJoinCommunity(selectedEvent.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
