'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FindJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/worker/jobs');
      const data = await res.json();
      if (Array.isArray(data)) {
        setJobs(data);
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

  const handleApply = async (staffingRequestId: string) => {
    setApplyingTo(staffingRequestId);
    try {
      const res = await fetch('/api/worker/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffingRequestId })
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
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.roleName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.event?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="text-[#242424] max-w-5xl">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Find Jobs</h1>
          <p className="text-lg text-gray-700">Discover and apply for open positions at upcoming events</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            placeholder="Search roles or events..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#CD7F32] shadow-sm w-full md:w-64"
          />
        </div>
      </div>

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
                <div className="space-y-3 flex-1">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                    <div>
                      <h3 className="text-2xl font-bold font-serif text-[#CD7F32]">{job.roleName}</h3>
                      <p className="text-lg font-semibold text-gray-800">{job.event?.title}</p>
                      <p className="text-sm text-gray-500 mt-1">by {job.event?.manager?.managerProfile?.company || 'Event Manager'}</p>
                    </div>
                    <div className="md:text-right mt-2 md:mt-0 bg-gray-50 md:bg-transparent p-3 md:p-0 rounded-lg">
                      <p className="text-2xl font-bold font-serif text-gray-800">₹{job.payRate}</p>
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
                    <button 
                      onClick={() => handleApply(job.id)}
                      disabled={applyingTo === job.id}
                      className="bg-[#242424] hover:bg-black text-white px-8 py-3 rounded-lg font-bold shadow-md transition-all disabled:opacity-50"
                    >
                      {applyingTo === job.id ? 'Applying...' : 'Apply Now'}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
