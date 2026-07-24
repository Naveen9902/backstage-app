'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

export default function MySchedule() {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [ratingTarget, setRatingTarget] = useState<any>(null);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showPassModal, setShowPassModal] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayApps, setSelectedDayApps] = useState<any[] | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const blanks = Array.from({ length: firstDay }, () => null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarGrid = [...blanks, ...days];

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayApps(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayApps(null);
  };

  const getAppsForDate = (dateNumber: number) => {
    const targetDate = new Date(year, month, dateNumber).toLocaleDateString('en-CA'); // YYYY-MM-DD
    return schedule.filter(app => {
      const appDate = new Date(app.staffingRequest.event.date).toLocaleDateString('en-CA');
      return appDate === targetDate;
    });
  };

  const isToday = (dateNumber: number) => {
    const today = new Date();
    return dateNumber === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const handleDayClick = (dateNumber: number) => {
    const appsForDay = getAppsForDate(dateNumber);
    if (appsForDay.length > 0) {
      setSelectedDayApps(appsForDay);
    } else {
      setSelectedDayApps(null);
    }
  };

  const generateQRCode = async (data: string) => {
    try {
      const url = await QRCode.toDataURL(data, { width: 300, margin: 2, color: { dark: '#111111', light: '#FFFFFF' } });
      setQrCodeDataUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  const openPass = (app: any) => {
    setShowPassModal(app);
    if (app.checkOutTime) {
      setQrCodeDataUrl('');
    } else if (app.checkInTime) {
      generateQRCode(`CHECKOUT:${app.id}`);
    } else {
      generateQRCode(`CHECKIN:${app.id}`);
    }
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
        fetchSchedule();
      }
    } catch (err) {
      console.error(err);
    }
    setSubmittingRating(false);
  };

  return (
    <div className="text-[#242424] max-w-lg mx-auto pb-24 relative min-h-screen">
      <div className="mb-6 px-4">
        <h1 className="text-3xl font-bold font-serif tracking-tight mb-1">My Schedule</h1>
        <p className="text-sm text-gray-500 font-medium">Your upcoming shifts and past events</p>
      </div>

      {loading ? (
        <div className="text-gray-500 font-medium p-8 bg-white rounded-xl mx-4 shadow-sm text-center">Loading calendar...</div>
      ) : (
        <div className="px-4">
          {/* Calendar Widget */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-[#111111] text-white">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <h2 className="text-lg font-bold tracking-widest uppercase">
                {monthNames[month]} <span className="font-light opacity-60 ml-1">{year}</span>
              </h2>
              <button onClick={handleNextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 p-4 pb-2 border-b border-gray-100">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{day}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 p-4">
              {calendarGrid.map((day, index) => {
                if (day === null) {
                  return <div key={`blank-${index}`} className="aspect-square"></div>;
                }

                const appsForDay = getAppsForDate(day);
                const hasGig = appsForDay.length > 0;
                const isSelected = selectedDayApps && selectedDayApps.length > 0 && new Date(selectedDayApps[0].staffingRequest.event.date).getDate() === day && new Date(selectedDayApps[0].staffingRequest.event.date).getMonth() === month;
                const isCurrent = isToday(day);

                return (
                  <div key={day} className="aspect-square p-0.5">
                    <button
                      onClick={() => handleDayClick(day)}
                      disabled={!hasGig && !isCurrent}
                      className={`w-full h-full rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300
                        ${isSelected ? 'bg-[#CD7F32] text-white shadow-md scale-105' : 
                          hasGig ? 'bg-[#CD7F32]/10 text-gray-900 hover:bg-[#CD7F32]/20 cursor-pointer' : 
                          isCurrent ? 'bg-gray-100 text-gray-900 font-bold border border-gray-200' : 'text-gray-400 hover:bg-gray-50 cursor-default'}
                      `}
                    >
                      <span className={`text-sm ${hasGig || isSelected || isCurrent ? 'font-bold' : 'font-medium'}`}>{day}</span>
                      
                      {/* Dots for shifts */}
                      {hasGig && (
                        <div className="flex gap-0.5 absolute bottom-1.5">
                          {appsForDay.slice(0, 3).map((app, i) => (
                            <span 
                              key={i} 
                              className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : app.staffingRequest.event.status === 'ONGOING' ? 'bg-green-500 animate-pulse' : 'bg-[#CD7F32]'}`}
                            ></span>
                          ))}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Upcoming Shifts List */}
          <div className="mt-8">
            <h2 className="text-xl font-bold font-serif mb-4 text-gray-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#CD7F32]"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Upcoming Shifts
            </h2>
            
            {schedule.filter(a => a.staffingRequest.event.status !== 'COMPLETED').length === 0 ? (
              <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 border-dashed text-gray-500">
                <p>No upcoming shifts scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {schedule.filter(a => a.staffingRequest.event.status !== 'COMPLETED').map(app => (
                  <div key={app.id} onClick={() => openPass(app)} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group">
                    {app.staffingRequest.event.status === 'ONGOING' && (
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex flex-col items-center justify-center border border-gray-100 flex-shrink-0 group-hover:bg-[#CD7F32]/10 transition-colors">
                        <span className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">{new Date(app.staffingRequest.event.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                        <span className="text-lg font-bold text-[#CD7F32] leading-none">{new Date(app.staffingRequest.event.date).getDate()}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{app.staffingRequest.event.title}</h4>
                        <p className="text-xs text-gray-500 font-medium">{app.staffingRequest.roleName} · {app.staffingRequest.event.startTime || 'TBD'}</p>
                      </div>
                    </div>
                    <div>
                      {app.staffingRequest.event.status === 'ONGOING' ? (
                        <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> LIVE
                        </span>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 group-hover:text-[#CD7F32] transition-colors"><path d="m9 18 6-6-6-6"/></svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-Up Bottom Sheet for Selected Day's Shifts */}
      <AnimatePresence>
        {selectedDayApps && selectedDayApps.length > 0 && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDayApps(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white rounded-t-3xl shadow-2xl z-50 overflow-y-auto max-h-[85vh] border-t border-gray-200"
            >
              <div className="sticky top-0 bg-white/80 backdrop-blur-md pt-4 pb-2 px-6 flex justify-between items-center border-b border-gray-100 z-10">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    {new Date(selectedDayApps[0].staffingRequest.event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <p className="text-xs text-[#CD7F32] font-bold uppercase tracking-widest">{selectedDayApps.length} Shift(s) Scheduled</p>
                </div>
                <button onClick={() => setSelectedDayApps(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {selectedDayApps.map((app) => {
                  const eventStatus = app.staffingRequest.event.status;
                  const isLive = eventStatus === 'ONGOING';
                  const isClosed = eventStatus === 'COMPLETED';

                  return (
                    <div key={app.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 relative overflow-hidden">
                      {isLive && (
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500"></div>
                      )}
                      
                      <div className="flex justify-between items-start mb-3">
                        <div className="pr-4">
                          <h4 className="text-xl font-bold font-serif text-gray-900">{app.staffingRequest.event.title}</h4>
                          <p className="font-bold text-gray-600 text-sm mt-0.5">{app.staffingRequest.roleName}</p>
                        </div>
                        {isLive && (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md flex items-center gap-1 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> LIVE
                          </span>
                        )}
                        {isClosed && (
                          <span className="bg-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md shrink-0">Closed</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-start gap-3">
                          <div className="bg-[#CD7F32]/10 p-1.5 rounded-lg text-[#CD7F32]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Call Time</p>
                            <p className="text-sm font-bold text-gray-800">{app.staffingRequest.event.startTime || 'TBD'}</p>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-start gap-3">
                          <div className="bg-[#CD7F32]/10 p-1.5 rounded-lg text-[#CD7F32]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Venue</p>
                            <p className="text-sm font-bold text-gray-800 line-clamp-1">{app.staffingRequest.event.location}</p>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-start gap-3 col-span-2">
                          <div className="bg-gray-100 p-1.5 rounded-lg text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Uniform Req.</p>
                            <p className="text-sm font-bold text-gray-800">Standard all-black attire (unless otherwise specified in chat).</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {!isClosed && (
                          <>
                            <button 
                              onClick={() => openPass(app)}
                              className="w-full bg-[#111111] hover:bg-black text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>
                              Show Digital Pass
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                              {isLive && (
                                <Link href="/worker/runners">
                                  <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-colors h-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                                    <span className="text-[10px] uppercase tracking-wider">Runners</span>
                                  </button>
                                </Link>
                              )}
                              <Link href={`/worker/events/${app.staffingRequest.eventId}/chat`} className={isLive ? '' : 'col-span-2'}>
                                <button className="w-full bg-white border border-gray-200 hover:border-[#CD7F32] hover:text-[#CD7F32] text-gray-700 px-4 py-2.5 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-colors h-full">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                  <span className="text-[10px] uppercase tracking-wider">Event Chat</span>
                                </button>
                              </Link>
                            </div>
                          </>
                        )}

                        {/* Rating Logic */}
                        {isClosed && (() => {
                          const hasReviewed = reviews.some(r => r.eventId === app.staffingRequest.event.id && r.revieweeId === app.staffingRequest.event.managerId);
                          const isRatingThis = ratingTarget?.eventId === app.staffingRequest.event.id;
                          
                          if (hasReviewed) {
                            return (
                              <div className="bg-green-50 text-green-700 border border-green-200 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                Manager Reviewed
                              </div>
                            );
                          }
                          
                          if (isRatingThis) {
                            return (
                              <div className="w-full mt-2 bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-gray-700">Rate manager:</span>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <button
                                        key={star}
                                        onClick={() => setRatingTarget({ ...ratingTarget, rating: star })}
                                        className={`focus:outline-none transition-colors ${ratingTarget.rating >= star ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'}`}
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
                                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32]"
                                  rows={2}
                                />
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => setRatingTarget(null)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                                  <button
                                    onClick={() => submitReview(app.staffingRequest.event.id, app.staffingRequest.event.managerId)}
                                    disabled={ratingTarget.rating === 0 || submittingRating}
                                    className="px-4 py-2 text-sm font-bold bg-[#CD7F32] text-white rounded-lg hover:bg-[#b06a28] transition-colors disabled:opacity-50 flex items-center gap-2"
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
                              className="w-full bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              Rate this Event
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DIGITAL PASS MODAL (over top of everything) */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
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
                {showPassModal.checkOutTime ? (
                  <div className="flex flex-col gap-3 mb-4">
                    <div className="bg-gray-100 text-gray-700 px-4 py-4 rounded-xl flex flex-col items-center justify-center gap-1 font-bold shadow-inner">
                      <span className="uppercase tracking-wider text-xs text-gray-500">Shift Completed</span>
                      <span className="text-3xl text-[#CD7F32] font-black mt-1 font-serif">
                        ₹{((new Date(showPassModal.checkOutTime).getTime() - new Date(showPassModal.checkInTime).getTime()) / (1000 * 60 * 60) * showPassModal.staffingRequest.payRate).toFixed(2)}
                      </span>
                      <span className="text-xs font-normal text-gray-500 mt-1">Total Earnings</span>
                    </div>
                    {showPassModal.status !== 'PAID' ? (
                      <button
                        onClick={() => {
                          fetch(`/api/worker/applications/${showPassModal.id}/status`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'PAID' })
                          }).then(() => {
                            setShowPassModal({ ...showPassModal, status: 'PAID' });
                            fetchSchedule();
                          });
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition-colors shadow-md flex justify-center items-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Confirm Payment Received
                      </button>
                    ) : (
                      <div className="bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        Payment Confirmed
                      </div>
                    )}
                  </div>
                ) : showPassModal.checkInTime ? (
                  <div className="bg-green-100 text-green-700 px-4 py-3 rounded-xl flex flex-col items-center justify-center gap-1 font-bold mb-4">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                      Checked In
                    </div>
                    <span className="text-sm font-normal text-green-600 mt-2 block">Manager must scan this QR code to check you out.</span>
                  </div>
                ) : (
                  <div className="bg-blue-100 text-blue-700 px-4 py-3 rounded-xl flex flex-col items-center justify-center gap-1 font-bold mb-4">
                    <span className="text-sm font-normal text-blue-600 block mb-1">Manager must scan this QR code to check you in.</span>
                  </div>
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
