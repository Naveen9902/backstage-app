'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { MapPin, Search, UserPlus, CheckCircle2 } from 'lucide-react';

interface Props {
  eventId: string;
  staffingRequestId: string;
  roleName: string;
  onClose: () => void;
}

export default function SearchTalentModal({ eventId, staffingRequestId, roleName, onClose }: Props) {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState('ALL');
  const [distance, setDistance] = useState('50');

  const fetchTalent = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/manager/events/${eventId}/search-talent?role=${roleName}&tier=${tierFilter}&distance=${distance}`);
      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalent();
  }, [tierFilter, distance]);

  const sendInvite = async (workerProfileId: string) => {
    try {
      const res = await fetch(`/api/manager/events/${eventId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerProfileId, staffingRequestId })
      });
      if (res.ok) {
        // Update local state to show invited
        setWorkers(workers.map(w => w.id === workerProfileId ? { ...w, applicationStatus: 'INVITED' } : w));
      } else {
        alert("Failed to send invite");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-2xl font-bold font-serif">Search Talent</h2>
            <p className="text-sm text-gray-600">Finding workers for <span className="font-bold text-[#CD7F32]">{roleName}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div className="p-6 bg-white border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tier</label>
              <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#CD7F32]">
                <option value="ALL">All Tiers</option>
                <option value="TIER_1">Tier 1 (Basic)</option>
                <option value="TIER_2">Tier 2 (Verified)</option>
                <option value="TIER_3">Tier 3 (Premium)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Max Distance</label>
              <select value={distance} onChange={(e) => setDistance(e.target.value)} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#CD7F32]">
                <option value="10">10 Miles</option>
                <option value="25">25 Miles</option>
                <option value="50">50 Miles</option>
                <option value="100">100 Miles</option>
                <option value="500">500 Miles</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Searching database...</div>
          ) : workers.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
              No workers found matching these criteria nearby.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workers.map((worker) => (
                <div key={worker.id} className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col justify-between hover:border-[#CD7F32] transition-colors shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                      {worker.user?.avatarUrl ? (
                        <img src={worker.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#242424] text-white font-bold">{worker.user?.name?.substring(0,2).toUpperCase()}</div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{worker.user?.name}</h4>
                      <div className="flex items-center gap-2 text-xs mt-1">
                        {worker.isVerified && worker.tier ? (
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase shadow-sm border ${
                            worker.tier === 'Tier 1' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                            worker.tier === 'Tier 2' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-purple-100 text-purple-800 border-purple-200'
                          }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Verified {worker.tier}
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded uppercase">Unverified</span>
                        )}
                        <span className="text-yellow-600 font-bold flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> {(worker.rating || 0).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                        <MapPin className="w-3 h-3" />
                        {worker.distance !== null ? `${worker.distance.toFixed(1)} miles away` : worker.location || 'Location unknown'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-50 flex justify-end">
                    {worker.applicationStatus === 'INVITED' ? (
                      <button disabled className="px-4 py-2 bg-gray-100 text-gray-500 font-bold text-xs rounded-lg uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Invited
                      </button>
                    ) : worker.applicationStatus ? (
                      <button disabled className="px-4 py-2 bg-gray-100 text-gray-500 font-bold text-xs rounded-lg uppercase flex items-center gap-1">
                        {worker.applicationStatus}
                      </button>
                    ) : (
                      <button onClick={() => sendInvite(worker.id)} className="px-4 py-2 bg-[#CD7F32] hover:bg-[#b56e29] text-white font-bold text-xs rounded-lg uppercase transition-colors flex items-center gap-1">
                        <UserPlus className="w-4 h-4" /> Invite to Apply
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
