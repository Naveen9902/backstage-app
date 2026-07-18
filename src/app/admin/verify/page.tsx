'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type Worker = {
  id: string;
  skills: string;
  experience: string;
  isVerified: boolean;
  verificationStatus: string;
  user: {
    name: string;
    email: string;
  };
};

export default function VerifyTalents() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

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
    return <div className="text-gray-500 font-bold">Loading profiles...</div>;
  }

  return (
    <div className="text-[#242424]">
      <div className="mb-10">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Verify Talents</h1>
        <p className="text-lg text-gray-700">Review and approve new worker profiles on the platform</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm" style={{ boxShadow: '-6px 6px 0px rgba(205, 127, 50, 0.9)' }}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm uppercase tracking-wider text-gray-500">
              <th className="px-6 py-4 font-bold">Talent</th>
              <th className="px-6 py-4 font-bold">Skills</th>
              <th className="px-6 py-4 font-bold">Experience</th>
              <th className="px-6 py-4 font-bold text-center">Status</th>
              <th className="px-6 py-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {workers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No worker profiles found.</td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{worker.user.name}</div>
                    <div className="text-sm text-gray-500">{worker.user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-[200px] truncate">{worker.skills || 'Not provided'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-[250px] truncate">{worker.experience || 'Not provided'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${worker.verificationStatus === 'APPROVED' ? 'bg-green-100 text-green-700' : worker.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                      {worker.verificationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {worker.verificationStatus === 'PENDING' && (
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => updateWorker(worker.id, 'APPROVE')}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-bold shadow-md transition-all"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => updateWorker(worker.id, 'REJECT')}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm font-bold shadow-md transition-all"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
