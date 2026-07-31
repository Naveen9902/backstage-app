'use client';
import { apiFetch } from '@/lib/apiFetch';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function MyApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/worker/applications`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setApplications(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="text-[#242424] max-w-5xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">My Applications</h1>
        <p className="text-lg text-gray-700">Track the status of your job applications</p>
      </div>

      {loading ? (
        <div className="text-gray-500 font-medium p-8 bg-white rounded-xl">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="text-gray-500 p-8 bg-white rounded-xl border border-gray-100 italic">You haven't applied to any jobs yet.</div>
      ) : (
        <div className="space-y-4">
          {applications.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl p-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl flex-shrink-0 border border-gray-200 overflow-hidden relative">
                  {app.staffingRequest?.event?.coverImageUrl ? (
                    <img src={app.staffingRequest.event.coverImageUrl} alt="Event Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold font-serif text-[#242424]">{app.staffingRequest?.roleName}</h3>
                  <p className="text-sm text-gray-600 font-medium">{app.staffingRequest?.event?.title} • {app.staffingRequest?.event?.manager?.managerProfile?.company || 'Manager'}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-xs text-gray-400">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs font-bold text-[#CD7F32]">₹{app.staffingRequest?.payRate} {app.staffingRequest?.payType === 'FIXED' ? 'Total' : '/ hr'}</p>
                  </div>
                </div>
              </div>

              <div className="self-start md:self-auto">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
                  ${app.status === 'PENDING' ? 'bg-orange-50 text-orange-700 border border-orange-200' : ''}
                  ${app.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                  ${app.status === 'PAID' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : ''}
                  ${app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' : ''}
                `}>
                  {app.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
