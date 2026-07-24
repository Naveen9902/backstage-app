'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Briefcase, Send, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function RunnersPage() {
  const [urgency, setUrgency] = useState('High');
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [task, setTask] = useState('');
  const [dispatches, setDispatches] = useState<any[]>([]);
  const [hiredStaff, setHiredStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  
  // Assign to specific worker
  const [assignModal, setAssignModal] = useState<{userId: string, name: string, eventId: string} | null>(null);

  const fetchDispatches = () => {
    fetch('/api/manager/runners').then(res => res.json()).then(data => {
      if (data) {
        setDispatches(data.dispatches || []);
        setHiredStaff(data.hiredStaff || []);
      }
    });
  };

  useEffect(() => {
    fetch('/api/manager/events').then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        const liveEvents = data.filter(ev => ev.status === 'ONGOING');
        setEvents(liveEvents);
        if (liveEvents.length > 0) setSelectedEvent(liveEvents[0].id);
      }
    });
    
    fetchDispatches();
    
    // Supabase Realtime instead of polling
    const channel = supabase.channel('manager_runner_dispatches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'RunnerDispatch' },
        () => {
          fetchDispatches(); // Instantly refresh data when any dispatch changes
        }
      )
      .subscribe();

    // Fallback: poll every 5 seconds just in case Realtime isn't enabled on the table
    const pollInterval = setInterval(() => {
      fetchDispatches();
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, []);

  const handleDirectAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModal || !task) return;
    setAssigning(true);

    try {
      const res = await fetch('/api/manager/runners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: assignModal.eventId,
          task,
          urgency,
          runnerId: assignModal.userId
        })
      });
      if (res.ok) {
        fetchDispatches();
        setAssignModal(null);
        setTask('');
      }
    } catch (err) {
      console.error(err);
    }
    setAssigning(false);
  };
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="mb-10 relative overflow-hidden bg-[#242424] rounded-3xl p-8 md:p-12 text-white shadow-xl shadow-[#242424]/10">
          {/* Radar Animation Background */}
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 opacity-30 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
            <div className="absolute inset-0 rounded-full border-2 border-[#CD7F32] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
            <div className="absolute inset-4 rounded-full border-2 border-[#CD7F32] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-8 rounded-full border-2 border-[#CD7F32] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-[#CD7F32] rounded-full shadow-[0_0_20px_#CD7F32] transform -translate-x-1/2 -translate-y-1/2"></div>
            {/* Sweeping radar line */}
            <div className="absolute top-1/2 left-1/2 w-1 h-1/2 bg-gradient-to-t from-[#CD7F32] to-transparent origin-bottom transform -translate-x-1/2 -translate-y-full animate-[spin_4s_linear_infinite]"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Operations
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-serif tracking-tight mb-3">Runner Dispatch Center</h1>
            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
              Assign high-priority tasks directly to your hired staff during live events. Real-time coordination, amplified.
            </p>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="text-amber-600 w-5 h-5" />
              <span className="font-bold text-amber-700">No Live Events</span>
            </div>
            <p className="text-amber-600">Runner dispatch is only available for <strong>ongoing events</strong>. Go to <Link href="/manager/my-events" className="underline font-bold">My Events</Link> and toggle an event to <strong>Live</strong> first.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Hired Staff List */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-serif mb-4 flex items-center gap-2">
                <Briefcase className="text-[#CD7F32] w-6 h-6" />
                Hired Staff
              </h2>
              {hiredStaff.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500 shadow-sm">
                  No hired staff found for your ongoing events.
                </div>
              ) : (
                <div className="space-y-4">
                  {hiredStaff.map((staff, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white p-5 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="font-bold text-lg text-gray-900">{staff.name}</div>
                        <div className="text-sm text-gray-500">{staff.roleName} &bull; {staff.eventName}</div>
                      </div>
                      <button 
                        onClick={() => setAssignModal({ userId: staff.userId, name: staff.name, eventId: staff.eventId })}
                        className="bg-[#242424] hover:bg-[#CD7F32] text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" /> Assign Task
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Dispatched Tasks */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-serif mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-[#CD7F32] w-6 h-6" />
                Task Dispatches
              </h2>
              {dispatches.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-gray-100 text-center text-gray-500 shadow-sm">
                  No runners dispatched yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {dispatches.map((dispatch, i) => (
                    <motion.div 
                      key={dispatch.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
                      style={{ borderLeft: `4px solid ${dispatch.urgency === 'Critical' ? '#ef4444' : dispatch.urgency === 'High' ? '#f97316' : '#CD7F32'}` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{dispatch.event?.title}</span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          dispatch.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          dispatch.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {dispatch.status}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 mb-3">{dispatch.task}</p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(dispatch.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        {dispatch.runner ? (
                          <div className="font-bold text-[#CD7F32]">Assigned to: {dispatch.runner.name}</div>
                        ) : (
                          <div className="font-bold text-gray-400">Unassigned (Broadcast)</div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">Assign Task to {assignModal.name}</h3>
            </div>
            
            <form onSubmit={handleDirectAssign} className="p-6 space-y-5">
              <div>
                <label className="text-sm font-bold text-gray-700 mb-1 block">Task Description</label>
                <textarea 
                  required 
                  rows={3} 
                  value={task} 
                  onChange={e=>setTask(e.target.value)} 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:border-[#CD7F32] outline-none shadow-inner text-gray-900" 
                  placeholder="e.g. Need more ice at the main stage VIP bar immediately."
                ></textarea>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block">Urgency</label>
                <div className="flex gap-2 flex-wrap">
                  {['Low', 'Medium', 'High', 'Critical'].map(level => (
                    <button 
                      key={level} 
                      type="button" 
                      onClick={() => setUrgency(level)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${urgency === level ? 'bg-[#CD7F32] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setAssignModal(null); setTask(''); }}
                  className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  disabled={assigning} 
                  type="submit" 
                  className="flex-1 bg-[#242424] text-white font-bold py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Dispatch'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
