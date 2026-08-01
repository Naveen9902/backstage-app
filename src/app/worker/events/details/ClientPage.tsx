'use client';
import { apiFetch } from '@/lib/apiFetch';

import { motion } from 'framer-motion';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function EventDetailsContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('id');
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Apply logic state
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  
  // Questions Modal
  const [activeJobForQuestions, setActiveJobForQuestions] = useState<any | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchEventData = async () => {
    try {
      const [eventRes, profileRes] = await Promise.all([
        apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/user/events/${eventId}`),
        apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/profile`)
      ]);
      
      if (!eventRes.ok) throw new Error('Failed to fetch event');
      const eventData = await eventRes.json();
      setEvent(eventData);

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setWorkerProfile(profileData.workerProfile);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
    
    let intervalId: NodeJS.Timeout;
    if (eventId && (!workerProfile || !workerProfile.isVerified)) {
      intervalId = setInterval(() => {
        apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/profile`, { cache: 'no-store' })
          .then(res => res.json())
          .then(data => {
            if (data && !data.error && data.workerProfile) {
              setWorkerProfile(data.workerProfile);
            }
          })
          .catch(() => {});
      }, 3000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [eventId, workerProfile?.isVerified]);

  const getTierLevel = (tier?: string) => {
    if (!tier) return 0;
    if (tier.includes('1')) return 1;
    if (tier.includes('2')) return 2;
    if (tier.includes('3')) return 3;
    return 0;
  };

  const workerLevel = getTierLevel(workerProfile?.tier || '');
  const isVerified = workerProfile?.isVerified;

  const initiateApply = (job: any) => {
    if (job.tier === 'Tier 2' || job.tier === 'Tier 3') {
      if (job.questions && job.questions.length > 0) {
        setActiveJobForQuestions(job);
        setAnswers(new Array(job.questions.length).fill(''));
        return;
      }
    }
    handleApply(job.id);
  };

  const handleApply = async (staffingRequestId: string, customAnswers: string[] = []) => {
    setApplyingTo(staffingRequestId);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffingRequestId, answers: customAnswers })
      });
      if (res.ok) {
        setSuccessMessage('Application submitted successfully!');
        fetchEventData();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to apply');
      }
    } catch (e) {
      alert('An error occurred while applying.');
    } finally {
      setApplyingTo(null);
      setActiveJobForQuestions(null);
    }
  };

  if (loading) return <div className="p-10 font-medium text-gray-500">Loading event details...</div>;
  if (error || !event) return <div className="p-10 font-medium text-red-500">{error || 'Event not found'}</div>;

  return (
    <div className="max-w-5xl text-[#242424] mx-auto pb-12">
      <div className="mb-6">
        <Link href="/worker/jobs" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#CD7F32] font-bold uppercase tracking-wider text-xs transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m15 18-6-6 6-6"/></svg>
          Back to Jobs
        </Link>
      </div>

      {/* Success Modal */}
      {successMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-[#1a1a20] rounded-3xl p-8 max-w-sm w-full text-center border border-white/10 shadow-[0_0_40px_rgba(205,127,50,0.3)]"
          >
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 font-serif">Success!</h3>
            <p className="text-gray-400 font-medium mb-6">{successMessage}</p>
            <button 
              onClick={() => setSuccessMessage(null)}
              className="w-full bg-[#CD7F32] text-white font-bold py-3.5 rounded-xl active:scale-95 transition-transform"
            >
              Awesome
            </button>
          </motion.div>
        </div>
      )}

      <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 mb-8">
        <div className="w-full h-64 md:h-80 bg-gray-200 relative">
          {event.coverImageUrl ? (
             <img src={event.coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </div>
          )}
        </div>
        
        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold font-serif mb-4 text-[#CD7F32]">{event.title}</h1>
              <p className="text-xl text-gray-600 mb-2">Hosted by {event.manager?.managerProfile?.company || event.manager?.name || 'Manager'}</p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Date</p>
                    <p className="font-bold">{new Date(event.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Location</p>
                    <p className="font-bold">{event.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="prose max-w-none text-gray-700">
            <h3 className="text-2xl font-bold font-serif mb-4 text-[#242424]">About this Event</h3>
            <p className="whitespace-pre-wrap leading-relaxed">{event.description || 'No description provided.'}</p>
          </div>
        </div>
      </div>

      <h2 className="text-3xl font-bold font-serif mb-6 text-[#242424]">Available Roles</h2>
      
      {event.staffingRequests && event.staffingRequests.length > 0 ? (
        <div className="space-y-4">
          {event.staffingRequests.map((job: any) => {
            const hasApplied = job.applications?.some((app: any) => app.workerProfile?.id === workerProfile?.id);
            const userApp = job.applications?.find((app: any) => app.workerProfile?.id === workerProfile?.id);
            const applicationStatus = userApp?.status;

            return (
              <motion.div 
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col md:flex-row justify-between gap-6 shadow-sm"
                style={{ boxShadow: '-4px 4px 0px rgba(205, 127, 50, 0.4)' }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-2xl font-bold font-serif text-[#CD7F32]">{job.roleName}</h3>
                    {job.tier && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase shadow-sm border ${
                        job.tier.includes('1') ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        job.tier.includes('2') ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-purple-100 text-purple-800 border-purple-200'
                      }`}>
                        Requires {job.tier}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{job.roleDescription || 'No detailed description provided.'}</p>
                  
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Pay Rate</p>
                      <p className="font-bold text-lg text-gray-800">₹{job.payRate} <span className="text-sm font-normal text-gray-500">{job.payType === 'FIXED' ? 'Total' : '/ hr'}</span></p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Required</p>
                      <p className="font-bold text-lg text-gray-800">{job.quantity} <span className="text-sm font-normal text-gray-500">people</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-end border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[200px]">
                  {hasApplied ? (
                    <div className={`w-full px-6 py-3 rounded-lg font-bold text-center border-2 border-dashed ${
                      applicationStatus === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' : 
                      applicationStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {applicationStatus === 'ACCEPTED' ? 'Hired!' : applicationStatus === 'REJECTED' ? 'Declined' : 'Applied (Pending)'}
                    </div>
                  ) : (
                    <div className="w-full flex flex-col items-center">
                      <button 
                        onClick={() => initiateApply(job)}
                        disabled={applyingTo === job.id || !isVerified || workerLevel < getTierLevel(job.tier)}
                        className="w-full bg-[#242424] hover:bg-black text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyingTo === job.id ? 'Applying...' : 'Apply Now'}
                      </button>
                      {!isVerified ? (
                        <p className="text-[10px] text-red-500 font-bold uppercase mt-2 text-center">Verification Required</p>
                      ) : workerLevel < getTierLevel(job.tier) ? (
                        <p className="text-[10px] text-red-500 font-bold uppercase mt-2 text-center">Requires {job.tier}</p>
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-xl border border-gray-100 text-gray-500 italic">
          No roles are currently open for this event.
        </div>
      )}

      {/* Questions Modal */}
      {activeJobForQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold font-serif mb-2">Answer Questions</h2>
            <p className="text-gray-600 mb-6 font-medium">Please answer the required questions to apply.</p>
            
            <div className="space-y-6 mb-8">
              {activeJobForQuestions.questions.map((q: string, i: number) => (
                <div key={i}>
                  <label className="block text-sm font-bold text-gray-700 mb-2">{q}</label>
                  <textarea 
                    value={answers[i]}
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      newAnswers[i] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                    placeholder="Type your answer here..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#CD7F32] focus:bg-white transition-colors"
                    rows={3}
                  />
                </div>
              ))}
              
              <div className="flex justify-end gap-3 mt-8">
                <button 
                  onClick={() => setActiveJobForQuestions(null)}
                  className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleApply(activeJobForQuestions.id, answers)}
                  disabled={applyingTo === activeJobForQuestions.id || answers.some(a => !a.trim())}
                  className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#CD7F32] hover:bg-[#a86524] transition-colors disabled:opacity-50"
                >
                  {applyingTo === activeJobForQuestions.id ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function EventDetailsPage() {
  return (
    <Suspense fallback={<div className="p-10 font-medium text-gray-500">Loading...</div>}>
      <EventDetailsContent />
    </Suspense>
  );
}
