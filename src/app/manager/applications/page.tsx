'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/manager/applications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setApplications(data);
        setLoading(false);
      });
  }, []);

  const handlePayAndAccept = async (app: any) => {
    if (!app.workerProfile?.stripeAccountId) {
      alert("This worker hasn't set up their payment account yet. They must connect Stripe before you can hire them.");
      return;
    }

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: app.id })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Checkout failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during checkout');
    }
  };

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/manager/applications/${appId}/status`, {
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
              className="bg-white rounded-xl p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6"
              style={{ boxShadow: '-4px 4px 0px rgba(205, 127, 50, 0.9)' }}
            >
              <div>
                <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                  {app.workerProfile?.user?.name || 'Unknown Worker'}
                  {app.workerProfile?.isVerified && (
                    <span title="Verified Identity" className="text-green-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
                    </span>
                  )}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{app.workerProfile?.user?.email}</p>
                <div className="flex gap-4 text-sm text-gray-700 mb-2">
                  <span><strong>Skills:</strong> {app.workerProfile?.skills || 'N/A'}</span>
                  <span><strong>Exp:</strong> {app.workerProfile?.experience || 'N/A'}</span>
                </div>
                <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-sm inline-block">
                  Applied for <strong>{app.staffingRequest?.roleName}</strong> at <strong>{app.staffingRequest?.event?.title}</strong>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 min-w-[140px]">
                {app.status === 'PENDING' ? (
                  <>
                    <button 
                      onClick={() => handlePayAndAccept(app)} 
                      className="bg-[#CD7F32] hover:bg-[#a86524] text-white font-bold px-4 py-2 rounded-lg transition-colors w-full shadow-sm flex items-center justify-center gap-2"
                    >
                      Pay & Accept
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
    </div>
  );
}
