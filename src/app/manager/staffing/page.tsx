'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchTalentModal from '@/components/SearchTalentModal';

function StaffingContent() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get('eventId') || '';
  
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId);
  const [requests, setRequests] = useState<any[]>([]);
  const [expandedReqId, setExpandedReqId] = useState<string | null>(null);
  const [disputeModal, setDisputeModal] = useState<{targetId: string, name: string} | null>(null);
  const [disputeForm, setDisputeForm] = useState({ reason: 'NO_SHOW', description: '' });
  const [submittingDispute, setSubmittingDispute] = useState(false);
  const [searchTalentReq, setSearchTalentReq] = useState<{ id: string, roleName: string } | null>(null);
  
  const [formData, setFormData] = useState({
    tierTarget: 'TIER_1',
    roleName: 'Runner',
    quantity: 1,
    payRate: ''
  });

  const rolesByTier: Record<string, string[]> = {
    'TIER_1': ['Runner', 'Usher', 'Stagehand', 'Cleaner'],
    'TIER_2': ['Security', 'VIP Host', 'Technician', 'Bartender'],
    'TIER_3': ['Event Director', 'Head of Security', 'Executive VIP Host']
  };

  // Update roleName automatically when tier changes if current role isn't in new tier
  useEffect(() => {
    const validRoles = rolesByTier[formData.tierTarget];
    if (!validRoles.includes(formData.roleName)) {
      setFormData(prev => ({ ...prev, roleName: validRoles[0] }));
    }
  }, [formData.tierTarget]);

  const fetchEvents = () => {
    fetch('/api/manager/events').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setEvents(data);
    });
  };

  const fetchRequests = () => {
    if (selectedEventId) {
      fetch(`/api/manager/events/${selectedEventId}/staffing`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setRequests(data);
        });
    } else {
      setRequests([]);
      setExpandedReqId(null);
    }
  };

  useEffect(() => { fetchEvents(); }, []);
  useEffect(() => { fetchRequests(); }, [selectedEventId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;

    try {
      const res = await fetch(`/api/manager/events/${selectedEventId}/staffing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchRequests();
        setFormData(prev => ({ ...prev, quantity: 1, payRate: '' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (applicationId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/manager/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchRequests(); // refresh to show updated status
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeModal || !selectedEventId) return;
    setSubmittingDispute(true);
    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          targetId: disputeModal.targetId,
          reason: disputeForm.reason,
          description: disputeForm.description
        })
      });
      if (res.ok) {
        setDisputeModal(null);
        setDisputeForm({ reason: 'NO_SHOW', description: '' });
      } else {
        alert('Failed to report issue');
      }
    } catch (err) {
      console.error('Dispute error', err);
    }
    setSubmittingDispute(false);
  };

  return (
    <div className="space-y-8">
      {/* Selector */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <label className="block text-sm font-bold text-gray-700 mb-2">Select Event to Manage Staffing</label>
        <select 
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#CD7F32] transition-colors"
        >
          <option value="">-- Choose an Event --</option>
          {events.map(ev => (
            <option key={ev.id} value={ev.id}>{ev.title} ({new Date(ev.date).toLocaleDateString()})</option>
          ))}
        </select>
      </div>

      {selectedEventId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-white rounded-xl p-6 border border-gray-100 h-fit"
            style={{ boxShadow: '-4px 4px 0px rgba(205, 127, 50, 0.9)' }}
          >
            <h3 className="text-xl font-bold font-serif mb-4">Add Staffing Need</h3>
            {events.find(ev => ev.id === selectedEventId)?.status === 'COMPLETED' ? (
              <div className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg border border-gray-100">
                This event is marked as <strong>completed</strong>. You can no longer post new staffing roles for it.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700">Target Tier</label>
                <select 
                  value={formData.tierTarget} 
                  onChange={e => setFormData({...formData, tierTarget: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none"
                >
                  <option value="TIER_1">Tier 1 (General)</option>
                  <option value="TIER_2">Tier 2 (Specialized)</option>
                  <option value="TIER_3">Tier 3 (Premium)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Role Name</label>
                <select 
                  required 
                  value={formData.roleName} 
                  onChange={e => setFormData({...formData, roleName: e.target.value})} 
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none"
                >
                  {rolesByTier[formData.tierTarget].map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Quantity Needed</label>
                <input required min="1" value={formData.quantity} onChange={e=>setFormData({...formData, quantity: e.target.value === '' ? ('' as any) : parseInt(e.target.value, 10)})} type="number" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Pay Rate (Total or Hourly)</label>
                <input required value={formData.payRate} onChange={e=>setFormData({...formData, payRate: e.target.value})} type="number" step="0.01" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" placeholder="₹" />
              </div>
                <button type="submit" className="w-full bg-[#CD7F32] text-white py-2.5 rounded-lg font-bold hover:bg-[#a06227] transition-colors mt-2">
                  Add Role
                </button>
              </form>
            )}
          </motion.div>

          {/* List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold font-serif mb-2">Current Staffing Requests</h3>
            {requests.length === 0 ? (
              <div className="text-gray-500 bg-white p-8 rounded-xl border border-gray-100 text-center">No staffing requests added for this event yet.</div>
            ) : (
              requests.map(req => {
                const isExpanded = expandedReqId === req.id;
                const apps = req.applications || [];
                const acceptedCount = apps.filter((a: any) => a.status === 'ACCEPTED').length;

                return (
                  <div key={req.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div 
                      className="p-5 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => setExpandedReqId(isExpanded ? null : req.id)}
                    >
                      <div>
                        <h4 className="font-bold text-lg">{req.roleName}</h4>
                        <p className="text-sm text-gray-600">Need: {req.quantity} person(s) &bull; Pay: ₹{req.payRate}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`text-sm font-bold ${acceptedCount >= req.quantity ? 'text-green-600' : 'text-[#CD7F32]'}`}>
                            {acceptedCount} / {req.quantity} Filled
                          </div>
                          <div className="text-xs text-gray-500">{apps.length} Total Applicants</div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>

                    <div className="bg-gray-50 border-t border-gray-100 p-3 flex justify-end">
                      <button 
                        onClick={() => setSearchTalentReq({ id: req.id, roleName: req.roleName })}
                        className="text-xs font-bold bg-[#242424] hover:bg-black text-white px-4 py-2 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                        Search Talent to Invite
                      </button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-100 bg-gray-50"
                        >
                          {apps.length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-500 italic">No applicants yet.</div>
                          ) : (
                            <div className="divide-y divide-gray-100">
                              {apps.map((app: any) => (
                                <div key={app.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden bg-cover bg-center shrink-0" style={{ backgroundImage: app.workerProfile?.user?.avatarUrl ? `url(${app.workerProfile.user.avatarUrl})` : 'none' }}>
                                      {!app.workerProfile?.user?.avatarUrl && (
                                        <div className="w-full h-full flex items-center justify-center bg-[#CD7F32] text-white font-bold text-xs">
                                          {app.workerProfile?.user?.name?.substring(0,2).toUpperCase() || 'WT'}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm">{app.workerProfile?.user?.name}</p>
                                        {app.workerProfile?.rating >= 4.5 && (
                                          <span className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase shadow-sm">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>
                                            Top Talent
                                          </span>
                                        )}
                                        {app.workerProfile?.isVerified && app.workerProfile?.tier && (
                                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase shadow-sm border ${
                                            app.workerProfile.tier === 'Tier 1' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                            app.workerProfile.tier === 'Tier 2' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                            'bg-purple-100 text-purple-800 border-purple-200'
                                          }`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                            Verified {app.workerProfile.tier}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{app.workerProfile?.skills || 'No skills listed'}</p>
                                        {app.workerProfile?.rating > 0 && (
                                          <span className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 bg-yellow-50 px-1.5 py-0.5 rounded">
                                            ★ {app.workerProfile.rating.toFixed(1)}
                                          </span>
                                        )}
                                      </div>
                                      
                                      {/* Times & Earnings */}
                                      {(app.checkInTime || app.status === 'PAID') && (
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs font-medium">
                                          <div className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                            <span className="opacity-70">In:</span>
                                            {app.checkInTime ? new Date(app.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                          </div>
                                          
                                          {app.checkOutTime ? (
                                            <>
                                              <div className="flex items-center gap-1 text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                <span className="opacity-70">Out:</span>
                                                {new Date(app.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                              </div>
                                              
                                              <div className="flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-bold">
                                                <span className="opacity-70 font-normal">Earned:</span>
                                                ₹{((new Date(app.checkOutTime).getTime() - new Date(app.checkInTime).getTime()) / (1000 * 60 * 60) * req.payRate).toFixed(2)}
                                              </div>
                                            </>
                                          ) : (
                                            <div className="flex items-center gap-1 text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                              <span className="opacity-70">Out:</span> Pending
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 self-end md:self-auto">
                                    {app.status === 'PENDING' ? (
                                      <>
                                        <button onClick={() => handleStatusUpdate(app.id, 'ACCEPTED')} className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold uppercase rounded hover:bg-green-200 transition-colors">Accept</button>
                                        <button onClick={() => handleStatusUpdate(app.id, 'REJECTED')} className="px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold uppercase rounded hover:bg-red-200 transition-colors">Reject</button>
                                      </>
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1.5 rounded text-xs font-bold uppercase ${app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : app.status === 'PAID' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'}`}>
                                          {app.status}
                                        </span>
                                        {app.status === 'ACCEPTED' && (
                                          <>
                                            <button 
                                              onClick={() => handleStatusUpdate(app.id, 'PAID')}
                                              disabled={!app.checkOutTime}
                                              className={`px-3 py-1.5 text-xs font-bold uppercase rounded transition-colors ${app.checkOutTime ? 'bg-[#CD7F32] text-white hover:bg-[#a06227]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                                            >
                                              {app.checkOutTime ? 'Mark Paid' : 'Awaiting Checkout'}
                                            </button>
                                            <button 
                                              onClick={() => setDisputeModal({ targetId: app.workerProfile.user.id, name: app.workerProfile.user.name })}
                                              className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700 text-xs font-bold uppercase rounded transition-colors"
                                            >
                                              Report Issue
                                            </button>
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {searchTalentReq && (
        <SearchTalentModal 
          eventId={selectedEventId} 
          staffingRequestId={searchTalentReq.id} 
          roleName={searchTalentReq.roleName}
          onClose={() => {
            setSearchTalentReq(null);
            fetchRequests();
          }}
        />
      )}

      {/* Dispute Modal */}
      {disputeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-serif text-red-700">Report Issue</h2>
              <button onClick={() => setDisputeModal(null)} className="text-gray-400 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 bg-red-50 p-3 rounded-lg border border-red-100">
              You are reporting an issue regarding <strong>{disputeModal.name}</strong> for this event. This will alert the platform administrators.
            </p>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Reason</label>
                <select 
                  value={disputeForm.reason}
                  onChange={e => setDisputeForm({...disputeForm, reason: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-red-400"
                >
                  <option value="NO_SHOW">No Show</option>
                  <option value="UNPROFESSIONAL">Unprofessional Behavior</option>
                  <option value="LATE">Extreme Tardiness</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={disputeForm.description}
                  onChange={e => setDisputeForm({...disputeForm, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-red-400"
                  placeholder="Please describe the issue in detail..."
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end mt-6">
                <button 
                  type="button" 
                  onClick={() => setDisputeModal(null)}
                  className="px-5 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingDispute}
                  className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-md"
                >
                  {submittingDispute ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function StaffingPage() {
  return (
    <div className="text-[#242424] max-w-6xl">
      <div className="mb-6">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Event Staffing</h1>
        <p className="text-lg text-gray-700">Create and manage staffing requests for your events</p>
      </div>

      <div className="mb-8 bg-[#f0f9ff] border border-[#bae6fd] p-4 rounded-xl flex items-start gap-4 shadow-sm">
        <div className="text-blue-500 mt-1 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div>
          <h3 className="font-bold text-blue-900">Hire with Peace of Mind</h3>
          <p className="text-blue-800 text-sm mt-1">Every worker hired through Back Stage is strictly verified using Stripe Identity, and their work at your event is covered by our ₹8,00,00,000 General Liability Insurance policy.</p>
        </div>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <StaffingContent />
      </Suspense>
    </div>
  );
}
