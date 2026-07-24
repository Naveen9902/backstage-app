'use client';

import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, X, Check } from 'lucide-react';

type Worker = {
  id: string;
  skills: string;
  experience: string;
  isVerified: boolean;
  verificationStatus: string;
  requestedTier?: string;
  govtIdUrl?: string;
  liveSelfieUrl?: string;
  proofOfExperienceUrl?: string;
  socialMediaUrl?: string;
  referenceContact?: string;
  referenceEvent?: string;
  user: {
    name: string;
    email: string;
    mobile?: string;
  };
};

export default function VerifyTalents() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await fetch('/api/admin/workers');
      const data = await res.json();
      if (Array.isArray(data)) {
        setWorkers(data);
      } else {
        setWorkers([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateWorker = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch('/api/admin/workers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerProfileId: id, action })
      });
      if (res.ok) {
        // Update local state
        setWorkers(workers.map(w => w.id === id ? { 
          ...w, 
          isVerified: action === 'APPROVE',
          verificationStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
        } : w));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[var(--primary)] font-medium tracking-widest uppercase text-sm">Loading Profiles</p>
      </div>
    );
  }

  return (
    <div className="min-h-full p-2 md:p-6 text-[var(--foreground)] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--primary)] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Verify Talents
          </h1>
          <p className="text-base md:text-lg text-gray-400 font-medium">Review and approve new worker profiles on the platform.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="bg-[#1a1a1a]/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="bg-black/20 border-b border-white/10 p-5 md:p-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
              <ShieldCheck size={16} />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">Pending & Reviewed Profiles</h2>
          </div>

          <div className="overflow-x-auto p-0">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-black/40 border-b border-white/5 text-xs uppercase tracking-widest text-gray-400 font-semibold">
                  <th className="p-5 pl-6">Talent</th>
                  <th className="p-5">Skills</th>
                  <th className="p-5">Experience</th>
                  <th className="p-5">Requested Tier</th>
                  <th className="p-5 text-center">Status</th>
                  <th className="p-5 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {workers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-16 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                        <ShieldCheck size={24} className="text-gray-500" />
                      </div>
                      <p className="text-gray-400 font-medium text-lg">No worker profiles found.</p>
                    </td>
                  </tr>
                ) : (
                  workers.map((worker) => (
                    <Fragment key={worker.id}>
                    <tr className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setExpandedId(expandedId === worker.id ? null : worker.id)}>
                      <td className="p-5 pl-6">
                        <div className="font-semibold text-gray-200 group-hover:text-[var(--primary)] transition-colors">{worker.user.name}</div>
                        <div className="text-sm text-gray-500">{worker.user.email}</div>
                      </td>
                      <td className="p-5 text-sm text-gray-400 max-w-[200px] truncate">{worker.skills || 'Not provided'}</td>
                      <td className="p-5 text-sm text-gray-400 max-w-[250px] truncate">{worker.experience || 'Not provided'}</td>
                      <td className="p-5 text-sm text-amber-500 font-bold">{worker.requestedTier || 'None'}</td>
                      <td className="p-5 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          worker.verificationStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                          worker.verificationStatus === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                          'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {worker.verificationStatus}
                        </span>
                      </td>
                      <td className="p-5 pr-6 text-right">
                        {worker.verificationStatus === 'PENDING' ? (
                          <div className="flex gap-2 justify-end">
                            <button 
                              onClick={() => updateWorker(worker.id, 'APPROVE')}
                              className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            >
                              <Check size={14} />
                              Approve
                            </button>
                            <button 
                              onClick={() => updateWorker(worker.id, 'REJECT')}
                              className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                            >
                              <X size={14} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600 font-medium tracking-wide">Processed</span>
                        )}
                      </td>
                    </tr>
                    {expandedId === worker.id && (
                      <tr key={`${worker.id}-details`} className="bg-black/40 border-b border-white/5">
                        <td colSpan={6} className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-4">
                              <h4 className="font-bold text-[var(--primary)] uppercase tracking-wider text-xs border-b border-white/10 pb-2">Identity & Contact</h4>
                              <p><span className="text-gray-500">Mobile:</span> {worker.user.mobile || 'N/A'}</p>
                              <div>
                                <span className="text-gray-500 block mb-1">Government ID:</span>
                                {worker.govtIdUrl ? (
                                  <a href={worker.govtIdUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">View Document</a>
                                ) : <span className="text-red-400">Not provided</span>}
                              </div>
                              <div>
                                <span className="text-gray-500 block mb-1">Live Selfie:</span>
                                {worker.liveSelfieUrl ? (
                                  <a href={worker.liveSelfieUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">View Image</a>
                                ) : <span className="text-red-400">Not provided</span>}
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-bold text-[var(--primary)] uppercase tracking-wider text-xs border-b border-white/10 pb-2">Professional Details</h4>
                              <div>
                                <span className="text-gray-500 block mb-1">Proof of Experience:</span>
                                {worker.proofOfExperienceUrl ? (
                                  <a href={worker.proofOfExperienceUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">View Proof</a>
                                ) : <span className="text-gray-600">Not provided</span>}
                              </div>
                              <div>
                                <span className="text-gray-500 block mb-1">Social Media / LinkedIn:</span>
                                {worker.socialMediaUrl ? (
                                  <a href={worker.socialMediaUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{worker.socialMediaUrl}</a>
                                ) : <span className="text-gray-600">Not provided</span>}
                              </div>
                              <p><span className="text-gray-500">Reference Event:</span> {worker.referenceEvent || 'None'}</p>
                              <p><span className="text-gray-500">Reference Contact:</span> {worker.referenceContact || 'None'}</p>
                            </div>
                          </div>
                          
                          {worker.verificationStatus === 'PENDING' && (
                            <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-4">
                              <button onClick={() => updateWorker(worker.id, 'REJECT')} className="px-6 py-2 rounded-lg font-bold text-sm bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">Reject Application</button>
                              <button onClick={() => updateWorker(worker.id, 'APPROVE')} className="px-6 py-2 rounded-lg font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">Approve & Verify Tier</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
