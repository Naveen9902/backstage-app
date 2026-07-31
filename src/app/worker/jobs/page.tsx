'use client';
import { apiFetch } from '@/lib/apiFetch';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FindJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [workerTier, setWorkerTier] = useState<string | null>(null);
  const [workerCategories, setWorkerCategories] = useState<string[]>([]);
  const [tierFilter, setTierFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Custom Questions Flow
  const [activeJobForQuestions, setActiveJobForQuestions] = useState<any | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);

  const fetchJobs = async () => {
    try {
      const [jobsRes, profileRes] = await Promise.all([
        apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/jobs`),
        apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/profile`)
      ]);
      const data = await jobsRes.json();
      const profileData = await profileRes.json();
      
      if (Array.isArray(data)) {
        setJobs(data);
      }
      if (profileData && profileData.workerProfile) {
        setIsVerified(profileData.workerProfile.isVerified);
        setWorkerTier(profileData.workerProfile.tier);
        setWorkerCategories(profileData.workerProfile.categories || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleApply = async (staffingRequestId: string, customAnswers: string[] = []) => {
    setApplyingTo(staffingRequestId);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffingRequestId, answers: customAnswers })
      });
      
      if (res.ok) {
        // Refresh jobs list to show 'Applied' status
        await fetchJobs();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to apply');
      }
    } catch (err) {
      alert('An error occurred while applying.');
    } finally {
      setApplyingTo(null);
      setActiveJobForQuestions(null);
      setAnswers([]);
    }
  };

  const initiateApply = (job: any) => {
    if (Array.isArray(job.questions) && job.questions.length > 0) {
      setActiveJobForQuestions(job);
      setAnswers(new Array(job.questions.length).fill(''));
    } else {
      handleApply(job.id);
    }
  };

  const getTierLevel = (tier?: string) => {
    if (!tier) return 0;
    if (tier.includes('1')) return 1;
    if (tier.includes('2')) return 2;
    if (tier.includes('3')) return 3;
    return 0;
  };

  const workerLevel = getTierLevel(workerTier || '');
  const availableRoles = Array.from(new Set(jobs.map(j => j.roleName))).sort();
  const availableEventTypes = Array.from(new Set(jobs.map(j => j.event?.attendeeCategory).filter(Boolean))).sort();

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.roleName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.event?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTierFilter = tierFilter === 'All' || job.tier === tierFilter;
    const matchesRoleFilter = roleFilter === 'All' || job.roleName === roleFilter;
    const matchesEventTypeFilter = eventTypeFilter === 'All' || job.event?.attendeeCategory === eventTypeFilter;
    
    let matchesDateFilter = true;
    if (dateFilter) {
      if (job.event?.date) {
        const jobDate = new Date(job.event.date).toISOString().split('T')[0];
        matchesDateFilter = jobDate === dateFilter;
      } else {
        matchesDateFilter = false;
      }
    }
    
    // Authorization logic
    const jobTierLevel = getTierLevel(job.tier);
    const hasSufficientTier = workerLevel >= jobTierLevel;
    const hasSpecificRole = jobTierLevel > 1 ? workerCategories.includes(job.roleName) : true;
    
    return matchesSearch && matchesTierFilter && matchesRoleFilter && matchesEventTypeFilter && matchesDateFilter && hasSufficientTier && hasSpecificRole;
  });

  return (
    <div className="text-[#242424] max-w-5xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Find Jobs</h1>
          <p className="text-lg text-gray-700">Discover and apply for open positions at upcoming events</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <input 
              type="text" 
              placeholder="Search roles or events..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#CD7F32] shadow-sm w-full"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <div className="relative w-full sm:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium focus:outline-none hover:bg-gray-50 shadow-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {(tierFilter !== 'All' || roleFilter !== 'All' || eventTypeFilter !== 'All' || dateFilter) && (
                <span className="w-2 h-2 rounded-full bg-[#CD7F32]"></span>
              )}
            </button>

            {/* Filter Dropdown */}
            {showFilters && (
              <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-72 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Filters</h3>
                  <button 
                    onClick={() => {
                      setTierFilter('All');
                      setRoleFilter('All');
                      setEventTypeFilter('All');
                      setDateFilter('');
                    }}
                    className="text-xs text-red-500 hover:underline font-medium"
                  >
                    Clear All
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tier</label>
                    <select
                      value={tierFilter}
                      onChange={(e) => setTierFilter(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CD7F32]"
                    >
                      <option value="All">All Tiers</option>
                      <option value="Tier 1">Tier 1</option>
                      <option value="Tier 2">Tier 2</option>
                      <option value="Tier 3">Tier 3</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CD7F32]"
                    >
                      <option value="All">All Roles</option>
                      {availableRoles.map(role => (
                        <option key={role as string} value={role as string}>{role as string}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Type</label>
                    <select
                      value={eventTypeFilter}
                      onChange={(e) => setEventTypeFilter(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CD7F32]"
                    >
                      <option value="All">All Types</option>
                      {availableEventTypes.length > 0 ? (
                        availableEventTypes.map(type => (
                          <option key={type as string} value={type as string}>{type as string}</option>
                        ))
                      ) : (
                        <option value="" disabled>No event types available</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                    <input 
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#CD7F32]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {!loading && !isVerified && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="font-bold">Verification Pending</h3>
            <p className="text-sm">You must wait for an Admin to review and approve your tier application before you can apply for jobs.</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-gray-500 font-medium p-8 bg-white rounded-xl">Loading open roles...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-gray-500 p-8 bg-white rounded-xl border border-gray-100 italic">No open jobs found matching your search.</div>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map((job, index) => {
            const hasApplied = job.applications && job.applications.length > 0;
            const applicationStatus = hasApplied ? job.applications[0].status : null;
            
            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 border border-gray-100 flex flex-col md:flex-row justify-between gap-6"
                style={{ boxShadow: '-6px 6px 0px rgba(205, 127, 50, 0.9)' }}
              >
                <Link href={`/worker/events/${job.event?.id}`} className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-1 hover:opacity-80 transition-opacity">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl flex-shrink-0 border border-gray-200 overflow-hidden relative">
                    {job.event?.coverImageUrl ? (
                      <img src={job.event.coverImageUrl} alt="Event Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
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
                        <p className="text-lg font-semibold text-gray-800">{job.event?.title}</p>
                        <p className="text-sm text-gray-500 mt-1">by {job.event?.manager?.managerProfile?.company || 'Event Manager'}</p>
                      </div>
                      <div className="md:text-right mt-2 md:mt-0 bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-lg">
                        <p className="text-2xl font-bold font-serif text-gray-800">₹{job.payRate} <span className="text-sm font-normal text-gray-500">{job.payType === 'FIXED' ? 'Total' : '/ hr'}</span></p>
                        <p className="text-sm text-gray-500 font-medium">Need {job.quantity} people</p>
                      </div>
                    </div>
                  
                  <div className="flex flex-wrap items-center text-gray-600 text-sm gap-4 pt-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                      {job.event?.date ? new Date(job.event.date).toLocaleDateString() : 'TBD'}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {job.event?.location}
                    </span>
                  </div>
                  </div>
                </Link>

                <div className="flex flex-col justify-end">
                  {hasApplied ? (
                    <div className={`px-6 py-3 rounded-lg font-bold text-center border-2 border-dashed ${
                      applicationStatus === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-200' : 
                      applicationStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' : 
                      'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {applicationStatus === 'ACCEPTED' ? 'Hired!' : applicationStatus === 'REJECTED' ? 'Declined' : 'Applied (Pending)'}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <button 
                        onClick={() => initiateApply(job)}
                        disabled={applyingTo === job.id || !isVerified || workerLevel < getTierLevel(job.tier)}
                        className="w-full bg-[#242424] hover:bg-black text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {applyingTo === job.id ? 'Applying...' : 'Apply Now'}
                      </button>
                      {!isVerified ? (
                        <p className="text-[10px] text-red-500 font-bold uppercase mt-2">Verification Required</p>
                      ) : workerLevel < getTierLevel(job.tier) ? (
                        <p className="text-[10px] text-red-500 font-bold uppercase mt-2">Requires {job.tier}</p>
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Questions Modal */}
      {activeJobForQuestions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold font-serif text-gray-900">Application Questions</h3>
                <p className="text-sm text-gray-500 mt-1">Please answer the screening questions for {activeJobForQuestions.roleName}</p>
              </div>
              <button 
                onClick={() => setActiveJobForQuestions(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {activeJobForQuestions.questions.map((q: string, idx: number) => (
                <div key={idx} className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">
                    <span className="text-[#CD7F32] mr-2">Q{idx + 1}.</span> {q} <span className="text-red-400">*</span>
                  </label>
                  <textarea 
                    required
                    rows={3}
                    value={answers[idx]}
                    onChange={(e) => {
                      const newA = [...answers];
                      newA[idx] = e.target.value;
                      setAnswers(newA);
                    }}
                    placeholder="Your answer..."
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#CD7F32] focus:ring-4 focus:ring-[#CD7F32]/10 transition-all resize-none shadow-sm"
                  />
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setActiveJobForQuestions(null)}
                className="px-6 py-2.5 rounded-lg font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleApply(activeJobForQuestions.id, answers)}
                disabled={applyingTo === activeJobForQuestions.id || answers.some(a => !a.trim())}
                className="bg-[#CD7F32] hover:bg-[#a06227] text-white px-8 py-2.5 rounded-lg font-bold shadow-md shadow-[#CD7F32]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applyingTo === activeJobForQuestions.id ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
