'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function WorkerCompletedShifts() {
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  // Expanded event state
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  
  const [ratingData, setRatingData] = useState<{[appId: string]: {rating: number, comment: string}}>({});
  const [submittingRating, setSubmittingRating] = useState<string | null>(null);
  
  // Dispute state
  const [disputeTarget, setDisputeTarget] = useState<{eventId: string, managerId: string} | null>(null);
  const [disputeData, setDisputeData] = useState({ reason: 'Unfair Payment', description: '' });
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const fetchData = async () => {
    try {
      const [appsRes, reviewsRes] = await Promise.all([
        fetch('/api/worker/applications', { cache: 'no-store' }),
        fetch('/api/reviews?type=given', { cache: 'no-store' })
      ]);
      
      const appsData = await appsRes.json();
      const reviewsData = await reviewsRes.json();
      
      if (Array.isArray(appsData)) {
        // ONLY keep completed events where worker was accepted or paid
        setApplications(appsData.filter(app => 
          (app.status === 'ACCEPTED' || app.status === 'PAID') && 
          app.staffingRequest?.event?.status === 'COMPLETED'
        ));
      }
      if (Array.isArray(reviewsData)) {
        setReviews(reviewsData);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpandApp = (appId: string) => {
    if (expandedAppId === appId) {
      setExpandedAppId(null);
    } else {
      setExpandedAppId(appId);
    }
  };

  const submitRating = async (app: any) => {
    const data = ratingData[app.id];
    const eventId = app.staffingRequest?.eventId;
    const managerId = app.staffingRequest?.event?.managerId;
    
    if (!data || data.rating === 0 || !eventId || !managerId) return;
    
    setSubmittingRating(app.id);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          revieweeId: managerId,
          rating: data.rating,
          comment: data.comment
        })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
    setSubmittingRating(null);
  };
  
  const submitDispute = async () => {
    if (!disputeTarget || !disputeData.reason || !disputeData.description) return;
    setSubmittingDispute(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: disputeTarget.eventId,
          targetId: disputeTarget.managerId,
          reason: disputeData.reason,
          description: disputeData.description
        })
      });
      if (res.ok) {
        setDisputeTarget(null);
        setDisputeData({ reason: 'Unfair Payment', description: '' });
        alert('Dispute filed successfully.');
      } else {
        alert('Failed to file dispute.');
      }
    } catch (err) {
      console.error(err);
      alert('Error filing dispute.');
    }
    setSubmittingDispute(false);
  };

  const handleConfirmPayment = async (appId: string) => {
    try {
      await fetch(`/api/worker/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAID' })
      });
      fetchData();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="relative text-[#242424] min-h-screen pb-24 overflow-hidden bg-gray-50/30">
      {/* Background Blooms */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#CD7F32]/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-[-200px] w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 pt-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12"
        >
          <div>
            <Link href="/worker" className="text-[#CD7F32] font-bold text-sm mb-4 inline-block hover:underline flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to Dashboard
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-2 text-gray-900">Completed Shifts</h1>
            <p className="text-gray-500 text-lg">Review managers, confirm payments, and file disputes if needed.</p>
          </div>
        </motion.div>

        {/* Shifts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
               <svg className="animate-spin h-10 w-10 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </div>
          ) : applications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 backdrop-blur-xl p-12 rounded-3xl border border-gray-100 shadow-sm text-center"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <h3 className="text-2xl font-bold font-serif mb-2">No Completed Shifts</h3>
              <p className="text-gray-500">You haven't completed any shifts yet.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {applications.map((app, index) => {
                const event = app.staffingRequest?.event;
                if (!event) return null;
                
                const isExpanded = expandedAppId === app.id;
                const hasReviewed = reviews.some(r => r.eventId === event.id && r.revieweeId === event.managerId);
                const data = ratingData[app.id] || { rating: 0, comment: '' };
                const checkInTime = app.checkInTime ? new Date(app.checkInTime) : null;
                const checkOutTime = app.checkOutTime ? new Date(app.checkOutTime) : null;
                
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <button 
                      onClick={() => toggleExpandApp(app.id)}
                      className="w-full p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
                    >
                      <div className="space-y-1">
                        <span className="flex items-center gap-1.5 text-[10px] font-extrabold bg-gray-100 text-gray-500 w-max px-3 py-1 rounded-md uppercase tracking-widest mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                          Completed Event
                        </span>
                        <h3 className="text-xl font-bold font-serif text-gray-900">{event.title}</h3>
                        <p className="text-sm font-medium text-gray-500">
                          {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          Role: {app.staffingRequest?.roleName}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-bold text-[#CD7F32]">
                          {isExpanded ? 'Hide Actions' : 'Review'}
                        </span>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 border border-gray-200 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </div>
                    </button>
                    
                    {/* EXPANDED CONTENT */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-100 bg-gray-50/50"
                        >
                          <div className="p-5 md:p-6">
                            <div className="flex flex-col lg:flex-row gap-8">
                              {/* Left: Payment & Dispute */}
                              <div className="flex-1 space-y-6">
                                <div>
                                  <h4 className="font-bold text-gray-800 mb-2">Shift Details</h4>
                                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-500">Check In</span>
                                      <span className="font-semibold">{checkInTime ? checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Missed'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-500">Check Out</span>
                                      <span className="font-semibold">{checkOutTime ? checkOutTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}</span>
                                    </div>
                                    <div className="h-px bg-gray-100"></div>
                                    <div className="flex justify-between items-center text-sm">
                                      <span className="text-gray-500">Payment Status</span>
                                      {app.status === 'PAID' ? (
                                        <span className="font-bold text-green-600 flex items-center gap-1">
                                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                          Received
                                        </span>
                                      ) : (
                                        <span className="font-bold text-orange-500">Pending</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-bold text-gray-800 mb-2">Actions</h4>
                                  <div className="flex flex-wrap items-center gap-3">
                                    {app.status !== 'PAID' && (
                                      <button 
                                        onClick={() => handleConfirmPayment(app.id)}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                        Mark Payment Received
                                      </button>
                                    )}
                                    
                                    <button 
                                      onClick={() => setDisputeTarget({ eventId: event.id, managerId: event.managerId })}
                                      className="text-sm font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-100 px-4 py-2.5 rounded-lg transition-colors flex items-center gap-1.5"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                                      File Dispute
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Right: Review */}
                              <div className="flex-1 lg:max-w-sm">
                                <h4 className="font-bold text-gray-800 mb-2">Manager Review</h4>
                                {hasReviewed ? (
                                  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm text-center py-8">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                                    </div>
                                    <p className="font-bold text-gray-700">Review Submitted</p>
                                    <p className="text-sm text-gray-500 mt-1">Thank you for rating the manager.</p>
                                  </div>
                                ) : (
                                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center">
                                      <span className="text-sm font-bold text-gray-700">Rate Manager</span>
                                      <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <button
                                            key={star}
                                            onClick={() => setRatingData({ ...ratingData, [app.id]: { ...data, rating: star } })}
                                            className={`focus:outline-none transition-colors ${data.rating >= star ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-300'}`}
                                          >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    <textarea
                                      placeholder="Leave feedback about the manager..."
                                      value={data.comment}
                                      onChange={(e) => setRatingData({ ...ratingData, [app.id]: { ...data, comment: e.target.value } })}
                                      className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-[#CD7F32] focus:ring-1 focus:ring-[#CD7F32]"
                                      rows={3}
                                    />
                                    <button
                                      onClick={() => submitRating(app)}
                                      disabled={data.rating === 0 || submittingRating === app.id}
                                      className="w-full py-2.5 text-sm font-bold bg-[#CD7F32] text-white rounded-lg hover:bg-[#b06a28] transition-colors disabled:opacity-50"
                                    >
                                      {submittingRating === app.id ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* DISPUTE MODAL */}
      {disputeTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-2xl"
          >
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold font-serif text-red-600 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                File Dispute
              </h2>
              <button onClick={() => setDisputeTarget(null)} className="text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-5">Filing a dispute will notify admins to investigate the issue.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Reason</label>
                <select 
                  value={disputeData.reason}
                  onChange={e => setDisputeData({...disputeData, reason: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400"
                >
                  <option value="Unfair Payment">Unfair Payment</option>
                  <option value="Unprofessional Conduct">Unprofessional Conduct</option>
                  <option value="Unsafe Conditions">Unsafe Conditions</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Description</label>
                <textarea 
                  required
                  placeholder="Provide details about what happened..."
                  value={disputeData.description}
                  onChange={e => setDisputeData({...disputeData, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400 min-h-[100px]"
                ></textarea>
              </div>
              
              <button
                onClick={submitDispute}
                disabled={!disputeData.description || submittingDispute}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-sm transition-colors disabled:opacity-50 mt-2"
              >
                {submittingDispute ? 'Filing Dispute...' : 'Submit Dispute'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
