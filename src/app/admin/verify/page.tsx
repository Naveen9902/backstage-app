'use client';
import { apiFetch } from '@/lib/apiFetch';


import { useState, useEffect, Fragment } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, X, Check, Building } from 'lucide-react';

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
  categories?: string[];
};

type Manager = {
  id: string;
  isVerified: boolean;
  verificationStatus: string;
  managerName?: string;
  company?: string;
  location?: string;
  socialLink?: string;
  profilePictureUrl?: string;
  user: {
    name: string;
    email: string;
    mobile?: string;
  };
};

const TIER_CATEGORIES: Record<string, string[]> = {
  'Tier 1': [
    'Labor / Ground Crew', 'Runners', 'Guest Assistance Staff', 'Parking Staff',
    'Setup/Breakdown Crew', 'Cleaning and Housekeeping Staff', 'Volunteers', 'General Help'
  ],
  'Tier 2': [
    'Event Coordinators', 'MC / Anchor', 'Registration Desk', 'Front of House Staff',
    'Photographer', 'Videographer', 'Media', 'Press Member', 'Paparazzi',
    'Technical Crew Member (Sound, Lighting, Ops)', 'Hospitality / Catering',
    'Stage Manager', 'Backstage Manager'
  ],
  'Tier 3': [
    'Bands / Music Performers', 'Speaker', 'Keynote Guests', 'Comedians',
    'Startup Performers', 'Celebrity', 'Influencer', 'DJ', 'Other Talents'
  ]
};

export default function VerifyTalents() {
  const [activeTab, setActiveTab] = useState<'WORKERS' | 'MANAGERS'>('WORKERS');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');

  useEffect(() => {
    if (activeTab === 'WORKERS') {
      fetchWorkers();
    } else {
      fetchManagers();
    }
  }, [statusFilter, activeTab]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/workers?status=${statusFilter}`);
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

  const fetchManagers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/managers?status=${statusFilter}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setManagers(data);
      } else {
        setManagers([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateWorker = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/workers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerProfileId: id, action })
      });
      if (res.ok) {
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

  const updateManager = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/admin/managers`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ managerProfileId: id, action })
      });
      if (res.ok) {
        setManagers(managers.map(m => m.id === id ? { 
          ...m, 
          isVerified: action === 'APPROVE',
          verificationStatus: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
        } : m));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading && workers.length === 0 && managers.length === 0) {
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
          className="mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Verify Users
          </h1>
          <p className="text-base md:text-lg text-gray-400 font-medium">Review and approve new worker and manager profiles on the platform.</p>
        </motion.div>

        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => { setActiveTab('WORKERS'); setExpandedId(null); }}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'WORKERS' ? 'bg-[var(--primary)] text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            Talents
          </button>
          <button 
            onClick={() => { setActiveTab('MANAGERS'); setExpandedId(null); }}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'MANAGERS' ? 'bg-[var(--primary)] text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            Managers
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="bg-[#1a1a1a]/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="bg-black/20 border-b border-white/10 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
                {activeTab === 'WORKERS' ? <ShieldCheck size={16} /> : <Building size={16} />}
              </div>
              <h2 className="text-lg md:text-xl font-bold text-white tracking-wide">
                {activeTab === 'WORKERS' ? 'Worker Profiles' : 'Manager Profiles'}
              </h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select 
                value={statusFilter} 
                onChange={e => setStatusFilter(e.target.value)} 
                className="bg-[#242424] text-white border border-white/20 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[var(--primary)]"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              {activeTab === 'WORKERS' && (
                <>
                  <select 
                    value={tierFilter} 
                    onChange={e => {
                      setTierFilter(e.target.value);
                      setRoleFilter('ALL');
                    }} 
                    className="bg-[#242424] text-white border border-white/20 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[var(--primary)]"
                  >
                    <option value="ALL">All Tiers</option>
                    {Object.keys(TIER_CATEGORIES).map(tier => (
                      <option key={tier} value={tier}>{tier}</option>
                    ))}
                  </select>
                  
                  <select 
                    value={roleFilter} 
                    onChange={e => setRoleFilter(e.target.value)} 
                    className="bg-[#242424] text-white border border-white/20 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[var(--primary)] max-w-[200px]"
                    disabled={tierFilter === 'ALL'}
                  >
                    <option value="ALL">All Roles</option>
                    {tierFilter !== 'ALL' && TIER_CATEGORIES[tierFilter].map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto p-0 relative min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
                 <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-black/40 border-b border-white/5 text-xs uppercase tracking-widest text-gray-400 font-semibold">
                  <th className="p-5 pl-6">{activeTab === 'WORKERS' ? 'Talent' : 'Manager'}</th>
                  {activeTab === 'WORKERS' ? (
                    <>
                      <th className="p-5">Skills</th>
                      <th className="p-5">Experience</th>
                      <th className="p-5">Requested Tier</th>
                    </>
                  ) : (
                    <>
                      <th className="p-5">Company</th>
                      <th className="p-5">Location</th>
                    </>
                  )}
                  <th className="p-5 text-center">Status</th>
                  <th className="p-5 pr-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(() => {
                  if (activeTab === 'WORKERS') {
                    const filteredWorkers = workers.filter(w => {
                      const matchesTier = tierFilter === 'ALL' || w.requestedTier === tierFilter;
                      const matchesRole = roleFilter === 'ALL' || (w.categories && w.categories.includes(roleFilter));
                      return matchesTier && matchesRole;
                    });

                    return filteredWorkers.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={6} className="p-16 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                            <ShieldCheck size={24} className="text-gray-500" />
                          </div>
                          <p className="text-gray-400 font-medium text-lg">No worker profiles found matching criteria.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredWorkers.map((worker) => (
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
                                    onClick={(e) => { e.stopPropagation(); updateWorker(worker.id, 'APPROVE'); }}
                                    className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                  >
                                    <Check size={14} />
                                    Approve
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); updateWorker(worker.id, 'REJECT'); }}
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
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))
                    );
                  } else {
                    return managers.length === 0 && !loading ? (
                      <tr>
                        <td colSpan={5} className="p-16 text-center">
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                            <Building size={24} className="text-gray-500" />
                          </div>
                          <p className="text-gray-400 font-medium text-lg">No manager profiles found matching criteria.</p>
                        </td>
                      </tr>
                    ) : (
                      managers.map((manager) => (
                        <Fragment key={manager.id}>
                          <tr className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setExpandedId(expandedId === manager.id ? null : manager.id)}>
                            <td className="p-5 pl-6">
                              <div className="font-semibold text-gray-200 group-hover:text-[var(--primary)] transition-colors">{manager.managerName || manager.user.name}</div>
                              <div className="text-sm text-gray-500">{manager.user.email}</div>
                            </td>
                            <td className="p-5 text-sm text-gray-400">{manager.company || 'Not provided'}</td>
                            <td className="p-5 text-sm text-gray-400">{manager.location || 'Not provided'}</td>
                            <td className="p-5 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                manager.verificationStatus === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
                                manager.verificationStatus === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 
                                'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              }`}>
                                {manager.verificationStatus}
                              </span>
                            </td>
                            <td className="p-5 pr-6 text-right">
                              {manager.verificationStatus === 'PENDING' ? (
                                <div className="flex gap-2 justify-end">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); updateManager(manager.id, 'APPROVE'); }}
                                    className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                  >
                                    <Check size={14} />
                                    Approve
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); updateManager(manager.id, 'REJECT'); }}
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
                          {expandedId === manager.id && (
                            <tr key={`${manager.id}-details`} className="bg-black/40 border-b border-white/5">
                              <td colSpan={5} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                  <div className="space-y-4">
                                    <h4 className="font-bold text-[var(--primary)] uppercase tracking-wider text-xs border-b border-white/10 pb-2">Identity & Contact</h4>
                                    <p><span className="text-gray-500">Mobile:</span> {manager.user.mobile || 'N/A'}</p>
                                    <div>
                                      <span className="text-gray-500 block mb-1">Company:</span>
                                      <p className="text-gray-300">{manager.company || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block mb-1">Location:</span>
                                      <p className="text-gray-300">{manager.location || 'Not provided'}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-4">
                                    <h4 className="font-bold text-[var(--primary)] uppercase tracking-wider text-xs border-b border-white/10 pb-2">Online Presence</h4>
                                    <div>
                                      <span className="text-gray-500 block mb-1">Social Link / Website:</span>
                                      {manager.socialLink ? (
                                        <a href={manager.socialLink} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{manager.socialLink}</a>
                                      ) : <span className="text-gray-600">Not provided</span>}
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block mb-1">Profile Picture:</span>
                                      {manager.profilePictureUrl ? (
                                        <a href={manager.profilePictureUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">View Image</a>
                                      ) : <span className="text-gray-600">Not provided</span>}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))
                    );
                  }
                })()}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
