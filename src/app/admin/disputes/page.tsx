'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
    return <div className="text-gray-500 font-bold">Loading disputes...</div>;
  }

  return (
    <div className="text-[#242424] max-w-5xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Manage Disputes</h1>
        <p className="text-lg text-gray-700">Review flagged issues, no-shows, and complaints</p>
      </div>

      <div className="space-y-6">
        {disputes.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm">
            No open disputes found. Great job!
          </div>
        ) : (
          disputes.map((dispute) => (
            <motion.div 
              key={dispute.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-red-200 overflow-hidden shadow-sm" 
              style={{ boxShadow: '-6px 6px 0px rgba(239, 68, 68, 0.3)' }}
            >
              <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {dispute.reason}
                  </span>
                  <span className="text-sm font-bold text-gray-700">
                    {dispute.event.title} • {new Date(dispute.event.date).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(dispute.createdAt).toLocaleString()}
                </span>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reported By</h4>
                    <p className="font-bold text-gray-900">{dispute.reporter.name}</p>
                    <p className="text-sm text-gray-600">{dispute.reporter.email} • <span className="uppercase">{dispute.reporter.role}</span></p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Target</h4>
                    <p className="font-bold text-gray-900">{dispute.target.name}</p>
                    <p className="text-sm text-gray-600">{dispute.target.email} • <span className="uppercase">{dispute.target.role}</span></p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                    {dispute.description}
                  </p>
                </div>

                {resolvingId === dispute.id ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-3">
                    <label className="block text-sm font-bold text-blue-900">Resolution Notes</label>
                    <textarea 
                      rows={3} 
                      className="w-full bg-white border border-blue-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-400"
                      placeholder="Detail how this dispute was resolved..."
                      value={resolutionText}
                      onChange={e => setResolutionText(e.target.value)}
                    ></textarea>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setResolvingId(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                      <button onClick={() => resolveDispute(dispute.id)} disabled={!resolutionText} className="px-6 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50">
                        Mark as Resolved
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button 
                      onClick={() => {
                        setResolvingId(dispute.id);
                        setResolutionText('');
                      }} 
                      className="bg-[#242424] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-black transition-colors"
                    >
                      Resolve Dispute
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
