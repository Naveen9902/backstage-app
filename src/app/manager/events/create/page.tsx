'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateEvent() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    startTime: '',
    location: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/manager/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        router.push('/manager/my-events');
      } else {
        setError(data.error || 'Failed to create event');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    }
    setLoading(false);
  };

  return (
    <div className="text-[#242424] max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/manager/dashboard" className="text-gray-500 hover:text-[#CD7F32] transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </Link>
        <div>
          <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Create New Event</h1>
          <p className="text-lg text-gray-700">Set up a new event and configure staffing requirements</p>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 border border-gray-100"
        style={{ boxShadow: '-6px 6px 0px rgba(205, 127, 50, 0.9)' }}
      >
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Event Title</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#CD7F32] transition-colors" 
                placeholder="e.g. Summer Music Festival" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Event Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#CD7F32] transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Start Time
                <span className="text-gray-400 font-normal ml-2">(24-hour format)</span>
              </label>
              <input 
                type="time" 
                required
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#CD7F32] transition-colors" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Location</label>
              <input 
                type="text" 
                required
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#CD7F32] transition-colors" 
                placeholder="e.g. Grand Ballroom, Hotel Prestige" 
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <textarea 
                rows={4} 
                required
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#CD7F32] transition-colors" 
                placeholder="Describe the event..."
              ></textarea>
            </div>
          </div>

          {/* Info box */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" className="text-amber-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
            <p className="text-sm text-amber-700">
              The event will start as <strong>Upcoming</strong>. Once the event day arrives, you can mark it <strong>Live / Ongoing</strong> early from your <em>My Events</em> page — workers will be notified instantly.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-4">
            <Link href="/manager/dashboard" className="px-6 py-3 font-semibold text-gray-600 hover:text-gray-900 transition-colors inline-block">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-[#CD7F32] text-white font-bold rounded-lg hover:bg-[#a06227] transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
