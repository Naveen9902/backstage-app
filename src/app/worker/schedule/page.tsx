'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function MySchedule() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingTarget, setRatingTarget] = useState<any>(null); // { eventId, managerId, rating, comment }
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showPassModal, setShowPassModal] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const generateQRCode = async (appId: string) => {
    try {
      const url = await QRCode.toDataURL(appId, { width: 300, margin: 2, color: { dark: '#111111', light: '#FFFFFF' } });
      setQrCodeDataUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const openPass = (app: any) => {
    setShowPassModal(app);
    generateQRCode(app.id);
  };

  const fetchSchedule = () => {
    fetch('/api/worker/applications', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const accepted = data.filter(app => app.status === 'ACCEPTED' && app.staffingRequest?.event?.date);
          accepted.sort((a, b) => new Date(a.staffingRequest.event.date).getTime() - new Date(b.staffingRequest.event.date).getTime());
          setSchedule(accepted);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
      
    // Fetch my submitted reviews
    fetch('/api/reviews?type=given')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReviews(data);
      });
  };

  useEffect(() => {
    fetchSchedule();
    const interval = setInterval(fetchSchedule, 5000);
    return () => clearInterval(interval);
  }, []);

  const submitReview = async (eventId: string, managerId: string) => {
    if (!ratingTarget || ratingTarget.rating === 0) return;
    setSubmittingRating(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          revieweeId: managerId,
          rating: ratingTarget.rating,
          comment: ratingTarget.comment
        })
      });
      if (res.ok) {
        setRatingTarget(null);
        fetchSchedule(); // refresh to get the new review
      }
    } catch (err) {
      console.error(err);
    }
    setSubmittingRating(false);
  };

  return (
    <div className="text-[#242424] max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">My Schedule</h1>
        <p className="text-lg text-gray-700">Your confirmed events and shifts</p>
      </div>

      {loading ? (
        <div className="text-gray-500 font-medium p-8 bg-white rounded-xl">Loading schedule...</div>
      ) : schedule.length === 0 ? (
        <div className="text-gray-500 p-8 bg-white rounded-xl border border-gray-100 italic">
          You don&apos;t have any confirmed shifts yet. Head over to <b>Find Jobs</b> to apply for open roles!
        </div>
      ) : (
        <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
          {schedule.map((app, index) => {
            const eventDate = new Date(app.staffingRequest.event.date);
            const eventStatus = app.staffingRequest.event.status;
            const isLive = eventStatus === 'ONGOING';
            const isClosed = eventStatus === 'COMPLETED';

            return (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative pl-8 ${isClosed ? 'opacity-60' : ''}`}
              >
                {/* Timeline Dot */}
                <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1.5 border-4 border-white ${
                  isClosed ? 'bg-gray-400' : isLive ? 'bg-green-500 animate-pulse' : 'bg-[#CD7F32]'
                }`}></div>

                <div
                  className={`bg-white rounded-xl p-6 border shadow-sm transition-all duration-500 ${
                    isLive ? 'border-green-300' : isClosed ? 'border-gray-200' : 'border-gray-100'
                  }`}
                  style={{
                    boxShadow: isClosed ? 'none' : isLive
                      ? '-4px 4px 0px rgba(34,197,94,0.4)'
                      : '-4px 4px 0px rgba(205, 127, 50, 0.2)'
                  }}
                >
                  {/* LIVE Banner */}
                  {isLive && (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse inline-block flex-shrink-0"></span>
                      <span className="text-green-700 font-bold text-sm">EVENT IS LIVE RIGHT NOW — You are on duty!</span>
                    </div>
                  )}

                  {/* CLOSED Banner */}
                  {isClosed && (
                    <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" className="text-gray-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      <span className="text-gray-500 font-bold text-sm">EVENT HAS BEEN CLOSED — Thank you for your service!</span>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`font-bold text-sm tracking-wide uppercase ${isLive ? 'text-green-600' : isClosed ? 'text-gray-400' : 'text-[#CD7F32]'}`}>
                          {eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          {app.staffingRequest.event.startTime && (
                            <span className="ml-2 normal-case">at {app.staffingRequest.event.startTime}</span>
                          )}
                        </span>
                        {/* Status badge */}
                        {isLive && (
                          <span className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block"></span> LIVE
                          </span>
                        )}
                        {isClosed && (
                          <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase">Closed</span>
                        )}
                      </div>
                      <h3 className={`text-2xl font-bold font-serif ${isClosed ? 'line-through text-gray-400' : 'text-[#242424]'}`}>
                        {app.staffingRequest?.event?.title}
                      </h3>
                      <p className="text-lg font-semibold text-gray-600 mt-1">Role: {app.staffingRequest?.roleName}</p>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        {app.staffingRequest?.event?.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                        ₹{app.staffingRequest?.payRate}
                      </span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3 items-center justify-between">
                    <p className="text-sm text-gray-500">
                      Managed by <span className="font-bold">{app.staffingRequest?.event?.manager?.managerProfile?.company || 'Event Manager'}</span>
                    </p>
                    {!isClosed && (
                      <div className="flex gap-2">
                        {isLive && (
                          <Link href="/worker/runners">
                            <button className="text-sm font-bold bg-green-600 text-white hover:bg-green-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                              Runner Tasks
                            </button>
                          </Link>
                        )}
                        {!isClosed && (
                          <button 
                            onClick={() => openPass(app)}
                            className="text-sm font-bold bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                            Show Digital Pass
                          </button>
                        )}
                        <Link href={`/worker/events/${app.staffingRequest.eventId}/chat`}>
                          <button className="text-sm font-bold text-[#CD7F32] border border-[#CD7F32] hover:bg-[#CD7F32] hover:text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                            Event Chat
                          </button>
                        </Link>
                      </div>
                    )}
                    {isClosed && (() => {
                      const hasReviewed = reviews.some(r => r.eventId === app.staffingRequest.event.id && r.revieweeId === app.staffingRequest.event.managerId);
                      const isRatingThis = ratingTarget?.eventId === app.staffingRequest.event.id;
                      
                      if (hasReviewed) {
                        return (
                          <span className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                            Reviewed
                          </span>
                        );
                      }
                      
                      if (isRatingThis) {
                        return (
                          <div className="w-full mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-700">Rate this experience:</span>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(star => (
                                  <button
                                    key={star}
                                    onClick={() => setRatingTarget({ ...ratingTarget, rating: star })}
                                    className={`focus:outline-none transition-colors ${ratingTarget.rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              placeholder="Leave a comment (optional)..."
                              value={ratingTarget.comment}
                              onChange={(e) => setRatingTarget({ ...ratingTarget, comment: e.target.value })}
                              className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32]"
                              rows={2}
                            />
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => setRatingTarget(null)} className="px-3 py-1.5 text-sm font-semibold text-gray-500 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                              <button
                                onClick={() => submitReview(app.staffingRequest.event.id, app.staffingRequest.event.managerId)}
                                disabled={ratingTarget.rating === 0 || submittingRating}
                                className="px-4 py-1.5 text-sm font-bold bg-[#CD7F32] text-white rounded-lg hover:bg-[#b06a28] transition-colors disabled:opacity-50 flex items-center gap-2"
                              >
                                {submittingRating ? 'Submitting...' : 'Submit Review'}
                              </button>
                            </div>
                          </div>
                        );
                      }
                      
                      return (
                        <button
                          onClick={() => setRatingTarget({ eventId: app.staffingRequest.event.id, managerId: app.staffingRequest.event.managerId, rating: 0, comment: '' })}
                          className="text-sm font-bold text-yellow-600 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          Rate this Event
                        </button>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* DIGITAL PASS MODAL */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative"
          >
            <button 
              onClick={() => setShowPassModal(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur-md z-10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
            </button>
            
            <div className="bg-[#111111] p-8 pb-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#CD7F32] rounded-full blur-[60px] opacity-20"></div>
              <h2 className="text-2xl font-bold font-serif text-white mb-1 tracking-wide">Back <span className="text-[#CD7F32]">Stage</span></h2>
              <p className="text-[#CD7F32] text-xs font-bold uppercase tracking-widest mb-6">Digital Event Pass</p>
              
              <h3 className="text-xl font-bold text-white leading-tight">
                {showPassModal.staffingRequest.event.title}
              </h3>
              <p className="text-gray-400 mt-2 font-medium">{showPassModal.staffingRequest.roleName}</p>
            </div>
            
            <div className="bg-white p-8 rounded-t-[2rem] -mt-6 relative flex flex-col items-center">
              <div className="w-16 h-1 bg-gray-200 rounded-full mb-8 absolute top-3"></div>
              
              <div className="p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl shadow-inner mb-6">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48 object-contain rounded-lg" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-gray-400">Loading QR...</div>
                )}
              </div>
              
              <div className="text-center w-full">
                {showPassModal.checkInTime ? (
                  <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    Checked In at {new Date(showPassModal.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 font-medium mb-4">Present this pass to the Event Manager upon arrival.</p>
                )}
                
                <div className="flex justify-between border-t border-gray-100 pt-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <div className="text-left">
                    <span className="block text-gray-800 text-sm mb-0.5">{new Date(showPassModal.staffingRequest.event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    Date
                  </div>
                  <div className="text-right">
                    <span className="block text-gray-800 text-sm mb-0.5">{showPassModal.staffingRequest.event.startTime || 'TBD'}</span>
                    Call Time
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
