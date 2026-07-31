'use client';
import { apiFetch } from '@/lib/apiFetch';

import Navbar from '@/components/Navbar';
import EventsFilters from '@/components/EventsFilters';
import { useState, useEffect } from 'react';

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/events/all`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="font-sans">
      <div className="bg-[#242424]">
        <Navbar />
      </div>
      
      {/* Client Component for Search, Filters, and Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-[#CD7F32] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <EventsFilters events={events} />
      )}
    </div>
  );
}
