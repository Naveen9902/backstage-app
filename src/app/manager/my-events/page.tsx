'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

type Event = {
  id: string;
  title: string;
  date: string;
  startTime: string | null;
  location: string;
  status: string | null;
  staffingRequests: any[];
};

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingModalState, setRatingModalState] = useState<{eventId: string, workers: any[]} | null>(null);
  const [ratingData, setRatingData] = useState<{[userId: string]: {rating: number, comment: string}}>({});
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/manager/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
      const reviewsRes = await fetch('/api/reviews?type=given');
      if (reviewsRes.ok) {
        const reviewsData = await reviewsRes.json();
        setReviews(reviewsData);
      }
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleLive = async (event: Event) => {
    const isLive = event.status === 'ONGOING';
    const newStatus = isLive ? 'UPCOMING' : 'ONGOING';
    setToggling(event.id + '_live');
    try {
      const res = await fetch('/api/manager/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, status: newStatus })
      });
      if (res.ok) fetchEvents();
    } catch (err) {
      console.error(err);
    }
    setToggling(null);
  };

  const closeEvent = async (event: Event) => {
    if (!confirm(`Close "${event.title}"? This marks it as COMPLETED and workers will be notified.`)) return;
    setToggling(event.id + '_close');
    try {
      const res = await fetch('/api/manager/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id, status: 'COMPLETED' })
      });
      if (res.ok) fetchEvents();
    } catch (err) {
      console.error(err);
    }
    setToggling(null);
  };

  const openRatingModal = async (eventId: string) => {
    try {
      const res = await fetch(`/api/manager/events/${eventId}/staffing`);
      if (res.ok) {
        const reqs = await res.json();
        const workers: any[] = [];
        const seenIds = new Set<string>();
        reqs.forEach((req: any) => {
          if (Array.isArray(req.applications)) {
            req.applications.forEach((app: any) => {
              const workerId = app.workerProfile?.user?.id;
              if (app.status === 'ACCEPTED' && workerId && !seenIds.has(workerId)) {
                seenIds.add(workerId);
                workers.push({
                  id: workerId,
                  name: app.workerProfile.user.name,
                  role: req.roleName
                });
              }
            });
          }
        });
        setRatingModalState({ eventId, workers });
        setRatingData({});
      }
    } catch (err) {
      console.error('Failed to fetch workers', err);
    }
  };

  const submitRating = async (revieweeId: string) => {
    if (!ratingModalState) return;
    const data = ratingData[revieweeId];
    if (!data || data.rating === 0) return;
    
    setSubmittingRating(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: ratingModalState.eventId,
          revieweeId,
          rating: data.rating,
          comment: data.comment
        })
      });
      if (res.ok) fetchEvents();
    } catch (err) {
      console.error(err);
    }
    setSubmittingRating(false);
  };

  const isLive = (status: string | null) => status === 'ONGOING';

  return (
    <div className="text-[#242424] max-w-5xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">My Events</h1>
          <p className="text-lg text-gray-700">Manage all your events</p>
        </div>
        <Link href="/manager/events/create">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-[#CD7F32] text-white px-6 py-2.5 rounded-lg font-semibold shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
            Create Event
          </motion.button>
        </Link>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-gray-500">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-gray-500 bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
            You haven&apos;t created any events yet.{' '}
            <Link href="/manager/events/create" className="text-[#CD7F32] hover:underline">Create one now.</Link>
          </div>
        ) : events.map((event, index) => {
          const live = isLive(event.status);
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`bg-white rounded-xl p-5 border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 ${live ? 'border-green-400' : event.status === 'COMPLETED' ? 'border-gray-200 opacity-70' : 'border-gray-100'}`}
              style={{ boxShadow: live ? '-6px 6px 0px rgba(34,197,94,0.5)' : event.status === 'COMPLETED' ? 'none' : '-6px 6px 0px rgba(205, 127, 50, 0.9)' }}
            >
              {/* Left — Event Info */}
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold font-serif">{event.title}</h3>
                  {live && (
                    <span className="flex items-center gap-1.5 text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
                      LIVE
                    </span>
                  )}
                  {event.status === 'COMPLETED' && (
                    <span className="flex items-center gap-1.5 text-xs font-bold bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full uppercase">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      CLOSED
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center text-gray-600 text-sm gap-3">
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  {event.startTime && (
                    <span className="flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {event.startTime}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {event.location}
                  </span>
                  <span className="bg-orange-100 text-[#CD7F32] px-2 py-0.5 rounded text-xs font-bold uppercase">
                    {event.staffingRequests?.length || 0} Roles
                  </span>
                </div>
              </div>

              {/* Right — Controls */}
              <div className="flex flex-col gap-2 min-w-[180px]">

                {/* ===== LIVE TOGGLE ===== */}
                {event.status !== 'COMPLETED' && (
                  <button
                    onClick={() => toggleLive(event)}
                    disabled={toggling === event.id + '_live' || toggling === event.id + '_close'}
                    className={`relative w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 border-2 ${
                      live
                        ? 'bg-green-50 border-green-400 text-green-700 hover:bg-green-100'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-[#CD7F32] hover:text-[#CD7F32]'
                    } disabled:opacity-60`}
                  >
                    <span className="flex items-center gap-2">
                      {live ? (
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-gray-300"></span>
                      )}
                      {toggling === event.id + '_live' ? 'Updating...' : live ? 'Event is LIVE' : 'Go Live'}
                    </span>
                    {/* Toggle pill */}
                    <div className={`w-12 h-6 rounded-full transition-colors duration-300 flex items-center px-1 ${live ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${live ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </button>
                )}

                {/* ===== CLOSE EVENT TOGGLE (only when LIVE) ===== */}
                {live && (
                  <button
                    onClick={() => closeEvent(event)}
                    disabled={toggling === event.id + '_close'}
                    className="relative w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-bold text-sm border-2 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300 disabled:opacity-60"
                  >
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      {toggling === event.id + '_close' ? 'Closing...' : 'Close Event'}
                    </span>
                    {/* Toggle pill — always off */}
                    <div className="w-12 h-6 rounded-full bg-red-300 flex items-center px-1">
                      <div className="w-4 h-4 bg-white rounded-full shadow translate-x-6"></div>
                    </div>
                  </button>
                )}

                {/* Actions when Not Completed */}
                {event.status !== 'COMPLETED' ? (
                  <>
                    <Link href={`/manager/staffing?eventId=${event.id}`}>
                      <button className="bg-[#242424] w-full justify-center hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        Manage Staffing
                      </button>
                    </Link>

                    <Link href={`/manager/events/${event.id}/chat`}>
                      <button className="bg-white border border-[#CD7F32] w-full justify-center text-[#CD7F32] hover:bg-[#CD7F32] hover:text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/></svg>
                        Event Chat
                      </button>
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => openRatingModal(event.id)}
                    className="bg-yellow-50 border border-yellow-200 w-full justify-center text-yellow-700 hover:bg-yellow-100 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Rate Workers
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      {/* Rating Modal */}
      {ratingModalState && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-serif">Rate Event Staff</h2>
              <button onClick={() => setRatingModalState(null)} className="text-gray-400 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            {ratingModalState.workers.length === 0 ? (
              <p className="text-gray-500 italic text-center py-8">No accepted workers found for this event.</p>
            ) : (
              <div className="space-y-6">
                {ratingModalState.workers.map(worker => {
                  const hasReviewed = reviews.some(r => r.eventId === ratingModalState.eventId && r.revieweeId === worker.id);
                  const data = ratingData[worker.id] || { rating: 0, comment: '' };
                  
                  return (
                    <div key={worker.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold">{worker.name}</h4>
                          <p className="text-sm text-gray-500">Role: {worker.role}</p>
                        </div>
                        {hasReviewed && (
                          <span className="flex items-center gap-1 text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            Reviewed
                          </span>
                        )}
                      </div>
                      
                      {!hasReviewed && (
                        <div className="space-y-3">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <button
                                key={star}
                                onClick={() => setRatingData({ ...ratingData, [worker.id]: { ...data, rating: star } })}
                                className={`focus:outline-none transition-colors ${data.rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              </button>
                            ))}
                          </div>
                          <textarea
                            placeholder="Leave feedback..."
                            value={data.comment}
                            onChange={(e) => setRatingData({ ...ratingData, [worker.id]: { ...data, comment: e.target.value } })}
                            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-[#CD7F32]"
                            rows={2}
                          />
                          <button
                            onClick={() => submitRating(worker.id)}
                            disabled={data.rating === 0 || submittingRating}
                            className="w-full py-2 text-sm font-bold bg-[#CD7F32] text-white rounded-lg hover:bg-[#b06a28] transition-colors disabled:opacity-50"
                          >
                            Submit Review
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
