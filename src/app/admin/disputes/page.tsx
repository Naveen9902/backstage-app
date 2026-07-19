'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Info, AlertOctagon, CheckCircle, Clock } from 'lucide-react';

type Dispute = {
  id: string;
  eventId: string;
  reason: string;
  description: string;
  status: string;
  resolution: string | null;
  createdAt: string;
  reporter: {
    name: string;
    email: string;
    role: string;
  };
  target: {
    name: string;
    email: string;
    role: string;
  };
  event: {
    title: string;
    date: string;
  };
};

export default function DisputesPanel() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await fetch('/api/admin/disputes?status=OPEN');
      const data = await res.json();
      if (Array.isArray(data)) {
        setDisputes(data);
      } else {
        setDisputes([]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async (id: string) => {
    if (!resolutionText) return;
    try {
      const res = await fetch('/api/admin/disputes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId: id, resolution: resolutionText })
      });
      if (res.ok) {
        setDisputes(disputes.filter(d => d.id !== id));
        setResolvingId(null);
        setResolutionText('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-red-400 font-medium tracking-widest uppercase text-sm">Loading Reports</p>
      </div>
    );
  }

  return (
    <div className="min-h-full p-2 md:p-6 text-[var(--foreground)] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-500 opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-red-600">
            Dispute Resolution
          </h1>
          <p className="text-base md:text-lg text-gray-400 font-medium">Investigate and resolve flagged issues and platform violations.</p>
        </motion.div>

        <div className="space-y-6">
          <AnimatePresence>
            {disputes.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1a1a1a]/80 backdrop-blur-2xl rounded-3xl border border-emerald-500/20 p-12 text-center shadow-[0_0_40px_rgba(16,185,129,0.05)]"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 mb-6 border border-emerald-500/20">
                  <CheckCircle size={32} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 tracking-wide">All Clear!</h3>
                <p className="text-gray-400 text-lg">There are no open disputes requiring your attention.</p>
              </motion.div>
            ) : (
              disputes.map((dispute, idx) => (
                <motion.div 
                  key={dispute.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-[#1a1a1a]/80 backdrop-blur-2xl rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative" 
                >
                  {/* Subtle red glow at top */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 to-transparent"></div>

                  <div className="bg-black/40 px-6 py-4 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-1.5 bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                        <AlertOctagon size={12} />
                        {dispute.reason}
                      </span>
                      <span className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></span>
                        {dispute.event.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono flex items-center gap-1.5">
                      <Clock size={12} />
                      {new Date(dispute.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {/* Reporter Info */}
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 blur-xl rounded-full"></div>
                        <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          Reported By
                        </h4>
                        <p className="font-bold text-white text-lg mb-1">{dispute.reporter.name}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-400">{dispute.reporter.email}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase tracking-wider">{dispute.reporter.role}</span>
                        </div>
                      </div>

                      {/* Target Info */}
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/10 blur-xl rounded-full"></div>
                        <h4 className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          Against Target
                        </h4>
                        <p className="font-bold text-white text-lg mb-1">{dispute.target.name}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-400">{dispute.target.email}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 uppercase tracking-wider">{dispute.target.role}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Info size={14} className="text-gray-400" />
                        Incident Description
                      </h4>
                      <p className="text-gray-300 bg-black/30 p-5 rounded-2xl border border-white/5 whitespace-pre-wrap leading-relaxed text-sm">
                        {dispute.description}
                      </p>
                    </div>

                    <AnimatePresence mode="wait">
                      {resolvingId === dispute.id ? (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-emerald-500/5 p-5 md:p-6 rounded-2xl border border-emerald-500/20 space-y-4 overflow-hidden"
                        >
                          <label className="block text-xs font-bold text-emerald-400 uppercase tracking-widest">Resolution Notes</label>
                          <textarea 
                            rows={3} 
                            className="w-full bg-black/40 border border-emerald-500/30 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/60 transition-all placeholder:text-gray-600"
                            placeholder="Detail how this dispute was resolved (e.g., Warning issued, Account suspended)..."
                            value={resolutionText}
                            onChange={e => setResolutionText(e.target.value)}
                          ></textarea>
                          <div className="flex gap-3 justify-end pt-2">
                            <button 
                              onClick={() => setResolvingId(null)} 
                              className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => resolveDispute(dispute.id)} 
                              disabled={!resolutionText} 
                              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-sm font-bold rounded-xl hover:bg-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle size={16} />
                              Confirm Resolution
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="flex justify-end"
                        >
                          <button 
                            onClick={() => {
                              setResolvingId(dispute.id);
                              setResolutionText('');
                            }} 
                            className="flex items-center gap-2 bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-[var(--primary)]/20 transition-all"
                          >
                            <ShieldAlert size={16} />
                            Resolve Dispute
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
