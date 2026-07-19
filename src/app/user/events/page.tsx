'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function UserEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can fetch from an open endpoint or create a user-specific one.
    // Fetch all public events for users
    fetch('/api/user/events')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEvents(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 text-[#242424]">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Upcoming Events</h1>
        <p className="text-gray-600">Browse all available events and get your tickets.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-[#CD7F32]/30 border-t-[#CD7F32] rounded-full animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[#CD7F32]/20">
          <p className="text-gray-500 mb-4">No events found at the moment.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={event.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#CD7F32]/20 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl leading-tight">{event.title}</h3>
                <span className="px-2 py-1 bg-[#CD7F32]/10 text-[#CD7F32] text-xs font-bold rounded-md uppercase">
                  {event.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">{event.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  <span>{new Date(event.date).toLocaleDateString()} {event.startTime && `at ${event.startTime}`}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span className="truncate">{event.location}</span>
                </div>
              </div>

              <Link href={`/user/events/${event.id}`} className="block w-full">
                <button className="w-full py-2.5 bg-[#242424] text-white rounded-xl font-semibold hover:bg-black transition-colors">
                  View Details
                </button>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
