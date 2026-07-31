'use client';
import { apiFetch } from '@/lib/apiFetch';


import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  useEffect(() => {
    apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manager/applications`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setApplications(data);
        setLoading(false);
      });
  }, []);

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/manager/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="text-[#242424] max-w-6xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Applications</h1>
        <p className="text-lg text-gray-700">Review talent applications for your events</p>
      </div>

      <div className="mb-8 bg-[#f0f9ff] border border-[#bae6fd] p-4 rounded-xl flex items-start gap-4 shadow-sm">
        <div className="text-blue-500 mt-1 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <h3 className="font-bold text-blue-900">Protected by Back Stage Event Insurance</h3>
          <p className="text-blue-800 text-sm mt-1">All verified workers hired through this platform are automatically covered by our ₹8 Crore Event Liability Insurance policy. Hire with confidence.</p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-gray-500">Loading applications...</div>
      ) : applications.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-100 text-center shadow-sm">
          <p className="text-gray-500">No applications received yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <motion.div 
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#CD7F32] transition-colors"
              style={{ boxShadow: '-4px 4px 0px rgba(205, 127, 50, 0.9)' }}
            >
              <div className="flex gap-4 items-start">
                {app.workerProfile?.user?.avatarUrl ? (
                  <img src={app.workerProfile.user.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-gray-100" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xl">
                    {app.workerProfile?.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold font-serif flex items-center gap-2 cursor-pointer hover:text-[#CD7F32] transition-colors" onClick={() => setSelectedProfile(app.workerProfile)}>
                      {app.workerProfile?.user?.name || 'Unknown Worker'}
                      {app.workerProfile?.isVerified && (
                        <span title="Verified Identity" className="text-green-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                        </span>
                      )}
                    </h3>
                    <button onClick={() => setSelectedProfile(app.workerProfile)} className="text-xs font-bold text-[#CD7F32] hover:underline">View Profile</button>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{app.workerProfile?.user?.email}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
                    <span><strong>Skills:</strong> {app.workerProfile?.skills || 'N/A'}</span>
                    <span><strong>Exp:</strong> {app.workerProfile?.experience || 'N/A'}</span>
                    <span className="flex items-center gap-1 text-[#CD7F32] font-bold">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {app.workerProfile?.rating ? app.workerProfile.rating.toFixed(1) : '0.0'}
                    </span>
                    {app.workerProfile?.tier && (
                      <span className="bg-orange-100 text-orange-800 px-2 rounded font-bold text-xs flex items-center">{app.workerProfile.tier}</span>
                    )}
                  </div>
                  <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-sm inline-block">
                    Applied for <strong>{app.staffingRequest?.roleName}</strong> at <strong>{app.staffingRequest?.event?.title}</strong>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 min-w-[140px]">
                {app.status === 'PENDING' ? (
                  <>
                    <button 
                      onClick={() => handleUpdateStatus(app.id, 'ACCEPTED')} 
                      className="bg-[#CD7F32] hover:bg-[#a86524] text-white font-bold px-4 py-2 rounded-lg transition-colors w-full shadow-sm flex items-center justify-center gap-2"
                    >
                      Accept
                    </button>
                    <button onClick={() => handleUpdateStatus(app.id, 'REJECTED')} className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors w-full">Reject</button>
                  </>
                ) : (
                  <div className={`text-center font-bold px-4 py-2 rounded-lg ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {app.status}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Worker Profile Modal */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto border border-gray-100"
            >
              <button 
                onClick={() => setSelectedProfile(null)}
                className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              
              <div className="flex flex-col md:flex-row gap-6 mb-8">
                {selectedProfile.user?.avatarUrl ? (
                  <img src={selectedProfile.user.avatarUrl} alt="Avatar" className="w-32 h-32 rounded-2xl object-cover border-4 border-gray-100 shadow-md" />
                ) : (
                  <div className="w-32 h-32 rounded-2xl bg-gray-100 border-4 border-gray-200 flex items-center justify-center text-gray-400 font-bold text-4xl shadow-md">
                    {selectedProfile.user?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-bold font-serif text-[#CD7F32]">{selectedProfile.user?.name}</h2>
                    {selectedProfile.isVerified && (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-green-200 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                        Verified Trust
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{selectedProfile.user?.email}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedProfile.tier && (
                      <span className="bg-orange-100 border border-orange-200 text-orange-800 px-3 py-1 rounded-md text-sm font-bold shadow-sm">
                        {selectedProfile.tier}
                      </span>
                    )}
                    <span className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm font-bold shadow-sm flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#CD7F32" stroke="#CD7F32"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                      {selectedProfile.rating ? selectedProfile.rating.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Skills</h4>
                  <p className="font-medium text-gray-800">{selectedProfile.skills || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Experience</h4>
                  <p className="font-medium text-gray-800">{selectedProfile.experience || 'Not specified'}</p>
                </div>
              </div>

              {selectedProfile.pastWork && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Past Work / Resume</h4>
                  <p className="text-gray-700 whitespace-pre-wrap text-sm">{selectedProfile.pastWork}</p>
                </div>
              )}

              {selectedProfile.portfolioLinks && (
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Portfolio Links</h4>
                  <a href={selectedProfile.portfolioLinks.startsWith('http') ? selectedProfile.portfolioLinks : `https://${selectedProfile.portfolioLinks}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium break-all">
                    {selectedProfile.portfolioLinks}
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
