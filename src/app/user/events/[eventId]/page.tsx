'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
          
          // Check if current user is already in fans list (using client side check for simplicity, ideally passed from API)
          // We assume if they have the fan cookie, we could check their ID. 
          // For now, if fans exist, we'll just show the count.
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="w-8 h-8 border-4 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-[#EAE6DF]">
        <p className="text-gray-500">Event not found.</p>
      </div>
    );
  }

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
          fans: [...(event.fans || []), { id: 'temp' }] // Optimistic update
        });
      }
    } catch (error) {
      console.error(error);
    }
    setIsJoining(false);
  };

  const memberCount = event.fans ? event.fans.length : 0;
  const jobs = event.staffingRequests || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-[#242424] font-sans pb-12">
      
      {/* Title Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EAE6DF] p-12 flex flex-col items-center justify-center min-h-[250px]">
        <div className="w-20 h-20 bg-[#FCD5B5] rounded-full flex items-center justify-center mb-4 text-[#CD7F32]">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        </div>
        <h1 className="text-xl font-bold font-serif">{event.title}</h1>
      </div>

      {/* Jobs Card */}
      <div id="jobs-section" className="bg-white rounded-xl shadow-sm border border-[#EAE6DF] overflow-hidden">
        <div className="border-b border-[#EAE6DF] px-6 py-4 flex items-center gap-2 text-[#CD7F32]">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          <h2 className="font-bold text-gray-800">Jobs</h2>
        </div>
        <div className="p-6">
          {jobs.length === 0 ? (
            <div className="p-6 flex flex-col items-center justify-center text-gray-500">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span className="text-sm">No jobs available for this event</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job: any) => (
                <div key={job.id} className="bg-[#F5F8F4] border border-green-100/50 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-800">{job.roleName}</h4>
                    <p className="text-xs text-gray-500 mt-1">Need: {job.quantity} • ₹{job.payRate}/hr</p>
                  </div>
                  <div className="w-10 h-10 bg-[#2F7E41]/10 rounded-full flex items-center justify-center text-[#2F7E41]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Community Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#EAE6DF] overflow-hidden">
        <div className="border-b border-[#EAE6DF] px-6 py-4 flex items-center gap-2 text-[#CD7F32]">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <h2 className="font-bold text-gray-800">Community</h2>
        </div>
        <div className="p-6">
          <div className="bg-[#F5F8F4] rounded-xl p-8 flex flex-col items-center justify-center border border-green-100/50">
            <div className="text-indigo-900 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="font-bold text-lg text-indigo-900 mb-1">{event.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{memberCount} member{memberCount !== 1 ? 's' : ''}</p>
            <button 
              onClick={handleJoinCommunity}
              disabled={isJoining || hasJoined}
              className={`w-full font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                hasJoined 
                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed' 
                  : 'bg-[#2F7E41] hover:bg-[#256634] text-white'
              }`}
            >
              {isJoining ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : hasJoined ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Joined!
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  Join Community
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-2">
        <button 
          onClick={() => {
            const jobsElement = document.getElementById('jobs-section');
            if (jobsElement) jobsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="bg-[#CD7F32] hover:bg-[#a06227] text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          View Jobs
        </button>
        
        <Link href="/user/events" className="bg-[#242424] hover:bg-black text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to Events
        </Link>
      </div>

    </div>
  );
}
