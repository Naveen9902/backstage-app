'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RunnersPage() {
  const [urgency, setUrgency] = useState('High');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [task, setTask] = useState('');
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assignModal, setAssignModal] = useState<{dispatchId: string, eventId: string, task: string, workers: any[]} | null>(null);
  const [assigning, setAssigning] = useState(false);

  const fetchDispatches = () => {
    fetch('/api/manager/runners').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setDispatches(data);
    });
  };

  useEffect(() => {
    // Fetch events - only show ONGOING ones for runner dispatch
    fetch('/api/manager/events').then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        const liveEvents = data.filter(ev => ev.status === 'ONGOING');
        setEvents(liveEvents);
        if (liveEvents.length > 0) setSelectedEvent(liveEvents[0].id);
      }
    });
    
    
    // Fetch current dispatches
    fetchDispatches();
  }, []);

  const openAssignModal = async (dispatch: any) => {
    try {
      const res = await fetch(`/api/manager/events/${dispatch.eventId}/staffing`);
      if (res.ok) {
        const reqs = await res.json();
        const workers: any[] = [];
        const seenIds = new Set<string>();
        reqs.forEach((req: any) => {
          if (Array.isArray(req.applications)) {
            req.applications.forEach((app: any) => {
              const workerId = app.workerProfile?.user?.id;
              if (app.status === 'ACCEPTED' && workerId && !seenIds.has(workerId)) {
                seenIds.add(workerId);
                workers.push({
                  id: workerId,
                  name: app.workerProfile.user.name,
                  role: req.roleName
                });
              }
            });
          }
        });
        setAssignModal({
          dispatchId: dispatch.id,
          eventId: dispatch.eventId,
          task: dispatch.task,
          workers
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (runnerName: string) => {
    if (!assignModal) return;
    setAssigning(true);
    try {
      const res = await fetch('/api/manager/runners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dispatchId: assignModal.dispatchId,
          runnerName
        })
      });
      if (res.ok) {
        fetchDispatches();
        setAssignModal(null);
      }
    } catch (err) {
      console.error(err);
    }
    setAssigning(false);
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !task) return;
    setLoading(true);

    try {
      const res = await fetch('/api/manager/runners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEvent,
          task,
          urgency
        })
      });
      if (res.ok) {
        const newDispatch = await res.json();
        setDispatches(prev => [newDispatch, ...prev]);
        setTask(''); // reset
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="text-[#242424] max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-serif tracking-tight mb-2">Runners Dispatch</h1>
        <p className="text-lg text-gray-700">Request last-minute help for your active events</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Dispatch Form */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          className="bg-white rounded-xl p-8 border border-gray-100 lg:col-span-1 h-fit" 
          style={{ boxShadow: '-6px 6px 0px rgba(205, 127, 50, 0.9)' }}
        >
          <h2 className="text-2xl font-bold font-serif mb-6">New Request</h2>
          {events.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" className="text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                <span className="font-bold text-amber-700 text-sm">No Live Events</span>
              </div>
              <p className="text-amber-600 text-sm">Runner dispatch is only available for <strong>ongoing events</strong>. Go to <Link href="/manager/my-events" className="underline">My Events</Link> and toggle an event to <strong>Live</strong> first.</p>
            </div>
          ) : (
            <form onSubmit={handleDispatch} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700">Event</label>
                <select required value={selectedEvent} onChange={e=>setSelectedEvent(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none">
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Task Description</label>
                <textarea required rows={3} value={task} onChange={e=>setTask(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 mt-1 focus:border-[#CD7F32] outline-none" placeholder="e.g. Need more ice at the main stage VIP bar immediately."></textarea>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700">Urgency</label>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {['Low', 'Medium', 'High', 'Critical'].map(level => (
                    <button 
                      key={level} 
                      type="button" 
                      onClick={() => setUrgency(level)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${urgency === level ? 'bg-[#CD7F32] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <button disabled={loading} type="submit" className="w-full bg-[#242424] text-white font-bold py-3 rounded-lg hover:bg-black transition-colors mt-4 disabled:opacity-50">
                {loading ? 'Dispatching...' : 'Dispatch Runner'}
              </button>
            </form>
          )}
        </motion.div>

        {/* Active Runners */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold font-serif mb-4">Active & Recent Dispatches</h2>
          
          {dispatches.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500">
              No runners dispatched yet.
            </div>
          ) : (
            dispatches.map((dispatch, i) => (
              <motion.div 
                key={dispatch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-5 rounded-xl border border-gray-100 flex items-center justify-between"
                style={{ boxShadow: '-4px 4px 0px rgba(205, 127, 50, 0.9)' }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg">{dispatch.task}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase ${dispatch.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {dispatch.status}
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase bg-red-100 text-red-700`}>
                      {dispatch.urgency}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {dispatch.event?.title} &bull; Runner: <strong>{dispatch.runner || 'Unassigned'}</strong>
                  </div>
                </div>
                <div className="text-right text-sm flex flex-col items-end gap-2">
                  <span className="font-medium text-gray-500">
                    {new Date(dispatch.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {dispatch.status === 'Pending' && (
                    <button 
                      onClick={() => openAssignModal(dispatch)}
                      className="px-3 py-1 bg-blue-50 text-blue-700 font-bold text-xs rounded-md border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      Assign Runner
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-serif">Assign Runner</h2>
              <button onClick={() => setAssignModal(null)} className="text-gray-400 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <strong>Task:</strong> {assignModal.task}
            </p>

            <h3 className="font-bold text-gray-700 mb-3">Available Workers for this Event</h3>
            
            {assignModal.workers.length === 0 ? (
              <p className="text-gray-500 italic text-center py-4 text-sm">No accepted workers found for this event.</p>
            ) : (
              <div className="space-y-2">
                {assignModal.workers.map(worker => (
                  <div key={worker.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-[#CD7F32] transition-colors">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800">{worker.name}</h4>
                      <p className="text-xs text-gray-500">{worker.role}</p>
                    </div>
                    <button
                      onClick={() => handleAssign(worker.name)}
                      disabled={assigning}
                      className="px-3 py-1.5 bg-[#CD7F32] text-white font-bold text-xs rounded-lg hover:bg-[#b06a28] transition-colors disabled:opacity-50"
                    >
                      {assigning ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
