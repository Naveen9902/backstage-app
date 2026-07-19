'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function CommunityPage() {
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/community')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCommunities(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-[#242424] font-sans pb-12">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Community Hub</h1>
        <p className="text-gray-600">Connect with other fans, share experiences, and discuss your favorite artists.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin" />
        </div>
      ) : communities.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#EAE6DF]">
          <div className="w-16 h-16 mx-auto bg-[#CD7F32]/10 rounded-full flex items-center justify-center text-[#CD7F32] mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h3 className="font-bold text-lg mb-2">No Communities Joined</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            You haven't joined any event communities yet. Browse upcoming events and join their communities to start discussing!
          </p>
          <Link href="/user/events">
            <button className="bg-[#CD7F32] hover:bg-[#a06227] text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
              Browse Events
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map((event, i) => (
            <Link key={event.id} href={`/user/community/${event.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-[#EAE6DF] hover:shadow-md transition-shadow p-6 flex flex-col h-full cursor-pointer group"
              >
                <div className="w-12 h-12 bg-[#FCD5B5] rounded-full flex items-center justify-center mb-4 text-[#CD7F32] group-hover:bg-[#CD7F32] group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                </div>
                <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                <p className="text-xs text-gray-500 mb-4 line-clamp-1 flex-1">{event.description}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    {event._count?.fans || 0} Members
                  </div>
                  <span className="text-[#CD7F32] text-xs font-bold flex items-center gap-1 group-hover:underline">
                    Enter Chat
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
