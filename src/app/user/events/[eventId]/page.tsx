'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function EventDetails({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    fetch(`/api/user/events/${eventId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setEvent(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleJoinCommunity = async () => {
    setIsJoining(true);
    try {
      const res = await fetch(`/api/user/events/${eventId}/join`, {
        method: 'POST',
      });
      if (res.ok) {
        setHasJoined(true);
        setEvent({
          ...event,
          fans: [...(event.fans || []), { id: 'temp' }]
        });
      }
    } catch (error) {
      console.error(error);
    }
    setIsJoining(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-[#CD7F32]/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#CD7F32] border-t-transparent rounded-full animate-spin"></div>
          <svg className="w-6 h-6 text-[#CD7F32] animate-pulse" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <p className="text-[#CD7F32] font-bold tracking-widest uppercase text-sm animate-pulse">Loading Experience...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-24 h-24 bg-[#242424] rounded-full flex items-center justify-center mb-6 shadow-xl shadow-black/10">
          <svg className="w-10 h-10 text-[#CD7F32]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 className="text-3xl font-bold font-serif mb-2 text-[#242424]">Event Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md text-center">We couldn't locate this event. It may have been removed or the link is incorrect.</p>
        <Link href="/user/events" className="bg-[#CD7F32] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#CD7F32]/30 hover:shadow-xl hover:bg-[#b86d26] hover:-translate-y-0.5 transition-all">
          Return to Events
        </Link>
      </div>
    );
  }

  const memberCount = event.fans ? event.fans.length : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 text-[#242424] font-sans relative">
      
      {/* Background ambient glow */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#CD7F32]/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      {/* Header Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center py-6 mb-2"
      >
        <Link href="/user/events" className="group flex items-center gap-2 text-gray-500 hover:text-[#CD7F32] transition-colors font-bold tracking-wide uppercase text-xs">
          <div className="w-8 h-8 rounded-full bg-white border border-gray-200 group-hover:border-[#CD7F32] flex items-center justify-center transition-all shadow-sm group-hover:shadow-md">
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </div>
          Back to Browse
        </Link>
      </motion.div>

      {/* Main Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative overflow-hidden bg-[#242424] rounded-3xl mb-8 shadow-2xl group border border-black"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay group-hover:scale-105 transition-transform duration-[2s] ease-out"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-[#242424]/80 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#CD7F32]/20 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#CD7F32]/10 rounded-full blur-[80px]"></div>
        
        <div className="relative z-10 p-8 md:p-14 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-[#CD7F32] to-[#e6a25d] rounded-2xl flex items-center justify-center mb-8 shadow-xl shadow-[#CD7F32]/20 ring-4 ring-white/10 rotate-3 group-hover:rotate-6 transition-transform duration-500">
            <svg className="w-10 h-10 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
          </div>
          <span className="text-[#CD7F32] font-bold tracking-[0.2em] uppercase text-xs mb-4 flex items-center gap-2">
            <span className="w-8 h-px bg-[#CD7F32]"></span>
            Exclusive Access
            <span className="w-8 h-px bg-[#CD7F32]"></span>
          </span>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-white mb-6 leading-tight">{event.title}</h1>
          <p className="text-gray-300 max-w-xl text-lg font-light leading-relaxed mb-10">{event.description || "Join the most exclusive event of the season. Connect with fellow attendees and experience unforgettable moments."}</p>
          
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 w-full max-w-2xl px-6 py-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#CD7F32]/20 flex items-center justify-center text-[#CD7F32]">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
              </div>
              <div className="text-left">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Date</div>
                <div className="text-sm font-semibold text-white">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</div>
              </div>
            </div>
            
            <div className="hidden md:block w-px h-10 bg-white/10"></div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#CD7F32]/20 flex items-center justify-center text-[#CD7F32]">
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div className="text-left">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</div>
                <div className="text-sm font-semibold text-white line-clamp-1 max-w-[150px]">{event.location}</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Community Section Full Width */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-10">
          
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-bold font-serif text-[#242424] flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#CD7F32] rounded-full inline-block"></span>
              Event Community
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed max-w-md">
              Become part of the exclusive inner circle for this event. Connect, share, and stay updated with the latest announcements.
            </p>
            
            <div className="flex items-center gap-4 py-4">
              <div className="flex -space-x-4">
                {[...Array(Math.min(4, memberCount || 1))].map((_, i) => (
                  <div key={i} className={`w-14 h-14 rounded-full border-4 border-white bg-gradient-to-br from-[#242424] to-[#404040] flex items-center justify-center shadow-md relative z-[${4-i}]`}>
                    <svg className="w-6 h-6 text-[#CD7F32]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                ))}
                {memberCount > 4 && (
                  <div className="w-14 h-14 rounded-full border-4 border-white bg-[#f0f0f0] flex items-center justify-center shadow-md relative z-0">
                    <span className="text-xs font-bold text-gray-500">+{memberCount - 4}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold font-serif leading-none text-[#242424]">{memberCount}</span>
                <span className="text-sm text-gray-400 uppercase tracking-widest font-bold mt-1">Active Fans</span>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-auto shrink-0">
            <button 
              onClick={handleJoinCommunity}
              disabled={isJoining || hasJoined}
              className={`w-full md:w-auto relative group overflow-hidden rounded-2xl font-bold py-5 px-10 transition-all duration-300 shadow-xl flex items-center justify-center gap-3 ${
                hasJoined 
                  ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none' 
                  : 'bg-[#242424] text-[#CD7F32] hover:shadow-2xl hover:shadow-[#242424]/20 hover:-translate-y-1'
              }`}
            >
              {!hasJoined && (
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              )}
              
              {isJoining ? (
                <span className="w-6 h-6 border-3 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin" />
              ) : hasJoined ? (
                <>
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Already Joined
                </>
              ) : (
                <>
                  <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <span className="text-lg tracking-wide text-white">Join Community</span>
                </>
              )}
            </button>
          </div>

        </div>
      </motion.div>

    </div>
  );
}
